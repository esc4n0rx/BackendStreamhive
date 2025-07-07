import { supabase } from '../../config/database.js';
import { RoomRepository } from '../../domain/repositories/room-repository.js';
import { Room } from '../../domain/entities/room.js';

/**
 * Implementação do repositório de salas usando Supabase
 */
export class SupabaseRoomRepository extends RoomRepository {
  constructor() {
    super();
    this.tableName = 'rooms';
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar sala: ${error.message}`);
    }

    return data ? new Room({
      id: data.id,
      nome: data.nome,
      descricao: data.descricao,
      codigoSala: data.codigo_sala,
      ownerId: data.owner_id,
      isPublic: data.is_public,
      maxParticipants: data.max_participants,
      senha: data.senha,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }) : null;
  }

  async findByCode(code) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('codigo_sala', code)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar sala: ${error.message}`);
    }

    return data ? new Room({
      id: data.id,
      nome: data.nome,
      descricao: data.descricao,
      codigoSala: data.codigo_sala,
      ownerId: data.owner_id,
      isPublic: data.is_public,
      maxParticipants: data.max_participants,
      senha: data.senha,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }) : null;
  }

  async findByOwnerId(ownerId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', ownerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar salas: ${error.message}`);
    }

    return data.map(item => new Room({
      id: item.id,
      nome: item.nome,
      descricao: item.descricao,
      codigoSala: item.codigo_sala,
      ownerId: item.owner_id,
      isPublic: item.is_public,
      maxParticipants: item.max_participants,
      senha: item.senha,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  async findPublicRooms() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('is_public', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar salas públicas: ${error.message}`);
    }

    return data.map(item => new Room({
      id: item.id,
      nome: item.nome,
      descricao: item.descricao,
      codigoSala: item.codigo_sala,
      ownerId: item.owner_id,
      isPublic: item.is_public,
      maxParticipants: item.max_participants,
      senha: item.senha,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  async create(roomData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([roomData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar sala: ${error.message}`);
    }

    return new Room({
      id: data.id,
      nome: data.nome,
      descricao: data.descricao,
      codigoSala: data.codigo_sala,
      ownerId: data.owner_id,
      isPublic: data.is_public,
      maxParticipants: data.max_participants,
      senha: data.senha,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  }

  async update(id, roomData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        ...roomData,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar sala: ${error.message}`);
    }

    return new Room({
      id: data.id,
      nome: data.nome,
      descricao: data.descricao,
      codigoSala: data.codigo_sala,
      ownerId: data.owner_id,
      isPublic: data.is_public,
      maxParticipants: data.max_participants,
      senha: data.senha,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar sala: ${error.message}`);
    }

    return true;
  }
}