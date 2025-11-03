#!/bin/bash
# 🚀 Автоматический деплой - все в одном
# Выполняет настройку сервера и первый деплой

set -e

echo "🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ НА TIMEWEB VDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Параметры
export TIMEWEB_SSH_HOST="${TIMEWEB_SSH_HOST:-5.129.248.224}"
export TIMEWEB_SSH_USER="${TIMEWEB_SSH_USER:-root}"
export TIMEWEB_SSH_PASSWORD="${TIMEWEB_SSH_PASSWORD:-xQvB1pv?yZTjaR}"
export TIMEWEB_SSH_PORT="${TIMEWEB_SSH_PORT:-22}"

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}📋 Параметры подключения:${NC}"
echo "  Host: $TIMEWEB_SSH_HOST"
echo "  User: $TIMEWEB_SSH_USER"
echo "  Port: $TIMEWEB_SSH_PORT"
echo ""

# Шаг 1: Настройка сервера
echo -e "${YELLOW}🔧 ШАГ 1: Настройка сервера...${NC}"
if [ -f "scripts/setup-timeweb-server.sh" ]; then
    bash scripts/setup-timeweb-server.sh
else
    echo "⚠️ Скрипт настройки не найден, пропускаем..."
fi

echo ""
echo -e "${YELLOW}🚀 ШАГ 2: Выполнение деплоя...${NC}"
if [ -f "scripts/deploy-timeweb-vds.sh" ]; then
    bash scripts/deploy-timeweb-vds.sh
else
    echo "⚠️ Скрипт деплоя не найден, пропускаем..."
fi

echo ""
echo -e "${GREEN}✅ АВТОМАТИЧЕСКИЙ ДЕПЛОЙ ЗАВЕРШЕН!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Приложение должно быть доступно по адресу:"
echo "   http://$TIMEWEB_SSH_HOST:3000"
echo ""
echo "📋 Проверка:"
echo "   ssh $TIMEWEB_SSH_USER@$TIMEWEB_SSH_HOST 'pm2 list'"
