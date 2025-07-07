/**
 * Interface do repositório de convites
 */
export class RoomInviteRepository {
  async findById(id) {
    throw new Error('Método findById deve ser implementado');
  }

  async findByCode(code) {
    throw new Error('Método findByCode deve ser implementado');
  }

  async findByRoomId(roomId) {
    throw new Error('Método findByRoomId deve ser implementado');
  }

  async create(inviteData) {
    throw new Error('Método create deve ser implementado');
  }

  async update(id, inviteData) {
    throw new Error('Método update deve ser implementado');
  }

  async delete(id) {
    throw new Error('Método delete deve ser implementado');
  }
}