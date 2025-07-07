import { createServer } from 'http';
import app from './src/app.js';
import { config } from './src/config/environment.js';
import { SocketServer } from './src/infrastructure/websocket/socket-server.js';

/**
 * Inicia o servidor HTTP e WebSocket
 */
const startServer = () => {
  try {
    // Criar servidor HTTP
    const httpServer = createServer(app);
    
    // Inicializar WebSocket
    const socketServer = new SocketServer(httpServer);
    
    // Iniciar servidor
    httpServer.listen(config.port, () => {
      console.log(`
🚀 Streamhive API iniciada com sucesso!
🌍 Ambiente: ${config.nodeEnv}
📡 Porta: ${config.port}
🔗 URL: http://localhost:${config.port}
📊 Health Check: http://localhost:${config.port}/health
🔌 WebSocket: Habilitado
⚡ Socket.IO: Configurado
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n🔄 Iniciando shutdown graceful...');
      
      socketServer.close();
      
      httpServer.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
      });
      
      // Force close após 10 segundos
      setTimeout(() => {
        console.log('❌ Forçando encerramento...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();