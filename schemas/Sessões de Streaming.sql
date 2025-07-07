-- ===========================================
-- TABELA: streaming_sessions (sessões de streaming)
-- ===========================================

-- Deletar tabela se existir
DROP TABLE IF EXISTS streaming_sessions CASCADE;

-- Criar tabela de sessões de streaming
CREATE TABLE streaming_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  started_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  video_url TEXT,
  current_time INTEGER DEFAULT 0, -- Tempo atual em segundos
  is_playing BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários da tabela
COMMENT ON TABLE streaming_sessions IS 'Tabela de sessões de streaming ativo';
COMMENT ON COLUMN streaming_sessions.current_time IS 'Tempo atual do vídeo em segundos';
COMMENT ON COLUMN streaming_sessions.is_playing IS 'Se o vídeo está sendo reproduzido';