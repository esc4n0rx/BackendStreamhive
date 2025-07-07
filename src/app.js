import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/environment.js';
import { errorHandler } from './presentation/middlewares/error-handler.js';
import authRoutes from './presentation/routes/auth-routes.js';
import roomRoutes from './presentation/routes/room-routes.js';
import streamingRoutes from './presentation/routes/streaming-routes.js';

/**
 * Configuração principal da aplicação Express
 */
const app = express();

// Middlewares de segurança
app.use(helmet({
  crossOriginEmbedderPolicy: false // Necessário para WebSocket
}));

app.use(cors({
  origin: config.nodeEnv === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:5500'],
  credentials: true
}));

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Streamhive API está funcionando',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    websocket: 'enabled'
  });
});

// Rotas da API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/streaming', streamingRoutes);

// Rota para endpoints não encontrados
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado'
  });
});

// Middleware global de tratamento de erros
app.use(errorHandler);

export default app;