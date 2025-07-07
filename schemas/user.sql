-- ===========================================
-- TABELA: users
-- ===========================================

-- Deletar tabela se existir (cuidado em produção!)
DROP TABLE IF EXISTS users CASCADE;

-- Criar tabela de usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários da tabela
COMMENT ON TABLE users IS 'Tabela de usuários do sistema Streamhive';
COMMENT ON COLUMN users.id IS 'ID único do usuário';
COMMENT ON COLUMN users.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN users.email IS 'Email único do usuário';
COMMENT ON COLUMN users.senha IS 'Hash da senha do usuário';
COMMENT ON COLUMN users.data_nascimento IS 'Data de nascimento do usuário';
COMMENT ON COLUMN users.avatar_url IS 'URL do avatar do usuário';
COMMENT ON COLUMN users.is_active IS 'Status ativo do usuário';
COMMENT ON COLUMN users.last_login IS 'Data/hora do último login';