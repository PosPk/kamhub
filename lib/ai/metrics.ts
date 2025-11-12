/**
 * AI METRICS TRACKING SYSTEM
 * Система отслеживания метрик для AI агентов
 * 
 * Основные метрики:
 * - Action Completion: Выполнил ли AI задачу
 * - Conversation Quality: Удовлетворенность пользователя
 * - Tool Execution: Работа инструментов (API, БД)
 * - Agent Efficiency: Скорость и эффективность
 */

import { query } from '@/lib/database';

// =============================================
// ТИПЫ
// =============================================

export type MetricType = 
  | 'action_completion' 
  | 'conversation_quality' 
  | 'tool_execution' 
  | 'agent_efficiency';

export type FeedbackType = 
  | 'thumbs_up' 
  | 'thumbs_down' 
  | 'task_completed' 
  | 'task_failed' 
  | 'rating';

export interface MetricData {
  sessionId: string;
  userId?: string;
  metricType: MetricType;
  metricValue?: number;  // 0-1
  toolName?: string;
  success?: boolean;
  latency?: number;
  errorMessage?: string;
  details?: Record<string, any>;
}

export interface ChatMessage {
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  latency?: number;
  tokensUsed?: number;
  modelUsed?: string;
  toolsUsed?: string[];
}

export interface SessionData {
  sessionId: string;
  userId?: string;
  firstUserMessage?: string;
  userGoal?: string;
}

export interface FeedbackData {
  sessionId: string;
  messageId?: string;
  userId?: string;
  feedbackType: FeedbackType;
  rating?: number;
  comment?: string;
}

// =============================================
// AI METRICS CLASS
// =============================================

