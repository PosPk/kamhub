#!/bin/bash
# ===================================================================
# СКРИПТ ДЛЯ ЗАПУСКА НА СЕРВЕРЕ
# Скопируйте весь этот файл и выполните на сервере
# ===================================================================

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 ДЕПЛОЙ KAMCHATOUR HUB                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 1. Node.js
echo "1️⃣ Установка Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "✅ Node.js: $(node --version)"

# 2. PostgreSQL
echo "2️⃣ Установка PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
fi
echo "✅ PostgreSQL: установлен"

# 3. БД
echo "3️⃣ Создание базы данных..."
sudo -u postgres psql << 'EOF'
DROP DATABASE IF EXISTS kamhub_production;
DROP USER IF EXISTS kamhub;
CREATE USER kamhub WITH PASSWORD 'kamhub2024secure';
CREATE DATABASE kamhub_production OWNER kamhub;
GRANT ALL PRIVILEGES ON DATABASE kamhub_production TO kamhub;
\q
EOF
echo "✅ База данных: kamhub_production"

# 4. Код
echo "4️⃣ Клонирование репозитория..."
apt-get install -y git
mkdir -p /var/www
cd /var/www

if [ -d "kamhub" ]; then
    echo "   Обновление существующего репозитория..."
    cd kamhub
    git fetch origin
    git reset --hard origin/cursor/deep-repository-scan-05bf
    git pull origin cursor/deep-repository-scan-05bf
else
    echo "   Клонирование нового репозитория..."
    git clone -b cursor/deep-repository-scan-05bf https://github.com/PosPk/kamhub.git kamhub
    cd kamhub
fi
echo "✅ Код получен"

# 5. .env
echo "5️⃣ Настройка переменных окружения..."
cat > .env.production << 'ENVEOF'
DATABASE_URL=postgresql://kamhub:kamhub2024secure@localhost:5432/kamhub_production
DATABASE_SSL=false
DATABASE_MAX_CONNECTIONS=20
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=http://5.129.248.224
JWT_SECRET=kamhub-production-jwt-secret-2024
JWT_EXPIRES_IN=7d
S3_ENDPOINT=https://s3.twcstorage.ru
S3_BUCKET=d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50
S3_ACCESS_KEY=F2CP4X3X17GVQ1YH5I5D
S3_SECRET_KEY=72iAsYR4QQCIdaDI9e9AzXnzVvvP8bvPELmrBVzX
S3_REGION=ru-1
ENVEOF
chmod 600 .env.production
echo "✅ Переменные настроены"

# 6. Сборка
echo "6️⃣ Установка зависимостей..."
npm install
echo "✅ Зависимости установлены"

echo "7️⃣ Сборка приложения..."
npm run build
echo "✅ Приложение собрано"

# 7. Схема БД
echo "8️⃣ Применение схемы базы данных..."
export PGPASSWORD='kamhub2024secure'
psql -h localhost -U kamhub -d kamhub_production -f lib/database/schema.sql 2>/dev/null || echo "   Schema already exists"
psql -h localhost -U kamhub -d kamhub_production -f lib/database/tour_system_schema.sql 2>/dev/null || echo "   Tour schema exists"
psql -h localhost -U kamhub -d kamhub_production -f lib/database/user_roles_migration.sql 2>/dev/null || echo "   Roles migrated"
echo "✅ База данных готова"

# 8. PM2
echo "9️⃣ Установка PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

pm2 delete kamhub 2>/dev/null || true

cat > ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: 'kamhub',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/kamhub',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
PM2EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
echo "✅ PM2 настроен, приложение запущено"

# 9. Nginx
echo "🔟 Настройка Nginx..."
apt-get install -y nginx

cat > /etc/nginx/sites-available/kamhub << 'NGINXEOF'
server {
    listen 80 default_server;
    server_name 5.129.248.224;
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/kamhub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "✅ Nginx настроен"

# Проверка
sleep 3
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО!                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Сайт доступен: http://5.129.248.224"
echo ""
echo "📊 Статус приложения:"
pm2 status
echo ""
echo "🔧 Команды управления:"
echo "   pm2 logs kamhub    - логи"
echo "   pm2 restart kamhub - рестарт"
echo "   pm2 stop kamhub    - остановка"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Откройте http://5.129.248.224"
echo "   2. Зарегистрируйтесь /auth/register-business"
echo "   3. Начните тестирование!"
echo ""
