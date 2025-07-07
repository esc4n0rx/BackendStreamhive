/**
 * Entidade Room - Representa uma sala de streaming
 */
export class Room {
  constructor({ 
    id, 
    nome, 
    descricao, 
    codigoSala, 
    ownerId, 
    isPublic, 
    maxParticipants, 
    senha, 
    isActive, 
    createdAt, 
    updatedAt 
  }) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.codigoSala = codigoSala;
    this.ownerId = ownerId;
    this.isPublic = isPublic;
    this.maxParticipants = maxParticipants;
    this.senha = senha;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Retorna dados da sala sem informações sensíveis
   */
  toPublic() {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      codigoSala: this.codigoSala,
      ownerId: this.ownerId,
      isPublic: this.isPublic,
      maxParticipants: this.maxParticipants,
      isActive: this.isActive,
      createdAt: this.createdAt,
      hasPassword: !this.isPublic && !!this.senha
    };
  }

  /**
   * Verifica se a sala necessita de senha
   */
  requiresPassword() {
    return !this.isPublic && !!this.senha;
  }

  /**
   * Verifica se a sala está ativa
   */
  isRoomActive() {
    return this.isActive;
  }
}