#!/bin/bash

# ================================================
# УДАЛЕННАЯ НАСТРОЙКА POSTGRESQL ЧЕРЕЗ SSH
# ================================================

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║      🚀 УДАЛЕННАЯ НАСТРОЙКА POSTGRESQL                       ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ================================================
# ПАРАМЕТРЫ ПОДКЛЮЧЕНИЯ
# ================================================

read -p "SSH Host (kamchatour-125051.timeweb.cloud): " SSH_HOST
SSH_HOST=${SSH_HOST:-kamchatour-125051.timeweb.cloud}

read -p "SSH User (app): " SSH_USER
SSH_USER=${SSH_USER:-app}

read -p "SSH Port (22): " SSH_PORT
SSH_PORT=${SSH_PORT:-22}

echo ""
echo -e "${BLUE}▶${NC} Подключение: ${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo ""

# ================================================
# ПРОВЕРКА ПОДКЛЮЧЕНИЯ
# ================================================

echo -e "${BLUE}▶${NC} Проверка SSH подключения..."

if ssh -p "$SSH_PORT" -o BatchMode=yes -o ConnectTimeout=5 "${SSH_USER}@${SSH_HOST}" "echo OK" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} SSH подключение работает"
else
  echo -e "${RED}❌ Не удалось подключиться по SSH без пароля${NC}"
  echo ""
  echo "💡 Настройте SSH ключи или введите пароль при подключении"
  echo ""
fi

echo ""

# ================================================
# ЗАГРУЗКА СКРИПТОВ НА СЕРВЕР
# ================================================

echo -e "${BLUE}▶${NC} Загрузка скриптов на сервер..."

# Создаем временную директорию
ssh -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" "mkdir -p ~/kamhub-setup"

# Загружаем скрипты
scp -P "$SSH_PORT" scripts/init-postgresql.sql "${SSH_USER}@${SSH_HOST}:~/kamhub-setup/"
scp -P "$SSH_PORT" scripts/setup-postgresql.sh "${SSH_USER}@${SSH_HOST}:~/kamhub-setup/"

echo -e "${GREEN}✓${NC} Скрипты загружены"
echo ""

# ================================================
# ПРОВЕРКА DATABASE_URL
# ================================================

echo -e "${BLUE}▶${NC} Проверка DATABASE_URL на сервере..."

DATABASE_URL=$(ssh -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" "printenv DATABASE_URL" 2>/dev/null || echo "")

if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠${NC} DATABASE_URL не установлена на сервере!"
  echo ""
  read -p "Введите DATABASE_URL: " DATABASE_URL
  
  if [ ! -z "$DATABASE_URL" ]; then
    echo "export DATABASE_URL='$DATABASE_URL'" | ssh -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" "cat >> ~/.bashrc"
    echo -e "${GREEN}✓${NC} DATABASE_URL добавлена в ~/.bashrc"
  fi
else
  echo -e "${GREEN}✓${NC} DATABASE_URL найдена"
fi

echo ""

# ================================================
# ЗАПУСК НАСТРОЙКИ
# ================================================

echo -e "${BLUE}▶${NC} Запуск настройки PostgreSQL на сервере..."
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

ssh -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" << 'ENDSSH'
cd ~/kamhub-setup
chmod +x setup-postgresql.sh

echo "🔧 Запуск setup-postgresql.sh..."
echo ""

if [ -z "$DATABASE_URL" ]; then
  source ~/.bashrc
fi

./setup-postgresql.sh

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✅ Настройка завершена!"
echo ""
ENDSSH

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ УДАЛЕННАЯ НАСТРОЙКА ЗАВЕРШЕНА!${NC}"
echo ""
echo "Следующие шаги:"
echo "  1. Проверьте базу данных через API"
echo "  2. Запустите приложение"
echo "  3. Проверьте /api/health/db"
echo ""
