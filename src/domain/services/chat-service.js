/**
 * Serviço de chat - lógica de negócio para mensagens do chat
 */
export class ChatService {
  constructor(chatMessageRepository, roomParticipantRepository) {
    this.chatMessageRepository = chatMessageRepository;
    this.roomParticipantRepository = roomParticipantRepository;
  }

  /**
   * Envia mensagem no chat
   */
  async sendMessage({ roomId, userId, message, messageType = 'text' }) {
    // Verificar se usuário está na sala
    const participant = await this.roomParticipantRepository.findByUserAndRoom(userId, roomId);
    if (!participant || !participant.isActive) {
      throw new Error('Usuário não está na sala');
    }

    // Validar mensagem
    if (!message || message.trim().length === 0) {
      throw new Error('Mensagem não pode estar vazia');
    }

    if (message.length > 500) {
      throw new Error('Mensagem muito longa (máximo 500 caracteres)');
    }

    // Filtrar conteúdo inadequado (básico)
    const cleanMessage = this.sanitizeMessage(message.trim());

    const messageData = {
      room_id: roomId,
      user_id: userId,
      message: cleanMessage,
      message_type: messageType,
      timestamp: new Date()
    };

    const chatMessage = await this.chatMessageRepository.create(messageData);
    return chatMessage.toPublic();
  }

  /**
   * Envia mensagem do sistema
   */
  async sendSystemMessage({ roomId, message }) {
    const messageData = {
      room_id: roomId,
      user_id: null, // Sistema não tem usuário
      message,
      message_type: 'system',
      timestamp: new Date()
    };

    const chatMessage = await this.chatMessageRepository.create(messageData);
    return chatMessage.toPublic();
  }

  /**
   * Obtém histórico de mensagens
   */
  async getMessageHistory(roomId, limit = 50) {
    return await this.chatMessageRepository.findByRoomId(roomId, limit);
  }

  /**
   * Deleta mensagem (apenas moderadores)
   */
  async deleteMessage({ messageId, userId, roomId }) {
    const participant = await this.roomParticipantRepository.findByUserAndRoom(userId, roomId);
    if (!participant || !participant.canManageRoom()) {
      throw new Error('Apenas moderadores podem deletar mensagens');
    }

    const message = await this.chatMessageRepository.findById(messageId);
    if (!message || message.roomId !== roomId) {
      throw new Error('Mensagem não encontrada');
    }

    await this.chatMessageRepository.delete(messageId);
    return { success: true, messageId };
  }

  /**
   * Sanitiza mensagem removendo conteúdo inadequado
   */
  sanitizeMessage(message) {
    // Lista básica de palavras bloqueadas (expandir conforme necessário)
    const blockedWords = ['spam', 'flood'];
    
    let cleanMessage = message;
    
    blockedWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      cleanMessage = cleanMessage.replace(regex, '*'.repeat(word.length));
    });

    return cleanMessage;
  }

  /**
   * Verifica se usuário pode enviar mensagem (rate limiting)
   */
  canSendMessage(userId, lastMessageTime) {
    const now = Date.now();
    const timeDiff = now - lastMessageTime;
    const minInterval = 1000; // 1 segundo entre mensagens

    return timeDiff >= minInterval;
  }
}