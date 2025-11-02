#!/bin/bash

###############################################################################
# KAMCHATOUR HUB - ДЕПЛОЙ СОВРЕМЕННОГО ДИЗАЙНА НА TIMEWEB
# Автоматический деплой на сервер 5.129.248.224
###############################################################################

set -e

# Конфигурация
SERVER_IP="5.129.248.224"
SERVER_USER="root"
APP_NAME="kamchatour-hub"
APP_DIR="/var/www/kamchatour"
DOMAIN="5.129.248.224"

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_step() { echo -e "${BLUE}▶${NC} $1"; }

echo ""
echo "🚀 ДЕПЛОЙ СОВРЕМЕННОГО ДИЗАЙНА KAMCHATOUR HUB"
echo "=============================================="
echo "Сервер: ${SERVER_USER}@${SERVER_IP}"
echo ""

# Проверка SSH подключения
log_step "Проверка SSH подключения..."
if ! ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "echo 'Connected'" > /dev/null 2>&1; then
    log_error "Не удалось подключиться к серверу ${SERVER_IP}"
    log_info "Проверьте:"
    log_info "  1. SSH ключ добавлен: ssh-copy-id ${SERVER_USER}@${SERVER_IP}"
    log_info "  2. Сервер доступен: ping ${SERVER_IP}"
    log_info "  3. Firewall разрешает SSH (порт 22)"
    exit 1
fi
log_info "Подключение установлено"

# Синхронизация файлов
log_step "Синхронизация файлов проекта..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'logs' \
    --exclude '*.log' \
    --exclude '.env.local' \
    --exclude '.env.development' \
    ./ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/

log_info "Файлы синхронизированы"

# Выполнение команд на сервере
log_step "Выполнение деплоя на сервере..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
set -e

cd ${APP_DIR}

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm ci --production=false

# Сборка проекта
echo "🏗️ Сборка Next.js приложения..."
npm run build

# Применение миграций (если есть)
if [ -f "scripts/migrate.ts" ]; then
    echo "🗄️ Применение миграций..."
    npm run migrate:up || echo "Миграции уже применены"
fi

# Перезапуск PM2
echo "🔄 Перезапуск приложения..."
if pm2 list | grep -q "${APP_NAME}"; then
    pm2 reload ${APP_NAME} --update-env
else
    pm2 start ecosystem.config.js --name ${APP_NAME}
fi

pm2 save

echo "✅ Деплой завершен!"
EOF

log_info "Деплой на сервере завершен"

# Проверка здоровья
log_step "Проверка здоровья приложения..."
sleep 3

if curl -f -s "http://${SERVER_IP}/api/health" > /dev/null 2>&1; then
    log_info "✅ Приложение работает!"
    echo ""
    echo "=============================================="
    echo -e "${GREEN}🎉 ДЕПЛОЙ УСПЕШНО ЗАВЕРШЕН!${NC}"
    echo "=============================================="
    echo ""
    echo "🌐 Приложение доступно:"
    echo "   http://${SERVER_IP}"
    echo "   http://${SERVER_IP}/api/health"
    echo ""
    echo "📊 Полезные команды:"
    echo "   ssh ${SERVER_USER}@${SERVER_IP}"
    echo "   pm2 logs ${APP_NAME}"
    echo "   pm2 restart ${APP_NAME}"
    echo ""
else
    log_warn "⚠️ Приложение может еще запускаться..."
    log_info "Проверьте логи: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs ${APP_NAME}'"
fi
