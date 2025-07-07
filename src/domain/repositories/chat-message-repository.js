/**
 * Interface do repositório de mensagens do chat
 */
export class ChatMessageRepository {
  async findById(id) {
    throw new Error('Método findById deve ser implementado');
  }

  async findByRoomId(roomId, limit = 50) {
    throw new Error('Método findByRoomId deve ser implementado');
  }

  async create(messageData) {
    throw new Error('Método create deve ser implementado');
  }

  async delete(id) {
    throw new Error('Método delete deve ser implementado');
  }

  async deleteByRoomId(roomId) {
    throw new Error('Método deleteByRoomId deve ser implementado');
  }
}