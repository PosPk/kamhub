-- Схема базы данных для Kamchatour Hub
-- PostgreSQL с расширениями для геоданных и JSON

-- Включаем необходимые расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- ТАБЛИЦА: users - Пользователи системы
-- ============================================
-- Хранит основную информацию о всех пользователях платформы
-- Поддерживает 4 типа ролей: турист, оператор, гид, поставщик
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),              -- Уникальный идентификатор пользователя
    email VARCHAR(255) UNIQUE NOT NULL,                          -- Email для входа (уникальный)
    name VARCHAR(255) NOT NULL,                                  -- Полное имя пользователя
    role VARCHAR(50) NOT NULL CHECK (role IN ('tourist', 'operator', 'guide', 'provider')), -- Роль в системе
    preferences JSONB DEFAULT '{}',                              -- Пользовательские настройки и предпочтения
    created_at TIMESTAMPTZ DEFAULT NOW(),                        -- Дата регистрации
    updated_at TIMESTAMPTZ DEFAULT NOW()                         -- Дата последнего обновления профиля
);

COMMENT ON TABLE users IS 'Пользователи системы Kamchatour Hub';
COMMENT ON COLUMN users.id IS 'Уникальный идентификатор пользователя (UUID)';
COMMENT ON COLUMN users.email IS 'Email адрес для входа в систему (уникальный)';
COMMENT ON COLUMN users.name IS 'Полное имя пользователя';
COMMENT ON COLUMN users.role IS 'Роль пользователя: tourist (турист), operator (туроператор), guide (гид), provider (поставщик услуг)';
COMMENT ON COLUMN users.preferences IS 'JSON с пользовательскими настройками (язык, валюта, уведомления и т.д.)';
COMMENT ON COLUMN users.created_at IS 'Дата и время регистрации пользователя';
COMMENT ON COLUMN users.updated_at IS 'Дата и время последнего обновления профиля';

-- ============================================
-- ТАБЛИЦА: partners - Партнеры и поставщики услуг
-- ============================================
-- Хранит информацию о всех партнерах платформы
-- Включает туроператоров, гидов, отели, рестораны и др.
-- Поддерживает систему рейтингов и верификацию
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),              -- Уникальный идентификатор партнера
    name VARCHAR(255) NOT NULL,                                  -- Название компании/имя партнера
    category VARCHAR(50) NOT NULL CHECK (category IN ('operator', 'guide', 'transfer', 'stay', 'souvenir', 'gear', 'cars', 'restaurant')), -- Категория услуг
    description TEXT,                                            -- Подробное описание партнера
    contact JSONB NOT NULL,                                      -- Контактная информация (телефон, email, сайт, telegram)
    rating DECIMAL(3,2) DEFAULT 0.0,                            -- Средний рейтинг партнера (0.00-5.00)
    review_count INTEGER DEFAULT 0,                              -- Количество отзывов
    is_verified BOOLEAN DEFAULT FALSE,                           -- Флаг верификации партнера администрацией
    logo_asset_id UUID,                                          -- Ссылка на логотип партнера
    created_at TIMESTAMPTZ DEFAULT NOW(),                        -- Дата добавления в систему
    updated_at TIMESTAMPTZ DEFAULT NOW()                         -- Дата последнего обновления
);

COMMENT ON TABLE partners IS 'Партнеры и поставщики услуг на платформе Kamchatour Hub';
COMMENT ON COLUMN partners.id IS 'Уникальный идентификатор партнера (UUID)';
COMMENT ON COLUMN partners.name IS 'Название компании или имя партнера';
COMMENT ON COLUMN partners.category IS 'Категория: operator (туроператор), guide (гид), transfer (трансфер), stay (размещение), souvenir (сувениры), gear (снаряжение), cars (прокат авто), restaurant (ресторан)';
COMMENT ON COLUMN partners.description IS 'Подробное описание партнера и его услуг';
COMMENT ON COLUMN partners.contact IS 'JSON с контактами: {phone, email, website, telegram, whatsapp}';
COMMENT ON COLUMN partners.rating IS 'Средний рейтинг на основе отзывов (от 0.00 до 5.00)';
COMMENT ON COLUMN partners.review_count IS 'Общее количество отзывов о партнере';
COMMENT ON COLUMN partners.is_verified IS 'Верифицирован ли партнер администрацией (проверенный партнер)';
COMMENT ON COLUMN partners.logo_asset_id IS 'ID логотипа партнера из таблицы assets';
COMMENT ON COLUMN partners.created_at IS 'Дата добавления партнера в систему';
COMMENT ON COLUMN partners.updated_at IS 'Дата последнего обновления информации о партнере';

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

