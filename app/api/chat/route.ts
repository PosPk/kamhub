/**
 * AI CHAT API ENDPOINT
 * Обработка запросов к AI ассистенту
 */

import { NextRequest, NextResponse } from 'next/server';
import { groqClient, KAMCHATOUR_SYSTEM_PROMPT } from '@/lib/ai/groq-client';
import { aiMetrics } from '@/lib/ai/metrics';
import { logger } from '@/lib/logger';
import { cache } from '@/lib/cache/redis';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { sessionId, userId, message, context } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { success: false, error: 'Session ID and message are required' },
        { status: 400 }
      );
    }

    logger.info('AI Chat запрос получен', {
      sessionId,
      userId,
      messageLength: message.length,
    });

    // 1. Создаем/обновляем сессию
    await aiMetrics.upsertSession({
      sessionId,
      userId,
      firstUserMessage: message,
      userGoal: aiMetrics.extractUserGoal(message),
    });

    // 2. Сохраняем сообщение пользователя
    await aiMetrics.saveMessage({
      sessionId,
      role: 'user',
      content: message,
    });

    // 3. Проверяем кэш для похожих вопросов
    const cacheKey = `chat:${message.toLowerCase().trim()}`;
    const cached = await cache.get<string>(cacheKey);
    
    if (cached) {
      logger.info('AI ответ из кэша', { sessionId });
      
      const aiMessage = {
        id: `${Date.now()}`,
        role: 'assistant' as const,
        content: cached,
        timestamp: new Date(),
        metadata: { cached: true },
      };

      // Сохраняем ответ
      await aiMetrics.saveMessage({
        sessionId,
        role: 'assistant',
        content: cached,
        latency: Date.now() - startTime,
      });

      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          messages: [aiMessage],
        },
      });
    }

    // 4. Проверяем доступность GROQ API
    if (!groqClient.isAvailable()) {
      logger.warn('GROQ API недоступен, используем fallback', { sessionId });
      
      const fallbackMessage = `Извините, AI-ассистент временно недоступен. 🤖

Но я все равно могу вам помочь! Вот что я могу сделать:

🗺️ **Популярные туры на Камчатке:**
- Вулканы Мутновский и Горелый
- Долина Гейзеров
- Курильское озеро
- Авачинская бухта

🚗 **Трансферы:**
- Аэропорт → Город (1200₽)
- По городу (от 500₽)
- На термальные источники (от 2000₽)

💡 **Рекомендую:**
1. Посетите нашу страницу туров
2. Свяжитесь с оператором для консультации
3. Позвоните: +7 (4152) 12-34-56

Чем еще могу помочь?`;

      const aiMessage = {
        id: `${Date.now()}`,
        role: 'assistant' as const,
        content: fallbackMessage,
        timestamp: new Date(),
        metadata: { fallback: true },
      };

      await aiMetrics.saveMessage({
        sessionId,
        role: 'assistant',
        content: fallbackMessage,
        latency: Date.now() - startTime,
      });

      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          messages: [aiMessage],
        },
      });
    }

    // 5. Формируем контекст
    const systemPrompt = KAMCHATOUR_SYSTEM_PROMPT + (context ? `\n\nКонтекст: ${JSON.stringify(context)}` : '');

    // 6. Вызываем GROQ API
    const aiResponseStart = Date.now();
    let aiResponse: string;
    
    try {
      aiResponse = await groqClient.ask(message, systemPrompt, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      // Трекаем успешное выполнение инструмента
      await aiMetrics.trackToolExecution({
        sessionId,
        userId,
        toolName: 'groq_api',
        success: true,
        latency: Date.now() - aiResponseStart,
      });

    } catch (error) {
      logger.error('GROQ API ошибка', error, { sessionId });

      // Трекаем ошибку инструмента
      await aiMetrics.trackToolExecution({
        sessionId,
        userId,
        toolName: 'groq_api',
        success: false,
        latency: Date.now() - aiResponseStart,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }

    // 7. Сохраняем ответ AI
    const totalLatency = Date.now() - startTime;
    await aiMetrics.saveMessage({
      sessionId,
      role: 'assistant',
      content: aiResponse,
      latency: totalLatency,
      modelUsed: 'groq-llama-3.1-70b',
    });

    // 8. Автоматически определяем completion
    const completed = aiMetrics.detectTaskCompletion(aiResponse);

    // 9. Трекаем эффективность (примерно)
    await aiMetrics.trackAgentEfficiency({
      sessionId,
      userId,
      totalSteps: 1, // Пока один шаг - прямой ответ
      optimalSteps: 1,
      totalLatency,
      apiCalls: 1,
    });

    // 10. Кэшируем популярные запросы
    if (message.length < 200) { // Только короткие вопросы
      await cache.set(cacheKey, aiResponse, { ttl: 3600 }); // 1 час
    }

    const aiMessage = {
      id: `${Date.now()}`,
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: new Date(),
      metadata: {
        model: 'groq-llama-3.1-70b',
        latency: totalLatency,
      },
    };

    logger.performance('AI Chat обработан', totalLatency, {
      sessionId,
      completed,
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        messages: [aiMessage],
        completed,
      },
    });

  } catch (error) {
    const totalLatency = Date.now() - startTime;
    
    logger.error('Ошибка в AI Chat', error, {
      latency: totalLatency,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Извините, произошла ошибка. Попробуйте еще раз.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - получить историю чата
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    // TODO: Реализовать получение истории из БД

    return NextResponse.json({
      success: true,
      data: {
        messages: [],
      },
    });

  } catch (error) {
    logger.error('Ошибка при получении истории чата', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
