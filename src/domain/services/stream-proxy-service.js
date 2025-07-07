/**
 * Serviço para processar e obter URLs de stream de diferentes fontes
 * Versão simplificada sem dependências de yt-dlp
 */
export class StreamProxyService {
  constructor() {
    console.log('🎯 StreamProxyService inicializado (modo simplificado)');
  }

  /**
   * Processa URL e retorna informações do stream
   */
  async processStreamUrl(url) {
    try {
      const urlType = this.detectUrlType(url);
      
      switch (urlType) {
        case 'youtube':
          return await this.processYouTubeUrl(url);
        case 'vimeo':
          return await this.processVimeoUrl(url);
        case 'twitch':
          return await this.processTwitchUrl(url);
        case 'm3u8':
          return await this.processM3u8Url(url);
        case 'direct':
          return await this.processDirectUrl(url);
        default:
          throw new Error('Tipo de URL não suportado');
      }
    } catch (error) {
      throw new Error(`Erro ao processar URL: ${error.message}`);
    }
  }

  /**
   * Detecta o tipo da URL
   */
  detectUrlType(url) {
    if (this.isYouTubeUrl(url)) return 'youtube';
    if (this.isVimeoUrl(url)) return 'vimeo';
    if (this.isTwitchUrl(url)) return 'twitch';
    if (this.isM3u8Url(url)) return 'm3u8';
    if (this.isDirectVideoUrl(url)) return 'direct';
    return 'unknown';
  }

