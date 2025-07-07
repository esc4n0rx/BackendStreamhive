 import { supabase } from '../../config/database.js';
import { UserRepository } from '../../domain/repositories/user-repository.js';
import { User } from '../../domain/entities/user.js';

/**
 * Implementação do repositório de usuários usando Supabase
 */
export class SupabaseUserRepository extends UserRepository {
  constructor() {
    super();
    this.tableName = 'users';
  }

  /**
   * Busca usuário por email
   */
  async findByEmail(email) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }

    return data ? new User(data) : null;
  }

  /**
   * Busca usuário por ID
   */
  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }

    return data ? new User(data) : null;
  }

  /**
   * Cria novo usuário
   */
  async create(userData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }

    return new User(data);
  }

  /**
   * Atualiza usuário
   */
  async update(id, userData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }

    return new User(data);
  }

  /**
   * Deleta usuário
   */
  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }

    return true;
  }
}
