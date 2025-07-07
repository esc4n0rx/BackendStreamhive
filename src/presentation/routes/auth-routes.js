 import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller.js';
import { validateRequest } from '../middlewares/validation-middleware.js';
import { authenticateToken } from '../middlewares/auth-middleware.js';
import { authValidators } from '../validators/auth-validators.js';

const router = Router();
const authController = new AuthController();

/**
 * Rota para registro de usuário
 * POST /auth/register
 */
router.post('/register', 
  validateRequest(authValidators.register),
  authController.register
);

/**
 * Rota para login
 * POST /auth/login
 */
router.post('/login',
  validateRequest(authValidators.login),
  authController.login
);

/**
 * Rota para obter dados do usuário autenticado
 * GET /auth/me
 */
router.get('/me',
  authenticateToken,
  authController.me
);

export default router;
