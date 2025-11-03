-- =====================================================
-- TOUR SYSTEM UPGRADE - Database Schema
-- Kamchatour Hub - Tours System v2.0
-- =====================================================
-- 
-- Цель: Довести систему туров до уровня трансферов
-- Основано на: transfer_schema.sql (proven architecture)
-- Дата: 2025-11-03
-- 
-- КРИТИЧЕСКИЕ УЛУЧШЕНИЯ:
-- 1. Race condition protection (SELECT FOR UPDATE NOWAIT)
-- 2. Временные блокировки мест (seat holds)
-- 3. Система расписания (schedules)
-- 4. Улучшенное бронирование (bookings v2)
-- 5. Система чекинов (checkins)
-- 6. Листы ожидания (waitlist)
-- =====================================================

-- =====================================================
-- 1. TOUR SCHEDULES - Расписание туров
-- =====================================================
-- Аналог transfer_schedules, но с дополнительными полями для туров

CREATE TABLE IF NOT EXISTS tour_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Связь с туром
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES partners(id),
    guide_id UUID REFERENCES partners(id),
    
    -- Даты и время
    start_date DATE NOT NULL,
    end_date DATE, -- для многодневных туров
    departure_time TIME NOT NULL,
    return_time TIME,
    duration_hours DECIMAL(4,2), -- рассчитываемое поле
    
    -- Участники
    max_participants INTEGER NOT NULL CHECK (max_participants > 0),
    min_participants INTEGER NOT NULL DEFAULT 1 CHECK (min_participants > 0),
    available_slots INTEGER NOT NULL CHECK (available_slots >= 0),
    
    -- Цены
    base_price DECIMAL(10,2) NOT NULL,
    price_per_person DECIMAL(10,2) NOT NULL,
    child_price DECIMAL(10,2), -- цена для детей
    group_discount_percent DECIMAL(5,2) DEFAULT 0, -- скидка для групп
    early_bird_discount_percent DECIMAL(5,2) DEFAULT 0, -- ранее бронирование
    
    -- Статус
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled',   -- запланирован
        'confirmed',   -- подтвержден (мин. участники набраны)
        'full',        -- полностью заполнен
        'cancelled',   -- отменен
        'completed',   -- завершен
        'in_progress'  -- в процессе
    )),
    
    -- Погода и безопасность
    weather_dependent BOOLEAN DEFAULT true,
    weather_check_time TIMESTAMPTZ, -- последняя проверка погоды
    weather_status VARCHAR(20) DEFAULT 'unknown' CHECK (weather_status IN (
        'excellent', 'good', 'moderate', 'poor', 'dangerous', 'unknown'
    )),
    weather_forecast JSONB, -- прогноз погоды
    
    -- Требования
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN (
        'easy', 'medium', 'hard', 'extreme'
    )),
    min_age INTEGER DEFAULT 0,
    max_age INTEGER,
    physical_requirements TEXT,
    medical_restrictions TEXT[],
    
    -- Место встречи
    meeting_point VARCHAR(500),
    meeting_coordinates JSONB, -- {lat, lng}
    meeting_instructions TEXT,
    
    -- Политика отмены
    cancellation_deadline INTERVAL DEFAULT '24 hours',
    refund_percent DECIMAL(5,2) DEFAULT 100,
    
    -- Дополнительно
    special_notes TEXT,
    equipment_provided TEXT[],
    equipment_required TEXT[],
    included_services TEXT[],
    excluded_services TEXT[],
    
    -- Метки времени
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Индексы
    CONSTRAINT fk_tour_schedule_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    CONSTRAINT fk_tour_schedule_operator FOREIGN KEY (operator_id) REFERENCES partners(id),
    CONSTRAINT fk_tour_schedule_guide FOREIGN KEY (guide_id) REFERENCES partners(id),
    CONSTRAINT chk_participants CHECK (min_participants <= max_participants),
    CONSTRAINT chk_slots CHECK (available_slots <= max_participants),
    CONSTRAINT chk_dates CHECK (start_date <= end_date OR end_date IS NULL)
);

