-- Схема базы данных для Kamchatour Hub
-- PostgreSQL с расширениями для геоданных и JSON

-- Включаем необходимые расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- RBAC базовые таблицы
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    UNIQUE(action, resource)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS role_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    organization_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('tourist', 'operator', 'guide', 'provider')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица партнеров
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('operator', 'guide', 'transfer', 'stay', 'souvenir', 'gear', 'cars', 'restaurant')),
    description TEXT,
    contact JSONB NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    logo_asset_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица активностей (старая таблица, оставляем для совместимости)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    icon_bytes BYTEA,
    icon_mime TEXT,
    icon_sha256 TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица туров
CREATE TABLE IF NOT EXISTS tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    duration INTEGER NOT NULL, -- в часах
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    season JSONB DEFAULT '[]', -- массив сезонов
    coordinates JSONB DEFAULT '[]', -- массив точек маршрута
    requirements JSONB DEFAULT '[]', -- массив требований
    included JSONB DEFAULT '[]', -- что включено
    not_included JSONB DEFAULT '[]', -- что не включено
    operator_id UUID REFERENCES partners(id),
    guide_id UUID REFERENCES partners(id),
    max_group_size INTEGER DEFAULT 20,
    min_group_size INTEGER DEFAULT 1,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица активов (изображения, файлы)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    sha256 VARCHAR(64) UNIQUE NOT NULL,
    size BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    alt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица связей туров и активов
CREATE TABLE IF NOT EXISTS tour_assets (
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    PRIMARY KEY (tour_id, asset_id)
);

-- Таблица связей партнеров и активов
CREATE TABLE IF NOT EXISTS partner_assets (
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    PRIMARY KEY (partner_id, asset_id)
);

-- Таблица бронирований
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    tour_id UUID REFERENCES tours(id),
    date DATE NOT NULL,
    participants INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Слоты туров
CREATE TABLE IF NOT EXISTS tour_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity >= 0),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','closed','sold_out')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_slots_tour ON tour_slots(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_slots_time ON tour_slots(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_tour_slots_status ON tour_slots(status);

