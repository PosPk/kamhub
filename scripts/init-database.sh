#!/bin/bash

# =============================================
# ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ KAMHUB
# =============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE} 🗄️  ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Загружаем credentials
if [ -f ".env.timeweb.local" ]; then
    source .env.timeweb.local
    echo -e "${GREEN}✅ Credentials загружены${NC}"
else
    echo -e "${RED}❌ Файл .env.timeweb.local не найден!${NC}"
    exit 1
fi

# Проверяем что пароль заполнен
if [ "$DB_PASSWORD" = "YOUR_PASSWORD" ] || [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Пароль БД не настроен!${NC}"
    echo -e "${YELLOW}   Откройте .env.timeweb.local и замените YOUR_PASSWORD${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Конфигурация БД:${NC}"
echo -e "   Host:     ${GREEN}$DB_HOST${NC}"
echo -e "   Port:     ${GREEN}$DB_PORT${NC}"
echo -e "   User:     ${GREEN}$DB_USER${NC}"
echo -e "   Database: ${GREEN}$DB_NAME${NC}"
echo ""

# Проверяем подключение
echo -e "${YELLOW}🔍 Проверка подключения...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Подключение успешно${NC}"
else
    echo -e "${RED}❌ Не удалось подключиться к БД!${NC}"
    echo -e "${YELLOW}   Проверьте credentials в .env.timeweb.local${NC}"
    exit 1
fi

# Получаем версию PostgreSQL
PG_VERSION=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT version();" | head -1)
echo -e "${BLUE}PostgreSQL версия:${NC} $PG_VERSION"
echo ""

# =============================================
# УСТАНОВКА РАСШИРЕНИЙ
# =============================================
echo -e "${YELLOW}📦 Установка расширений...${NC}"

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'SQL'
-- UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PostGIS для геолокации
CREATE EXTENSION IF NOT EXISTS postgis;

-- pg_trgm для полнотекстового поиска
CREATE EXTENSION IF NOT EXISTS pg_trgm;

SELECT 'Расширения установлены' as status;
SQL

echo -e "${GREEN}✅ Расширения установлены${NC}"
echo ""

# =============================================
# СОЗДАНИЕ СХЕМЫ
# =============================================
echo -e "${YELLOW}🏗️  Создание схемы БД...${NC}"

# Объединяем все SQL файлы в правильном порядке
cat > /tmp/kamhub_full_schema.sql << 'EOF'
-- =============================================
-- KAMHUB FULL DATABASE SCHEMA
-- =============================================

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

EOF

# Добавляем основную схему
if [ -f "lib/database/schema.sql" ]; then
    cat lib/database/schema.sql >> /tmp/kamhub_full_schema.sql
fi

# Добавляем трансферы
if [ -f "lib/database/transfer_schema.sql" ]; then
    cat lib/database/transfer_schema.sql >> /tmp/kamhub_full_schema.sql
fi

# Добавляем программу лояльности
if [ -f "lib/database/loyalty_schema.sql" ]; then
    cat lib/database/loyalty_schema.sql >> /tmp/kamhub_full_schema.sql
fi

# Добавляем блокировки мест
if [ -f "lib/database/seat_holds_schema.sql" ]; then
    cat lib/database/seat_holds_schema.sql >> /tmp/kamhub_full_schema.sql
fi

# Добавляем платежи
if [ -f "lib/database/transfer_payments_schema.sql" ]; then
    cat lib/database/transfer_payments_schema.sql >> /tmp/kamhub_full_schema.sql
fi

# Добавляем операторов
if [ -f "lib/database/operators_schema.sql" ]; then
    cat lib/database/operators_schema.sql >> /tmp/kamhub_full_schema.sql
fi

# Добавляем AI метрики
if [ -f "lib/database/ai_metrics_schema.sql" ]; then
    cat lib/database/ai_metrics_schema.sql >> /tmp/kamhub_full_schema.sql
fi

echo ""
echo -e "${YELLOW}Применяем схему...${NC}"

# Применяем схему
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f /tmp/kamhub_full_schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Схема создана успешно${NC}"
else
    echo -e "${RED}❌ Ошибка при создании схемы${NC}"
    exit 1
fi

echo ""

# =============================================
# ПРОВЕРКА ТАБЛИЦ
# =============================================
echo -e "${YELLOW}🔍 Проверка созданных таблиц...${NC}"
echo ""

TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo -e "${BLUE}Создано таблиц: ${GREEN}$TABLE_COUNT${NC}"
echo ""

# Список основных таблиц
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'SQL'
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
SQL

echo ""

# =============================================
# ТЕСТОВЫЕ ДАННЫЕ (опционально)
# =============================================
echo ""
read -p "Добавить тестовые данные? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📝 Добавление тестовых данных...${NC}"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'SQL'
    -- Тестовый пользователь-администратор
    INSERT INTO users (email, name, role, password_hash)
    VALUES (
        'admin@tourhab.ru',
        'Администратор',
        'admin',
        '$2a$10$KqH.J8XQrM3bNj5nLqR4teX.KYQ8pPk.3KnR7xQZR4oDvV8mXJSzi' -- пароль: admin123
    )
    ON CONFLICT (email) DO NOTHING;

    -- Тестовый туроператор
    INSERT INTO users (email, name, role, password_hash)
    VALUES (
        'operator@tourhab.ru',
        'Туроператор Тест',
        'operator',
        '$2a$10$KqH.J8XQrM3bNj5nLqR4teX.KYQ8pPk.3KnR7xQZR4oDvV8mXJSzi'
    )
    ON CONFLICT (email) DO NOTHING;

    -- Тестовый турист
    INSERT INTO users (email, name, role, password_hash)
    VALUES (
        'tourist@tourhab.ru',
        'Турист Тест',
        'tourist',
        '$2a$10$KqH.J8XQrM3bNj5nLqR4teX.KYQ8pPk.3KnR7xQZR4oDvV8mXJSzi'
    )
    ON CONFLICT (email) DO NOTHING;

    SELECT 'Тестовые пользователи созданы' as status;
SQL
    
    echo -e "${GREEN}✅ Тестовые данные добавлены${NC}"
    echo ""
    echo -e "${YELLOW}Тестовые аккаунты:${NC}"
    echo -e "  ${BLUE}Админ:${NC}      admin@tourhab.ru / admin123"
    echo -e "  ${BLUE}Оператор:${NC}   operator@tourhab.ru / admin123"
    echo -e "  ${BLUE}Турист:${NC}     tourist@tourhab.ru / admin123"
fi

echo ""

# =============================================
# ЗАВЕРШЕНИЕ
# =============================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}       🎉 БАЗА ДАННЫХ ГОТОВА! 🎉${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Информация:${NC}"
echo ""
echo -e "  ${BLUE}Host:${NC}     $DB_HOST"
echo -e "  ${BLUE}Port:${NC}     $DB_PORT"
echo -e "  ${BLUE}Database:${NC} $DB_NAME"
echo -e "  ${BLUE}User:${NC}     $DB_USER"
echo -e "  ${BLUE}Таблиц:${NC}   $TABLE_COUNT"
echo ""
echo -e "${YELLOW}🔗 Строка подключения:${NC}"
echo -e "${GREEN}  postgresql://$DB_USER:***@$DB_HOST:$DB_PORT/$DB_NAME${NC}"
echo ""
echo -e "${YELLOW}📝 Подключение:${NC}"
echo -e "${GREEN}  psql '$DATABASE_URL'${NC}"
echo ""
echo -e "${YELLOW}🚀 Следующий шаг:${NC}"
echo -e "  ${GREEN}Обновите .env.production на сервере с DATABASE_URL${NC}"
echo -e "  ${GREEN}Перезапустите приложение: pm2 restart kamhub${NC}"
echo ""
