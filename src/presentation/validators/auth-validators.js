 import { z } from 'zod';

/**
 * Validadores para rotas de autenticação
 */
export const authValidators = {
  /**
   * Validador para registro de usuário
   */
  register: z.object({
    nome: z.string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
    
    email: z.string()
      .email('Email deve ter formato válido')
      .max(255, 'Email deve ter no máximo 255 caracteres'),
    
    senha: z.string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .max(128, 'Senha deve ter no máximo 128 caracteres'),
    
    dataNascimento: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD')
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 13 && age <= 120;
      }, 'Usuário deve ter entre 13 e 120 anos')
  }),

  /**
   * Validador para login
   */
  login: z.object({
    email: z.string()
      .email('Email deve ter formato válido'),
    
    senha: z.string()
      .min(1, 'Senha é obrigatória')
  })
};
