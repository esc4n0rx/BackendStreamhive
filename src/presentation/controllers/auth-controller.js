 import { AuthService } from '../../domain/services/auth-service.js';
import { SupabaseUserRepository } from '../../infrastructure/repositories/supabase-user-repository.js';

/**
 * Controller para autenticação
 */
export class AuthController {
  constructor() {
    this.userRepository = new SupabaseUserRepository();
    this.authService = new AuthService(this.userRepository);
  }

  /**
   * Registra novo usuário
   */
  register = async (req, res, next) => {
    try {
      const { nome, email, senha, dataNascimento } = req.body;

      const result = await this.authService.register({
        nome,
        email,
        senha,
        dataNascimento
      });

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Autentica usuário
   */
  login = async (req, res, next) => {
    try {
      const { email, senha } = req.body;

      const result = await this.authService.login({
        email,
        senha
      });

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retorna dados do usuário autenticado
   */
  me = async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
