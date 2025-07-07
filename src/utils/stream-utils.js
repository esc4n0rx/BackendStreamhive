/**
 * Utilitários para streaming
 */
export class StreamUtils {
  /**
   * Valida posição do vídeo
   */
  static validatePosition(position, duration = null) {
    if (typeof position !== 'number' || position < 0) {
      return false;
    }
    
    if (duration && position > duration) {
      return false;
    }
    
    return true;
  }

  /**
   * Calcula sincronização entre clientes
   */
  static calculateSyncData(currentTime, isPlaying, lastUpdateTime) {
    const now = Date.now();
    const timeDiff = (now - new Date(lastUpdateTime).getTime()) / 1000;
    
    let syncTime = currentTime;
    if (isPlaying) {
      syncTime += timeDiff;
    }
    
    return {
      currentTime: Math.max(0, syncTime),
      isPlaying,
      serverTime: now,
      syncAccuracy: timeDiff
    };
  }

  /**
   * Valida URL de vídeo
   */
  static isValidVideoUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Extrai ID do vídeo do YouTube
   */
  static extractYouTubeId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Formata tempo em segundos para HH:MM:SS
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}