import { PasswordUtils } from '../../utils/password-utils.js';
import { JWTUtils } from '../../utils/jwt-utils.js';

/**
 * Serviço de autenticação - contém a lógica de negócio
 */
export class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Registra novo usuário
   */
  async register({ nome, email, senha, dataNascimento }) {
    // Verificar se usuário já existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Usuário já existe com este email');
    }

    // Validar força da senha
    const passwordValidation = PasswordUtils.validatePasswordStrength(senha);
    if (!passwordValidation.isValid) {
      throw new Error(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash da senha
    const hashedPassword = await PasswordUtils.hashPassword(senha);

    // Criar usuário
    const userData = {
      nome,
      email: email.toLowerCase(),
      senha: hashedPassword,
      data_nascimento: dataNascimento
    };

    const user = await this.userRepository.create(userData);

    // Gerar token
    const token = JWTUtils.generateToken({
      id: user.id,
      email: user.email,
      nome: user.nome
    });

    return {
      user: user.toPublic(),
      token
    };
  }

  /**
   * Autentica usuário
   */
  async login({ email, senha }) {
    // Buscar usuário
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await PasswordUtils.verifyPassword(senha, user.senha);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token
    const token = JWTUtils.generateToken({
      id: user.id,
      email: user.email,
      nome: user.nome
    });

    return {
      user: user.toPublic(),
      token
    };
  }

  /**
   * Verifica token e retorna usuário
   */
  async verifyToken(token) {
    const decoded = JWTUtils.verifyToken(token);
    const user = await this.userRepository.findById(decoded.id);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user.toPublic();
  }
}
