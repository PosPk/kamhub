#!/bin/bash

###############################################################################
# ФИНАЛЬНЫЙ PUSH И ДЕПЛОЙ
###############################################################################

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🚀 ДЕПЛОЙ НА TIMEWEB CLOUD                             ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_info() { echo -e "${BLUE}▶${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }

# Шаг 1: Git Push
log_info "Шаг 1/4: Push в git..."
echo ""

if git push origin $(git branch --show-current); then
    log_success "Код отправлен в репозиторий"
else
    echo "Ошибка push. Проверьте подключение к git remote."
    exit 1
fi

echo ""
log_success "✅ Git push выполнен"
echo ""

# Шаг 2: Инструкции для Timeweb
log_info "Шаг 2/4: Настройка в Timeweb Cloud"
echo ""
echo "1. Откройте: ${BLUE}https://timeweb.cloud/my/projects/1883095${NC}"
echo "2. Проверьте что начался автоматический deploy"
echo "3. Следите за логами: Deployments → Logs"
echo ""

read -p "Нажмите Enter когда deploy завершится..."
echo ""
log_success "Deploy завершен"
echo ""

# Шаг 3: Настройка секретов
log_info "Шаг 3/4: Настройка Environment Variables"
echo ""
echo "Откройте: ${BLUE}Settings → Environment Variables${NC}"
echo ""
echo "Добавьте ОБЯЗАТЕЛЬНЫЕ переменные:"
echo ""
cat << 'ENVS'
DATABASE_URL=postgresql://user:pass@host:5432/kamchatour
JWT_SECRET=<сгенерировать: openssl rand -base64 32>
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://kamchatour-1883095.timeweb.app
DATABASE_SSL=true
DATABASE_MAX_CONNECTIONS=20
ENVS
echo ""
echo "После добавления нажмите Save и Restart приложения"
echo ""

read -p "Нажмите Enter когда секреты настроены..."
echo ""
log_success "Секреты настроены"
echo ""

# Шаг 4: Миграции
log_info "Шаг 4/4: Применение миграций базы данных"
echo ""
echo "В Timeweb Terminal выполните:"
echo ""
cat << 'MIGRATIONS'
npm run migrate:up
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql $DATABASE_URL -f lib/database/seat_holds_schema.sql
MIGRATIONS
echo ""

read -p "Нажмите Enter когда миграции применены..."
echo ""
log_success "Миграции применены"
echo ""

# Проверка
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅ ДЕПЛОЙ ЗАВЕРШЕН!                                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

log_info "Проверка приложения..."
echo ""

APP_URL="https://kamchatour-1883095.timeweb.app"

echo "🌐 Приложение: ${BLUE}${APP_URL}${NC}"
echo ""
echo "Проверьте:"
echo "  1. Открыть: ${APP_URL}"
echo "  2. Health: ${APP_URL}/api/health"
echo "  3. Database: ${APP_URL}/api/health/db"
echo ""

log_success "Готово! 🎉"
echo ""
echo "📚 Документация:"
echo "  - ДЕПЛОЙ_СЕЙЧАС.md - быстрый старт"
echo "  - TIMEWEB_ДЕПЛОЙ.md - полное руководство"
echo "  - TIMEWEB_SECRETS_SETUP.md - настройка секретов"
echo ""
