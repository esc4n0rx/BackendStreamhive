import { z } from 'zod';

/**
 * Validadores para rotas de streaming
 */
export const streamingValidators = {
  /**
   * Validador para validação de URL
   */
  validateUrl: z.object({
    url: z.string()
      .url('URL deve ter formato válido')
      .max(2000, 'URL muito longa')
  }),

  /**
   * Validador para iniciar sessão
   */
  startSession: z.object({
    roomId: z.string()
      .uuid('ID da sala deve ser UUID válido'),
    
    videoUrl: z.string()
      .url('URL do vídeo deve ser válida')
      .max(2000, 'URL muito longa'),
    
    title: z.string()
      .min(1, 'Título é obrigatório')
      .max(200, 'Título muito longo')
      .optional(),
    
    description: z.string()
      .max(1000, 'Descrição muito longa')
      .optional()
  }),

  /**
   * Validador para mensagem do chat
   */
  sendMessage: z.object({
    roomId: z.string()
      .uuid('ID da sala deve ser UUID válido'),
    
    message: z.string()
      .min(1, 'Mensagem não pode estar vazia')
      .max(500, 'Mensagem muito longa')
      .trim(),
    
    messageType: z.enum(['text', 'emoji'])
      .default('text')
  })
};