#!/bin/bash

# ================================================
# АВТОМАТИЧЕСКАЯ НАСТРОЙКА POSTGRESQL ДЛЯ KAMHUB
# ================================================
# Автор: Cursor AI Agent
# Дата: 2025-10-30

set -e  # Остановка при ошибке

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║         🔧 НАСТРОЙКА POSTGRESQL ДЛЯ KAMHUB                   ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ================================================
# 1. ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
# ================================================

echo -e "${BLUE}▶${NC} Проверка DATABASE_URL..."

if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ Ошибка: DATABASE_URL не установлена!${NC}"
  echo ""
  echo "Установите переменную окружения:"
  echo "  export DATABASE_URL='postgresql://user:password@host:5432/database'"
  echo ""
  echo "Или передайте как аргумент:"
  echo "  ./setup-postgresql.sh 'postgresql://user:password@host:5432/database'"
  echo ""
  exit 1
fi

# Если передан аргумент, используем его
if [ ! -z "$1" ]; then
  DATABASE_URL="$1"
fi

echo -e "${GREEN}✓${NC} DATABASE_URL найдена"
echo ""

# ================================================
# 2. ПРОВЕРКА ПОДКЛЮЧЕНИЯ
# ================================================

echo -e "${BLUE}▶${NC} Проверка подключения к PostgreSQL..."

if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${RED}❌ Не удалось подключиться к PostgreSQL!${NC}"
  echo ""
  echo "Проверьте:"
  echo "  • DATABASE_URL правильный"
  echo "  • PostgreSQL запущен"
  echo "  • Firewall разрешает подключения"
  echo ""
  exit 1
fi

echo -e "${GREEN}✓${NC} Подключение успешно"
echo ""

# ================================================
# 3. ПРИМЕНЕНИЕ МИГРАЦИЙ
# ================================================

echo -e "${BLUE}▶${NC} Применение SQL миграций..."

psql "$DATABASE_URL" -f scripts/init-postgresql.sql

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓${NC} Миграции применены успешно"
else
  echo -e "${RED}❌ Ошибка при применении миграций${NC}"
  exit 1
fi

echo ""

# ================================================
# 4. ПРОВЕРКА ТАБЛИЦ
# ================================================

echo -e "${BLUE}▶${NC} Проверка созданных таблиц..."

TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo -e "${GREEN}✓${NC} Создано таблиц: $TABLE_COUNT"
echo ""

# ================================================
# 5. СОЗДАНИЕ ТЕСТОВЫХ ДАННЫХ (ОПЦИОНАЛЬНО)
# ================================================

read -p "Создать тестовые данные для разработки? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}▶${NC} Создание тестовых данных..."
  
  psql "$DATABASE_URL" << 'EOF'
-- Тестовый пользователь
INSERT INTO users (email, password_hash, name, phone, role)
VALUES (
  'test@kamhub.ru',
  '$2b$10$abcdefghijklmnopqrstuvwxyz',  -- Хеш пароля "test123"
  'Тестовый Пользователь',
  '+79001234567',
  'user'
) ON CONFLICT (email) DO NOTHING;

-- Тестовый оператор
INSERT INTO transfer_operators (company_name, license_number, rating, status)
VALUES (
  'Камчатка Трансфер',
  'LIC-2025-001',
  4.8,
  'active'
) ON CONFLICT DO NOTHING;

\echo '✓ Тестовые данные созданы'
EOF

  echo -e "${GREEN}✓${NC} Тестовые данные добавлены"
  echo ""
fi

# ================================================
# 6. ФИНАЛЬНАЯ ПРОВЕРКА
# ================================================

echo -e "${BLUE}▶${NC} Финальная проверка базы данных..."

psql "$DATABASE_URL" << 'EOF'
-- Проверка расширений
SELECT 'Расширения: ' || STRING_AGG(extname, ', ') 
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'postgis');

-- Проверка таблиц
SELECT 'Таблиц: ' || COUNT(*)::text 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Проверка индексов
SELECT 'Индексов: ' || COUNT(*)::text 
FROM pg_indexes 
WHERE schemaname = 'public';
EOF

echo ""

# ================================================
# ИТОГОВАЯ ИНФОРМАЦИЯ
# ================================================

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║         ✅ POSTGRESQL НАСТРОЕН УСПЕШНО!                      ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓${NC} Расширения установлены"
echo -e "${GREEN}✓${NC} Таблицы созданы ($TABLE_COUNT шт)"
echo -e "${GREEN}✓${NC} Индексы созданы"
echo -e "${GREEN}✓${NC} Начальные данные добавлены"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📝 СЛЕДУЮЩИЕ ШАГИ:"
echo ""
echo "1. Проверьте базу данных:"
echo "   ${BLUE}psql \"\$DATABASE_URL\" -c \"\\dt\"${NC}"
echo ""
echo "2. Проверьте через API:"
echo "   ${BLUE}curl https://your-app.timeweb.cloud/api/health/db${NC}"
echo ""
echo "3. Запустите приложение:"
echo "   ${BLUE}npm start${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}💡 СОВЕТ:${NC} Сохраните CONNECTION STRING в безопасном месте!"
echo ""
