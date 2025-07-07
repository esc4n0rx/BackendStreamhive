import { RoomUtils } from '../../utils/room-utils.js';

/**
 * Serviço de convites para salas
 */
export class RoomInviteService {
  constructor(roomInviteRepository, roomRepository, roomParticipantRepository) {
    this.roomInviteRepository = roomInviteRepository;
    this.roomRepository = roomRepository;
    this.roomParticipantRepository = roomParticipantRepository;
  }

  /**
   * Cria convite para sala
   */
  async createInvite({ roomId, userId, invitedEmail, expiresInHours = 24 }) {
    // Verificar se sala existe
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Sala não encontrada');
    }

    // Verificar se usuário pode criar convites (owner ou moderator)
    const participant = await this.roomParticipantRepository.findByUserAndRoom(userId, roomId);
    if (!participant || !participant.canManageRoom()) {
      throw new Error('Apenas donos e moderadores podem criar convites');
    }

    // Gerar código único
    let inviteCode;
    let existingInvite;
    
    do {
      inviteCode = RoomUtils.generateInviteCode();
      existingInvite = await this.roomInviteRepository.findByCode(inviteCode);
    } while (existingInvite);

    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Criar convite
    const inviteData = {
      room_id: roomId,
      invited_by: userId,
      invited_email: invitedEmail,
      invite_code: inviteCode,
      expires_at: expiresAt,
      is_active: true
    };

    const invite = await this.roomInviteRepository.create(inviteData);

    return {
      invite: invite.toPublic(),
      inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${inviteCode}`
    };
  }

  /**
   * Usa convite para entrar na sala
   */
  async useInvite({ inviteCode, userId }) {
    // Buscar convite
    const invite = await this.roomInviteRepository.findByCode(inviteCode);
    if (!invite) {
      throw new Error('Convite não encontrado');
    }

    // Verificar se convite é válido
    if (!invite.isValid()) {
      if (invite.isExpired()) {
        throw new Error('Convite expirado');
      }
      if (invite.usedAt) {
        throw new Error('Convite já foi usado');
      }
      throw new Error('Convite inválido');
    }

    // Verificar se sala existe e está ativa
    const room = await this.roomRepository.findById(invite.roomId);
    if (!room || !room.isActive) {
      throw new Error('Sala não encontrada ou inativa');
    }

    // Verificar se usuário já está na sala
    const existingParticipant = await this.roomParticipantRepository.findByUserAndRoom(userId, room.id);
    if (existingParticipant && existingParticipant.isActive) {
      throw new Error('Usuário já está na sala');
    }

    // Verificar limite de participantes
    const activeParticipants = await this.roomParticipantRepository.countActiveByRoom(room.id);
    if (activeParticipants >= room.maxParticipants) {
      throw new Error('Sala lotada');
    }

    // Marcar convite como usado
    await this.roomInviteRepository.update(invite.id, {
      used_at: new Date(),
      used_by: userId
    });

    // Adicionar/reativar participante
    if (existingParticipant) {
      await this.roomParticipantRepository.update(existingParticipant.id, {
        is_active: true,
        joined_at: new Date(),
        left_at: null
      });
    } else {
      await this.roomParticipantRepository.create({
        room_id: room.id,
        user_id: userId,
        role: 'participant',
        is_active: true
      });
    }

    return {
      room: room.toPublic(),
      message: 'Entrou na sala via convite com sucesso'
    };
  }

  /**
   * Lista convites da sala
   */
  async getRoomInvites(roomId, userId) {
    // Verificar se usuário pode ver convites
    const participant = await this.roomParticipantRepository.findByUserAndRoom(userId, roomId);
    if (!participant || !participant.canManageRoom()) {
      throw new Error('Apenas donos e moderadores podem ver convites');
    }

    const invites = await this.roomInviteRepository.findByRoomId(roomId);
    return invites.map(invite => invite.toPublic());
  }

  /**
   * Desativa convite
   */
  async deactivateInvite({ inviteId, userId }) {
    const invite = await this.roomInviteRepository.findById(inviteId);
    if (!invite) {
      throw new Error('Convite não encontrado');
    }

    // Verificar se usuário pode desativar convite
    const participant = await this.roomParticipantRepository.findByUserAndRoom(userId, invite.roomId);
    if (!participant || !participant.canManageRoom()) {
      throw new Error('Apenas donos e moderadores podem desativar convites');
    }

    await this.roomInviteRepository.update(inviteId, {
      is_active: false
    });

    return { message: 'Convite desativado com sucesso' };
  }
}