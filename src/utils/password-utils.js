import bcrypt from 'bcrypt';

/**
 * Utilitários para gerenciamento de senhas
 */
export class PasswordUtils {
  /**
   * Gera hash da senha
   */
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica se a senha está correta
   */
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Valida força da senha
   */
  static validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];

    if (password.length < minLength) {
      errors.push(`Senha deve ter pelo menos ${minLength} caracteres`);
    }

    if (!hasUpperCase) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!hasLowerCase) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!hasNumbers) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (!hasSpecialChar) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
