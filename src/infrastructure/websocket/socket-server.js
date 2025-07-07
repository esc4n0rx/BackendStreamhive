import { Server } from 'socket.io';
import { SocketMiddleware } from './socket-middleware.js';
import { RoomHandler } from './socket-handlers/room-handler.js';
import { StreamingHandler } from './socket-handlers/streaming-handler.js';
import { ChatHandler } from './socket-handlers/chat-handler.js';
import { config } from '../../config/environment.js';

/**
 * Servidor WebSocket principal
 */
export class SocketServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.nodeEnv === 'production' 
          ? ['https://yourdomain.com'] 
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling']
    });

    this.middleware = new SocketMiddleware();
    this.setupMiddlewares();
    this.setupHandlers();
    this.setupConnectionHandling();
  }

  /**
   * Configura middlewares
   */
  setupMiddlewares() {
    // Middleware de autenticação
    this.io.use((socket, next) => this.middleware.authenticate(socket, next));
    
    // Middleware de rate limiting
    this.io.use(this.middleware.createRateLimitMiddleware(30, 60000));
    
    // Middleware de logging (apenas em desenvolvimento)
    if (config.nodeEnv === 'development') {
      this.io.use((socket, next) => this.middleware.logging(socket, next));
    }
  }

  /**
   * Configura handlers de eventos
   */
  setupHandlers() {
    this.roomHandler = new RoomHandler(this.io);
    this.streamingHandler = new StreamingHandler(this.io);
    this.chatHandler = new ChatHandler(this.io);
  }

  /**
   * Configura tratamento de conexões
   */
  setupConnectionHandling() {
    this.io.on('connection', (socket) => {
      console.log(`[Socket.IO] Nova conexão: ${socket.id} (${socket.userName})`);
      
      // Adicionar timestamp de conexão
      socket.connectedAt = new Date().toISOString();

      // Registrar handlers
      this.roomHandler.register(socket);
      this.streamingHandler.register(socket);
      this.chatHandler.register(socket);

      // Eventos globais
      socket.on('ping', () => {
        socket.emit('pong', {
          timestamp: new Date().toISOString(),
          userId: socket.userId
        });
      });

      socket.on('disconnect', (reason) => {
        console.log(`[Socket.IO] Desconexão: ${socket.id} (${socket.userName}) - Motivo: ${reason}`);
      });

      // Enviar confirmação de conexão
      socket.emit('connected', {
        success: true,
        message: 'Conectado ao servidor WebSocket',
        userId: socket.userId,
        socketId: socket.id,
        timestamp: socket.connectedAt
      });
    });

    // Estatísticas de conexão
    setInterval(() => {
      const connectedSockets = this.io.engine.clientsCount;
      console.log(`[Socket.IO] Conexões ativas: ${connectedSockets}`);
    }, 60000); // Log a cada minuto
  }

  /**
   * Envia mensagem para sala específica
   */
  emitToRoom(roomId, event, data) {
    const roomName = `room_${roomId}`;
    this.io.to(roomName).emit(event, data);
  }

  /**
   * Envia mensagem para usuário específico
   */
  emitToUser(userId, event, data) {
    // Buscar socket do usuário (assumindo que só há uma conexão por usuário)
    const userSockets = Array.from(this.io.sockets.sockets.values())
      .filter(socket => socket.userId === userId);
    
    userSockets.forEach(socket => {
      socket.emit(event, data);
    });
  }

  /**
   * Obtém estatísticas do servidor
   */
  getStats() {
    return {
      connectedSockets: this.io.engine.clientsCount,
      rooms: Array.from(this.io.sockets.adapter.rooms.keys())
        .filter(room => room.startsWith('room_')),
      uptime: process.uptime()
    };
  }

  /**
   * Fecha servidor WebSocket
   */
  close() {
    this.io.close();
  }
}