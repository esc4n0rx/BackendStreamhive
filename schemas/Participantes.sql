-- ===========================================
-- TABELA: room_participants (participantes da sala)
-- ===========================================

-- Deletar tabela se existir
DROP TABLE IF EXISTS room_participants CASCADE;

-- Criar tabela de participantes
CREATE TABLE room_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('owner', 'moderator', 'participant')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  -- Constraint para evitar duplicatas
  UNIQUE(room_id, user_id)
);

-- Comentários da tabela
COMMENT ON TABLE room_participants IS 'Tabela de participantes das salas';
COMMENT ON COLUMN room_participants.role IS 'Papel do usuário na sala: owner, moderator, participant';
COMMENT ON COLUMN room_participants.joined_at IS 'Data/hora que entrou na sala';
COMMENT ON COLUMN room_participants.left_at IS 'Data/hora que saiu da sala';