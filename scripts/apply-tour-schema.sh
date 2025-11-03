#!/bin/bash

# =====================================================
# Применение Tour System Schema к Timeweb Cloud БД
# =====================================================

set -e  # Exit on error

echo "🚀 Tour System Schema Deployment"
echo "=================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database credentials
DB_HOST="51e6e5ca5d967b8e81fc9b75.twc1.net"
DB_PORT="5432"
DB_NAME="default_db"
DB_USER="gen_user"
DB_PASSWORD="q;3U+PY7XCz@Br"

# SSL Certificate path
SSL_CERT="$HOME/.cloud-certs/root.crt"

# Connection string
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=verify-full"

echo "📋 Configuration:"
echo "   Host: ${DB_HOST}"
echo "   Database: ${DB_NAME}"
echo "   User: ${DB_USER}"
echo ""

# Проверка наличия SSL сертификата
if [ ! -f "$SSL_CERT" ]; then
    echo -e "${YELLOW}⚠️  SSL certificate not found at $SSL_CERT${NC}"
    echo "   Downloading certificate..."
    
    mkdir -p "$HOME/.cloud-certs"
    curl -o "$HOME/.cloud-certs/root.crt" https://timeweb.cloud/certs/root.crt
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Certificate downloaded${NC}"
    else
        echo -e "${RED}❌ Failed to download certificate${NC}"
        exit 1
    fi
fi

echo ""
echo "🔍 Testing database connection..."

# Тест подключения
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Failed to connect to database${NC}"
    echo "   Please check your credentials and network connection"
    exit 1
fi

echo ""
echo "📦 Checking existing tables..."

# Проверяем существующие таблицы
EXISTING_TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'tour_%';")

echo "   Found $EXISTING_TABLES tour-related tables"

if [ "$EXISTING_TABLES" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: Tour tables already exist${NC}"
    echo ""
    read -p "Do you want to continue? This will create/update tables (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

echo ""
echo "🔧 Applying tour_system_schema.sql..."

# Применяем схему
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f ./lib/database/tour_system_schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema applied successfully${NC}"
else
    echo -e "${RED}❌ Failed to apply schema${NC}"
    exit 1
fi

echo ""
echo "🔍 Verifying tables..."

# Проверяем созданные таблицы
TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'tour_%' ORDER BY table_name;")

echo ""
echo "📊 Created tables:"
echo "$TABLES" | while read -r table; do
    if [ -n "$table" ]; then
        COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;")
        echo "   ✅ $table (rows: $COUNT)"
    fi
done

echo ""
echo "🔍 Verifying functions..."

# Проверяем функции
FUNCTIONS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%tour%' ORDER BY routine_name;")

echo ""
echo "📊 Created functions:"
echo "$FUNCTIONS" | while read -r func; do
    if [ -n "$func" ]; then
        echo "   ✅ $func()"
    fi
done

echo ""
echo "🔍 Verifying indexes..."

# Проверяем индексы
INDEX_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename LIKE 'tour_%';")

echo "   ✅ $INDEX_COUNT indexes created"

echo ""
echo -e "${GREEN}🎉 Tour System Schema deployed successfully!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env.production with DATABASE_URL"
echo "   2. Test API endpoints"
echo "   3. Create test tour schedules"
echo "   4. Run tests"
echo ""
echo "🚀 Database is ready for Tour System!"
