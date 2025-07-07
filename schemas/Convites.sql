-- ===========================================
-- TABELA: room_invites (convites para salas)
-- ===========================================

-- Deletar tabela se existir
DROP TABLE IF EXISTS room_invites CASCADE;

-- Criar tabela de convites
CREATE TABLE room_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  invite_code VARCHAR(50) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários da tabela
COMMENT ON TABLE room_invites IS 'Tabela de convites para salas';
COMMENT ON COLUMN room_invites.invite_code IS 'Código único do convite';
COMMENT ON COLUMN room_invites.expires_at IS 'Data/hora de expiração do convite';
COMMENT ON COLUMN room_invites.used_at IS 'Data/hora que o convite foi usado';