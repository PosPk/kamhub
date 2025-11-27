#!/bin/bash

###############################################################################
# БЫСТРЫЙ ДЕПЛОЙ KAMHUB - ОДНА КОМАНДА
# Использует sshpass для автоматического ввода пароля
###############################################################################

SERVER="147.45.158.166"
USER="root"
PASS="eiGo@VK4.,,VH7"

echo "🚀 Запуск быстрого деплоя на $SERVER..."
echo ""

# Проверка sshpass
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass не установлен. Устанавливаю..."
    sudo apt install -y sshpass
fi

# Функция SSH
ssh_exec() {
    sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no $USER@$SERVER "$@"
}

# Проверка подключения
echo "Проверка подключения..."
if ! ssh_exec "echo 'OK'" &> /dev/null; then
    echo "❌ Не удалось подключиться к серверу"
    exit 1
fi
echo "✅ Подключение успешно"
echo ""

# Запуск основного скрипта деплоя на сервере
echo "Загружаю и запускаю скрипт деплоя на сервере..."
echo ""

sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no $USER@$SERVER 'bash -s' << 'REMOTE_SCRIPT'

set -e

echo "🚀 KAMHUB - Деплой на сервере"
echo "=============================="
echo ""

# Обновление системы
echo "▶ Обновление системы..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
echo "✓ Система обновлена"
echo ""

# Node.js 20
echo "▶ Установка Node.js 20..."
if ! command -v node &> /dev/null || [ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
fi
echo "✓ Node.js $(node -v) установлен"
echo ""

# PostgreSQL
echo "▶ Установка PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt-get install -y postgresql postgresql-contrib > /dev/null 2>&1
    systemctl start postgresql
    systemctl enable postgresql
fi
echo "✓ PostgreSQL установлен"
echo ""

# Настройка БД
echo "▶ Настройка базы данных..."
DB_NAME="kamchatour"
DB_USER="kamuser"
DB_PASS=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || {
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" > /dev/null 2>&1
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" > /dev/null 2>&1
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" > /dev/null 2>&1
    sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" > /dev/null 2>&1
    sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS postgis;" > /dev/null 2>&1 || true
}
echo "✓ База данных настроена"
echo "  DB: $DB_NAME"
echo "  User: $DB_USER"
echo "  Pass: $DB_PASS"
echo ""

# Nginx
echo "▶ Установка Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx > /dev/null 2>&1
    systemctl start nginx
    systemctl enable nginx
fi
echo "✓ Nginx установлен"
echo ""

# PM2
echo "▶ Установка PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2 > /dev/null 2>&1
fi
echo "✓ PM2 установлен"
echo ""

# Клонирование проекта
echo "▶ Клонирование проекта..."
if [ -d "/var/www/kamchatour" ]; then
    cd /var/www/kamchatour
    git pull origin main 2>&1 | tail -3
else
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/PosPk/kamhub.git kamchatour 2>&1 | tail -3
    cd kamchatour
fi
echo "✓ Проект клонирован"
echo ""

# Создание .env
echo "▶ Создание .env файла..."
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

cat > /var/www/kamchatour/.env << ENVEOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
DATABASE_SSL=false
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://$(hostname -I | awk '{print $1}'):3002
PORT=3002
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
YANDEX_WEATHER_API_KEY=8f6b0a53-135f-4217-8de1-de98c1316cc0
YANDEX_MAPS_API_KEY=
GROQ_API_KEY=
DEEPSEEK_API_KEY=
CLOUDPAYMENTS_PUBLIC_ID=
CLOUDPAYMENTS_API_SECRET=
ENVEOF

echo "✓ .env создан"
echo ""

# Установка зависимостей
echo "▶ Установка зависимостей (это займет 2-3 минуты)..."
cd /var/www/kamchatour
npm install --production=false 2>&1 | grep -E "(added|removed|changed)" || true
echo "✓ Зависимости установлены"
echo ""

# Сборка
echo "▶ Сборка проекта (это займет 3-5 минут)..."
npm run build 2>&1 | tail -5
echo "✓ Проект собран"
echo ""

# Миграции
echo "▶ Применение миграций..."
cd /var/www/kamchatour
for schema in lib/database/*.sql; do
    if [ -f "$schema" ]; then
        PGPASSWORD="$DB_PASS" psql -h localhost -U $DB_USER -d $DB_NAME -f "$schema" 2>&1 | tail -1 || true
    fi
done
echo "✓ Миграции применены"
echo ""

# PM2 запуск
echo "▶ Запуск через PM2..."
pm2 delete kamchatour-hub 2>/dev/null || true
pm2 start npm --name kamchatour-hub -- start
pm2 save
pm2 startup | grep -v "PM2" | bash 2>/dev/null || true
echo "✓ PM2 запущен"
echo ""

# Nginx конфиг
echo "▶ Настройка Nginx..."
cat > /etc/nginx/sites-available/kamchatour << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    access_log /var/log/nginx/kamchatour_access.log;
    error_log /var/log/nginx/kamchatour_error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:3002;
        add_header Cache-Control "public, max-age=3600, immutable";
    }
}
NGINXEOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo "✓ Nginx настроен"
echo ""

# Firewall
echo "▶ Настройка firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp > /dev/null 2>&1
    ufw allow 80/tcp > /dev/null 2>&1
    ufw allow 443/tcp > /dev/null 2>&1
    ufw --force enable > /dev/null 2>&1
    echo "✓ UFW настроен"
else
    echo "⚠️  UFW не установлен"
fi
echo ""

# Статус
echo "▶ Проверка статуса..."
sleep 2
pm2 status
echo ""

# Итог
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "============================================"
echo "✅ ДЕПЛОЙ ЗАВЕРШЕН!"
echo "============================================"
echo ""
echo "🌐 Приложение: http://$SERVER_IP"
echo ""
echo "⚠️  ВАЖНО: Заполните API ключи!"
echo ""
echo "1. Подключитесь к серверу:"
echo "   ssh root@$SERVER_IP"
echo ""
echo "2. Отредактируйте .env:"
echo "   nano /var/www/kamchatour/.env"
echo ""
echo "3. Заполните:"
echo "   - YANDEX_MAPS_API_KEY"
echo "   - GROQ_API_KEY"
echo "   - DEEPSEEK_API_KEY"
echo ""
echo "4. Перезапустите:"
echo "   pm2 restart kamchatour-hub"
echo ""
echo "📊 База данных:"
echo "   DB: $DB_NAME"
echo "   User: $DB_USER"
echo "   Pass: $DB_PASS"
echo ""
echo "🔧 Команды:"
echo "   pm2 status       - статус"
echo "   pm2 logs         - логи"
echo "   pm2 monit        - мониторинг"
echo ""
echo "🎉 Готово!"

REMOTE_SCRIPT

echo ""
echo "============================================"
echo "✅ ДЕПЛОЙ ЗАВЕРШЕН!"
echo "============================================"
echo ""
echo "Приложение доступно: http://$SERVER"
echo ""
echo "⚠️  Не забудьте заполнить API ключи!"
echo ""
echo "Инструкция: ДЕПЛОЙ_НА_147.45.158.166.md"