-- Индексы для tour_schedules
CREATE INDEX idx_tour_schedules_tour ON tour_schedules(tour_id);
CREATE INDEX idx_tour_schedules_operator ON tour_schedules(operator_id);
CREATE INDEX idx_tour_schedules_guide ON tour_schedules(guide_id);
CREATE INDEX idx_tour_schedules_dates ON tour_schedules(start_date, end_date);
CREATE INDEX idx_tour_schedules_status ON tour_schedules(status);
CREATE INDEX idx_tour_schedules_available ON tour_schedules(available_slots) WHERE available_slots > 0;
CREATE INDEX idx_tour_schedules_weather ON tour_schedules(weather_status) WHERE weather_dependent = true;

-- Комментарии
COMMENT ON TABLE tour_schedules IS 'Расписание туров с защитой от race conditions';
COMMENT ON COLUMN tour_schedules.available_slots IS 'КРИТИЧНО: Изменяется только через транзакции с блокировками';
COMMENT ON COLUMN tour_schedules.weather_dependent IS 'Если true, автоматически проверяется погода';

-- =====================================================
-- 2. TOUR SEAT HOLDS - Временные блокировки мест
-- =====================================================
-- Аналог seat_holds для трансферов

CREATE TABLE IF NOT EXISTS tour_seat_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Связи
    schedule_id UUID NOT NULL REFERENCES tour_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Блокировка
    slots_count INTEGER NOT NULL CHECK (slots_count > 0),
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Статус
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
        'active',      -- активна
        'converted',   -- превращена в бронирование
        'expired',     -- истекла
        'released'     -- освобождена вручную
    )),
    
    -- Для отслеживания
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для tour_seat_holds
CREATE INDEX idx_tour_seat_holds_schedule ON tour_seat_holds(schedule_id);
CREATE INDEX idx_tour_seat_holds_user ON tour_seat_holds(user_id);
CREATE INDEX idx_tour_seat_holds_expires ON tour_seat_holds(expires_at) WHERE status = 'active';
CREATE INDEX idx_tour_seat_holds_status ON tour_seat_holds(status);

COMMENT ON TABLE tour_seat_holds IS 'Временные блокировки мест (15 мин по умолчанию)';

-- =====================================================
-- 3. TOUR BOOKINGS V2 - Улучшенные бронирования
-- =====================================================

CREATE TABLE IF NOT EXISTS tour_bookings_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Связи
    user_id UUID NOT NULL REFERENCES users(id),
    operator_id UUID NOT NULL REFERENCES partners(id),
    tour_id UUID NOT NULL REFERENCES tours(id),
    schedule_id UUID NOT NULL REFERENCES tour_schedules(id) ON DELETE RESTRICT,
    
    -- Информация о бронировании
    booking_number VARCHAR(20) UNIQUE NOT NULL, -- человеко-читаемый номер
    confirmation_code VARCHAR(20) UNIQUE NOT NULL, -- для QR кода
    
    -- Даты
    booking_date DATE NOT NULL,
    tour_start_date DATE NOT NULL,
    tour_end_date DATE,
    
    -- Участники
    participants_count INTEGER NOT NULL CHECK (participants_count > 0),
    adults_count INTEGER DEFAULT 0,
    children_count INTEGER DEFAULT 0,
    
    -- Цены
    base_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Статусы
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending',      -- ожидает подтверждения
        'confirmed',    -- подтвержден
        'paid',         -- оплачен
        'in_progress',  -- тур идет
        'completed',    -- завершен
        'cancelled',    -- отменен
        'refunded'      -- возврат средств
    )),
    
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
        'pending',      -- ожидает оплаты
        'processing',   -- обрабатывается
        'paid',         -- оплачен
        'partially_paid', -- частично оплачен
        'failed',       -- ошибка
        'refunded',     -- возврат
        'cancelled'     -- отменен
    )),
    
    -- Контактная информация
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    
    -- Дополнительная информация
    special_requests TEXT,
    dietary_requirements TEXT[],
    medical_conditions TEXT[],
    emergency_contact JSONB, -- {name, phone, relation}
    
    -- Отмена
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2),
    refund_processed_at TIMESTAMPTZ,
    
    -- Чекин
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES users(id),
    
    -- Метаданные
    source VARCHAR(50), -- web, mobile, agent, phone
    booking_metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_tour_booking_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_tour_booking_operator FOREIGN KEY (operator_id) REFERENCES partners(id),
    CONSTRAINT fk_tour_booking_tour FOREIGN KEY (tour_id) REFERENCES tours(id),
    CONSTRAINT fk_tour_booking_schedule FOREIGN KEY (schedule_id) REFERENCES tour_schedules(id),
    CONSTRAINT chk_participants_split CHECK (adults_count + children_count = participants_count)
);

