import bcrypt from 'bcrypt';

/**
 * Utilitários para salas
 */
export class RoomUtils {
  /**
   * Gera código único para sala
   */
  static generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }

  /**
   * Gera hash da senha da sala
   */
  static async hashRoomPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica senha da sala
   */
  static async verifyRoomPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Gera código de convite
   */
  static generateInviteCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }

  /**
   * Valida URL de stream
   */
  static validateStreamUrl(url) {
    if (!url) return { isValid: false, errors: ['URL é obrigatória'] };

    const errors = [];
    
    // Validação básica de URL
    try {
      new URL(url);
    } catch {
      errors.push('URL inválida');
      return { isValid: false, errors };
    }

    // Validação de tipos suportados
    const supportedPatterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i, // YouTube
      /^http?:\/\/.*\.m3u8(\?.*)?$/i, // HLS
      /^https?:\/\/.*\.(mp4|webm|ogg)(\?.*)?$/i, // Vídeos diretos
      /^http?:\/\/.*\/.*\.m3u8/i // M3U8 em paths
    ];

    const isSupported = supportedPatterns.some(pattern => pattern.test(url));
    
    if (!isSupported) {
      errors.push('Tipo de stream não suportado. Use YouTube, HLS (.m3u8) ou vídeos diretos');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}