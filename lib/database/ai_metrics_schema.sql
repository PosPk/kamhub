-- =============================================
-- AI METRICS SCHEMA
-- Система отслеживания метрик AI агентов
-- =============================================

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ТАБЛИЦА: ai_metrics - Метрики AI
-- =============================================
CREATE TABLE IF NOT EXISTS ai_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Идентификация
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Тип метрики
  metric_type VARCHAR(50) NOT NULL,
  -- Возможные значения:
  -- 'action_completion' - Выполнена ли задача пользователя
  -- 'conversation_quality' - Удовлетворенность пользователя
  -- 'tool_execution' - Выполнение инструментов (поиск, бронирование и т.д.)
  -- 'agent_efficiency' - Эффективность работы агента
  
  -- Значение метрики (0-1 для процентных метрик)
  metric_value DECIMAL(5,4),
  
  -- Для tool_execution метрик
  tool_name VARCHAR(100),
  success BOOLEAN,
  latency INTEGER,  -- В миллисекундах
  error_message TEXT,
  
  -- Дополнительные детали (JSON)
  details JSONB DEFAULT '{}',
  
  -- Временные метки
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ТАБЛИЦА: ai_chat_sessions - Сессии чата
-- =============================================
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Статистика сессии
  total_messages INTEGER DEFAULT 0,
  user_messages INTEGER DEFAULT 0,
  ai_messages INTEGER DEFAULT 0,
  
  -- Результат сессии
  task_completed BOOLEAN DEFAULT false,
  user_satisfied BOOLEAN,
  
  -- Первое и последнее сообщение
  first_user_message TEXT,
  user_goal TEXT,  -- Извлеченная цель пользователя
  
  -- Временные метки
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ТАБЛИЦА: ai_chat_messages - Сообщения чата
-- =============================================
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  
  -- Роль и контент
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Метаданные
  latency INTEGER,  -- Время генерации ответа (для assistant)
  tokens_used INTEGER,  -- Использованные токены
  model_used VARCHAR(50),  -- Какая модель использовалась
  
  -- Инструменты использованные в этом сообщении
  tools_used TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ТАБЛИЦА: ai_feedback - Обратная связь пользователей
-- =============================================
CREATE TABLE IF NOT EXISTS ai_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  message_id UUID REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Тип обратной связи
  feedback_type VARCHAR(50) NOT NULL,
  -- 'thumbs_up', 'thumbs_down', 'task_completed', 'task_failed', 'rating'
  
  -- Значение
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ИНДЕКСЫ
-- =============================================

-- ai_metrics индексы
CREATE INDEX idx_ai_metrics_session ON ai_metrics(session_id);
CREATE INDEX idx_ai_metrics_user ON ai_metrics(user_id);
CREATE INDEX idx_ai_metrics_type ON ai_metrics(metric_type);
CREATE INDEX idx_ai_metrics_created ON ai_metrics(created_at DESC);
CREATE INDEX idx_ai_metrics_tool ON ai_metrics(tool_name) WHERE tool_name IS NOT NULL;
CREATE INDEX idx_ai_metrics_success ON ai_metrics(success) WHERE success IS NOT NULL;

-- ai_chat_sessions индексы
CREATE INDEX idx_ai_sessions_session ON ai_chat_sessions(session_id);
CREATE INDEX idx_ai_sessions_user ON ai_chat_sessions(user_id);
CREATE INDEX idx_ai_sessions_started ON ai_chat_sessions(started_at DESC);
CREATE INDEX idx_ai_sessions_completed ON ai_chat_sessions(task_completed);

-- ai_chat_messages индексы
CREATE INDEX idx_ai_messages_session ON ai_chat_messages(session_id);
CREATE INDEX idx_ai_messages_created ON ai_chat_messages(created_at DESC);
CREATE INDEX idx_ai_messages_role ON ai_chat_messages(role);

-- ai_feedback индексы
CREATE INDEX idx_ai_feedback_session ON ai_feedback(session_id);
CREATE INDEX idx_ai_feedback_user ON ai_feedback(user_id);
CREATE INDEX idx_ai_feedback_type ON ai_feedback(feedback_type);

-- =============================================
-- ПРЕДСТАВЛЕНИЯ (VIEWS)
-- =============================================

