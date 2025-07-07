import { supabase } from '../../config/database.js';
import { RoomParticipantRepository } from '../../domain/repositories/room-participant-repository.js';
import { RoomParticipant } from '../../domain/entities/room-participant.js';

/**
 * Implementação do repositório de participantes usando Supabase
 */
export class SupabaseRoomParticipantRepository extends RoomParticipantRepository {
  constructor() {
    super();
    this.tableName = 'room_participants';
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar participante: ${error.message}`);
    }

    return data ? new RoomParticipant({
      id: data.id,
      roomId: data.room_id,
      userId: data.user_id,
      role: data.role,
      joinedAt: data.joined_at,
      leftAt: data.left_at,
      isActive: data.is_active
    }) : null;
  }

  async findByRoomId(roomId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        users!inner(id, nome, email, avatar_url)
      `)
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar participantes: ${error.message}`);
    }

    return data.map(item => ({
      ...new RoomParticipant({
        id: item.id,
        roomId: item.room_id,
        userId: item.user_id,
        role: item.role,
        joinedAt: item.joined_at,
        leftAt: item.left_at,
        isActive: item.is_active
      }),
      user: {
        id: item.users.id,
        nome: item.users.nome,
        email: item.users.email,
        avatarUrl: item.users.avatar_url
      }
    }));
  }

  async findByUserAndRoom(userId, roomId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('room_id', roomId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar participante: ${error.message}`);
    }

    return data ? new RoomParticipant({
      id: data.id,
      roomId: data.room_id,
      userId: data.user_id,
      role: data.role,
      joinedAt: data.joined_at,
      leftAt: data.left_at,
      isActive: data.is_active
    }) : null;
  }

  async create(participantData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([participantData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar participante: ${error.message}`);
    }

    return new RoomParticipant({
      id: data.id,
      roomId: data.room_id,
      userId: data.user_id,
      role: data.role,
      joinedAt: data.joined_at,
      leftAt: data.left_at,
      isActive: data.is_active
    });
  }

  async update(id, participantData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(participantData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar participante: ${error.message}`);
      }
return new RoomParticipant({
  id: data.id,
  roomId: data.room_id,
  userId: data.user_id,
  role: data.role,
  joinedAt: data.joined_at,
  leftAt: data.left_at,
  isActive: data.is_active
});
}
async delete(id) {
const { error } = await supabase
.from(this.tableName)
.delete()
.eq('id', id);
if (error) {
  throw new Error(`Erro ao deletar participante: ${error.message}`);
}

return true;
}
async countActiveByRoom(roomId) {
const { count, error } = await supabase
.from(this.tableName)
.select('*', { count: 'exact', head: true })
.eq('room_id', roomId)
.eq('is_active', true);
if (error) {
  throw new Error(`Erro ao contar participantes: ${error.message}`);
}

return count || 0;
}
}