/**
 * Utilitários para WebSocket
 */
export class WebSocketUtils {
  /**
   * Extrai token JWT do handshake
   */
  static extractTokenFromHandshake(socket) {
    const token = socket.handshake.auth?.token || 
                  socket.handshake.headers?.authorization?.split(' ')[1];
    return token;
  }

  /**
   * Cria nome da sala para Socket.IO
   */
  static createRoomName(roomId) {
    return `room_${roomId}`;
  }

  /**
   * Valida dados de evento
   */
  static validateEventData(data, requiredFields) {
    const errors = [];
    
    if (!data || typeof data !== 'object') {
      return ['Dados inválidos'];
    }

    requiredFields.forEach(field => {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        errors.push(`Campo obrigatório: ${field}`);
      }
    });

    return errors;
  }

  /**
   * Cria resposta de erro padronizada
   */
  static createErrorResponse(message, code = 'GENERIC_ERROR') {
    return {
      success: false,
      error: {
        code,
        message
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Cria resposta de sucesso padronizada
   */
  static createSuccessResponse(data = null, message = null) {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Limita a frequência de eventos por usuário
   */
  static createRateLimiter(maxEvents = 10, windowMs = 60000) {
    const userEvents = new Map();

    return (userId) => {
      const now = Date.now();
      const userEventHistory = userEvents.get(userId) || [];
      
      // Remove eventos antigos
      const recentEvents = userEventHistory.filter(
        timestamp => now - timestamp < windowMs
      );

      if (recentEvents.length >= maxEvents) {
        return false; // Rate limit excedido
      }

      recentEvents.push(now);
      userEvents.set(userId, recentEvents);
      
      return true; // Permitido
    };
  }
}