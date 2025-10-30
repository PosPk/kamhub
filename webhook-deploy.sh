#!/bin/bash

# ============================================
# WEBHOOK ДЕПЛОЙ для KAMCHATOUR HUB
# ============================================
# Этот скрипт нужно разместить на сервере
# Потом можно будет деплоить одним HTTP запросом!

APP_DIR="/var/www/kamchatour-hub"
BRANCH="cursor/study-timeweb-cloud-documentation-thoroughly-72f9"

echo "🔄 Обновление приложения..."

cd $APP_DIR

# Получение обновлений
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Установка зависимостей
npm ci

# Сборка
npm run build

# Перезапуск PM2
pm2 reload kamchatour-hub

echo "✅ Обновление завершено!"