-- Агрегированная статистика по метрикам
CREATE OR REPLACE VIEW ai_metrics_summary AS
SELECT 
  date_trunc('day', created_at) as date,
  metric_type,
  COUNT(*) as total_measurements,
  ROUND(AVG(metric_value) * 100, 2) as avg_value_percent,
  ROUND(MIN(metric_value) * 100, 2) as min_value_percent,
  ROUND(MAX(metric_value) * 100, 2) as max_value_percent,
  COUNT(CASE WHEN metric_value >= 0.8 THEN 1 END) as high_quality_count,
  COUNT(CASE WHEN metric_value < 0.5 THEN 1 END) as low_quality_count
FROM ai_metrics
WHERE metric_value IS NOT NULL
GROUP BY date_trunc('day', created_at), metric_type
ORDER BY date DESC, metric_type;

-- Статистика по инструментам
CREATE OR REPLACE VIEW ai_tool_performance AS
SELECT 
  tool_name,
  COUNT(*) as total_calls,
  COUNT(CASE WHEN success = true THEN 1 END) as successful_calls,
  COUNT(CASE WHEN success = false THEN 1 END) as failed_calls,
  ROUND(
    COUNT(CASE WHEN success = true THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as success_rate_percent,
  ROUND(AVG(latency), 0) as avg_latency_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency), 0) as p95_latency_ms,
  array_agg(DISTINCT error_message) FILTER (WHERE error_message IS NOT NULL) as common_errors
FROM ai_metrics
WHERE metric_type = 'tool_execution' AND tool_name IS NOT NULL
GROUP BY tool_name
ORDER BY total_calls DESC;

-- Статистика по сессиям
CREATE OR REPLACE VIEW ai_session_stats AS
SELECT 
  date_trunc('day', started_at) as date,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN task_completed = true THEN 1 END) as completed_sessions,
  COUNT(CASE WHEN user_satisfied = true THEN 1 END) as satisfied_sessions,
  ROUND(AVG(total_messages), 1) as avg_messages_per_session,
  ROUND(
    COUNT(CASE WHEN task_completed = true THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as completion_rate_percent,
  ROUND(
    COUNT(CASE WHEN user_satisfied = true THEN 1 END)::numeric / 
    NULLIF(COUNT(CASE WHEN user_satisfied IS NOT NULL THEN 1 END), 0) * 100, 
    2
  ) as satisfaction_rate_percent
FROM ai_chat_sessions
GROUP BY date_trunc('day', started_at)
ORDER BY date DESC;

-- =============================================
-- ФУНКЦИИ
-- =============================================

-- Функция для очистки старых метрик (>90 дней)
CREATE OR REPLACE FUNCTION cleanup_old_ai_metrics()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_metrics 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  DELETE FROM ai_chat_messages
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Функция для завершения сессии
CREATE OR REPLACE FUNCTION end_ai_session(
  p_session_id VARCHAR(255),
  p_task_completed BOOLEAN,
  p_user_satisfied BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_chat_sessions
  SET 
    ended_at = NOW(),
    task_completed = p_task_completed,
    user_satisfied = COALESCE(p_user_satisfied, user_satisfied),
    last_activity_at = NOW()
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- =============================================

-- Комментарии к таблицам
COMMENT ON TABLE ai_metrics IS 'Метрики производительности AI агентов';
COMMENT ON TABLE ai_chat_sessions IS 'Сессии чата с AI';
COMMENT ON TABLE ai_chat_messages IS 'Сообщения в чате с AI';
COMMENT ON TABLE ai_feedback IS 'Обратная связь пользователей по AI';

COMMENT ON COLUMN ai_metrics.metric_type IS 'action_completion, conversation_quality, tool_execution, agent_efficiency';
COMMENT ON COLUMN ai_metrics.metric_value IS 'Значение от 0 до 1 (для процентных метрик)';

-- =============================================
-- ПРИМЕРЫ ЗАПРОСОВ
-- =============================================

-- Получить метрики за последние 7 дней
-- SELECT * FROM ai_metrics_summary 
-- WHERE date >= NOW() - INTERVAL '7 days';

-- Получить производительность инструментов
-- SELECT * FROM ai_tool_performance;

-- Получить статистику сессий за месяц
-- SELECT * FROM ai_session_stats 
-- WHERE date >= date_trunc('month', NOW());

-- Найти проблемные сессии (не завершены и пользователь недоволен)
-- SELECT * FROM ai_chat_sessions 
-- WHERE task_completed = false AND user_satisfied = false
-- ORDER BY started_at DESC LIMIT 10;