-- Индексы для tour_bookings_v2
CREATE INDEX idx_tour_bookings_v2_user ON tour_bookings_v2(user_id);
CREATE INDEX idx_tour_bookings_v2_operator ON tour_bookings_v2(operator_id);
CREATE INDEX idx_tour_bookings_v2_tour ON tour_bookings_v2(tour_id);
CREATE INDEX idx_tour_bookings_v2_schedule ON tour_bookings_v2(schedule_id);
CREATE INDEX idx_tour_bookings_v2_status ON tour_bookings_v2(status);
CREATE INDEX idx_tour_bookings_v2_payment ON tour_bookings_v2(payment_status);
CREATE INDEX idx_tour_bookings_v2_date ON tour_bookings_v2(tour_start_date);
CREATE INDEX idx_tour_bookings_v2_confirmation ON tour_bookings_v2(confirmation_code);
CREATE INDEX idx_tour_bookings_v2_number ON tour_bookings_v2(booking_number);

COMMENT ON TABLE tour_bookings_v2 IS 'Улучшенная система бронирований с полным функционалом';

-- =====================================================
-- 4. TOUR PARTICIPANTS - Участники туров
-- =====================================================

CREATE TABLE IF NOT EXISTS tour_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    booking_id UUID NOT NULL REFERENCES tour_bookings_v2(id) ON DELETE CASCADE,
    
    -- Личные данные
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Документы
    passport_number VARCHAR(50),
    passport_country VARCHAR(3),
    
    -- Контакты
    phone VARCHAR(50),
    email VARCHAR(255),
    
    -- Медицинская информация
    blood_type VARCHAR(10),
    allergies TEXT[],
    medical_conditions TEXT[],
    emergency_medication TEXT,
    
    -- Экипировка
    shoe_size VARCHAR(10),
    clothing_size VARCHAR(10),
    equipment_rental JSONB, -- что арендует
    
    -- Чекин
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    qr_code VARCHAR(255) UNIQUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_participant_booking FOREIGN KEY (booking_id) REFERENCES tour_bookings_v2(id) ON DELETE CASCADE
);

CREATE INDEX idx_tour_participants_booking ON tour_participants(booking_id);
CREATE INDEX idx_tour_participants_qr ON tour_participants(qr_code);
CREATE INDEX idx_tour_participants_checkin ON tour_participants(checked_in);

-- =====================================================
-- 5. TOUR CHECKINS - История чекинов
-- =====================================================

CREATE TABLE IF NOT EXISTS tour_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    booking_id UUID NOT NULL REFERENCES tour_bookings_v2(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES tour_participants(id) ON DELETE SET NULL,
    schedule_id UUID NOT NULL REFERENCES tour_schedules(id),
    
    -- Чекин
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    checked_in_by UUID REFERENCES users(id), -- кто провел чекин (гид/оператор)
    
    -- Метод
    checkin_method VARCHAR(20) CHECK (checkin_method IN (
        'qr_code', 'manual', 'confirmation_code', 'nfc', 'face_recognition'
    )),
    
    -- Валидация
    qr_code VARCHAR(255),
    validation_result JSONB,
    
    -- Локация
    checkin_location JSONB, -- {lat, lng}
    ip_address INET,
    device_info JSONB,
    
    notes TEXT,
    
    CONSTRAINT fk_checkin_booking FOREIGN KEY (booking_id) REFERENCES tour_bookings_v2(id) ON DELETE CASCADE,
    CONSTRAINT fk_checkin_schedule FOREIGN KEY (schedule_id) REFERENCES tour_schedules(id)
);

CREATE INDEX idx_tour_checkins_booking ON tour_checkins(booking_id);
CREATE INDEX idx_tour_checkins_participant ON tour_checkins(participant_id);
CREATE INDEX idx_tour_checkins_schedule ON tour_checkins(schedule_id);
CREATE INDEX idx_tour_checkins_time ON tour_checkins(checked_in_at);

-- =====================================================
-- 6. TOUR WAITLIST - Листы ожидания
-- =====================================================