-- ============================================
-- ТАБЛИЦА: tours - Туры и экскурсии
-- ============================================
-- Основная таблица с турами по Камчатке
-- Включает маршруты, цены, сложность, требования
-- Связана с партнерами (операторы и гиды)
-- ============================================
CREATE TABLE IF NOT EXISTS tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),              -- Уникальный идентификатор тура
    name VARCHAR(255) NOT NULL,                                  -- Название тура
    description TEXT NOT NULL,                                   -- Полное описание тура
    short_description TEXT,                                      -- Краткое описание для списков
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')), -- Уровень сложности
    duration INTEGER NOT NULL,                                   -- Продолжительность тура в часах
    price DECIMAL(10,2) NOT NULL,                               -- Базовая цена за человека
    currency VARCHAR(3) DEFAULT 'RUB',                          -- Валюта (RUB, USD, EUR)
    season JSONB DEFAULT '[]',                                  -- Сезоны проведения: ['summer', 'winter', ...]
    coordinates JSONB DEFAULT '[]',                             -- Координаты точек маршрута [{lat, lng, name}]
    requirements JSONB DEFAULT '[]',                            -- Требования к участникам ['физ. подготовка', ...]
    included JSONB DEFAULT '[]',                                -- Что включено в стоимость ['трансфер', 'питание']
    not_included JSONB DEFAULT '[]',                            -- Что НЕ включено ['личное снаряжение']
    operator_id UUID REFERENCES partners(id),                   -- ID туроператора
    guide_id UUID REFERENCES partners(id),                      -- ID гида
    max_group_size INTEGER DEFAULT 20,                          -- Максимальный размер группы
    min_group_size INTEGER DEFAULT 1,                           -- Минимальный размер группы
    rating DECIMAL(3,2) DEFAULT 0.0,                           -- Средний рейтинг тура
    review_count INTEGER DEFAULT 0,                             -- Количество отзывов
    is_active BOOLEAN DEFAULT TRUE,                             -- Активен ли тур (опубликован)
    created_at TIMESTAMPTZ DEFAULT NOW(),                       -- Дата создания тура
    updated_at TIMESTAMPTZ DEFAULT NOW()                        -- Дата последнего обновления
);

COMMENT ON TABLE tours IS 'Туры и экскурсии по Камчатке';
COMMENT ON COLUMN tours.id IS 'Уникальный идентификатор тура (UUID)';
COMMENT ON COLUMN tours.name IS 'Название тура (например: "Восхождение на Авачинский вулкан")';
COMMENT ON COLUMN tours.description IS 'Полное описание тура с деталями программы';
COMMENT ON COLUMN tours.short_description IS 'Краткое описание для карточек и списков';
COMMENT ON COLUMN tours.difficulty IS 'Уровень сложности: easy (легкий), medium (средний), hard (сложный)';
COMMENT ON COLUMN tours.duration IS 'Продолжительность тура в часах';
COMMENT ON COLUMN tours.price IS 'Базовая цена за одного человека';
COMMENT ON COLUMN tours.currency IS 'Валюта цены (RUB - рубли, USD - доллары, EUR - евро)';
COMMENT ON COLUMN tours.season IS 'JSON массив сезонов проведения тура';
COMMENT ON COLUMN tours.coordinates IS 'JSON массив координат ключевых точек маршрута';
COMMENT ON COLUMN tours.requirements IS 'JSON массив требований к участникам';
COMMENT ON COLUMN tours.included IS 'JSON массив услуг, включенных в стоимость';
COMMENT ON COLUMN tours.not_included IS 'JSON массив услуг, НЕ включенных в стоимость';
COMMENT ON COLUMN tours.operator_id IS 'ID туроператора из таблицы partners';
COMMENT ON COLUMN tours.guide_id IS 'ID гида из таблицы partners';
COMMENT ON COLUMN tours.max_group_size IS 'Максимальное количество участников';
COMMENT ON COLUMN tours.min_group_size IS 'Минимальное количество участников для проведения';
COMMENT ON COLUMN tours.rating IS 'Средний рейтинг тура (автоматически обновляется из отзывов)';
COMMENT ON COLUMN tours.review_count IS 'Количество отзывов о туре (автоматически)';
COMMENT ON COLUMN tours.is_active IS 'Активность тура (true - опубликован, false - снят с публикации)';
COMMENT ON COLUMN tours.created_at IS 'Дата создания тура';
COMMENT ON COLUMN tours.updated_at IS 'Дата последнего обновления информации о туре';

