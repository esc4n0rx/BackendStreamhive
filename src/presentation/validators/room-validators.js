import { z } from 'zod';

/**
 * Validadores para rotas de salas
 */
export const roomValidators = {
  /**
   * Validador para criação de sala
   */
  createRoom: z.object({
    nome: z.string()
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .trim(),
    
    descricao: z.string()
      .max(500, 'Descrição deve ter no máximo 500 caracteres')
      .optional(),
    
    isPublic: z.boolean()
      .default(true),
    
    senha: z.string()
      .min(4, 'Senha deve ter pelo menos 4 caracteres')
      .max(50, 'Senha deve ter no máximo 50 caracteres')
      .optional()
  }).refine((data) => {
    // Se não é pública, senha é obrigatória
    if (!data.isPublic && !data.senha) {
      return false;
    }
    return true;
  }, {
    message: 'Senha é obrigatória para salas privadas',
    path: ['senha']
  }),

  /**
   * Validador para entrada na sala
   */
  joinRoom: z.object({
    codigoSala: z.string()
      .length(6, 'Código da sala deve ter 6 caracteres')
      .regex(/^[A-Z0-9]+$/, 'Código deve conter apenas letras maiúsculas e números'),
    
    senha: z.string()
      .min(4, 'Senha deve ter pelo menos 4 caracteres')
      .max(50, 'Senha deve ter no máximo 50 caracteres')
      .optional()
  }),

  /**
   * Validador para atualização de sala
   */
  updateRoom: z.object({
    nome: z.string()
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .trim()
      .optional(),
    
    descricao: z.string()
      .max(500, 'Descrição deve ter no máximo 500 caracteres')
      .optional(),
    
    isPublic: z.boolean()
      .optional(),
    
    senha: z.string()
      .min(4, 'Senha deve ter pelo menos 4 caracteres')
      .max(50, 'Senha deve ter no máximo 50 caracteres')
      .optional()
  }),

  /**
   * Validador para criação de convite
   */
  createInvite: z.object({
    invitedEmail: z.string()
      .email('Email deve ter formato válido')
      .max(255, 'Email deve ter no máximo 255 caracteres'),
    
    expiresInHours: z.number()
      .min(1, 'Convite deve expirar em pelo menos 1 hora')
      .max(168, 'Convite não pode expirar em mais de 7 dias (168 horas)')
      .default(24)
  }),

  /**
   * Validador para usar convite
   */
  useInvite: z.object({
    inviteCode: z.string()
      .length(12, 'Código de convite deve ter 12 caracteres')
      .regex(/^[a-zA-Z0-9]+$/, 'Código deve conter apenas letras e números')
  })
};