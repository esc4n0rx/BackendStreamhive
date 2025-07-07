-- ===========================================
-- TABELA: rooms (salas)
-- ===========================================

-- Deletar tabela se existir
DROP TABLE IF EXISTS rooms CASCADE;

-- Criar tabela de salas
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  codigo_sala VARCHAR(10) UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  max_participants INTEGER DEFAULT 50,
  senha VARCHAR(255), -- Hash da senha da sala (opcional)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários da tabela
COMMENT ON TABLE rooms IS 'Tabela de salas de streaming';
COMMENT ON COLUMN rooms.codigo_sala IS 'Código único da sala para convites';
COMMENT ON COLUMN rooms.owner_id IS 'ID do usuário criador da sala';
COMMENT ON COLUMN rooms.is_public IS 'Se a sala é pública ou privada';
COMMENT ON COLUMN rooms.max_participants IS 'Máximo de participantes na sala';
COMMENT ON COLUMN rooms.senha IS 'Hash da senha da sala (se privada)';