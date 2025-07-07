 /**
 * Middleware global para tratamento de erros
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  // Erro de validação
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: err.errors
    });
  }

  // Erro personalizado com status
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Erro de negócio conhecido
  if (err.message && typeof err.message === 'string') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Erro interno do servidor
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
};
