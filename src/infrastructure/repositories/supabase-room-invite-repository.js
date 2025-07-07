import { supabase } from '../../config/database.js';
import { RoomInviteRepository } from '../../domain/repositories/room-invite-repository.js';
import { RoomInvite } from '../../domain/entities/room-invite.js';

/**
 * Implementação do repositório de convites usando Supabase
 */
export class SupabaseRoomInviteRepository extends RoomInviteRepository {
  constructor() {
    super();
    this.tableName = 'room_invites';
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar convite: ${error.message}`);
    }

    return data ? new RoomInvite({
      id: data.id,
      roomId: data.room_id,
      invitedBy: data.invited_by,
      invitedEmail: data.invited_email,
      inviteCode: data.invite_code,
      expiresAt: data.expires_at,
      usedAt: data.used_at,
      usedBy: data.used_by,
      isActive: data.is_active,
      createdAt: data.created_at
    }) : null;
  }

  async findByCode(code) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('invite_code', code)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar convite: ${error.message}`);
    }

    return data ? new RoomInvite({
      id: data.id,
      roomId: data.room_id,
      invitedBy: data.invited_by,
      invitedEmail: data.invited_email,
      inviteCode: data.invite_code,
      expiresAt: data.expires_at,
      usedAt: data.used_at,
      usedBy: data.used_by,
      isActive: data.is_active,
      createdAt: data.created_at
    }) : null;
  }

  async findByRoomId(roomId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar convites: ${error.message}`);
    }

    return data.map(item => new RoomInvite({
      id: item.id,
      roomId: item.room_id,
      invitedBy: item.invited_by,
      invitedEmail: item.invited_email,
      inviteCode: item.invite_code,
      expiresAt: item.expires_at,
      usedAt: item.used_at,
      usedBy: item.used_by,
      isActive: item.is_active,
      createdAt: item.created_at
    }));
  }

  async create(inviteData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([inviteData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar convite: ${error.message}`);
    }

    return new RoomInvite({
      id: data.id,
      roomId: data.room_id,
      invitedBy: data.invited_by,
      invitedEmail: data.invited_email,
      inviteCode: data.invite_code,
      expiresAt: data.expires_at,
      usedAt: data.used_at,
      usedBy: data.used_by,
      isActive: data.is_active,
      createdAt: data.created_at
    });
  }

  async update(id, inviteData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(inviteData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar convite: ${error.message}`);
    }

    return new RoomInvite({
      id: data.id,
      roomId: data.room_id,
      invitedBy: data.invited_by,
      invitedEmail: data.invited_email,
      inviteCode: data.invite_code,
      expiresAt: data.expires_at,
      usedAt: data.used_at,
      usedBy: data.used_by,
      isActive: data.is_active,
      createdAt: data.created_at
    });
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar convite: ${error.message}`);
    }

    return true;
  }
}