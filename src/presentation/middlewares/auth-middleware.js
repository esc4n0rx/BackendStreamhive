import { JWTUtils } from '../../utils/jwt-utils.js';
import { SupabaseUserRepository } from '../../infrastructure/repositories/supabase-user-repository.js';

/**
 * Middleware para verificação de autenticação
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    // Verificar token
    const decoded = JWTUtils.verifyToken(token);
    
    // Buscar usuário (opcional, para garantir que ainda existe)
    const userRepository = new SupabaseUserRepository();
    const user = await userRepository.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Adicionar dados do usuário à requisição
    req.user = user.toPublic();
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};