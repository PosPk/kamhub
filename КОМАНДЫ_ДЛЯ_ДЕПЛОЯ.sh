#!/bin/bash

# 🚀 КОМАНДЫ ДЛЯ ДЕПЛОЯ ФИНАЛЬНОЙ ВЕРСИИ
# Выполните на сервере VDS

echo "🚀 ДЕПЛОЮ ФИНАЛЬНУЮ ВЕРСИЮ..."

# 1. Подключиться к серверу
ssh kamchatour@5.129.248.224 << 'ENDSSH'

# 2. Перейти в директорию проекта
cd /var/www/kamchatour

# 3. Подтянуть изменения из Git
echo "📥 Подтягиваю изменения из Git..."
git pull origin main

# 4. Проверить что файлы обновились
echo "📋 Проверяю файлы..."
ls -lh app/page.tsx
ls -lh app/final-homepage.css
ls -lh public/icons/*.svg | wc -l

# 5. Пересобрать проект
echo "🔨 Пересобираю проект..."
sudo -u kamchatour NODE_ENV=production npx next build

# 6. Перезапустить PM2
echo "♻️ Перезапускаю PM2..."
pm2 restart kamchatour

# 7. Проверить статус
echo "✅ Проверяю статус..."
pm2 status kamchatour
pm2 logs kamchatour --lines 20

echo ""
echo "✅ ДЕПЛОЙ ЗАВЕРШЁН!"
echo "🌐 Откройте: http://5.129.248.224"

ENDSSH