CREATE TABLE IF NOT EXISTS tour_waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES tour_schedules(id) ON DELETE CASCADE,
    
    participants_count INTEGER NOT NULL CHECK (participants_count > 0),
    
    -- Статус
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN (
        'waiting',    -- ожидает
        'notified',   -- уведомлен о доступности
        'converted',  -- превратился в бронирование
        'expired',    -- истек срок
        'cancelled'   -- отменен
    )),
    
    -- Уведомления
    notified_at TIMESTAMPTZ,
    notification_expires_at TIMESTAMPTZ, -- до какого времени действует уведомление
    
    -- Приоритет (FIFO по умолчанию)
    priority INTEGER DEFAULT 0,
    
    -- Контакты
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_waitlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_waitlist_schedule FOREIGN KEY (schedule_id) REFERENCES tour_schedules(id) ON DELETE CASCADE,
    CONSTRAINT unique_waitlist_entry UNIQUE (user_id, schedule_id, status)
);

CREATE INDEX idx_tour_waitlist_user ON tour_waitlist(user_id);
CREATE INDEX idx_tour_waitlist_schedule ON tour_waitlist(schedule_id);
CREATE INDEX idx_tour_waitlist_status ON tour_waitlist(status);
CREATE INDEX idx_tour_waitlist_priority ON tour_waitlist(priority DESC, created_at ASC) WHERE status = 'waiting';

-- =====================================================
-- 7. TOUR CANCELLATIONS - История отмен
-- =====================================================

CREATE TABLE IF NOT EXISTS tour_cancellations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    booking_id UUID NOT NULL REFERENCES tour_bookings_v2(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES tour_schedules(id),
    
    -- Кто отменил
    cancelled_by UUID REFERENCES users(id),
    cancelled_by_role VARCHAR(50), -- user, operator, system, admin
    
    -- Причина
    cancellation_type VARCHAR(50) CHECK (cancellation_type IN (
        'user_request',
        'weather',
        'insufficient_participants',
        'operator_decision',
        'force_majeure',
        'safety_concerns',
        'payment_failed',
        'other'
    )),
    reason TEXT NOT NULL,
    
    -- Возврат средств
    refund_amount DECIMAL(10,2),
    refund_percent DECIMAL(5,2),
    refund_method VARCHAR(50),
    refund_status VARCHAR(20) DEFAULT 'pending',
    refund_processed_at TIMESTAMPTZ,
    
    -- Статистика
    cancellation_time_hours DECIMAL(10,2), -- за сколько часов до тура
    
    cancelled_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_cancellation_booking FOREIGN KEY (booking_id) REFERENCES tour_bookings_v2(id) ON DELETE CASCADE
);

CREATE INDEX idx_tour_cancellations_booking ON tour_cancellations(booking_id);
CREATE INDEX idx_tour_cancellations_schedule ON tour_cancellations(schedule_id);
CREATE INDEX idx_tour_cancellations_type ON tour_cancellations(cancellation_type);
CREATE INDEX idx_tour_cancellations_time ON tour_cancellations(cancelled_at);

-- =====================================================
-- 8. TOUR WEATHER ALERTS - Погодные предупреждения
-- =====================================================

CREATE TABLE IF NOT EXISTS tour_weather_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    schedule_id UUID NOT NULL REFERENCES tour_schedules(id) ON DELETE CASCADE,
    
    -- Погода
    weather_data JSONB NOT NULL, -- полные данные погоды
    alert_level VARCHAR(20) CHECK (alert_level IN (
        'info', 'warning', 'danger', 'critical'
    )),
    
    -- Описание
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    recommendations TEXT,
    
    -- Действия
    action_required VARCHAR(50) CHECK (action_required IN (
        'none', 'inform', 'reschedule', 'cancel'
    )),
    
    -- Уведомления
    participants_notified BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_weather_alert_schedule FOREIGN KEY (schedule_id) REFERENCES tour_schedules(id) ON DELETE CASCADE
);

CREATE INDEX idx_tour_weather_alerts_schedule ON tour_weather_alerts(schedule_id);
CREATE INDEX idx_tour_weather_alerts_level ON tour_weather_alerts(alert_level);
CREATE INDEX idx_tour_weather_alerts_time ON tour_weather_alerts(created_at);

-- =====================================================
-- ТРИГГЕРЫ И ФУНКЦИИ
-- =====================================================

