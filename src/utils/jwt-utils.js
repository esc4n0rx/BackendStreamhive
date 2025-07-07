 import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';

/**
 * Utilitários para gerenciamento de JWT
 */
export class JWTUtils {
  /**
   * Gera token JWT
   */
  static generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  /**
   * Verifica e decodifica token JWT
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Decodifica token sem verificar (útil para debug)
   */
  static decodeToken(token) {
    return jwt.decode(token);
  }
}
