import { StreamProxyService } from './stream-proxy-service.js';

/**
 * Serviço de streaming - lógica de negócio para sessões de streaming
 */
export class StreamingService {
  constructor(streamingSessionRepository, roomRepository, roomParticipantRepository) {
    this.streamingSessionRepository = streamingSessionRepository;
    this.roomRepository = roomRepository;
    this.roomParticipantRepository = roomParticipantRepository;
    this.streamProxyService = new StreamProxyService();
  }

  /**
   * Inicia nova sessão de streaming
   */
  async startStreamingSession({ roomId, userId, videoUrl, title, description }) {
    // Verificar se sala existe
    const room = await this.roomRepository.findById(roomId);
    if (!room || !room.isActive) {
      throw new Error('Sala não encontrada ou inativa');
    }

    // Verificar se usuário pode iniciar stream (owner ou moderator)
    const participant = await this.roomParticipantRepository.findByUserAndRoom(userId, roomId);
    if (!participant || !participant.canManageRoom()) {
      throw new Error('Apenas donos e moderadores podem iniciar streaming');
    }

    // Verificar se já existe sessão ativa na sala
    const activeSession = await this.streamingSessionRepository.findActiveByRoomId(roomId);
    if (activeSession) {
      throw new Error('Já existe uma sessão ativa nesta sala');
    }

    // Processar URL do vídeo
    const streamInfo = await this.streamProxyService.processStreamUrl(videoUrl);

    // Criar sessão
    const sessionData = {
      room_id: roomId,
      started_by: userId,
      title: title || streamInfo.title,
      description: description || streamInfo.description,
      video_url: streamInfo.streamUrl,
      current_time: 0,
      is_playing: false,
      is_active: true,
      started_at: new Date()
    };

    const session = await this.streamingSessionRepository.create(sessionData);

    return {
      session: session.toPublic(),
      streamInfo
    };
  }

  /**
   * Para sessão de streaming
   */
  async stopStreamingSession({ roomId, userId }) {
    const activeSession = await this.streamingSessionRepository.findActiveByRoomId(roomId);
    if (!activeSession) {
      throw new Error('Nenhuma sessão ativa encontrada');
    }

    // Verificar permissões
    const participant = await this.roomParticipantRepository.findByUserAndRoom(userId, roomId);
    if (!participant || (!participant.canManageRoom() && activeSession.startedBy !== userId)) {
      throw new Error('Sem permissão para parar o streaming');
    }

    const endedSession = await this.streamingSessionRepository.endSession(activeSession.id);
    return endedSession.toPublic();
  }

  /**
   * Atualiza estado de reprodução
   */
  async updatePlaybackState({ roomId, userId, isPlaying, currentTime }) {
    const activeSession = await this.streamingSessionRepository.findActiveByRoomId(roomId);
    if (!activeSession) {
      throw new Error('Nenhuma sessão ativa encontrada');
    }

    // Verificar permissões
    const participant = await this.roomParticipantRepository.findByUserAndRoom(userId, roomId);
    if (!participant || !participant.canManageRoom()) {
      throw new Error('Apenas donos e moderadores podem controlar a reprodução');
    }

    const updateData = {};
    if (isPlaying !== undefined) updateData.is_playing = isPlaying;
    if (currentTime !== undefined) updateData.current_time = Math.max(0, currentTime);

    const updatedSession = await this.streamingSessionRepository.update(activeSession.id, updateData);
    return updatedSession.toPublic();
  }

  /**
   * Sincroniza posição do vídeo
   */
  async seekToPosition({ roomId, userId, position }) {
    const activeSession = await this.streamingSessionRepository.findActiveByRoomId(roomId);
    if (!activeSession) {
      throw new Error('Nenhuma sessão ativa encontrada');
    }

    // Verificar permissões
    const participant = await this.roomParticipantRepository.findByUserAndRoom(userId, roomId);
    if (!participant || !participant.canManageRoom()) {
      throw new Error('Apenas donos e moderadores podem alterar a posição');
    }

    const updatedSession = await this.streamingSessionRepository.update(activeSession.id, {
      current_time: Math.max(0, position)
    });

    return updatedSession.toPublic();
  }

  /**
   * Obtém sessão ativa da sala
   */
  async getActiveSession(roomId) {
    const activeSession = await this.streamingSessionRepository.findActiveByRoomId(roomId);
    return activeSession ? activeSession.toPublic() : null;
  }

  /**
   * Valida URL de streaming
   */
  async validateStreamUrl(url) {
    return await this.streamProxyService.validateUrl(url);
  }

  /**
   * Obtém tipos de URL suportados
   */
  getSupportedUrlTypes() {
    return this.streamProxyService.getSupportedTypes();
  }
}