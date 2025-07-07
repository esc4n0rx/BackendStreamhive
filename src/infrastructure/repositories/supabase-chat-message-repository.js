import { supabase } from '../../config/database.js';
import { ChatMessageRepository } from '../../domain/repositories/chat-message-repository.js';
import { ChatMessage } from '../../domain/entities/chat-message.js';

/**
 * Implementação do repositório de mensagens do chat usando Supabase
 */
export class SupabaseChatMessageRepository extends ChatMessageRepository {
  constructor() {
    super();
    this.tableName = 'chat_messages';
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        users!inner(id, nome)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar mensagem: ${error.message}`);
    }

    return data ? new ChatMessage({
      id: data.id,
      roomId: data.room_id,
      userId: data.user_id,
      username: data.users.nome,
      message: data.message,
      messageType: data.message_type,
      timestamp: data.timestamp,
      createdAt: data.created_at
    }) : null;
  }

  async findByRoomId(roomId, limit = 50) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        users!inner(id, nome, avatar_url)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar mensagens: ${error.message}`);
    }

    return data.map(item => new ChatMessage({
      id: item.id,
      roomId: item.room_id,
      userId: item.user_id,
      username: item.users.nome,
      message: item.message,
      messageType: item.message_type,
      timestamp: item.timestamp,
      createdAt: item.created_at
    })).reverse(); // Inverter para ordem cronológica
  }

  async create(messageData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([messageData])
      .select(`
        *,
        users!inner(id, nome, avatar_url)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar mensagem: ${error.message}`);
    }

    return new ChatMessage({
      id: data.id,
      roomId: data.room_id,
      userId: data.user_id,
      username: data.users.nome,
      message: data.message,
      messageType: data.message_type,
      timestamp: data.timestamp,
      createdAt: data.created_at
    });
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar mensagem: ${error.message}`);
    }

    return true;
  }

  async deleteByRoomId(roomId) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('room_id', roomId);

    if (error) {
      throw new Error(`Erro ao deletar mensagens da sala: ${error.message}`);
    }

    return true;
  }
}