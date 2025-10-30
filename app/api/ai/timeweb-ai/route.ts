import { NextRequest, NextResponse } from 'next/server';
import { timewebAI, AGENTS } from '@/lib/timeweb-ai/client';

export const runtime = 'nodejs';

interface TimewebAIRequestBody {
  agentId?: string;
  message: string;
  conversationId?: string;
}

/**
 * API endpoint для работы с Timeweb Cloud AI
 * 
 * POST /api/ai/timeweb-ai
 * Body: { message: string, agentId?: string, conversationId?: string }
 * Response: { ok: boolean, answer: string, conversationId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Парсинг тела запроса
    const body: TimewebAIRequestBody = await req.json();
    const { agentId = AGENTS.GUIDE, message, conversationId } = body;

    // Валидация
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Message is required' }, 
        { status: 400 }
      );
    }

    if (message.length < 1 || message.length > 4000) {
      return NextResponse.json(
        { ok: false, error: 'Message length must be between 1 and 4000 characters' }, 
        { status: 400 }
      );
    }

    // Проверка API ключа
    if (!process.env.TIMEWEB_AI_KEY) {
      console.error('TIMEWEB_AI_KEY is not configured');
      
      // Fallback: используем Groq, если Timeweb AI недоступен
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Timeweb AI not configured. Please add TIMEWEB_AI_KEY to environment variables.' 
        }, 
        { status: 503 }
      );
    }

    // Запрос к Timeweb Cloud AI
    const startTime = Date.now();
    
    const result = await timewebAI.chat({
      agentId,
      message: message.trim(),
      conversationId
    });

    const responseTime = Date.now() - startTime;

    // Логирование для мониторинга
    console.log('[Timeweb AI]', {
      agentId,
      messageLength: message.length,
      responseTime: `${responseTime}ms`,
      tokensUsed: result.tokensUsed,
      hasConversationId: !!result.conversationId
    });

    // Ответ клиенту
    return NextResponse.json({
      ok: true,
      answer: result.response,
      conversationId: result.conversationId,
      meta: {
        agentId,
        model: result.model,
        tokensUsed: result.tokensUsed,
        responseTime
      }
    });

  } catch (error) {
    console.error('Timeweb AI API error:', error);

    // Возвращаем читаемую ошибку
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        ok: false, 
        error: 'AI service temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }, 
      { status: 503 }
    );
  }
}

/**
 * GET /api/ai/timeweb-ai - информация о сервисе
 */
export async function GET() {
  try {
    const agents = await timewebAI.listAgents();
    
    return NextResponse.json({
      ok: true,
      service: 'Timeweb Cloud AI',
      agents: agents,
      availableAgents: AGENTS
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch agents info'
    }, { status: 500 });
  }
}