export class AIMetrics {
  /**
   * Отслеживание выполнения задачи (Action Completion)
   */
  async trackActionCompletion(data: {
    sessionId: string;
    userId?: string;
    userMessage: string;
    aiResponse: string;
    completed: boolean;
    userGoal?: string;
  }): Promise<void> {
    try {
      const metricValue = data.completed ? 1.0 : 0.0;
      
      await query(`
        INSERT INTO ai_metrics (
          session_id, user_id, metric_type, metric_value, details, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        data.sessionId,
        data.userId || null,
        'action_completion',
        metricValue,
        JSON.stringify({
          userMessage: data.userMessage,
          aiResponse: data.aiResponse,
          userGoal: data.userGoal,
          completed: data.completed
        })
      ]);
      
      // Обновляем статус сессии
      await query(`
        UPDATE ai_chat_sessions
        SET task_completed = $1, last_activity_at = NOW()
        WHERE session_id = $2
      `, [data.completed, data.sessionId]);
      
      console.log(`✅ Action Completion tracked: ${data.completed ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.error('❌ Error tracking action completion:', error);
    }
  }

  /**
   * Отслеживание качества беседы (Conversation Quality)
   */
  async trackConversationQuality(data: {
    sessionId: string;
    userId?: string;
    satisfied: boolean;
    frustrationSignals?: string[];
    turnsToResolution?: number;
  }): Promise<void> {
    try {
      const metricValue = data.satisfied ? 1.0 : 0.0;
      
      await query(`
        INSERT INTO ai_metrics (
          session_id, user_id, metric_type, metric_value, details, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        data.sessionId,
        data.userId || null,
        'conversation_quality',
        metricValue,
        JSON.stringify({
          satisfied: data.satisfied,
          frustrationSignals: data.frustrationSignals || [],
          turnsToResolution: data.turnsToResolution
        })
      ]);
      
      // Обновляем статус сессии
      await query(`
        UPDATE ai_chat_sessions
        SET user_satisfied = $1, last_activity_at = NOW()
        WHERE session_id = $2
      `, [data.satisfied, data.sessionId]);
      
      console.log(`✅ Conversation Quality tracked: ${data.satisfied ? 'SATISFIED' : 'FRUSTRATED'}`);
    } catch (error) {
      console.error('❌ Error tracking conversation quality:', error);
    }
  }

  /**
   * Отслеживание выполнения инструментов (Tool Execution)
   */
  async trackToolExecution(data: {
    sessionId: string;
    userId?: string;
    toolName: string;
    success: boolean;
    latency: number;
    errorMessage?: string;
    params?: Record<string, any>;
  }): Promise<void> {
    try {
      await query(`
        INSERT INTO ai_metrics (
          session_id, user_id, metric_type, tool_name, 
          success, latency, error_message, details, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        data.sessionId,
        data.userId || null,
        'tool_execution',
        data.toolName,
        data.success,
        data.latency,
        data.errorMessage || null,
        JSON.stringify(data.params || {})
      ]);
      
      const emoji = data.success ? '✅' : '❌';
      console.log(`${emoji} Tool Execution: ${data.toolName} (${data.latency}ms)`);
    } catch (error) {
      console.error('❌ Error tracking tool execution:', error);
    }
  }

  /**
   * Отслеживание эффективности агента (Agent Efficiency)
   */
  async trackAgentEfficiency(data: {
    sessionId: string;
    userId?: string;
    totalSteps: number;
    optimalSteps: number;
    totalLatency: number;
    apiCalls: number;
  }): Promise<void> {
    try {
      const efficiency = data.optimalSteps / data.totalSteps;
      
      await query(`
        INSERT INTO ai_metrics (
          session_id, user_id, metric_type, metric_value, 
          latency, details, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        data.sessionId,
        data.userId || null,
        'agent_efficiency',
        efficiency,
        data.totalLatency,
        JSON.stringify({
          totalSteps: data.totalSteps,
          optimalSteps: data.optimalSteps,
          efficiency: efficiency,
          apiCalls: data.apiCalls
        })
      ]);
      
      const efficiencyPercent = (efficiency * 100).toFixed(1);
      console.log(`📊 Agent Efficiency: ${efficiencyPercent}% (${data.totalSteps}/${data.optimalSteps} steps)`);
    } catch (error) {
      console.error('❌ Error tracking agent efficiency:', error);
    }
  }

  /**
   * Создание/обновление сессии чата
   */
  async upsertSession(data: SessionData): Promise<void> {
    try {
      await query(`
        INSERT INTO ai_chat_sessions (
          session_id, user_id, first_user_message, user_goal, 
          started_at, last_activity_at
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (session_id) 
        DO UPDATE SET 
          user_id = COALESCE(EXCLUDED.user_id, ai_chat_sessions.user_id),
          first_user_message = COALESCE(EXCLUDED.first_user_message, ai_chat_sessions.first_user_message),
          user_goal = COALESCE(EXCLUDED.user_goal, ai_chat_sessions.user_goal),
          last_activity_at = NOW()
      `, [
        data.sessionId,
        data.userId || null,
        data.firstUserMessage || null,
        data.userGoal || null
      ]);
    } catch (error) {
      console.error('❌ Error upserting session:', error);
    }
  }

  /**
   * Сохранение сообщения чата
   */
  async saveMessage(data: ChatMessage): Promise<string | null> {
    try {
      const result = await query(`
        INSERT INTO ai_chat_messages (
          session_id, role, content, latency, 
          tokens_used, model_used, tools_used, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id
      `, [
        data.sessionId,
        data.role,
        data.content,
        data.latency || null,
        data.tokensUsed || null,
        data.modelUsed || null,
        data.toolsUsed || null
      ]);
      
      // Обновляем счетчики сессии
      await query(`
        UPDATE ai_chat_sessions
        SET 
          total_messages = total_messages + 1,
          user_messages = user_messages + CASE WHEN $2 = 'user' THEN 1 ELSE 0 END,
          ai_messages = ai_messages + CASE WHEN $2 = 'assistant' THEN 1 ELSE 0 END,
          last_activity_at = NOW()
        WHERE session_id = $1
      `, [data.sessionId, data.role]);
      
      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Error saving message:', error);
      return null;
    }
  }

  /**
   * Сохранение обратной связи пользователя
   */
  async saveFeedback(data: FeedbackData): Promise<void> {
    try {
      await query(`
        INSERT INTO ai_feedback (
          session_id, message_id, user_id, feedback_type, 
          rating, comment, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        data.sessionId,
        data.messageId || null,
        data.userId || null,
        data.feedbackType,
        data.rating || null,
        data.comment || null
      ]);
      
      console.log(`💬 Feedback saved: ${data.feedbackType}`);
    } catch (error) {
      console.error('❌ Error saving feedback:', error);
    }
  }

  /**
   * Автоматическое определение завершенности задачи
   */
  detectTaskCompletion(aiResponse: string): boolean {
    const completionPhrases = [
      'вот результаты',
      'я нашел',
      'я нашёл',
      'забронировал',
      'забронирован',
      'подтверждаю',
      'подтверждено',
      'готово',
      'успешно',
      'оформлен',
      'создан',
      'вот что удалось найти',
      'выполнено'
    ];
    
    const lowerResponse = aiResponse.toLowerCase();
    return completionPhrases.some(phrase => lowerResponse.includes(phrase));
  }

  /**
   * Определение фрустрации пользователя
   */
  detectFrustration(messages: Array<{ role: string; content: string }>): string[] {
    const signals: string[] = [];
    
    const userMessages = messages.filter(m => m.role === 'user');
    
    // Повторяющиеся вопросы
    const repeated = userMessages.filter((msg, i, arr) => 
      arr.slice(0, i).some(prev => 
        this.textSimilarity(msg.content, prev.content) > 0.7
      )
    );
    if (repeated.length > 0) {
      signals.push('repeated_questions');
    }
    
    // Негативные слова
    const negativeWords = [
      'не понимаю',
      'не работает',
      'не помогло',
      'бесполезно',
      'не то',
      'неправильно',
      'ошибка',
      'плохо'
    ];
    
    const hasNegative = userMessages.some(msg => 
      negativeWords.some(word => msg.content.toLowerCase().includes(word))
    );
    if (hasNegative) {
      signals.push('negative_language');
    }
    
    // Короткие односложные ответы (признак фрустрации)
    const shortMessages = userMessages.filter(m => m.content.length < 10);
    if (shortMessages.length > 3) {
      signals.push('short_responses');
    }
    
    return signals;
  }

  /**
   * Простая проверка схожести текстов (0-1)
   */
  private textSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Извлечение цели пользователя из первого сообщения
   */
  extractUserGoal(message: string): string {
    // Простая эвристика - первое предложение или первые 100 символов
    const firstSentence = message.split(/[.!?]/)[0];
    return firstSentence.substring(0, 100).trim();
  }

  /**
   * Завершение сессии
   */
  async endSession(
    sessionId: string, 
    taskCompleted: boolean, 
    userSatisfied?: boolean
  ): Promise<void> {
    try {
      await query(`
        SELECT end_ai_session($1, $2, $3)
      `, [sessionId, taskCompleted, userSatisfied || null]);
      
      console.log(`🏁 Session ended: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error ending session:', error);
    }
  }
}

// Singleton instance
export const aiMetrics = new AIMetrics();
