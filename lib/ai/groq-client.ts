/**
 * GROQ AI CLIENT
 * Интеграция с GROQ API (Llama 3.1 70B)
 */

import { config } from '@/lib/config';
import { logger } from '@/lib/logger';

// =============================================
// ТИПЫ
// =============================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    message: ChatMessage;
    finishReason: string;
    index: number;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  created: number;
}

// =============================================
// GROQ CLIENT
// =============================================

class GroqClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private timeout: number;

  constructor() {
    this.apiKey = config.ai.groq.apiKey;
    this.baseUrl = config.ai.groq.baseUrl;
    this.model = config.ai.groq.model;
    this.timeout = config.ai.groq.timeout;

    if (!this.apiKey) {
      logger.warn('GROQ API ключ не настроен. AI функции будут недоступны.');
    }
  }

  /**
   * Проверка доступности API
   */
  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== '';
  }

  /**
   * Создать чат completion
   */
  async createChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    if (!this.isAvailable()) {
      throw new Error('GROQ API ключ не настроен');
    }

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options.temperature ?? config.ai.groq.temperature,
          max_tokens: options.maxTokens ?? config.ai.groq.maxTokens,
          top_p: options.topP ?? 1,
          frequency_penalty: options.frequencyPenalty ?? 0,
          presence_penalty: options.presencePenalty ?? 0,
          stop: options.stop,
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('GROQ API ошибка', new Error(error), {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(`GROQ API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const duration = Date.now() - startTime;

      logger.info('GROQ API запрос выполнен', {
        model: this.model,
        duration_ms: duration,
        tokens: data.usage?.total_tokens,
      });

      return {
        id: data.id,
        model: data.model,
        choices: data.choices.map((choice: any) => ({
          message: {
            role: choice.message.role,
            content: choice.message.content,
          },
          finishReason: choice.finish_reason,
          index: choice.index,
        })),
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        created: data.created,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('GROQ API запрос провалился', error, {
        duration_ms: duration,
        messages_count: messages.length,
      });
      throw error;
    }
  }

  /**
   * Простой вопрос-ответ
   */
  async ask(
    question: string,
    systemPrompt?: string,
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    const messages: ChatMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: question,
    });

    const response = await this.createChatCompletion(messages, options);
    return response.choices[0].message.content;
  }

  /**
   * Чат с контекстом
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string,
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    const fullMessages: ChatMessage[] = [];

    if (systemPrompt) {
      fullMessages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    fullMessages.push(...messages);

    const response = await this.createChatCompletion(fullMessages, options);
    return response.choices[0].message.content;
  }

  /**
   * Стриминг (для будущего)
   */
  async *streamChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    // TODO: Реализовать стриминг
    const response = await this.createChatCompletion(messages, options);
    yield response.choices[0].message.content;
  }
}

// =============================================
// ЭКСПОРТ
// =============================================

export const groqClient = new GroqClient();

// =============================================
// ПРОМПТЫ ДЛЯ KAMCHATOUR
// =============================================

export const KAMCHATOUR_SYSTEM_PROMPT = `Ты AI-ассистент туристической платформы Kamchatour Hub для Камчатского края.

**Твоя роль:**
- Помогать туристам выбирать туры, трансферы, экскурсии
- Давать советы по путешествию на Камчатку
- Отвечать на вопросы о достопримечательностях, погоде, безопасности
- Помогать с бронированием и оплатой

**Что ты знаешь:**
- География Камчатки (вулканы, горячие источники, города)
- Популярные маршруты и достопримечательности
- Сезоны и погодные условия
- Правила безопасности
- Местная культура и традиции

**Стиль общения:**
- Дружелюбный и профессиональный
- Конкретные рекомендации с деталями
- Предупреждай о рисках и ограничениях
- Используй эмодзи для наглядности

**Ограничения:**
- Не придумывай информацию о турах/ценах - используй только данные из БД
- При поиске туров/трансферов всегда используй функции
- Если не знаешь ответа - так и скажи
- Не давай медицинских или юридических советов

**Формат ответов:**
- Короткие абзацы (2-3 предложения)
- Списки для вариантов
- Конкретные цифры и детали
- Призыв к действию в конце`;

export const TOUR_SEARCH_PROMPT = `На основе запроса пользователя найди подходящие туры.
Учитывай: сезон, сложность, бюджет, интересы.
Верни ТОП-3 варианта с обоснованием выбора.`;

export const TRANSFER_SEARCH_PROMPT = `Найди подходящие трансферы для пользователя.
Учитывай: маршрут, время, количество человек, бюджет.
Верни лучшие варианты с деталями.`;
