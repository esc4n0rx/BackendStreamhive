import { StreamingService } from '../../domain/services/streaming-service.js';
import { ChatService } from '../../domain/services/chat-service.js';
import { SupabaseStreamingSessionRepository } from '../../infrastructure/repositories/supabase-streaming-session-repository.js';
import { SupabaseChatMessageRepository } from '../../infrastructure/repositories/supabase-chat-message-repository.js';
import { SupabaseRoomRepository } from '../../infrastructure/repositories/supabase-room-repository.js';
import { SupabaseRoomParticipantRepository } from '../../infrastructure/repositories/supabase-room-participant-repository.js';

/**
 * Controller para streaming (rotas HTTP complementares)
 */
export class StreamingController {
  constructor() {
    this.streamingService = new StreamingService(
      new SupabaseStreamingSessionRepository(),
      new SupabaseRoomRepository(),
      new SupabaseRoomParticipantRepository()
    );
    
    this.chatService = new ChatService(
      new SupabaseChatMessageRepository(),
      new SupabaseRoomParticipantRepository()
    );
  }

  /**
   * Valida URL de stream
   */
  validateStreamUrl = async (req, res, next) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL é obrigatória'
        });
      }

      const validation = await this.streamingService.validateStreamUrl(url);

      res.status(200).json({
        success: true,
        data: validation
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtém sessão ativa da sala
   */
  getActiveSession = async (req, res, next) => {
    try {
      const { roomId } = req.params;

      const session = await this.streamingService.getActiveSession(roomId);

      res.status(200).json({
        success: true,
        data: {
          hasActiveSession: !!session,
          session
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtém histórico do chat
   */
  getChatHistory = async (req, res, next) => {
    try {
      const { roomId } = req.params;
      const { limit = 50 } = req.query;

      const messages = await this.chatService.getMessageHistory(roomId, parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          messages,
          count: messages.length
        }
      });
    } catch (error) {
      next(error);
    }
  };
}