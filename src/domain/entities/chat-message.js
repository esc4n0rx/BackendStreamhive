/**
 * Entidade ChatMessage - Representa uma mensagem do chat
 */
export class ChatMessage {
  constructor({ 
    id, 
    roomId, 
    userId, 
    username,
    message, 
    messageType, 
    timestamp, 
    createdAt 
  }) {
    this.id = id;
    this.roomId = roomId;
    this.userId = userId;
    this.username = username;
    this.message = message;
    this.messageType = messageType || 'text'; // text, system, emoji
    this.timestamp = timestamp || new Date();
    this.createdAt = createdAt || new Date();
  }

  /**
   * Retorna dados públicos da mensagem
   */
  toPublic() {
    return {
      id: this.id,
      roomId: this.roomId,
      userId: this.userId,
      username: this.username,
      message: this.message,
      messageType: this.messageType,
      timestamp: this.timestamp,
      createdAt: this.createdAt
    };
  }

  /**
   * Verifica se é uma mensagem do sistema
   */
  isSystemMessage() {
    return this.messageType === 'system';
  }

  /**
   * Valida o conteúdo da mensagem
   */
  isValid() {
    return this.message && 
           this.message.length > 0 && 
           this.message.length <= 500 &&
           this.userId &&
           this.roomId;
  }
}