-- ============================================
-- ТАБЛИЦА: assets - Медиафайлы и изображения
-- ============================================
-- Хранит все медиафайлы: фото туров, логотипы, изображения
-- Использует SHA256 для дедупликации файлов
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),              -- Уникальный идентификатор файла
    url TEXT NOT NULL,                                           -- URL файла (локальный или внешний)
    mime_type VARCHAR(100) NOT NULL,                             -- MIME тип (image/jpeg, image/png, etc.)
    sha256 VARCHAR(64) UNIQUE NOT NULL,                          -- SHA256 хеш для проверки дубликатов
    size BIGINT NOT NULL,                                        -- Размер файла в байтах
    width INTEGER,                                               -- Ширина изображения в пикселях
    height INTEGER,                                              -- Высота изображения в пикселях
    alt TEXT,                                                    -- Альтернативный текст для доступности
    created_at TIMESTAMPTZ DEFAULT NOW()                         -- Дата загрузки файла
);

COMMENT ON TABLE assets IS 'Медиафайлы и изображения системы';
COMMENT ON COLUMN assets.id IS 'Уникальный идентификатор файла (UUID)';
COMMENT ON COLUMN assets.url IS 'URL файла (может быть относительным или абсолютным)';
COMMENT ON COLUMN assets.mime_type IS 'MIME тип файла (например: image/jpeg, image/png)';
COMMENT ON COLUMN assets.sha256 IS 'SHA256 хеш файла для предотвращения дубликатов';
COMMENT ON COLUMN assets.size IS 'Размер файла в байтах';
COMMENT ON COLUMN assets.width IS 'Ширина изображения (если применимо)';
COMMENT ON COLUMN assets.height IS 'Высота изображения (если применимо)';
COMMENT ON COLUMN assets.alt IS 'Альтернативный текст для изображения (для SEO и доступности)';
COMMENT ON COLUMN assets.created_at IS 'Дата и время загрузки файла';

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

-- ============================================
-- ТАБЛИЦА: bookings - Бронирования туров
-- ============================================
-- Хранит информацию о бронированиях туров пользователями
-- Отслеживает статусы бронирования и оплаты
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),              -- Уникальный идентификатор бронирования
    user_id UUID REFERENCES users(id),                           -- ID пользователя, сделавшего бронирование
    tour_id UUID REFERENCES tours(id),                           -- ID забронированного тура
    date DATE NOT NULL,                                          -- Дата проведения тура
    participants INTEGER NOT NULL,                               -- Количество участников
    total_price DECIMAL(10,2) NOT NULL,                         -- Общая стоимость бронирования
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')), -- Статус бронирования
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')), -- Статус оплаты
    special_requests TEXT,                                       -- Особые пожелания туриста
    created_at TIMESTAMPTZ DEFAULT NOW(),                        -- Дата создания бронирования
    updated_at TIMESTAMPTZ DEFAULT NOW()                         -- Дата последнего обновления
);

COMMENT ON TABLE bookings IS 'Бронирования туров пользователями';
COMMENT ON COLUMN bookings.id IS 'Уникальный идентификатор бронирования (UUID)';
COMMENT ON COLUMN bookings.user_id IS 'ID пользователя из таблицы users';
COMMENT ON COLUMN bookings.tour_id IS 'ID тура из таблицы tours';
COMMENT ON COLUMN bookings.date IS 'Дата проведения тура';
COMMENT ON COLUMN bookings.participants IS 'Количество участников в группе';
COMMENT ON COLUMN bookings.total_price IS 'Общая стоимость бронирования (цена × участников)';
COMMENT ON COLUMN bookings.status IS 'Статус: pending (ожидает), confirmed (подтверждено), cancelled (отменено), completed (завершено)';
COMMENT ON COLUMN bookings.payment_status IS 'Статус оплаты: pending (ожидает), paid (оплачено), refunded (возврат)';
COMMENT ON COLUMN bookings.special_requests IS 'Особые пожелания или требования туриста';
COMMENT ON COLUMN bookings.created_at IS 'Дата и время создания бронирования';
COMMENT ON COLUMN bookings.updated_at IS 'Дата и время последнего обновления статуса';

