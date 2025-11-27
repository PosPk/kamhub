-- ============================================
-- SOS EMERGENCY CALLS - СХЕМА БАЗЫ ДАННЫХ
-- Экстренные вызовы для безопасности туристов
-- ============================================

-- Таблица экстренных SOS вызовов
CREATE TABLE IF NOT EXISTS sos_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Локация (обязательно)
  location JSONB NOT NULL, -- { lat, lng, address?, altitude?, accuracy? }
  
  -- Тип чрезвычайной ситуации
  emergency_type VARCHAR(50) NOT NULL CHECK (emergency_type IN (
    'medical',      -- Медицинская помощь
    'lost',         -- Потерялся
    'accident',     -- Несчастный случай
    'weather',      -- Погодные условия
    'wildlife',     -- Встреча с дикими животными
    'other'         -- Другое
  )),
  
  -- Описание ситуации
  description TEXT,
  
  -- Контактная информация
  contact_phone VARCHAR(50),
  
  -- Размер группы
  group_size INTEGER DEFAULT 1,
  
  -- Уровень серьезности
  severity_level VARCHAR(20) DEFAULT 'high' CHECK (severity_level IN (
    'low',          -- Низкий
    'medium',       -- Средний
    'high',         -- Высокий
    'critical'      -- Критический
  )),
  
  -- Статус вызова
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active',       -- Активный (требует помощи)
    'responded',    -- Получен ответ
    'resolved',     -- Решено
    'cancelled'     -- Отменено
  )),
  
  -- Информация об ответе
  responder_id UUID REFERENCES users(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  response_notes TEXT,
  
  -- Метаданные
  device_info JSONB, -- Информация об устройстве
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_sos_calls_user_id ON sos_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_calls_status ON sos_calls(status);
CREATE INDEX IF NOT EXISTS idx_sos_calls_severity ON sos_calls(severity_level);
CREATE INDEX IF NOT EXISTS idx_sos_calls_emergency_type ON sos_calls(emergency_type);
CREATE INDEX IF NOT EXISTS idx_sos_calls_created_at ON sos_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sos_calls_active ON sos_calls(status, severity_level) WHERE status = 'active';

-- Пространственный индекс для поиска по локации (требует PostGIS)
-- CREATE INDEX IF NOT EXISTS idx_sos_calls_location ON sos_calls USING GIST ((location::geometry));

-- Комментарии к таблице
COMMENT ON TABLE sos_calls IS 'Экстренные SOS вызовы от туристов';
COMMENT ON COLUMN sos_calls.emergency_type IS 'Тип чрезвычайной ситуации';
COMMENT ON COLUMN sos_calls.severity_level IS 'Уровень серьезности: critical - требует немедленной помощи';
COMMENT ON COLUMN sos_calls.status IS 'Статус: active - требует помощи, responded - получен ответ';

-- Таблица истории обновлений SOS вызовов
CREATE TABLE IF NOT EXISTS sos_call_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sos_call_id UUID REFERENCES sos_calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'responded', 'resolved', 'cancelled'
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sos_history_call_id ON sos_call_history(sos_call_id);
CREATE INDEX IF NOT EXISTS idx_sos_history_created_at ON sos_call_history(created_at DESC);

-- Триггер для автоматического логирования изменений
CREATE OR REPLACE FUNCTION log_sos_call_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO sos_call_history (sos_call_id, user_id, action, new_status, notes)
    VALUES (NEW.id, NEW.user_id, 'created', NEW.status, 'SOS вызов создан');
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO sos_call_history (sos_call_id, user_id, action, old_status, new_status, notes)
      VALUES (NEW.id, NEW.responder_id, 'status_changed', OLD.status, NEW.status, NEW.response_notes);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sos_call_changes ON sos_calls;
CREATE TRIGGER trg_sos_call_changes
AFTER INSERT OR UPDATE ON sos_calls
FOR EACH ROW
EXECUTE FUNCTION log_sos_call_changes();

-- Представление для активных SOS вызовов с дополнительной информацией
CREATE OR REPLACE VIEW active_sos_calls AS
SELECT 
  s.id,
  s.emergency_type,
  s.severity_level,
  s.location,
  s.description,
  s.group_size,
  s.contact_phone,
  s.created_at,
  u.name as user_name,
  u.email as user_email,
  u.phone as user_phone,
  EXTRACT(EPOCH FROM (NOW() - s.created_at))/60 as minutes_since_call
FROM sos_calls s
LEFT JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
ORDER BY s.severity_level DESC, s.created_at ASC;

COMMENT ON VIEW active_sos_calls IS 'Активные SOS вызовы с информацией о пользователе';

\echo '✓ SOS Emergency таблицы созданы'
