/**
 * Interface do repositório de participantes
 */
export class RoomParticipantRepository {
  async findById(id) {
    throw new Error('Método findById deve ser implementado');
  }

  async findByRoomId(roomId) {
    throw new Error('Método findByRoomId deve ser implementado');
  }

  async findByUserAndRoom(userId, roomId) {
    throw new Error('Método findByUserAndRoom deve ser implementado');
  }

  async create(participantData) {
    throw new Error('Método create deve ser implementado');
  }

  async update(id, participantData) {
    throw new Error('Método update deve ser implementado');
  }

  async delete(id) {
    throw new Error('Método delete deve ser implementado');
  }

  async countActiveByRoom(roomId) {
    throw new Error('Método countActiveByRoom deve ser implementado');
  }
}