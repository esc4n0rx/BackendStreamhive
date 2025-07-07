import { StreamingService } from '../../../domain/services/streaming-service.js';
import { SupabaseStreamingSessionRepository } from '../../repositories/supabase-streaming-session-repository.js';
import { SupabaseRoomRepository } from '../../repositories/supabase-room-repository.js';
import { SupabaseRoomParticipantRepository } from '../../repositories/supabase-room-participant-repository.js';
import { WebSocketUtils } from '../../../utils/websocket-utils.js';
import { StreamUtils } from '../../../utils/stream-utils.js';

/**
 * Handler para eventos de streaming
 */
export class StreamingHandler {
  constructor(io) {
    this.io = io;
    this.streamingService = new StreamingService(
      new SupabaseStreamingSessionRepository(),
      new SupabaseRoomRepository(),
      new SupabaseRoomParticipantRepository()
    );
  }

  /**
   * Registra eventos de streaming
   */
  register(socket) {
    socket.on('start_stream', (data) => this.handleStartStream(socket, data));
    socket.on('stop_stream', (data) => this.handleStopStream(socket, data));
    socket.on('play_video', (data) => this.handlePlayVideo(socket, data));
    socket.on('pause_video', (data) => this.handlePauseVideo(socket, data));
    socket.on('seek_video', (data) => this.handleSeekVideo(socket, data));
    socket.on('sync_request', (data) => this.handleSyncRequest(socket, data));
    socket.on('get_stream_status', (data) => this.handleGetStreamStatus(socket, data));
  }

  /**
   * Handle iniciar stream
   */
  async handleStartStream(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId', 'videoUrl']);
      if (errors.length > 0) {
        return socket.emit('start_stream_error',
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId, videoUrl, title, description } = data;

      // Validar URL
      if (!StreamUtils.isValidVideoUrl(videoUrl)) {
        return socket.emit('start_stream_error',
          WebSocketUtils.createErrorResponse('URL de vídeo inválida', 'INVALID_URL')
        );
      }

      const result = await this.streamingService.startStreamingSession({
        roomId,
        userId: socket.userId,
        videoUrl,
        title,
        description
      });

      const roomName = WebSocketUtils.createRoomName(roomId);

      // Notificar todos na sala
      this.io.to(roomName).emit('stream_started', WebSocketUtils.createSuccessResponse({
        session: result.session,
        streamInfo: result.streamInfo,
        startedBy: socket.user
      }));

    } catch (error) {
      console.error('Erro ao iniciar stream:', error);
      socket.emit('start_stream_error',
        WebSocketUtils.createErrorResponse(error.message, 'START_STREAM_ERROR')
      );
    }
  }

  /**
   * Handle parar stream
   */
  async handleStopStream(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId']);
      if (errors.length > 0) {
        return socket.emit('stop_stream_error',
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId } = data;

      const result = await this.streamingService.stopStreamingSession({
        roomId,
        userId: socket.userId
      });

      const roomName = WebSocketUtils.createRoomName(roomId);

      // Notificar todos na sala
      this.io.to(roomName).emit('stream_stopped', WebSocketUtils.createSuccessResponse({
        session: result,
        stoppedBy: socket.user
      }));

    } catch (error) {
      console.error('Erro ao parar stream:', error);
      socket.emit('stop_stream_error',
        WebSocketUtils.createErrorResponse(error.message, 'STOP_STREAM_ERROR')
      );
    }
  }

  /**
   * Handle play vídeo
   */
  async handlePlayVideo(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId']);
      if (errors.length > 0) {
        return socket.emit('play_video_error',
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId, currentTime } = data;

      const result = await this.streamingService.updatePlaybackState({
        roomId,
        userId: socket.userId,
        isPlaying: true,
        currentTime: currentTime !== undefined ? currentTime : undefined
      });

      const roomName = WebSocketUtils.createRoomName(roomId);

      // Notificar todos na sala (exceto quem enviou)
      socket.to(roomName).emit('video_played', WebSocketUtils.createSuccessResponse({
        session: result,
        triggeredBy: socket.user,
        syncData: StreamUtils.calculateSyncData(
          result.currentTime,
          result.isPlaying,
          result.updatedAt || new Date()
        )
      }));

      // Confirmar para quem enviou
      socket.emit('play_video_success', WebSocketUtils.createSuccessResponse({
        session: result
      }));

    } catch (error) {
      console.error('Erro ao reproduzir vídeo:', error);
      socket.emit('play_video_error',
        WebSocketUtils.createErrorResponse(error.message, 'PLAY_VIDEO_ERROR')
      );
    }
  }