-- ============================================
-- ТАБЛИЦА: reviews - Отзывы о турах
-- ============================================
-- Хранит отзывы пользователей о пройденных турах
-- Автоматически обновляет рейтинги туров и партнеров
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),              -- Уникальный идентификатор отзыва
    user_id UUID REFERENCES users(id),                           -- ID пользователя, оставившего отзыв
    tour_id UUID REFERENCES tours(id),                           -- ID тура, к которому относится отзыв
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Оценка от 1 до 5 звезд
    comment TEXT,                                                -- Текст отзыва
    is_verified BOOLEAN DEFAULT FALSE,                           -- Проверен ли отзыв модератором
    created_at TIMESTAMPTZ DEFAULT NOW(),                        -- Дата создания отзыва
    updated_at TIMESTAMPTZ DEFAULT NOW()                         -- Дата последнего редактирования
);

COMMENT ON TABLE reviews IS 'Отзывы пользователей о турах';
COMMENT ON COLUMN reviews.id IS 'Уникальный идентификатор отзыва (UUID)';
COMMENT ON COLUMN reviews.user_id IS 'ID пользователя из таблицы users';
COMMENT ON COLUMN reviews.tour_id IS 'ID тура из таблицы tours';
COMMENT ON COLUMN reviews.rating IS 'Оценка тура от 1 до 5 звезд';
COMMENT ON COLUMN reviews.comment IS 'Текст отзыва (опционально)';
COMMENT ON COLUMN reviews.is_verified IS 'Проверен ли отзыв модератором (защита от спама)';
COMMENT ON COLUMN reviews.created_at IS 'Дата и время создания отзыва';
COMMENT ON COLUMN reviews.updated_at IS 'Дата и время последнего редактирования отзыва';

-- Таблица изображений отзывов
CREATE TABLE IF NOT EXISTS review_assets (
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    PRIMARY KEY (review_id, asset_id)
);

-- ============================================
-- ТАБЛИЦА: eco_points - Экологические точки
-- ============================================
-- Места для экологических активностей
-- Пункты сбора мусора, переработки, экологических акций
-- ============================================
CREATE TABLE IF NOT EXISTS eco_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),              -- Уникальный идентификатор точки
    name VARCHAR(255) NOT NULL,                                  -- Название экоточки
    description TEXT,                                            -- Описание и инструкции
    coordinates JSONB NOT NULL,                                  -- Координаты: {lat, lng, address, name}
    category VARCHAR(50) NOT NULL CHECK (category IN ('recycling', 'cleaning', 'conservation', 'education')), -- Категория активности
    points INTEGER NOT NULL,                                     -- Количество начисляемых эко-баллов
    is_active BOOLEAN DEFAULT TRUE,                              -- Активна ли точка
    created_at TIMESTAMPTZ DEFAULT NOW()                         -- Дата создания
);

COMMENT ON TABLE eco_points IS 'Экологические точки для активностей на Камчатке';
COMMENT ON COLUMN eco_points.id IS 'Уникальный идентификатор экоточки (UUID)';
COMMENT ON COLUMN eco_points.name IS 'Название экологической точки';
COMMENT ON COLUMN eco_points.description IS 'Описание активности и инструкции';
COMMENT ON COLUMN eco_points.coordinates IS 'JSON с координатами: {lat, lng, address, name}';
COMMENT ON COLUMN eco_points.category IS 'Категория: recycling (переработка), cleaning (уборка), conservation (охрана природы), education (образование)';
COMMENT ON COLUMN eco_points.points IS 'Количество эко-баллов, начисляемых за активность';
COMMENT ON COLUMN eco_points.is_active IS 'Активность точки (доступна ли для посещения)';
COMMENT ON COLUMN eco_points.created_at IS 'Дата добавления экоточки в систему';

-- ============================================
-- ТАБЛИЦА: user_eco_points - Эко-баллы пользователей
-- ============================================
-- Отслеживает эко-баллы и уровень каждого пользователя
-- Система геймификации для экологических активностей
-- ============================================
CREATE TABLE IF NOT EXISTS user_eco_points (
    user_id UUID PRIMARY KEY REFERENCES users(id),               -- ID пользователя (первичный ключ)
    total_points INTEGER DEFAULT 0,                              -- Общее количество накопленных баллов
    level INTEGER DEFAULT 1,                                     -- Текущий уровень пользователя
    last_activity TIMESTAMPTZ DEFAULT NOW()                      -- Дата последней экологической активности
);

COMMENT ON TABLE user_eco_points IS 'Эко-баллы и уровни пользователей';
COMMENT ON COLUMN user_eco_points.user_id IS 'ID пользователя из таблицы users';
COMMENT ON COLUMN user_eco_points.total_points IS 'Общее количество накопленных эко-баллов';
COMMENT ON COLUMN user_eco_points.level IS 'Текущий уровень пользователя в эко-системе';
COMMENT ON COLUMN user_eco_points.last_activity IS 'Дата и время последней экологической активности';

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

