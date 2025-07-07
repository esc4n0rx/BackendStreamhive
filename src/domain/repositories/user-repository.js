/**
 * Interface do repositório de usuários
 * Define os contratos que as implementações devem seguir
 */
export class UserRepository {
  async findByEmail(email) {
    throw new Error('Método findByEmail deve ser implementado');
  }

  async findById(id) {
    throw new Error('Método findById deve ser implementado');
  }

  async create(userData) {
    throw new Error('Método create deve ser implementado');
  }

  async update(id, userData) {
    throw new Error('Método update deve ser implementado');
  }

  async delete(id) {
    throw new Error('Método delete deve ser implementado');
  }
}