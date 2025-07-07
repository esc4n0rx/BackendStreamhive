/**
 * Interface do repositório de salas
 */
export class RoomRepository {
  async findById(id) {
    throw new Error('Método findById deve ser implementado');
  }

  async findByCode(code) {
    throw new Error('Método findByCode deve ser implementado');
  }

  async findByOwnerId(ownerId) {
    throw new Error('Método findByOwnerId deve ser implementado');
  }

  async findPublicRooms() {
    throw new Error('Método findPublicRooms deve ser implementado');
  }

  async create(roomData) {
    throw new Error('Método create deve ser implementado');
  }

  async update(id, roomData) {
    throw new Error('Método update deve ser implementado');
  }

  async delete(id) {
    throw new Error('Método delete deve ser implementado');
  }

  async countActiveParticipants(roomId) {
    throw new Error('Método countActiveParticipants deve ser implementado');
  }
}