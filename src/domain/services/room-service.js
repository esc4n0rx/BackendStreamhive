import { RoomUtils } from '../../utils/room-utils.js';

/**
 * Serviço de salas - contém a lógica de negócio
 */
export class RoomService {
  constructor(roomRepository, roomParticipantRepository) {
    this.roomRepository = roomRepository;
    this.roomParticipantRepository = roomParticipantRepository;
  }

  /**
   * Cria nova sala
   */
  async createRoom({ nome, descricao, isPublic, senha, ownerId }) {
    // Gerar código único
    let codigoSala;
    let existingRoom;
    
    do {
      codigoSala = RoomUtils.generateRoomCode();
      existingRoom = await this.roomRepository.findByCode(codigoSala);
    } while (existingRoom);

    // Hash da senha se sala privada
    let hashedPassword = null;
    if (!isPublic && senha) {
      hashedPassword = await RoomUtils.hashRoomPassword(senha);
    }

    // Criar sala
    const roomData = {
      nome,
      descricao,
      codigo_sala: codigoSala,
      owner_id: ownerId,
      is_public: isPublic,
      max_participants: 10,
      senha: hashedPassword,
      is_active: true
    };

    const room = await this.roomRepository.create(roomData);

    // Adicionar owner como participante
    await this.roomParticipantRepository.create({
      room_id: room.id,
      user_id: ownerId,
      role: 'owner',
      is_active: true
    });

    return room.toPublic();
  }

  /**
   * Busca sala por código
   */
  async getRoomByCode(code) {
    const room = await this.roomRepository.findByCode(code);
    
    if (!room) {
      throw new Error('Sala não encontrada');
    }

    if (!room.isActive) {
      throw new Error('Sala não está ativa');
    }

    return room.toPublic();
  }

  /**
   * Entra na sala
   */
  async joinRoom({ codigoSala, userId, senha }) {
    const room = await this.roomRepository.findByCode(codigoSala);
    
    if (!room) {
      throw new Error('Sala não encontrada');
    }

    if (!room.isActive) {
      throw new Error('Sala não está ativa');
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

    // Verificar senha se necessário
    if (room.requiresPassword()) {
      if (!senha) {
        throw new Error('Senha é obrigatória para esta sala');
      }

      const isPasswordValid = await RoomUtils.verifyRoomPassword(senha, room.senha);
      if (!isPasswordValid) {
        throw new Error('Senha incorreta');
      }
    }

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
      message: 'Entrou na sala com sucesso'
    };
  }

  /**
   * Sai da sala
   */
  async leaveRoom({ roomId, userId }) {
    const participant = await this.roomParticipantRepository.findByUserAndRoom(userId, roomId);
    
    if (!participant || !participant.isActive) {
      throw new Error('Usuário não está na sala');
    }

    // Atualizar participante
    await this.roomParticipantRepository.update(participant.id, {
      is_active: false,
      left_at: new Date()
    });

    return { message: 'Saiu da sala com sucesso' };
  }

  /**
   * Lista participantes da sala
   */
  async getRoomParticipants(roomId) {
    const participants = await this.roomParticipantRepository.findActiveByRoomId(roomId);
    return participants.map(p => ({
      ...p.toPublic(),
      user: p.user
    }));
  }

  /**
   * Lista salas do usuário
   */
  async getUserRooms(userId) {
    const rooms = await this.roomRepository.findByOwnerId(userId);
    return rooms.map(room => room.toPublic());
  }

  /**
   * Lista salas públicas
   */
  async getPublicRooms() {
    const rooms = await this.roomRepository.findPublicRooms();
    return rooms.map(room => room.toPublic());
  }

  /**
   * Atualiza sala
   */
  async updateRoom({ roomId, userId, nome, descricao, isPublic, senha }) {
    const room = await this.roomRepository.findById(roomId);
    
    if (!room) {
      throw new Error('Sala não encontrada');
    }

    // Verificar se usuário é o dono
    if (room.ownerId !== userId) {
      throw new Error('Apenas o dono pode editar a sala');
    }

    const updateData = {};
    
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (isPublic !== undefined) updateData.is_public = isPublic;
    
    // Atualizar senha se fornecida
    if (senha !== undefined && senha !== null) {
      if (!isPublic && senha) {
        updateData.senha = await RoomUtils.hashRoomPassword(senha);
      } else {
        updateData.senha = null;
      }
    }

    const updatedRoom = await this.roomRepository.update(roomId, updateData);
    return updatedRoom.toPublic();
  }

  /**
   * Deleta sala
   */
  async deleteRoom({ roomId, userId }) {
    const room = await this.roomRepository.findById(roomId);
    
    if (!room) {
      throw new Error('Sala não encontrada');
    }

    // Verificar se usuário é o dono
    if (room.ownerId !== userId) {
      throw new Error('Apenas o dono pode deletar a sala');
    }

    await this.roomRepository.delete(roomId);
    return { message: 'Sala deletada com sucesso' };
  }
}