-- Удержания инвентаря
CREATE TABLE IF NOT EXISTS inventory_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID REFERENCES tour_slots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','released','expired')),
    idempotency_key VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(slot_id, user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_inventory_holds_slot ON inventory_holds(slot_id);
CREATE INDEX IF NOT EXISTS idx_inventory_holds_expires ON inventory_holds(expires_at);

-- Платежные намерения (для туров)
CREATE TABLE IF NOT EXISTS payment_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'cloudpayments',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
    status VARCHAR(30) NOT NULL DEFAULT 'created' CHECK (status IN ('created','authorized','captured','canceled','failed','refunded','partially_refunded')),
    idempotency_key VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_booking ON payment_intents(booking_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_intents_idem ON payment_intents(idempotency_key);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    tour_id UUID REFERENCES tours(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица изображений отзывов
CREATE TABLE IF NOT EXISTS review_assets (
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    PRIMARY KEY (review_id, asset_id)
);

-- Таблица Eco-points
CREATE TABLE IF NOT EXISTS eco_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    coordinates JSONB NOT NULL, -- {lat: number, lng: number, address?: string, name?: string}
    category VARCHAR(50) NOT NULL CHECK (category IN ('recycling', 'cleaning', 'conservation', 'education')),
    points INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица пользовательских Eco-points
CREATE TABLE IF NOT EXISTS user_eco_points (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица достижений
CREATE TABLE IF NOT EXISTS eco_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица пользовательских достижений
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id UUID REFERENCES users(id),
    achievement_id UUID REFERENCES eco_achievements(id),
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- Таблица активностей пользователей
CREATE TABLE IF NOT EXISTS user_eco_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    points INTEGER NOT NULL,
    activity VARCHAR(255) NOT NULL,
    eco_point_id UUID REFERENCES eco_points(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица чат-сессий
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица сообщений чата
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Таблица сессий пользователей
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица аудита
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_partners_category ON partners(category);
CREATE INDEX IF NOT EXISTS idx_partners_verified ON partners(is_verified);
CREATE INDEX IF NOT EXISTS idx_tours_operator ON tours(operator_id);
CREATE INDEX IF NOT EXISTS idx_tours_guide ON tours(guide_id);
CREATE INDEX IF NOT EXISTS idx_tours_difficulty ON tours(difficulty);
CREATE INDEX IF NOT EXISTS idx_tours_price ON tours(price);
CREATE INDEX IF NOT EXISTS idx_tours_active ON tours(is_active);
CREATE INDEX IF NOT EXISTS idx_tours_created_at ON tours(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_tour ON reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_eco_points_category ON eco_points(category);
CREATE INDEX IF NOT EXISTS idx_eco_points_active ON eco_points(is_active);
CREATE INDEX IF NOT EXISTS idx_eco_points_coordinates ON eco_points USING GIST (ST_GeogFromText('POINT(' || (coordinates->>'lng')::text || ' ' || (coordinates->>'lat')::text || ')'));
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Создаем триггеры для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_slots_updated_at BEFORE UPDATE ON tour_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_intents_updated_at BEFORE UPDATE ON payment_intents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Создаем функцию для обновления рейтинга тура
CREATE OR REPLACE FUNCTION update_tour_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tours SET
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE tour_id = COALESCE(NEW.tour_id, OLD.tour_id)
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE tour_id = COALESCE(NEW.tour_id, OLD.tour_id)
        )
    WHERE id = COALESCE(NEW.tour_id, OLD.tour_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tour_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_tour_rating();

-- Создаем функцию для обновления рейтинга партнера
CREATE OR REPLACE FUNCTION update_partner_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE partners SET
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews r
            JOIN tours t ON r.tour_id = t.id
            WHERE t.operator_id = COALESCE(NEW.operator_id, OLD.operator_id)
               OR t.guide_id = COALESCE(NEW.guide_id, OLD.guide_id)
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews r
            JOIN tours t ON r.tour_id = t.id
            WHERE t.operator_id = COALESCE(NEW.operator_id, OLD.operator_id)
               OR t.guide_id = COALESCE(NEW.guide_id, OLD.guide_id)
        )
    WHERE id = COALESCE(NEW.operator_id, OLD.operator_id)
       OR id = COALESCE(NEW.guide_id, OLD.guide_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_partner_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_partner_rating();

-- Вставляем начальные данные
INSERT INTO eco_achievements (name, description, points) VALUES
('Первый шаг', 'Заработайте первые 10 очков', 10),
('Экологический активист', 'Заработайте 50 очков', 50),
('Защитник природы', 'Заработайте 200 очков', 200),
('Эко-гуру', 'Заработайте 500 очков', 500),
('Мастер экологии', 'Заработайте 1000 очков', 1000)
ON CONFLICT DO NOTHING;

-- Создаем представления для удобства
CREATE OR REPLACE VIEW tour_details AS
SELECT 
    t.*,
    o.name as operator_name,
    o.category as operator_category,
    o.rating as operator_rating,
    g.name as guide_name,
    g.rating as guide_rating,
    array_agg(DISTINCT a.url) as images
FROM tours t
LEFT JOIN partners o ON t.operator_id = o.id
LEFT JOIN partners g ON t.guide_id = g.id
LEFT JOIN tour_assets ta ON t.id = ta.tour_id
LEFT JOIN assets a ON ta.asset_id = a.id
GROUP BY t.id, o.id, g.id;

CREATE OR REPLACE VIEW partner_details AS
SELECT 
    p.*,
    l.url as logo_url,
    array_agg(DISTINCT a.url) as images
FROM partners p
LEFT JOIN assets l ON p.logo_asset_id = l.id
LEFT JOIN partner_assets pa ON p.id = pa.partner_id
LEFT JOIN assets a ON pa.asset_id = a.id
GROUP BY p.id, l.url;