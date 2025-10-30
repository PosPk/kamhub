#!/bin/bash

# ═══════════════════════════════════════════════════════════════
#  БЫСТРАЯ НАСТРОЙКА POSTGRESQL ДЛЯ KAMCHATOUR HUB
#  Timeweb Cloud Edition
# ═══════════════════════════════════════════════════════════════

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║      🐘 БЫСТРАЯ НАСТРОЙКА POSTGRESQL                          ║"
echo "║      Timeweb Cloud Edition                                    ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Данные подключения Timeweb Cloud
DB_HOST="51e6e5ca5d967b8e81fc9b75.twc1.net"
DB_PORT="5432"
DB_NAME="default_db"
DB_USER="gen_user"
DB_PASS="q;3U+PY7XCz@Br"
DB_SSL="sslmode=require"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?${DB_SSL}"

echo -e "${BLUE}📋 Данные подключения:${NC}"
echo "   Host: ${DB_HOST}"
echo "   Port: ${DB_PORT}"
echo "   Database: ${DB_NAME}"
echo "   User: ${DB_USER}"
echo "   SSL: require"
echo ""

# Функция для вывода успеха
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Функция для вывода ошибки
error() {
    echo -e "${RED}✗${NC} $1"
}

# Функция для вывода предупреждения
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Функция для вывода информации
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Шаг 1: Проверка наличия psql
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Шаг 1/5: Проверка psql${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

if ! command -v psql &> /dev/null; then
    error "psql не установлен"
    info "Установите PostgreSQL client:"
    echo "   Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "   macOS: brew install postgresql"
    echo "   CentOS/RHEL: sudo yum install postgresql"
    exit 1
fi

success "psql установлен: $(psql --version)"
echo ""

# Шаг 2: Проверка подключения
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Шаг 2/5: Проверка подключения${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

if psql "${DATABASE_URL}" -c "SELECT version();" > /dev/null 2>&1; then
    success "Подключение к базе данных успешно"
    
    # Получаем версию PostgreSQL
    PG_VERSION=$(psql "${DATABASE_URL}" -t -c "SELECT version();" | head -n1)
    info "PostgreSQL версия: ${PG_VERSION}"
else
    error "Не удалось подключиться к базе данных"
    echo ""
    echo "Проверьте:"
    echo "  • Правильность данных подключения"
    echo "  • Что база данных запущена в Timeweb Cloud"
    echo "  • Доступ к хосту: ${DB_HOST}"
    exit 1
fi
echo ""

# Шаг 3: Проверка наличия таблиц
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Шаг 3/5: Проверка существующих таблиц${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

TABLE_COUNT=$(psql "${DATABASE_URL}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

if [ "$TABLE_COUNT" -gt 0 ]; then
    warning "Найдено таблиц: ${TABLE_COUNT}"
    
    echo ""
    echo "Список существующих таблиц:"
    psql "${DATABASE_URL}" -c "\dt" 2>/dev/null || true
    echo ""
    
    read -p "Перезаписать базу данных? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        info "Отменено пользователем"
        exit 0
    fi
    
    info "Удаление существующих таблиц..."
    psql "${DATABASE_URL}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" > /dev/null 2>&1
    success "Существующие таблицы удалены"
else
    success "База данных пустая, готова к инициализации"
fi
echo ""

# Шаг 4: Выполнение SQL скрипта инициализации
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Шаг 4/5: Инициализация базы данных${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="${SCRIPT_DIR}/init-postgresql.sql"

if [ ! -f "$SQL_FILE" ]; then
    error "SQL скрипт не найден: ${SQL_FILE}"
    exit 1
fi

info "Выполнение SQL скрипта: ${SQL_FILE}"

if psql "${DATABASE_URL}" -f "${SQL_FILE}" > /dev/null 2>&1; then
    success "SQL скрипт выполнен успешно"
else
    error "Ошибка при выполнении SQL скрипта"
    exit 1
fi
echo ""

# Шаг 5: Проверка результата
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Шаг 5/5: Проверка результата${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

FINAL_TABLE_COUNT=$(psql "${DATABASE_URL}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

if [ "$FINAL_TABLE_COUNT" -ge 17 ]; then
    success "Создано таблиц: ${FINAL_TABLE_COUNT} ✓"
else
    warning "Создано таблиц: ${FINAL_TABLE_COUNT} (ожидалось 17)"
fi

echo ""
echo "Список созданных таблиц:"
psql "${DATABASE_URL}" -c "\dt" 2>/dev/null || true
echo ""

# Проверка расширений
info "Проверка установленных расширений:"
psql "${DATABASE_URL}" -c "SELECT extname, extversion FROM pg_extension;" 2>/dev/null || true
echo ""

# Проверка loyalty tiers
TIERS_COUNT=$(psql "${DATABASE_URL}" -t -c "SELECT COUNT(*) FROM loyalty_tiers;" 2>/dev/null | xargs || echo "0")
if [ "$TIERS_COUNT" -gt 0 ]; then
    success "Loyalty tiers созданы: ${TIERS_COUNT}"
else
    warning "Loyalty tiers не найдены"
fi
echo ""

# Итоговый отчет
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║      ✅ НАСТРОЙКА ЗАВЕРШЕНА УСПЕШНО!                          ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 ИТОГИ:${NC}"
echo "   • Таблиц создано: ${FINAL_TABLE_COUNT}"
echo "   • Loyalty tiers: ${TIERS_COUNT}"
echo "   • База данных готова к использованию ✓"
echo ""

echo -e "${BLUE}📋 DATABASE_URL ДЛЯ TIMEWEB APPS:${NC}"
echo ""
echo "${DATABASE_URL}"
echo ""

echo -e "${BLUE}⚙️ СЛЕДУЮЩИЕ ШАГИ:${NC}"
echo ""
echo "1. Добавьте DATABASE_URL в Timeweb Apps:"
echo "   https://timeweb.cloud/my/apps/125051"
echo "   Settings → Environment Variables → Add Variable"
echo ""
echo "2. Добавьте другие переменные окружения:"
echo "   NEXTAUTH_SECRET=<минимум_32_символа>"
echo "   NEXTAUTH_URL=<url_вашего_приложения>"
echo "   JWT_SECRET=<минимум_32_символа>"
echo ""
echo "3. Перезапустите приложение:"
echo "   Settings → Restart Application"
echo ""
echo "4. Проверьте работу приложения:"
echo "   Откройте URL и попробуйте зарегистрироваться"
echo ""

echo -e "${GREEN}✨ База данных готова! Удачи с деплоем! 🚀${NC}"
echo ""
