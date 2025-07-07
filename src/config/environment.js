import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  }
};

// Validar variáveis críticas
if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('Variáveis de ambiente do Supabase são obrigatórias');
}