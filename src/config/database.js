import { createClient } from '@supabase/supabase-js';
import { config } from './environment.js';

// Cliente Supabase para operações gerais
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Cliente Supabase com privilégios de admin (para operações sensíveis)
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);