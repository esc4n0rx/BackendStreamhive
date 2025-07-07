/**
 * Entidade RoomParticipant - Representa um participante da sala
 */
export class RoomParticipant {
  constructor({ 
    id, 
    roomId, 
    userId, 
    role, 
    joinedAt, 
    leftAt, 
    isActive 
  }) {
    this.id = id;
    this.roomId = roomId;
    this.userId = userId;
    this.role = role;
    this.joinedAt = joinedAt;
    this.leftAt = leftAt;
    this.isActive = isActive;
  }

  /**
   * Retorna dados do participante
   */
  toPublic() {
    return {
      id: this.id,
      roomId: this.roomId,
      userId: this.userId,
      role: this.role,
      joinedAt: this.joinedAt,
      leftAt: this.leftAt,
      isActive: this.isActive
    };
  }

  /**
   * Verifica se é o dono da sala
   */
  isOwner() {
    return this.role === 'owner';
  }

  /**
   * Verifica se é moderador
   */
  isModerator() {
    return this.role === 'moderator';
  }

  /**
   * Verifica se pode gerenciar a sala
   */
  canManageRoom() {
    return this.role === 'owner' || this.role === 'moderator';
  }
}