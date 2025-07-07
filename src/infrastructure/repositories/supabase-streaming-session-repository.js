import { supabase } from '../../config/database.js';
import { StreamingSessionRepository } from '../../domain/repositories/streaming-session-repository.js';
import { StreamingSession } from '../../domain/entities/streaming-session.js';

/**
 * Implementação do repositório de sessões de streaming usando Supabase
 */
export class SupabaseStreamingSessionRepository extends StreamingSessionRepository {
  constructor() {
    super();
    this.tableName = 'streaming_sessions';
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar sessão: ${error.message}`);
    }

    return data ? new StreamingSession({
      id: data.id,
      roomId: data.room_id,
      startedBy: data.started_by,
      title: data.title,
      description: data.description,
      videoUrl: data.video_url,
      currentTime: data.current_time,
      isPlaying: data.is_playing,
      isActive: data.is_active,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }) : null;
  }

  async findActiveByRoomId(roomId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('room_id', roomId)
      .eq('is_active', true)
      .is('ended_at', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar sessão ativa: ${error.message}`);
    }

    return data ? new StreamingSession({
      id: data.id,
      roomId: data.room_id,
      startedBy: data.started_by,
      title: data.title,
      description: data.description,
      videoUrl: data.video_url,
      currentTime: data.current_time,
      isPlaying: data.is_playing,
      isActive: data.is_active,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }) : null;
  }

  async create(sessionData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([sessionData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar sessão: ${error.message}`);
    }

    return new StreamingSession({
      id: data.id,
      roomId: data.room_id,
      startedBy: data.started_by,
      title: data.title,
      description: data.description,
      videoUrl: data.video_url,
      currentTime: data.current_time,
      isPlaying: data.is_playing,
      isActive: data.is_active,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  }

  async update(id, sessionData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        ...sessionData,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar sessão: ${error.message}`);
    }

    return new StreamingSession({
      id: data.id,
      roomId: data.room_id,
      startedBy: data.started_by,
      title: data.title,
      description: data.description,
      videoUrl: data.video_url,
      currentTime: data.current_time,
      isPlaying: data.is_playing,
      isActive: data.is_active,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  }

  async endSession(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        is_active: false,
        ended_at: new Date(),
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao finalizar sessão: ${error.message}`);
    }

    return new StreamingSession({
      id: data.id,
      roomId: data.room_id,
      startedBy: data.started_by,
      title: data.title,
      description: data.description,
      videoUrl: data.video_url,
      currentTime: data.current_time,
      isPlaying: data.is_playing,
      isActive: data.is_active,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  }

  async findByRoomId(roomId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar sessões: ${error.message}`);
    }

    return data.map(item => new StreamingSession({
      id: item.id,
      roomId: item.room_id,
      startedBy: item.started_by,
      title: item.title,
      description: item.description,
      videoUrl: item.video_url,
      currentTime: item.current_time,
      isPlaying: item.is_playing,
      isActive: item.is_active,
      startedAt: item.started_at,
      endedAt: item.ended_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }
}