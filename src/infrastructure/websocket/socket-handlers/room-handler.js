import { SupabaseRoomRepository } from '../../repositories/supabase-room-repository.js';
import { SupabaseRoomParticipantRepository } from '../../repositories/supabase-room-participant-repository.js';
import { WebSocketUtils } from '../../../utils/websocket-utils.js';

/**
 * Handler para eventos de sala
 */
export class RoomHandler {
  constructor(io) {
    this.io = io;
    this.roomRepository = new SupabaseRoomRepository();
    this.roomParticipantRepository = new SupabaseRoomParticipantRepository();
  }

  /**
   * Registra eventos de sala
   */
  register(socket) {
    socket.on('join_room', (data) => this.handleJoinRoom(socket, data));
    socket.on('leave_room', (data) => this.handleLeaveRoom(socket, data));
    socket.on('get_room_info', (data) => this.handleGetRoomInfo(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  /**
   * Handle entrar na sala
   */
  async handleJoinRoom(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId']);
      if (errors.length > 0) {
        return socket.emit('join_room_error', 
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId } = data;

      // Verificar se sala existe
      const room = await this.roomRepository.findById(roomId);
      if (!room || !room.isActive) {
        return socket.emit('join_room_error',
          WebSocketUtils.createErrorResponse('Sala não encontrada', 'ROOM_NOT_FOUND')
        );
      }

      // Verificar se usuário é participante
      const participant = await this.roomParticipantRepository.findByUserAndRoom(
        socket.userId, 
        roomId
      );
      
      if (!participant || !participant.isActive) {
        return socket.emit('join_room_error',
          WebSocketUtils.createErrorResponse('Usuário não é participante da sala', 'NOT_PARTICIPANT')
        );
      }

      // Entrar na sala do Socket.IO
      const roomName = WebSocketUtils.createRoomName(roomId);
      await socket.join(roomName);
      
      // Armazenar sala atual do usuário
      socket.currentRoomId = roomId;

      // Notificar outros participantes
      socket.to(roomName).emit('user_joined', WebSocketUtils.createSuccessResponse({
        user: socket.user,
        joinedAt: new Date().toISOString()
      }));

      // Buscar participantes online
      const onlineParticipants = await this.getOnlineParticipants(roomName);

      socket.emit('join_room_success', WebSocketUtils.createSuccessResponse({
        room: room.toPublic(),
        onlineParticipants,
        userRole: participant.role
      }));

    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      socket.emit('join_room_error',
        WebSocketUtils.createErrorResponse('Erro interno do servidor', 'INTERNAL_ERROR')
      );
    }
  }

  /**
   * Handle sair da sala
   */
  async handleLeaveRoom(socket, data) {
    try {
      const { roomId } = data || {};
      const currentRoomId = roomId || socket.currentRoomId;

      if (!currentRoomId) {
        return socket.emit('leave_room_error',
          WebSocketUtils.createErrorResponse('Nenhuma sala para sair', 'NO_ROOM')
        );
      }

      const roomName = WebSocketUtils.createRoomName(currentRoomId);
      
      // Sair da sala do Socket.IO
      await socket.leave(roomName);
      
      // Notificar outros participantes
      socket.to(roomName).emit('user_left', WebSocketUtils.createSuccessResponse({
        user: socket.user,
        leftAt: new Date().toISOString()
      }));

      // Limpar sala atual
      socket.currentRoomId = null;

      socket.emit('leave_room_success', WebSocketUtils.createSuccessResponse({
        leftRoom: currentRoomId
      }));

    } catch (error) {
      console.error('Erro ao sair da sala:', error);
      socket.emit('leave_room_error',
        WebSocketUtils.createErrorResponse('Erro interno do servidor', 'INTERNAL_ERROR')
      );
    }
  }

  /**
   * Handle obter informações da sala
   */
  async handleGetRoomInfo(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId']);
      if (errors.length > 0) {
        return socket.emit('room_info_error',
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId } = data;
      const room = await this.roomRepository.findById(roomId);
      
      if (!room) {
        return socket.emit('room_info_error',
          WebSocketUtils.createErrorResponse('Sala não encontrada', 'ROOM_NOT_FOUND')
        );
      }

      const roomName = WebSocketUtils.createRoomName(roomId);
      const onlineParticipants = await this.getOnlineParticipants(roomName);

      socket.emit('room_info_success', WebSocketUtils.createSuccessResponse({
        room: room.toPublic(),
        onlineParticipants
      }));

    } catch (error) {
      console.error('Erro ao obter info da sala:', error);
      socket.emit('room_info_error',
        WebSocketUtils.createErrorResponse('Erro interno do servidor', 'INTERNAL_ERROR')
      );
    }
  }

  /**
   * Handle desconexão
   */
  async handleDisconnect(socket) {
    try {
      if (socket.currentRoomId) {
        const roomName = WebSocketUtils.createRoomName(socket.currentRoomId);
        
        // Notificar outros participantes
        socket.to(roomName).emit('user_disconnected', WebSocketUtils.createSuccessResponse({
          user: socket.user,
          disconnectedAt: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Erro na desconexão:', error);
    }
  }

  /**
   * Obtém participantes online na sala
   */
  async getOnlineParticipants(roomName) {
    try {
      const sockets = await this.io.in(roomName).fetchSockets();
      return sockets.map(socket => ({
        id: socket.userId,
        name: socket.userName,
        email: socket.userEmail,
        socketId: socket.id,
        connectedAt: socket.connectedAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao buscar participantes online:', error);
      return [];
    }
  }
}