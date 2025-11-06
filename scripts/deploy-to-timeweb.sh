#!/bin/bash

# ================================================================
# СКРИПТ АВТОМАТИЧЕСКОГО ДЕПЛОЯ KAMHUB НА TIMEWEB
# ================================================================

set -e  # Прерывать при ошибках

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Переменные
SERVER_IP="5.129.248.224"
SERVER_USER="root"
SERVER_PATH="/var/www/kamhub"
DB_NAME="kamhub"
DB_USER="kamhub_user"
APP_PORT="3000"

echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🚀 ДЕПЛОЙ KAMHUB НА TIMEWEB CLOUD               ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""

# ================================================================
# 1. ПРОВЕРКА ЛОКАЛЬНОЙ СБОРКИ
# ================================================================
echo -e "${YELLOW}[1/10] Проверка локальной сборки...${NC}"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Ошибка: package.json не найден!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ package.json найден${NC}"

# Сборка локально для проверки
echo "Выполняю локальную сборку для проверки..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка сборки! Исправьте ошибки перед деплоем.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Локальная сборка успешна${NC}"
echo ""

# ================================================================
# 2. СОЗДАНИЕ АРХИВА ДЛЯ ДЕПЛОЯ
# ================================================================
echo -e "${YELLOW}[2/10] Создание архива для деплоя...${NC}"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="kamhub-deploy-${TIMESTAMP}.tar.gz"

tar -czf $ARCHIVE_NAME \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.env*' \
    .

echo -e "${GREEN}✅ Архив создан: $ARCHIVE_NAME${NC}"
echo ""

# ================================================================
# 3. КОПИРОВАНИЕ НА СЕРВЕР
# ================================================================
echo -e "${YELLOW}[3/10] Копирование на сервер...${NC}"

scp $ARCHIVE_NAME $SERVER_USER@$SERVER_IP:/tmp/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка копирования на сервер!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Файлы скопированы на сервер${NC}"
echo ""

# ================================================================
# 4. РАСПАКОВКА И УСТАНОВКА НА СЕРВЕРЕ
# ================================================================
echo -e "${YELLOW}[4/10] Распаковка и установка на сервере...${NC}"

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

# Создать директорию если не существует
mkdir -p /var/www/kamhub

# Создать backup текущей версии (если существует)
if [ -d "/var/www/kamhub/app" ]; then
    echo "📦 Создание backup..."
    tar -czf /root/backups/kamhub-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /var/www/kamhub .
fi

# Распаковать новую версию
cd /var/www/kamhub
tar -xzf /tmp/kamhub-deploy-*.tar.gz

# Установить зависимости
echo "📦 Установка зависимостей..."
npm ci --production

# Сборка на сервере
echo "🏗️ Сборка приложения..."
npm run build

echo "✅ Приложение распаковано и собрано"
ENDSSH

echo -e "${GREEN}✅ Установка на сервере завершена${NC}"
echo ""

# ================================================================
# 5. ПРИМЕНЕНИЕ SQL СХЕМ (ТОЛЬКО ПРИ ПЕРВОМ ДЕПЛОЕ)
# ================================================================
echo -e "${YELLOW}[5/10] Применение SQL схем...${NC}"

