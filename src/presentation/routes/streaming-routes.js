import { Router } from 'express';
import { StreamingController } from '../controllers/streaming-controller.js';
import { validateRequest } from '../middlewares/validation-middleware.js';
import { authenticateToken } from '../middlewares/auth-middleware.js';
import { streamingValidators } from '../validators/streaming-validators.js';

const router = Router();
const streamingController = new StreamingController();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

/**
 * Rota para validar URL de stream
 * POST /streaming/validate-url
 */
router.post('/validate-url',
  validateRequest(streamingValidators.validateUrl),
  streamingController.validateStreamUrl
);

/**
 * Rota para obter sessão ativa da sala
 * GET /streaming/room/:roomId/session
 */
router.get('/room/:roomId/session',
  streamingController.getActiveSession
);

/**
 * Rota para obter histórico do chat
 * GET /streaming/room/:roomId/chat
 */
router.get('/room/:roomId/chat',
  streamingController.getChatHistory
);

export default router;