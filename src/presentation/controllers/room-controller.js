import { RoomService } from '../../domain/services/room-service.js';
import { RoomInviteService } from '../../domain/services/room-invite-service.js';
import { SupabaseRoomRepository } from '../../infrastructure/repositories/supabase-room-repository.js';
import { SupabaseRoomParticipantRepository } from '../../infrastructure/repositories/supabase-room-participant-repository.js';
import { SupabaseRoomInviteRepository } from '../../infrastructure/repositories/supabase-room-invite-repository.js';

/**
 * Controller para salas
 */
export class RoomController {
  constructor() {
    this.roomRepository = new SupabaseRoomRepository();
    this.roomParticipantRepository = new SupabaseRoomParticipantRepository();
    this.roomInviteRepository = new SupabaseRoomInviteRepository();
    
    this.roomService = new RoomService(
      this.roomRepository,
      this.roomParticipantRepository
    );
    
    this.roomInviteService = new RoomInviteService(
      this.roomInviteRepository,
      this.roomRepository,
      this.roomParticipantRepository
    );
  }

  /**
   * Cria nova sala
   */
  createRoom = async (req, res, next) => {
    try {
      const { nome, descricao, isPublic, senha } = req.body;
      const userId = req.user.id;

      const room = await this.roomService.createRoom({
        nome,
        descricao,
        isPublic,
        senha,
        ownerId: userId
      });

      res.status(201).json({
        success: true,
        message: 'Sala criada com sucesso',
        data: { room }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca sala por código
   */
  getRoomByCode = async (req, res, next) => {
    try {
      const { code } = req.params;

      const room = await this.roomService.getRoomByCode(code);

      res.status(200).json({
        success: true,
        data: { room }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Entra na sala
   */
  joinRoom = async (req, res, next) => {
    try {
      const { codigoSala, senha } = req.body;
      const userId = req.user.id;

      const result = await this.roomService.joinRoom({
        codigoSala,
        userId,
        senha
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Sai da sala
   */
  leaveRoom = async (req, res, next) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      const result = await this.roomService.leaveRoom({
        roomId,
        userId
      });

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lista participantes da sala
   */
  getRoomParticipants = async (req, res, next) => {
    try {
      const { roomId } = req.params;

      const participants = await this.roomService.getRoomParticipants(roomId);

      res.status(200).json({
        success: true,
        data: { participants }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lista salas do usuário
   */
  getUserRooms = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const rooms = await this.roomService.getUserRooms(userId);

      res.status(200).json({
        success: true,
        data: { rooms }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lista salas públicas
   */
  getPublicRooms = async (req, res, next) => {
    try {
      const rooms = await this.roomService.getPublicRooms();

      res.status(200).json({
        success: true,
        data: { rooms }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Atualiza sala
   */
  updateRoom = async (req, res, next) => {
    try {
      const { roomId } = req.params;
      const { nome, descricao, isPublic, senha } = req.body;
      const userId = req.user.id;

      const room = await this.roomService.updateRoom({
        roomId,
        userId,
        nome,
        descricao,
        isPublic,
        senha
      });

      res.status(200).json({
        success: true,
        message: 'Sala atualizada com sucesso',
        data: { room }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deleta sala
   */
  deleteRoom = async (req, res, next) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      const result = await this.roomService.deleteRoom({
        roomId,
        userId
      });

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cria convite para sala
   */
  createInvite = async (req, res, next) => {
    try {
      const { roomId } = req.params;
      const { invitedEmail, expiresInHours } = req.body;
      const userId = req.user.id;

      const result = await this.roomInviteService.createInvite({
        roomId,
        userId,
        invitedEmail,
        expiresInHours
      });

      res.status(201).json({
        success: true,
        message: 'Convite criado com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Usa convite para entrar na sala
   */
  useInvite = async (req, res, next) => {
    try {
      const { inviteCode } = req.body;
      const userId = req.user.id;

      const result = await this.roomInviteService.useInvite({
        inviteCode,
        userId
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lista convites da sala
   */
  getRoomInvites = async (req, res, next) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      const invites = await this.roomInviteService.getRoomInvites(roomId, userId);

      res.status(200).json({
        success: true,
        data: { invites }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Desativa convite
   */
  deactivateInvite = async (req, res, next) => {
    try {
      const { inviteId } = req.params;
      const userId = req.user.id;

      const result = await this.roomInviteService.deactivateInvite({
        inviteId,
        userId
      });

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };
}