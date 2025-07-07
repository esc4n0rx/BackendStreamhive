/**
 * Interface do repositório de sessões de streaming
 */
export class StreamingSessionRepository {
  async findById(id) {
    throw new Error('Método findById deve ser implementado');
  }

  async findActiveByRoomId(roomId) {
    throw new Error('Método findActiveByRoomId deve ser implementado');
  }

  async create(sessionData) {
    throw new Error('Método create deve ser implementado');
  }

  async update(id, sessionData) {
    throw new Error('Método update deve ser implementado');
  }

  async endSession(id) {
    throw new Error('Método endSession deve ser implementado');
  }

  async findByRoomId(roomId) {
    throw new Error('Método findByRoomId deve ser implementado');
  }
}