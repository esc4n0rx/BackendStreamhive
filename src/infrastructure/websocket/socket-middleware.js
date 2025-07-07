import { JWTUtils } from '../../utils/jwt-utils.js';
import { SupabaseUserRepository } from '../repositories/supabase-user-repository.js';
import { WebSocketUtils } from '../../utils/websocket-utils.js';

/**
 * Middleware de autenticação para WebSocket
 */
export class SocketMiddleware {
  constructor() {
    this.userRepository = new SupabaseUserRepository();
  }

  /**
   * Middleware de autenticação
   */
  async authenticate(socket, next) {
    try {
      const token = WebSocketUtils.extractTokenFromHandshake(socket);
      
      if (!token) {
        return next(new Error('Token de autenticação necessário'));
      }

      // Verificar token
      const decoded = JWTUtils.verifyToken(token);
      
      // Buscar usuário
      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        return next(new Error('Usuário não encontrado'));
      }

      // Adicionar dados do usuário ao socket
      socket.userId = user.id;
      socket.userEmail = user.email;
      socket.userName = user.nome;
      socket.user = user.toPublic();

      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  }

  /**
   * Middleware de rate limiting
   */
  createRateLimitMiddleware(maxEvents = 30, windowMs = 60000) {
    const rateLimiter = WebSocketUtils.createRateLimiter(maxEvents, windowMs);

    return (socket, next) => {
      const originalEmit = socket.emit;
      
      socket.emit = function(...args) {
        if (!rateLimiter(socket.userId)) {
          socket.emit('error', WebSocketUtils.createErrorResponse(
            'Muitos eventos enviados. Tente novamente em alguns segundos.',
            'RATE_LIMIT_EXCEEDED'
          ));
          return;
        }
        
        return originalEmit.apply(this, args);
      };

      next();
    };
  }

  /**
   * Middleware de logging
   */
  logging(socket, next) {
    const originalOn = socket.on;
    
    socket.on = function(event, handler) {
      const wrappedHandler = (...args) => {
        console.log(`[Socket.IO] ${socket.id} (${socket.userName || 'Unknown'}) -> ${event}`, {
          timestamp: new Date().toISOString(),
          userId: socket.userId,
          data: args[0]
        });
        
        return handler.apply(this, args);
      };
      
      return originalOn.call(this, event, wrappedHandler);
    };

    next();
  }
}