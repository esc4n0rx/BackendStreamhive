/**
 * Entidade RoomInvite - Representa um convite para sala
 */
export class RoomInvite {
  constructor({ 
    id, 
    roomId, 
    invitedBy, 
    invitedEmail, 
    inviteCode, 
    expiresAt, 
    usedAt, 
    usedBy, 
    isActive, 
    createdAt 
  }) {
    this.id = id;
    this.roomId = roomId;
    this.invitedBy = invitedBy;
    this.invitedEmail = invitedEmail;
    this.inviteCode = inviteCode;
    this.expiresAt = expiresAt;
    this.usedAt = usedAt;
    this.usedBy = usedBy;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }

  /**
   * Retorna dados do convite
   */
  toPublic() {
    return {
      id: this.id,
      roomId: this.roomId,
      invitedBy: this.invitedBy,
      invitedEmail: this.invitedEmail,
      inviteCode: this.inviteCode,
      expiresAt: this.expiresAt,
      usedAt: this.usedAt,
      usedBy: this.usedBy,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }

  /**
   * Verifica se o convite está válido
   */
  isValid() {
    const now = new Date();
    return (
      this.isActive &&
      !this.usedAt &&
      new Date(this.expiresAt) > now
    );
  }

  /**
   * Verifica se o convite expirou
   */
  isExpired() {
    const now = new Date();
    return new Date(this.expiresAt) <= now;
  }
}