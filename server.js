import app from './src/app.js';
import { config } from './src/config/environment.js';

/**
 * Inicia o servidor
 */
const startServer = () => {
  try {
    app.listen(config.port, () => {
      console.log(`
🚀 Streamhive API iniciada com sucesso!
🌍 Ambiente: ${config.nodeEnv}
📡 Porta: ${config.port}
🔗 URL: http://localhost:${config.port}
📊 Health Check: http://localhost:${config.port}/health
      `);
    });
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