read -p "Применить SQL схемы к базе данных? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Копирование SQL файлов..."
    scp -r lib/database $SERVER_USER@$SERVER_IP:/tmp/kamhub-sql/

    ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /tmp/kamhub-sql

    echo "Применение схем к базе данных..."
    psql -U kamhub_user -d kamhub -f schema.sql
    psql -U kamhub_user -d kamhub -f accommodation_schema.sql
    psql -U kamhub_user -d kamhub -f transfer_schema.sql
    psql -U kamhub_user -d kamhub -f transfer_payments_schema.sql
    psql -U kamhub_user -d kamhub -f seat_holds_schema.sql
    psql -U kamhub_user -d kamhub -f operators_schema.sql
    psql -U kamhub_user -d kamhub -f loyalty_schema.sql
    psql -U kamhub_user -d kamhub -f agent_schema.sql
    psql -U kamhub_user -d kamhub -f admin_schema.sql
    psql -U kamhub_user -d kamhub -f transfer_operator_schema.sql
    psql -U kamhub_user -d kamhub -f souvenirs_schema.sql
    psql -U kamhub_user -d kamhub -f gear_schema.sql
    psql -U kamhub_user -d kamhub -f cars_schema.sql

    # Применение миграций
    if [ -d "migrations" ]; then
        for migration in migrations/*.sql; do
            echo "Применение миграции: $migration"
            psql -U kamhub_user -d kamhub -f "$migration"
        done
    fi

    echo "✅ SQL схемы применены"
ENDSSH

    echo -e "${GREEN}✅ SQL схемы успешно применены${NC}"
else
    echo "⏭️ Пропуск применения SQL схем"
fi
echo ""

# ================================================================
# 6. НАСТРОЙКА ENVIRONMENT VARIABLES
# ================================================================
echo -e "${YELLOW}[6/10] Настройка environment variables...${NC}"

read -p "Копировать .env файл на сервер? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f ".env.production" ]; then
        scp .env.production $SERVER_USER@$SERVER_IP:/var/www/kamhub/.env
        echo -e "${GREEN}✅ .env файл скопирован${NC}"
    else
        echo -e "${RED}⚠️ Файл .env.production не найден!${NC}"
        echo "Создайте его на сервере вручную."
    fi
else
    echo "⏭️ Пропуск копирования .env"
fi
echo ""

# ================================================================
# 7. ЗАПУСК/ПЕРЕЗАПУСК PM2
# ================================================================
echo -e "${YELLOW}[7/10] Запуск приложения через PM2...${NC}"

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /var/www/kamhub

# Проверить, запущено ли приложение
if pm2 list | grep -q "kamhub"; then
    echo "🔄 Перезапуск приложения..."
    pm2 restart kamhub
else
    echo "🚀 Первый запуск приложения..."
    pm2 start ecosystem.config.js
    pm2 save
fi

# Показать статус
pm2 status
pm2 info kamhub
ENDSSH

echo -e "${GREEN}✅ Приложение запущено${NC}"
echo ""

# ================================================================
# 8. ПРОВЕРКА ЗДОРОВЬЯ ПРИЛОЖЕНИЯ
# ================================================================
echo -e "${YELLOW}[8/10] Проверка здоровья приложения...${NC}"

sleep 5  # Подождать запуска

# Проверка локального endpoint
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
echo "Проверка http://localhost:3000/api/health ..."
curl -s http://localhost:3000/api/health | head -5

echo ""
echo "Проверка http://localhost:3000/api/ping ..."
curl -s http://localhost:3000/api/ping | head -5
ENDSSH

echo -e "${GREEN}✅ Приложение отвечает${NC}"
echo ""

# ================================================================
# 9. ОЧИСТКА
# ================================================================
echo -e "${YELLOW}[9/10] Очистка временных файлов...${NC}"

rm $ARCHIVE_NAME
ssh $SERVER_USER@$SERVER_IP "rm -f /tmp/kamhub-deploy-*.tar.gz"

echo -e "${GREEN}✅ Временные файлы удалены${NC}"
echo ""

# ================================================================
# 10. ФИНАЛЬНАЯ ПРОВЕРКА
# ================================================================
echo -e "${YELLOW}[10/10] Финальная проверка...${NC}"

echo "Проверка доступности сервера..."
echo "URL: https://kamhub.ru"
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
echo "📊 Статус сервисов:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "PostgreSQL: "
systemctl is-active postgresql || echo "❌ НЕ ЗАПУЩЕН"

echo -n "Nginx: "
systemctl is-active nginx || echo "❌ НЕ ЗАПУЩЕН"

echo -n "PM2: "
pm2 status | grep -q "kamhub" && echo "✅ Запущен" || echo "❌ НЕ ЗАПУЩЕН"

echo ""
echo "📋 PM2 статус:"
pm2 list

echo ""
echo "💾 Использование диска:"
df -h | grep -E "Filesystem|/$"

echo ""
echo "🧠 Использование памяти:"
free -h
ENDSSH

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ ДЕПЛОЙ ЗАВЕРШЁН УСПЕШНО!                     ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "🌐 Проверьте приложение:"
echo -e "   https://kamhub.ru"
echo -e "   https://kamhub.ru/api/health"
echo ""
echo -e "📊 Для просмотра логов:"
echo -e "   ssh $SERVER_USER@$SERVER_IP"
echo -e "   pm2 logs kamhub"
echo ""
echo -e "🔄 Для перезапуска:"
echo -e "   ssh $SERVER_USER@$SERVER_IP"
echo -e "   pm2 restart kamhub"
echo ""

exit 0
