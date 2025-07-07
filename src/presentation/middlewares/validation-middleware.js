 /**
 * Middleware para validação de dados usando Zod
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validar dados da requisição
      const validatedData = schema.parse(req.body);
      
      // Substituir req.body pelos dados validados
      req.body = validatedData;
      
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errorMessages
        });
      }

      next(error);
    }
  };
};
