#!/bin/bash

# Скрипт для добавления OpenWeather API ключа на сервер

set -e

OPENWEATHER_KEY=$1

if [ -z "$OPENWEATHER_KEY" ]; then
  echo "❌ Ошибка: Не указан API ключ!"
  echo ""
  echo "Использование:"
  echo "  ./scripts/add-openweather-key.sh YOUR_API_KEY_HERE"
  echo ""
  echo "Получить ключ: https://home.openweathermap.org/users/sign_up"
  exit 1
fi

echo "🌤️  Добавляем OpenWeather API ключ на сервер..."

# Подключаемся к серверу и добавляем ключ
sshpass -p 'xQvB1pv?yZTjaR' ssh -o StrictHostKeyChecking=no root@5.129.248.224 << EOF
cd /var/www/kamhub

# Проверяем есть ли .env
if [ ! -f .env ]; then
  echo "📝 Создаем .env файл..."
  cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://gen_user:q;3U+PY7XCz@Br@45.8.96.120:5432/default_db
REDIS_ENABLED=false
ENVEOF
fi

# Удаляем старый ключ (если есть)
sed -i '/OPENWEATHER_API_KEY/d' .env

# Добавляем новый ключ
echo "OPENWEATHER_API_KEY=$OPENWEATHER_KEY" >> .env

echo "✅ API ключ добавлен!"
echo ""

# Перезапускаем приложение
echo "🔄 Перезапускаем приложение..."
pm2 restart kamhub

echo ""
echo "✅ ГОТОВО!"
echo ""
echo "Проверить погоду:"
echo "  curl http://localhost:3000/api/weather"
echo ""
echo "Или откройте: http://5.129.248.224/"
EOF

echo ""
echo "🎉 OpenWeather API ключ успешно добавлен и активирован!"
echo ""
echo "Теперь на сайте отображается реальная погода Петропавловска-Камчатского! ☀️❄️"