-- ============================================
-- ТАБЛИЦА: chat_sessions - Сессии AI чата
-- ============================================
-- Хранит сессии общения с AI ассистентом
-- Поддерживает контекст разговора для персонализации
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),              -- Уникальный идентификатор сессии
    user_id UUID REFERENCES users(id),                           -- ID пользователя (NULL для анонимных)
    context JSONB DEFAULT '{}',                                  -- Контекст разговора (предпочтения, история)
    created_at TIMESTAMPTZ DEFAULT NOW(),                        -- Дата начала сессии
    updated_at TIMESTAMPTZ DEFAULT NOW()                         -- Дата последнего сообщения
);

COMMENT ON TABLE chat_sessions IS 'Сессии общения с AI ассистентом';
COMMENT ON COLUMN chat_sessions.id IS 'Уникальный идентификатор чат-сессии (UUID)';
COMMENT ON COLUMN chat_sessions.user_id IS 'ID пользователя (может быть NULL для анонимных чатов)';
COMMENT ON COLUMN chat_sessions.context IS 'JSON с контекстом: предпочтения, местоположение, история запросов';
COMMENT ON COLUMN chat_sessions.created_at IS 'Дата и время начала чат-сессии';
COMMENT ON COLUMN chat_sessions.updated_at IS 'Дата и время последнего сообщения в сессии';

-- ============================================
-- ТАБЛИЦА: chat_messages - Сообщения AI чата
-- ============================================
-- Хранит все сообщения в чат-сессиях
-- Поддерживает сообщения от пользователя и AI
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),              -- Уникальный идентификатор сообщения
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE, -- ID чат-сессии
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')), -- Роль отправителя
    content TEXT NOT NULL,                                       -- Текст сообщения
    timestamp TIMESTAMPTZ DEFAULT NOW(),                         -- Время отправки
    metadata JSONB DEFAULT '{}'                                  -- Дополнительные данные (источники, токены)
);

COMMENT ON TABLE chat_messages IS 'Сообщения в AI чате';
COMMENT ON COLUMN chat_messages.id IS 'Уникальный идентификатор сообщения (UUID)';
COMMENT ON COLUMN chat_messages.session_id IS 'ID чат-сессии из таблицы chat_sessions';
COMMENT ON COLUMN chat_messages.role IS 'Роль отправителя: user (пользователь) или assistant (AI)';
COMMENT ON COLUMN chat_messages.content IS 'Текстовое содержимое сообщения';
COMMENT ON COLUMN chat_messages.timestamp IS 'Дата и время отправки сообщения';
COMMENT ON COLUMN chat_messages.metadata IS 'JSON с метаданными: источники информации, токены, модель AI';

-- Таблица сессий пользователей
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ТАБЛИЦА: audit_logs - Журнал аудита
-- ============================================
-- Логирование всех важных действий пользователей
-- Для безопасности и анализа активности
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),              -- Уникальный идентификатор записи
    user_id UUID REFERENCES users(id),                           -- ID пользователя, совершившего действие
    action VARCHAR(100) NOT NULL,                                -- Тип действия (create, update, delete, login)
    resource_type VARCHAR(50),                                   -- Тип ресурса (tour, booking, review)
    resource_id UUID,                                            -- ID затронутого ресурса
    details JSONB DEFAULT '{}',                                  -- Детали операции
    ip_address INET,                                             -- IP адрес пользователя
    user_agent TEXT,                                             -- User-Agent браузера
    created_at TIMESTAMPTZ DEFAULT NOW()                         -- Время события
);

COMMENT ON TABLE audit_logs IS 'Журнал аудита действий пользователей';
COMMENT ON COLUMN audit_logs.id IS 'Уникальный идентификатор записи аудита (UUID)';
COMMENT ON COLUMN audit_logs.user_id IS 'ID пользователя из таблицы users';
COMMENT ON COLUMN audit_logs.action IS 'Тип действия: create, update, delete, login, logout и др.';
COMMENT ON COLUMN audit_logs.resource_type IS 'Тип ресурса: tour, booking, review, partner и др.';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID затронутого ресурса (UUID)';
COMMENT ON COLUMN audit_logs.details IS 'JSON с деталями: что изменилось, причина и т.д.';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP адрес пользователя на момент действия';
COMMENT ON COLUMN audit_logs.user_agent IS 'User-Agent браузера пользователя';
COMMENT ON COLUMN audit_logs.created_at IS 'Дата и время события';

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