-- Триггер: Автоматическое обновление updated_at
CREATE OR REPLACE FUNCTION update_tour_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tour_schedules_updated_at
    BEFORE UPDATE ON tour_schedules
    FOR EACH ROW EXECUTE FUNCTION update_tour_updated_at();

CREATE TRIGGER trg_tour_bookings_v2_updated_at
    BEFORE UPDATE ON tour_bookings_v2
    FOR EACH ROW EXECUTE FUNCTION update_tour_updated_at();

CREATE TRIGGER trg_tour_participants_updated_at
    BEFORE UPDATE ON tour_participants
    FOR EACH ROW EXECUTE FUNCTION update_tour_updated_at();

CREATE TRIGGER trg_tour_waitlist_updated_at
    BEFORE UPDATE ON tour_waitlist
    FOR EACH ROW EXECUTE FUNCTION update_tour_updated_at();

-- Функция: Проверка доступности мест с учетом блокировок
CREATE OR REPLACE FUNCTION check_tour_availability(
    p_schedule_id UUID,
    p_requested_slots INTEGER
)
RETURNS TABLE (
    available BOOLEAN,
    slots_left INTEGER,
    active_holds INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (s.available_slots - COALESCE(SUM(h.slots_count), 0)) >= p_requested_slots AS available,
        (s.available_slots - COALESCE(SUM(h.slots_count), 0))::INTEGER AS slots_left,
        COUNT(h.id)::INTEGER AS active_holds
    FROM tour_schedules s
    LEFT JOIN tour_seat_holds h ON s.id = h.schedule_id 
        AND h.status = 'active' 
        AND h.expires_at > NOW()
    WHERE s.id = p_schedule_id
    GROUP BY s.id, s.available_slots;
END;
$$ LANGUAGE plpgsql;

-- Функция: Автоматическая очистка истекших блокировок
CREATE OR REPLACE FUNCTION cleanup_expired_tour_holds()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH expired AS (
        UPDATE tour_seat_holds
        SET status = 'expired'
        WHERE status = 'active' 
            AND expires_at < NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM expired;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Функция: Генерация уникального номера бронирования
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_number VARCHAR(20);
    exists BOOLEAN;
BEGIN
    LOOP
        -- Формат: TKH-YYYYMMDD-XXXX (TKH = Tour Kamchatka Hub)
        new_number := 'TKH-' || 
                     TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        SELECT EXISTS(
            SELECT 1 FROM tour_bookings_v2 WHERE booking_number = new_number
        ) INTO exists;
        
        EXIT WHEN NOT exists;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Функция: Генерация кода подтверждения
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(20) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ПРЕДСТАВЛЕНИЯ (VIEWS)
-- =====================================================

-- View: Полная информация о расписании
CREATE OR REPLACE VIEW tour_schedule_details AS
SELECT 
    s.*,
    t.name as tour_title,
    t.description as tour_description,
    t.difficulty as tour_difficulty,
    o.name as operator_name,
    o.rating as operator_rating,
    g.name as guide_name,
    g.rating as guide_rating,
    (s.max_participants - s.available_slots) as booked_slots,
    ROUND((s.max_participants - s.available_slots)::NUMERIC / s.max_participants * 100, 2) as occupancy_percent,
    COUNT(DISTINCT b.id) as bookings_count,
    SUM(b.participants_count) as total_participants
FROM tour_schedules s
JOIN tours t ON s.tour_id = t.id
JOIN partners o ON s.operator_id = o.id
LEFT JOIN partners g ON s.guide_id = g.id
LEFT JOIN tour_bookings_v2 b ON s.id = b.schedule_id AND b.status NOT IN ('cancelled', 'refunded')
GROUP BY s.id, t.id, o.id, g.id;

COMMENT ON VIEW tour_schedule_details IS 'Полная информация о расписании туров со статистикой';

-- =====================================================
-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- =====================================================

-- Композитные индексы для частых запросов
CREATE INDEX idx_tour_schedules_date_status 
    ON tour_schedules(start_date, status) 
    WHERE status IN ('scheduled', 'confirmed');

CREATE INDEX idx_tour_bookings_user_date 
    ON tour_bookings_v2(user_id, tour_start_date DESC);

CREATE INDEX idx_tour_bookings_operator_status 
    ON tour_bookings_v2(operator_id, status) 
    WHERE status NOT IN ('cancelled', 'refunded');

-- Финал
SELECT 'Tour System Schema v2.0 installed successfully!' as status;
