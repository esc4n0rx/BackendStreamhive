import { Router } from 'express';
import { RoomController } from '../controllers/room-controller.js';
import { validateRequest } from '../middlewares/validation-middleware.js';
import { authenticateToken } from '../middlewares/auth-middleware.js';
import { roomValidators } from '../validators/room-validators.js';

const router = Router();
const roomController = new RoomController();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

/**
 * Rota para criar sala
 * POST /rooms
 */
router.post('/',
  validateRequest(roomValidators.createRoom),
  roomController.createRoom
);

/**
 * Rota para buscar sala por código
 * GET /rooms/code/:code
 */
router.get('/code/:code',
  roomController.getRoomByCode
);

/**
 * Rota para entrar na sala
 * POST /rooms/join
 */
router.post('/join',
  validateRequest(roomValidators.joinRoom),
  roomController.joinRoom
);

/**
 * Rota para usar convite
 * POST /rooms/invite/use
 */
router.post('/invite/use',
  validateRequest(roomValidators.useInvite),
  roomController.useInvite
);

/**
 * Rota para sair da sala
 * POST /rooms/:roomId/leave
 */
router.post('/:roomId/leave',
  roomController.leaveRoom
);

/**
 * Rota para listar participantes da sala
 * GET /rooms/:roomId/participants
 */
router.get('/:roomId/participants',
  roomController.getRoomParticipants
);

/**
 * Rota para listar salas do usuário
 * GET /rooms/my
 */
router.get('/my',
  roomController.getUserRooms
);

/**
 * Rota para listar salas públicas
 * GET /rooms/public
 */
router.get('/public',
  roomController.getPublicRooms
);

/**
 * Rota para atualizar sala
 * PUT /rooms/:roomId
 */
router.put('/:roomId',
  validateRequest(roomValidators.updateRoom),
  roomController.updateRoom
);

/**
 * Rota para deletar sala
 * DELETE /rooms/:roomId
 */
router.delete('/:roomId',
  roomController.deleteRoom
);

/**
 * Rota para criar convite
 * POST /rooms/:roomId/invites
 */
router.post('/:roomId/invites',
  validateRequest(roomValidators.createInvite),
  roomController.createInvite
);

/**
 * Rota para listar convites da sala
 * GET /rooms/:roomId/invites
 */
router.get('/:roomId/invites',
  roomController.getRoomInvites
);

/**
 * Rota para desativar convite
 * DELETE /rooms/invites/:inviteId
 */
router.delete('/invites/:inviteId',
  roomController.deactivateInvite
);

export default router;