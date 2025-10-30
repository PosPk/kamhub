#!/bin/bash

# ============================================================================
# Скрипт автоматического развертывания KamchaTour Hub на Timeweb Cloud
# ============================================================================

set -e  # Выход при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функции для цветного вывода
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Проверка наличия .env файла
if [ ! -f .env.production ]; then
    error ".env.production файл не найден!"
    exit 1
fi

# Загрузка переменных окружения
export $(cat .env.production | xargs)

info "🚀 Начинаем развертывание на Timeweb Cloud..."

# Проверка подключения к серверу
info "📡 Проверка подключения к серверу..."
if ! ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST "echo 'Connected'" > /dev/null 2>&1; then
    error "Не удалось подключиться к серверу $SERVER_HOST"
    exit 1
fi
info "✅ Подключение установлено"

# Проверка существования директории проекта
info "📂 Проверка директории проекта..."
ssh $SERVER_USER@$SERVER_HOST "mkdir -p ~/kamchatour-hub"

# Синхронизация кода
info "📤 Синхронизация кода с сервером..."
rsync -avz --exclude 'node_modules' \
           --exclude '.next' \
           --exclude '.git' \
           --exclude 'logs' \
           --delete \
           ./ $SERVER_USER@$SERVER_HOST:~/kamchatour-hub/

# Копирование .env файла
info "🔐 Копирование переменных окружения..."
scp .env.production $SERVER_USER@$SERVER_HOST:~/kamchatour-hub/.env.production

# Выполнение команд на сервере
info "🔧 Установка зависимостей и сборка..."
ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'
    set -e
    cd ~/kamchatour-hub
    
    # Установка зависимостей
    echo "📦 Установка зависимостей..."
    npm ci --production=false
    
    # Применение миграций БД
    echo "🗄️ Применение миграций базы данных..."
    npx prisma migrate deploy
    
    # Сборка приложения
    echo "🏗️ Сборка Next.js приложения..."
    npm run build
    
    # Перезапуск приложения через PM2
    echo "🔄 Перезапуск приложения..."
    if pm2 list | grep -q kamchatour-hub; then
        pm2 reload kamchatour-hub --update-env
    else
        pm2 start ecosystem.config.js
    fi
    
    # Сохранение конфигурации PM2
    pm2 save
    
    echo "✅ Развертывание завершено!"
ENDSSH

# Проверка здоровья приложения
info "🏥 Проверка здоровья приложения..."
sleep 5  # Даем время приложению запуститься

HEALTH_CHECK_URL="https://${APP_DOMAIN}/api/health"
if curl -f -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL | grep -q "200"; then
    info "✅ Приложение работает корректно!"
else
    warn "⚠️ Проверка здоровья не прошла. Проверьте логи приложения."
fi

# Показать статус PM2
info "📊 Статус PM2:"
ssh $SERVER_USER@$SERVER_HOST "pm2 status"

info "🎉 Развертывание успешно завершено!"
info "🌐 Приложение доступно по адресу: https://${APP_DOMAIN}"

# Опционально: Отправка уведомления в Telegram
if [ ! -z "$TELEGRAM_DEPLOY_BOT_TOKEN" ] && [ ! -z "$TELEGRAM_DEPLOY_CHAT_ID" ]; then
    info "📱 Отправка уведомления в Telegram..."
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_DEPLOY_BOT_TOKEN}/sendMessage" \
         -d chat_id=${TELEGRAM_DEPLOY_CHAT_ID} \
         -d text="✅ KamchaTour Hub успешно развернут на Timeweb Cloud!" \
         > /dev/null
fi

info "✨ Готово!"
