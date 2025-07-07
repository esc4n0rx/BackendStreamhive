/**
 * Entidade StreamingSession - Representa uma sessão de streaming ativa
 */
export class StreamingSession {
  constructor({ 
    id, 
    roomId, 
    startedBy, 
    title, 
    description, 
    videoUrl, 
    currentTime, 
    isPlaying, 
    isActive, 
    startedAt, 
    endedAt, 
    createdAt, 
    updatedAt 
  }) {
    this.id = id;
    this.roomId = roomId;
    this.startedBy = startedBy;
    this.title = title;
    this.description = description;
    this.videoUrl = videoUrl;
    this.currentTime = currentTime || 0;
    this.isPlaying = isPlaying || false;
    this.isActive = isActive || true;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Retorna dados públicos da sessão
   */
  toPublic() {
    return {
      id: this.id,
      roomId: this.roomId,
      startedBy: this.startedBy,
      title: this.title,
      description: this.description,
      videoUrl: this.videoUrl,
      currentTime: this.currentTime,
      isPlaying: this.isPlaying,
      isActive: this.isActive,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      createdAt: this.createdAt
    };
  }

  /**
   * Verifica se a sessão está ativa
   */
  isSessionActive() {
    return this.isActive && !this.endedAt;
  }

  /**
   * Atualiza o tempo atual do vídeo
   */
  updateCurrentTime(time) {
    this.currentTime = Math.max(0, time);
    this.updatedAt = new Date();
  }

  /**
   * Alterna o estado de reprodução
   */
  togglePlayState() {
    this.isPlaying = !this.isPlaying;
    this.updatedAt = new Date();
  }
}