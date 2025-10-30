#!/bin/bash

###############################################################################
# KAMCHATOUR HUB - БЫСТРЫЙ ДЕПЛОЙ
# Автоматический скрипт для деплоя приложения
###############################################################################

set -e  # Exit on error

echo "🚀 KAMCHATOUR HUB - Автоматический деплой"
echo "=========================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Проверка Node.js
echo "Проверка зависимостей..."
if ! command -v node &> /dev/null; then
    log_error "Node.js не установлен!"
    echo "Установите Node.js 20+ с https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    log_error "Требуется Node.js 20+, установлена версия $(node -v)"
    exit 1
fi
log_info "Node.js $(node -v) ✓"

# Проверка npm
if ! command -v npm &> /dev/null; then
    log_error "npm не установлен!"
    exit 1
fi
log_info "npm $(npm -v) ✓"

# Проверка PostgreSQL
echo ""
echo "Проверка PostgreSQL..."
if ! command -v psql &> /dev/null; then
    log_warn "PostgreSQL не найден в системе"
    echo "Установите PostgreSQL или используйте удаленную БД"
else
    log_info "PostgreSQL установлен ✓"
fi

# Проверка .env файла
echo ""
echo "Проверка конфигурации..."
if [ ! -f .env ]; then
    log_warn ".env файл не найден"
    echo "Создаем из .env.example..."
    cp .env.example .env
    log_info ".env создан из шаблона"
    log_warn "ВАЖНО: Отредактируйте .env файл с реальными данными!"
    echo ""
    read -p "Нажмите Enter после редактирования .env или Ctrl+C для отмены..."
else
    log_info ".env файл найден ✓"
fi

# Проверка DATABASE_URL
source .env 2>/dev/null || true
if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"localhost"* ]]; then
    log_warn "DATABASE_URL не настроен или использует localhost"
    echo ""
    echo "Введите DATABASE_URL или нажмите Enter для использования localhost:"
    read -p "DATABASE_URL: " DB_URL
    if [ ! -z "$DB_URL" ]; then
        # Update .env
        if grep -q "^DATABASE_URL=" .env; then
            sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DB_URL|" .env
        else
            echo "DATABASE_URL=$DB_URL" >> .env
        fi
        log_info "DATABASE_URL обновлен"
    fi
fi

# Установка зависимостей
echo ""
echo "Установка зависимостей..."
if [ ! -d "node_modules" ]; then
    npm install
    log_info "Зависимости установлены ✓"
else
    log_info "node_modules уже существует, пропускаем установку"
fi

# Build проекта
echo ""
echo "Сборка проекта..."
if npm run build; then
    log_info "Проект успешно собран ✓"
else
    log_error "Ошибка сборки!"
    exit 1
fi

# Применение миграций
echo ""
echo "Применение миграций..."
read -p "Применить миграции базы данных? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if npm run migrate:up 2>/dev/null; then
        log_info "Миграции применены ✓"
    else
        log_warn "Ошибка применения миграций (возможно уже применены)"
    fi
    
    # Seat holds таблица
    if [ -f "lib/database/seat_holds_schema.sql" ]; then
        echo "Применение seat_holds схемы..."
        if psql "$DATABASE_URL" -f lib/database/seat_holds_schema.sql 2>/dev/null; then
            log_info "seat_holds таблица создана ✓"
        else
            log_warn "Ошибка создания seat_holds (возможно уже существует)"
        fi
    fi
else
    log_warn "Миграции пропущены"
fi

# Настройка backup
echo ""
read -p "Настроить автоматические backup? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "scripts/setup-backup-cron.sh" ]; then
        chmod +x scripts/setup-backup-cron.sh
        bash scripts/setup-backup-cron.sh
        log_info "Backup настроен ✓"
    else
        log_warn "Скрипт backup не найден"
    fi
else
    log_warn "Backup пропущен"
fi

# Выбор режима запуска
echo ""
echo "=========================================="
echo "Деплой завершен! Выберите действие:"
echo ""
echo "1) Запустить в development режиме (npm run dev)"
echo "2) Запустить в production режиме (npm start)"
echo "3) Установить PM2 и запустить как сервис"
echo "4) Показать инструкции для Vercel/Docker"
echo "5) Выход"
echo ""
read -p "Выберите опцию (1-5): " choice

case $choice in
    1)
        log_info "Запуск в development режиме..."
        echo ""
        echo "Приложение будет доступно на http://localhost:3002"
        echo "Нажмите Ctrl+C для остановки"
        echo ""
        npm run dev
        ;;
    2)
        log_info "Запуск в production режиме..."
        echo ""
        echo "Приложение будет доступно на http://localhost:3000"
        echo "Нажмите Ctrl+C для остановки"
        echo ""
        npm start
        ;;
    3)
        log_info "Установка PM2..."
        if ! command -v pm2 &> /dev/null; then
            npm install -g pm2
        fi
        pm2 start npm --name "kamchatour-hub" -- start
        pm2 save
        log_info "PM2 запущен ✓"
        echo ""
        echo "Команды для управления:"
        echo "  pm2 status           - статус"
        echo "  pm2 logs kamchatour-hub  - логи"
        echo "  pm2 restart kamchatour-hub  - перезапуск"
        echo "  pm2 stop kamchatour-hub     - остановка"
        ;;
    4)
        cat << 'EOF'

========================================
📦 ДЕПЛОЙ НА VERCEL
========================================

1. Установить Vercel CLI:
   npm install -g vercel

2. Login:
   vercel login

3. Deploy:
   vercel --prod

4. Настроить переменные в Vercel Dashboard:
   - DATABASE_URL (из Vercel Postgres)
   - JWT_SECRET
   - Другие из .env.example

========================================
🐳 ДЕПЛОЙ ЧЕРЕЗ DOCKER
========================================

1. Build образ:
   docker build -t kamchatour-hub .

2. Запустить с PostgreSQL:
   docker-compose up -d

3. Применить миграции:
   docker-compose exec app npm run migrate:up

Подробнее: см. DEPLOY_NOW.md

EOF
        ;;
    5)
        log_info "Выход"
        exit 0
        ;;
    *)
        log_error "Неверный выбор"
        exit 1
        ;;
esac

echo ""
log_info "Готово! 🎉"