  /**
   * Verifica se é URL do YouTube
   */
  isYouTubeUrl(url) {
    const youtubePatterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i
    ];
    return youtubePatterns.some(pattern => pattern.test(url));
  }

  /**
   * Verifica se é URL do Vimeo
   */
  isVimeoUrl(url) {
    return /^https?:\/\/(www\.)?vimeo\.com/i.test(url);
  }

  /**
   * Verifica se é URL do Twitch
   */
  isTwitchUrl(url) {
    return /^https?:\/\/(www\.)?twitch\.tv/i.test(url);
  }

  /**
   * Verifica se é URL M3U8
   */
  isM3u8Url(url) {
    return /\.m3u8(\?.*)?$/i.test(url);
  }

  /**
   * Verifica se é URL de vídeo direto
   */
  isDirectVideoUrl(url) {
    return /\.(mp4|webm|ogg|avi|mov|mkv|flv)(\?.*)?$/i.test(url);
  }

  /**
   * Extrai ID do vídeo do YouTube
   */
  extractYouTubeId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
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
   * Extrai ID do vídeo do Vimeo
   */
  extractVimeoId(url) {
    const pattern = /vimeo\.com\/(?:.*#|.*\/)?(\d+)/;
    const match = url.match(pattern);
    return match ? match[1] : null;
  }

  /**
   * Processa URL do YouTube (modo embed)
   */
  async processYouTubeUrl(url) {
    try {
      console.log(`🎬 Processando YouTube: ${url}`);
      
      const videoId = this.extractYouTubeId(url);
      if (!videoId) {
        throw new Error('ID do vídeo do YouTube não encontrado');
      }

      // Usar URL embed do YouTube (mais confiável)
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      // Tentar obter informações básicas via oEmbed (público)
      let title = 'Vídeo YouTube';
      let description = '';

      try {
        const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const response = await fetch(oEmbedUrl);
        if (response.ok) {
          const data = await response.json();
          title = data.title || title;
          description = data.author_name || '';
        }
      } catch (error) {
        console.log('⚠️  Não foi possível obter metadados do YouTube:', error.message);
      }

      return {
        type: 'youtube',
        title,
        description,
        duration: 0, // Não disponível sem API key
        thumbnail: thumbnailUrl,
        streamUrl: embedUrl,
        originalUrl: url,
        videoId,
        quality: 'auto',
        format: 'embed'
      };
    } catch (error) {
      throw new Error(`Erro ao processar YouTube: ${error.message}`);
    }
  }

  /**
   * Processa URL do Vimeo
   */
  async processVimeoUrl(url) {
    try {
      console.log(`🎬 Processando Vimeo: ${url}`);
      
      const videoId = this.extractVimeoId(url);
      if (!videoId) {
        throw new Error('ID do vídeo do Vimeo não encontrado');
      }

      // Usar URL embed do Vimeo
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;

      // Tentar obter informações via oEmbed
      let title = 'Vídeo Vimeo';
      let description = '';
      let thumbnail = '';

      try {
        const oEmbedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
        const response = await fetch(oEmbedUrl);
        if (response.ok) {
          const data = await response.json();
          title = data.title || title;
          description = data.description || '';
          thumbnail = data.thumbnail_url || '';
        }
      } catch (error) {
        console.log('⚠️  Não foi possível obter metadados do Vimeo:', error.message);
      }

      return {
        type: 'vimeo',
        title,
        description,
        duration: 0,
        thumbnail,
        streamUrl: embedUrl,
        originalUrl: url,
        videoId,
        quality: 'auto',
        format: 'embed'
      };
    } catch (error) {
      throw new Error(`Erro ao processar Vimeo: ${error.message}`);
    }
  }

  /**
   * Processa URL do Twitch
   */
  async processTwitchUrl(url) {
    try {
      console.log(`🎮 Processando Twitch: ${url}`);
      
      // Extrair canal ou vídeo do Twitch
      const channelMatch = url.match(/twitch\.tv\/([^\/\?]+)/);
      if (!channelMatch) {
        throw new Error('Canal do Twitch não encontrado');
      }

      const channel = channelMatch[1];
      const embedUrl = `https://player.twitch.tv/?channel=${channel}&parent=localhost`;

      return {
        type: 'twitch',
        title: `Stream do ${channel}`,
        description: 'Transmissão ao vivo do Twitch',
        duration: 0,
        thumbnail: '',
        streamUrl: embedUrl,
        originalUrl: url,
        channel,
        quality: 'auto',
        format: 'embed'
      };
    } catch (error) {
      throw new Error(`Erro ao processar Twitch: ${error.message}`);
    }
  }

  /**
   * Processa URL M3U8 (HLS)
   */
  async processM3u8Url(url) {
    try {
      console.log(`📺 Processando M3U8: ${url}`);
      
      // Validar se a URL é acessível
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error('URL M3U8 não acessível');
      }

      return {
        type: 'm3u8',
        title: 'Stream HLS',
        description: 'Transmissão HLS',
        duration: 0,
        thumbnail: '',
        streamUrl: url,
        originalUrl: url,
        quality: 'auto',
        format: 'hls'
      };
    } catch (error) {
      throw new Error(`Erro ao processar M3U8: ${error.message}`);
    }
  }

  /**
   * Processa URL de vídeo direto
   */
  async processDirectUrl(url) {
    try {
      console.log(`🎥 Processando vídeo direto: ${url}`);
      
      // Validar se a URL é acessível
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error('URL de vídeo não acessível');
      }

      const contentType = response.headers.get('content-type') || '';
      const contentLength = response.headers.get('content-length');
      
      if (!contentType.startsWith('video/')) {
        throw new Error('URL não é um arquivo de vídeo válido');
      }

      // Extrair nome do arquivo da URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      const title = fileName || 'Vídeo Direto';

      return {
        type: 'direct',
        title,
        description: 'Arquivo de vídeo direto',
        duration: 0,
        thumbnail: '',
        streamUrl: url,
        originalUrl: url,
        quality: 'original',
        format: contentType.split('/')[1] || 'mp4',
        size: contentLength ? parseInt(contentLength) : null
      };
    } catch (error) {
      throw new Error(`Erro ao processar vídeo direto: ${error.message}`);
    }
  }

  /**
   * Valida se uma URL é suportada
   */
  async validateUrl(url) {
    try {
      const urlType = this.detectUrlType(url);
      if (urlType === 'unknown') {
        return { 
          isValid: false, 
          error: 'Tipo de URL não suportado. Use YouTube, Vimeo, Twitch, HLS (.m3u8) ou vídeos diretos.',
          supportedTypes: ['youtube', 'vimeo', 'twitch', 'm3u8', 'direct']
        };
      }

      // Para URLs embed, não precisamos testar conectividade
      if (['youtube', 'vimeo', 'twitch'].includes(urlType)) {
        return { 
          isValid: true, 
          error: null,
          type: urlType,
          method: 'embed'
        };
      }

      // Teste de conectividade para URLs diretas e M3U8
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        
        return { 
          isValid: response.ok, 
          error: response.ok ? null : 'URL não acessível',
          type: urlType,
          method: 'direct'
        };
      } catch (fetchError) {
        return { 
          isValid: false, 
          error: `Erro de conectividade: ${fetchError.message}`,
          type: urlType
        };
      }
    } catch (error) {
      return { 
        isValid: false, 
        error: `Erro de validação: ${error.message}` 
      };
    }
  }

  /**
   * Obtém informações sobre tipos suportados
   */
  getSupportedTypes() {
    return {
      youtube: {
        name: 'YouTube',
        description: 'Vídeos do YouTube (modo embed)',
        examples: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ']
      },
      vimeo: {
        name: 'Vimeo',
        description: 'Vídeos do Vimeo (modo embed)',
        examples: ['https://vimeo.com/123456789']
      },
      twitch: {
        name: 'Twitch',
        description: 'Streams ao vivo do Twitch',
        examples: ['https://www.twitch.tv/ninja']
      },
      m3u8: {
        name: 'HLS Streams',
        description: 'Streams HLS (.m3u8)',
        examples: ['https://example.com/stream.m3u8']
      },
      direct: {
        name: 'Vídeos Diretos',
        description: 'Arquivos de vídeo diretos',
        examples: ['https://example.com/video.mp4', 'https://example.com/video.webm']
      }
    };
  }
}