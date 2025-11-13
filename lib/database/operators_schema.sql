-- =============================================
-- СХЕМА ТАБЛИЦЫ ОПЕРАТОРОВ (КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ)
-- Kamchatour Hub - Operators Schema
-- =============================================

-- ВАЖНО: Эта таблица необходима для работы модуля трансферов!
-- В transfer_schema.sql используются ссылки на operators(id), но таблица не была создана.

-- ============================================
-- ТАБЛИЦА: operators - Туроператоры и владельцы трансферов
-- ============================================
-- Хранит информацию о всех операторах платформы
-- Поддерживает туроператоров и владельцев трансферов
-- Включает систему верификации и рейтингов
-- ============================================
CREATE TABLE IF NOT EXISTS operators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),                 -- Уникальный идентификатор оператора
  name VARCHAR(255) NOT NULL,                                     -- Название компании
  phone VARCHAR(20) NOT NULL,                                     -- Контактный телефон
  email VARCHAR(255) NOT NULL,                                    -- Email для связи
  category VARCHAR(50) NOT NULL CHECK (category IN ('tour', 'transfer', 'both')), -- Категория услуг
  description TEXT,                                               -- Описание компании и услуг
  address TEXT,                                                   -- Юридический/фактический адрес
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5), -- Средний рейтинг оператора
  review_count INTEGER DEFAULT 0,                                 -- Количество отзывов
  is_verified BOOLEAN DEFAULT FALSE,                              -- Верифицирован ли администрацией
  is_active BOOLEAN DEFAULT TRUE,                                 -- Активность на платформе
  license_number VARCHAR(100),                                    -- Номер лицензии (если требуется)
  tax_id VARCHAR(50),                                            -- ИНН или налоговый номер
  bank_details JSONB DEFAULT '{}',                               -- Банковские реквизиты для выплат
  created_at TIMESTAMPTZ DEFAULT NOW(),                          -- Дата регистрации в системе
  updated_at TIMESTAMPTZ DEFAULT NOW()                           -- Дата последнего обновления
);

COMMENT ON TABLE operators IS 'Туроператоры и владельцы трансферов на платформе Kamchatour Hub';
COMMENT ON COLUMN operators.id IS 'Уникальный идентификатор оператора (UUID)';
COMMENT ON COLUMN operators.name IS 'Название компании или ИП';
COMMENT ON COLUMN operators.phone IS 'Контактный телефон для связи';
COMMENT ON COLUMN operators.email IS 'Email адрес для деловой переписки';
COMMENT ON COLUMN operators.category IS 'Категория: tour (туроператор), transfer (владелец трансферов), both (оба направления)';
COMMENT ON COLUMN operators.description IS 'Подробное описание компании и предоставляемых услуг';
COMMENT ON COLUMN operators.address IS 'Юридический или фактический адрес компании';
COMMENT ON COLUMN operators.rating IS 'Средний рейтинг оператора на основе отзывов (0.00-5.00)';
COMMENT ON COLUMN operators.review_count IS 'Общее количество отзывов о компании';
COMMENT ON COLUMN operators.is_verified IS 'Верифицирована ли компания администрацией платформы';
COMMENT ON COLUMN operators.is_active IS 'Активность оператора (принимает ли заказы)';
COMMENT ON COLUMN operators.license_number IS 'Номер туристической лицензии или разрешения';
COMMENT ON COLUMN operators.tax_id IS 'ИНН или другой налоговый идентификатор';
COMMENT ON COLUMN operators.bank_details IS 'JSON с банковскими реквизитами для перечисления средств';
COMMENT ON COLUMN operators.created_at IS 'Дата регистрации оператора на платформе';
COMMENT ON COLUMN operators.updated_at IS 'Дата последнего обновления информации об операторе';

-- Индексы для operators
CREATE INDEX IF NOT EXISTS idx_operators_category ON operators(category);
CREATE INDEX IF NOT EXISTS idx_operators_is_active ON operators(is_active);
CREATE INDEX IF NOT EXISTS idx_operators_is_verified ON operators(is_verified);
CREATE INDEX IF NOT EXISTS idx_operators_rating ON operators(rating);
CREATE INDEX IF NOT EXISTS idx_operators_email ON operators(email);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_operators_updated_at 
  BEFORE UPDATE ON operators
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Вставляем тестовых операторов
INSERT INTO operators (id, name, phone, email, category, description, is_verified, is_active) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Камчатка Трансфер',
  '+7-914-000-00-00',
  'info@kamchatka-transfer.ru',
  'transfer',
  'Надёжные трансферы по Камчатке с 2015 года',
  true,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Вулканы Камчатки Тур',
  '+7-914-111-11-11',
  'info@volcano-tour.ru',
  'tour',
  'Экскурсии к вулканам и горячим источникам',
  true,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Камчатка Приключения',
  '+7-914-222-22-22',
  'hello@kamadventure.ru',
  'both',
  'Полный спектр туристических услуг: туры + трансферы',
  true,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Восточный экспресс',
  '+7-914-333-33-33',
  'support@east-express.ru',
  'transfer',
  'Трансферы из аэропорта Елизово в город и обратно',
  false,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Легенды Камчатки',
  '+7-914-444-44-44',
  'booking@legends-kamchatka.ru',
  'tour',
  'Этнографические туры и знакомство с культурой коренных народов',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Обновляем существующие записи в transfer_vehicles и transfer_drivers
-- (если они уже созданы с некорректными operator_id)
UPDATE transfer_vehicles 
SET operator_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE operator_id IS NOT NULL 
  AND operator_id NOT IN (SELECT id FROM operators);

UPDATE transfer_drivers 
SET operator_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE operator_id IS NOT NULL 
  AND operator_id NOT IN (SELECT id FROM operators);

-- Представление для полной информации об операторах
CREATE OR REPLACE VIEW operator_full_info AS
SELECT 
  o.*,
  COUNT(DISTINCT v.id) as total_vehicles,
  COUNT(DISTINCT d.id) as total_drivers,
  COUNT(DISTINCT b.id) as total_bookings,
  COALESCE(SUM(b.total_price), 0) as total_revenue
FROM operators o
LEFT JOIN transfer_vehicles v ON o.id = v.operator_id AND v.is_active = true
LEFT JOIN transfer_drivers d ON o.id = d.operator_id AND d.is_active = true
LEFT JOIN transfer_bookings b ON o.id = b.operator_id
GROUP BY o.id;

-- ============================================
-- ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
-- ============================================
-- Таблица operators является центральной для модуля трансферов
-- Все транспортные средства и водители связаны с операторами
-- Рейтинг рассчитывается автоматически на основе отзывов

-- Вывод информации
SELECT 
  'Таблица operators создана успешно!' as status,
  COUNT(*) as total_operators
FROM operators;
