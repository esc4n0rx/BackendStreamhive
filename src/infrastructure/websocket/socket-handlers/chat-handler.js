import { ChatService } from '../../../domain/services/chat-service.js';
import { SupabaseChatMessageRepository } from '../../repositories/supabase-chat-message-repository.js';
import { SupabaseRoomParticipantRepository } from '../../repositories/supabase-room-participant-repository.js';
import { WebSocketUtils } from '../../../utils/websocket-utils.js';

/**
 * Handler para eventos de chat
 */
export class ChatHandler {
  constructor(io) {
    this.io = io;
    this.chatService = new ChatService(
      new SupabaseChatMessageRepository(),
      new SupabaseRoomParticipantRepository()
    );
    
    // Rate limiting para mensagens (máximo 10 mensagens por minuto por usuário)
    this.messageRateLimiter = WebSocketUtils.createRateLimiter(10, 60000);
    this.userLastMessage = new Map();
  }

  /**
   * Registra eventos de chat
   */
  register(socket) {
    socket.on('send_message', (data) => this.handleSendMessage(socket, data));
    socket.on('get_chat_history', (data) => this.handleGetChatHistory(socket, data));
    socket.on('delete_message', (data) => this.handleDeleteMessage(socket, data));
    socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
    socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));
  }

  /**
   * Handle enviar mensagem
   */
  async handleSendMessage(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId', 'message']);
      if (errors.length > 0) {
        return socket.emit('send_message_error',
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId, message, messageType = 'text' } = data;

      // Rate limiting por usuário
      if (!this.messageRateLimiter(socket.userId)) {
        return socket.emit('send_message_error',
          WebSocketUtils.createErrorResponse(
            'Muitas mensagens enviadas. Aguarde alguns segundos.',
            'RATE_LIMIT_EXCEEDED'
          )
        );
      }

      // Rate limiting entre mensagens (anti-spam)
      const lastMessageTime = this.userLastMessage.get(socket.userId) || 0;
      if (!this.chatService.canSendMessage(socket.userId, lastMessageTime)) {
        return socket.emit('send_message_error',
          WebSocketUtils.createErrorResponse(
            'Aguarde um momento antes de enviar outra mensagem.',
            'MESSAGE_COOLDOWN'
          )
        );
      }

      const chatMessage = await this.chatService.sendMessage({
        roomId,
        userId: socket.userId,
        message,
        messageType
      });

      // Atualizar timestamp da última mensagem
      this.userLastMessage.set(socket.userId, Date.now());

      const roomName = WebSocketUtils.createRoomName(roomId);

      // Enviar mensagem para todos na sala
      this.io.to(roomName).emit('new_message', WebSocketUtils.createSuccessResponse({
        message: chatMessage
      }));

      // Parar indicador de digitação para este usuário
      socket.to(roomName).emit('typing_stopped', WebSocketUtils.createSuccessResponse({
        userId: socket.userId,
        userName: socket.userName
      }));

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      socket.emit('send_message_error',
        WebSocketUtils.createErrorResponse(error.message, 'SEND_MESSAGE_ERROR')
      );
    }
  }

  /**
   * Handle obter histórico do chat
   */
  async handleGetChatHistory(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId']);
      if (errors.length > 0) {
        return socket.emit('chat_history_error',
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId, limit = 50 } = data;

      // Verificar se usuário está na sala (será verificado no serviço)
      const messages = await this.chatService.getMessageHistory(roomId, limit);

      socket.emit('chat_history_response', WebSocketUtils.createSuccessResponse({
        messages,
        roomId,
        count: messages.length
      }));

    } catch (error) {
      console.error('Erro ao obter histórico do chat:', error);
      socket.emit('chat_history_error',
        WebSocketUtils.createErrorResponse(error.message, 'CHAT_HISTORY_ERROR')
      );
    }
  }

  /**
   * Handle deletar mensagem
   */
  async handleDeleteMessage(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId', 'messageId']);
      if (errors.length > 0) {
        return socket.emit('delete_message_error',
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId, messageId } = data;

      const result = await this.chatService.deleteMessage({
        messageId,
        userId: socket.userId,
        roomId
      });

      const roomName = WebSocketUtils.createRoomName(roomId);

      // Notificar todos na sala sobre a mensagem deletada
      this.io.to(roomName).emit('message_deleted', WebSocketUtils.createSuccessResponse({
        messageId,
        deletedBy: socket.user,
        deletedAt: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      socket.emit('delete_message_error',
        WebSocketUtils.createErrorResponse(error.message, 'DELETE_MESSAGE_ERROR')
      );
    }
  }

  /**
   * Handle início de digitação
   */
  async handleTypingStart(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId']);
      if (errors.length > 0) {
        return; // Ignorar silenciosamente para eventos de digitação
      }

      const { roomId } = data;
      const roomName = WebSocketUtils.createRoomName(roomId);

      // Notificar outros usuários (exceto quem está digitando)
      socket.to(roomName).emit('typing_started', WebSocketUtils.createSuccessResponse({
        userId: socket.userId,
        userName: socket.userName
      }));

      // Auto-stop após 3 segundos se não receber typing_stop
      setTimeout(() => {
        socket.to(roomName).emit('typing_stopped', WebSocketUtils.createSuccessResponse({
          userId: socket.userId,
          userName: socket.userName
        }));
      }, 3000);

    } catch (error) {
      console.error('Erro no indicador de digitação:', error);
    }
  }

  /**
   * Handle parada de digitação
   */
  async handleTypingStop(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId']);
      if (errors.length > 0) {
        return; // Ignorar silenciosamente para eventos de digitação
      }

      const { roomId } = data;
      const roomName = WebSocketUtils.createRoomName(roomId);

      // Notificar outros usuários
      socket.to(roomName).emit('typing_stopped', WebSocketUtils.createSuccessResponse({
        userId: socket.userId,
        userName: socket.userName
      }));

    } catch (error) {
      console.error('Erro ao parar indicador de digitação:', error);
    }
  }
}