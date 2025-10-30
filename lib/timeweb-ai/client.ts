/**
 * Клиент для работы с Timeweb Cloud AI
 * 
 * Использование:
 * import { timewebAI } from '@/lib/timeweb-ai/client';
 * const result = await timewebAI.chat({ agentId: '12805', message: 'Привет!' });
 */

export interface TimewebAIConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ChatRequest {
  agentId: string;
  message: string;
  conversationId?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  response: string;
  conversationId?: string;
  tokensUsed?: number;
  model?: string;
}

export class TimewebAIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: TimewebAIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.timeweb.cloud/ai/v1';
  }

  /**
   * Отправить сообщение агенту
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/agents/${request.agentId}/chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: request.message.slice(0, 4000), // Ограничение длины
            conversation_id: request.conversationId,
            stream: request.stream || false,
            temperature: request.temperature,
            max_tokens: request.maxTokens
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Timeweb AI error ${response.status}: ${error}`);
      }

      const data = await response.json();
      
      return {
        response: data.response || data.message || data.text || '',
        conversationId: data.conversation_id || data.conversationId,
        tokensUsed: data.tokens_used || data.usage?.total_tokens,
        model: data.model
      };
    } catch (error) {
      console.error('Timeweb AI client error:', error);
      throw error;
    }
  }

  /**
   * Получить историю диалога
   */
  async getConversationHistory(conversationId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/conversations/${conversationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get conversation: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      throw error;
    }
  }

  /**
   * Список всех агентов
   */
  async listAgents() {
    try {
      const response = await fetch(
        `${this.baseUrl}/agents`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to list agents: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to list agents:', error);
      throw error;
    }
  }

  /**
   * Создать новый диалог
   */
  async createConversation(agentId: string, metadata?: Record<string, any>) {
    try {
      const response = await fetch(
        `${this.baseUrl}/conversations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            agent_id: agentId,
            metadata
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }
}

// Singleton instance
let instance: TimewebAIClient | null = null;

export function getTimewebAI(): TimewebAIClient {
  if (!instance) {
    const apiKey = process.env.TIMEWEB_AI_KEY;
    
    if (!apiKey) {
      throw new Error(
        'TIMEWEB_AI_KEY is not set. Add it to your environment variables.'
      );
    }
    
    instance = new TimewebAIClient({ apiKey });
  }
  
  return instance;
}

// Экспорт для удобства
export const timewebAI = {
  chat: async (request: ChatRequest) => getTimewebAI().chat(request),
  getHistory: async (conversationId: string) => 
    getTimewebAI().getConversationHistory(conversationId),
  listAgents: async () => getTimewebAI().listAgents(),
  createConversation: async (agentId: string, metadata?: Record<string, any>) =>
    getTimewebAI().createConversation(agentId, metadata)
};

// Константы агентов
export const AGENTS = {
  GUIDE: '12805',        // Гид по Камчатке (основной)
  TRANSFERS: '12806',    // Расчёт трансферов (если создан)
  LOYALTY: '12807',      // Программа лояльности (если создан)
  SUPPORT: '12808'       // Поддержка клиентов (если создан)
} as const;
