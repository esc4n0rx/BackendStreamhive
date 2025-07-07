import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { platform } from 'os';

// Criar require para módulos CommonJS
const require = createRequire(import.meta.url);
const YtDlpWrap = require('yt-dlp-wrap');

/**
 * Serviço para processar e obter URLs de stream de diferentes fontes
 */
export class StreamProxyService {
  constructor() {
    const ytDlpPath = this.getLocalYtDlpPath();
    
    if (ytDlpPath && existsSync(ytDlpPath)) {
      console.log(`🎯 Usando yt-dlp local: ${ytDlpPath}`);
      this.ytDlp = new YtDlpWrap(ytDlpPath);
    } else {
      console.log('⚠️  yt-dlp local não encontrado, usando global');
      this.ytDlp = new YtDlpWrap();
    }
  }

  /**
   * Obtém o caminho do yt-dlp local na pasta bin
   */
  getLocalYtDlpPath() {
    try {
      // Obter diretório atual do projeto
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const projectRoot = join(__dirname, '../../../'); // Volta 3 níveis: services -> domain -> src -> raiz

      const os = platform();
      let binaryName;

      switch (os) {
        case 'win32':
          binaryName = 'yt-dlp.exe';
          break;
        case 'darwin':
        case 'linux':
          binaryName = 'yt-dlp';
          break;
        default:
          binaryName = 'yt-dlp';
      }

      const localPath = join(projectRoot, 'bin', binaryName);
      
      console.log(`🔍 Procurando yt-dlp em: ${localPath}`);
      
      return localPath;
    } catch (error) {
      console.error('Erro ao obter caminho local do yt-dlp:', error);
      return null;
    }
  }

  /**
   * Verifica se o yt-dlp está disponível
   */
  async checkYtDlpAvailability() {
    try {
      // Teste simples para verificar se o yt-dlp está funcionando
      const result = await this.ytDlp.execPromise(['--version']);
      console.log(`✅ yt-dlp disponível - Versão: ${result.trim()}`);
      return true;
    } catch (error) {
      console.error('❌ yt-dlp não está disponível:', error.message);
      return false;
    }
  }

  /**
   * Processa URL e retorna informações do stream
   */
  async processStreamUrl(url) {
    try {
      // Verificar se yt-dlp está disponível antes de usar
      const isAvailable = await this.checkYtDlpAvailability();
      if (!isAvailable) {
        throw new Error('yt-dlp não está disponível. Instale ou coloque o executável na pasta bin/');
      }

      const urlType = this.detectUrlType(url);
      
      switch (urlType) {
        case 'youtube':
          return await this.processYouTubeUrl(url);
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
   * Verifica se é URL M3U8
   */
  isM3u8Url(url) {
    return /\.m3u8(\?.*)?$/i.test(url);
  }

  /**
   * Verifica se é URL de vídeo direto
   */
  isDirectVideoUrl(url) {
    return /\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i.test(url);
  }

  /**
   * Processa URL do YouTube
   */
  async processYouTubeUrl(url) {
    try {
      console.log(`🎬 Processando YouTube: ${url}`);
      
      const info = await this.ytDlp.getVideoInfo(url);
      
      // Buscar melhor qualidade disponível (adaptive streaming)
      const formats = info.formats || [];
      const videoFormat = formats.find(f => 
        f.ext === 'mp4' && 
        f.vcodec !== 'none' && 
        f.acodec !== 'none' &&
        f.height <= 720 // Limitar qualidade para performance
      );

      if (!videoFormat) {
        throw new Error('Formato de vídeo compatível não encontrado');
      }

      return {
        type: 'youtube',
        title: info.title || 'Vídeo YouTube',
        description: info.description || '',
        duration: info.duration || 0,
        thumbnail: info.thumbnail || '',
        streamUrl: videoFormat.url,
        originalUrl: url,
        quality: `${videoFormat.height}p`,
        format: videoFormat.ext
      };
    } catch (error) {
      throw new Error(`Erro ao processar YouTube: ${error.message}`);
    }
  }

  /**
   * Processa URL M3U8 (HLS)
   */
  async processM3u8Url(url) {
    try {
      console.log(`📺 Processando M3U8: ${url}`);
      
      // Validar se a URL é acessível
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('URL M3U8 não acessível');
      }

      return {
        type: 'm3u8',
        title: 'Stream HLS',
        description: 'Transmissão ao vivo HLS',
        duration: 0, // Live streams não têm duração fixa
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
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('URL de vídeo não acessível');
      }

      const contentType = response.headers.get('content-type') || '';
      const contentLength = response.headers.get('content-length');
      
      if (!contentType.startsWith('video/')) {
        throw new Error('URL não é um arquivo de vídeo válido');
      }

      return {
        type: 'direct',
        title: 'Vídeo Direto',
        description: 'Arquivo de vídeo direto',
        duration: 0, // Não podemos determinar sem baixar
        thumbnail: '',
        streamUrl: url,
        originalUrl: url,
        quality: 'original',
        format: contentType.split('/')[1],
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
        return { isValid: false, error: 'Tipo de URL não suportado' };
      }

      // Teste básico de conectividade
      const response = await fetch(url, { 
        method: 'HEAD',
        timeout: 5000 
      });
      
      return { 
        isValid: response.ok, 
        error: response.ok ? null : 'URL não acessível',
        type: urlType
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: `Erro de validação: ${error.message}` 
      };
    }
  }
}