  /**
   * Handle pause vídeo
   */
  async handlePauseVideo(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId']);
      if (errors.length > 0) {
        return socket.emit('pause_video_error',
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId, currentTime } = data;

      const result = await this.streamingService.updatePlaybackState({
        roomId,
        userId: socket.userId,
        isPlaying: false,
        currentTime: currentTime !== undefined ? currentTime : undefined
      });

      const roomName = WebSocketUtils.createRoomName(roomId);

      // Notificar todos na sala (exceto quem enviou)
      socket.to(roomName).emit('video_paused', WebSocketUtils.createSuccessResponse({
        session: result,
        triggeredBy: socket.user,
        syncData: StreamUtils.calculateSyncData(
          result.currentTime,
          result.isPlaying,
          result.updatedAt || new Date()
        )
      }));

      // Confirmar para quem enviou
      socket.emit('pause_video_success', WebSocketUtils.createSuccessResponse({
        session: result
      }));

    } catch (error) {
      console.error('Erro ao pausar vídeo:', error);
      socket.emit('pause_video_error',
        WebSocketUtils.createErrorResponse(error.message, 'PAUSE_VIDEO_ERROR')
      );
    }
  }

  /**
   * Handle seek vídeo
   */
  async handleSeekVideo(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId', 'position']);
      if (errors.length > 0) {
        return socket.emit('seek_video_error',
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId, position } = data;

      if (!StreamUtils.validatePosition(position)) {
        return socket.emit('seek_video_error',
          WebSocketUtils.createErrorResponse('Posição inválida', 'INVALID_POSITION')
        );
      }

      const result = await this.streamingService.seekToPosition({
        roomId,
        userId: socket.userId,
        position
      });

      const roomName = WebSocketUtils.createRoomName(roomId);

      // Notificar todos na sala (exceto quem enviou)
      socket.to(roomName).emit('video_seeked', WebSocketUtils.createSuccessResponse({
        session: result,
        triggeredBy: socket.user,
        syncData: StreamUtils.calculateSyncData(
          result.currentTime,
          result.isPlaying,
          result.updatedAt || new Date()
        )
      }));

      // Confirmar para quem enviou
      socket.emit('seek_video_success', WebSocketUtils.createSuccessResponse({
        session: result
      }));

    } catch (error) {
      console.error('Erro ao alterar posição do vídeo:', error);
      socket.emit('seek_video_error',
        WebSocketUtils.createErrorResponse(error.message, 'SEEK_VIDEO_ERROR')
      );
    }
  }

  /**
   * Handle solicitação de sincronização
   */
  async handleSyncRequest(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId']);
      if (errors.length > 0) {
        return socket.emit('sync_error',
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId } = data;

      const activeSession = await this.streamingService.getActiveSession(roomId);
      
      if (!activeSession) {
        return socket.emit('sync_error',
          WebSocketUtils.createErrorResponse('Nenhuma sessão ativa', 'NO_ACTIVE_SESSION')
        );
      }

      const syncData = StreamUtils.calculateSyncData(
        activeSession.currentTime,
        activeSession.isPlaying,
        activeSession.updatedAt || new Date()
      );

      socket.emit('sync_response', WebSocketUtils.createSuccessResponse({
        session: activeSession,
        syncData
      }));

    } catch (error) {
      console.error('Erro na sincronização:', error);
      socket.emit('sync_error',
        WebSocketUtils.createErrorResponse('Erro na sincronização', 'SYNC_ERROR')
      );
    }
  }

  /**
   * Handle obter status do stream
   */
  async handleGetStreamStatus(socket, data) {
    try {
      const errors = WebSocketUtils.validateEventData(data, ['roomId']);
      if (errors.length > 0) {
        return socket.emit('stream_status_error',
          WebSocketUtils.createErrorResponse(errors.join(', '), 'VALIDATION_ERROR')
        );
      }

      const { roomId } = data;

      const activeSession = await this.streamingService.getActiveSession(roomId);

      socket.emit('stream_status_response', WebSocketUtils.createSuccessResponse({
        hasActiveSession: !!activeSession,
        session: activeSession,
        syncData: activeSession ? StreamUtils.calculateSyncData(
          activeSession.currentTime,
          activeSession.isPlaying,
          activeSession.updatedAt || new Date()
        ) : null
      }));

    } catch (error) {
      console.error('Erro ao obter status do stream:', error);
      socket.emit('stream_status_error',
        WebSocketUtils.createErrorResponse('Erro interno', 'INTERNAL_ERROR')
      );
    }
  }
}