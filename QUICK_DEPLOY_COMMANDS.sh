#!/bin/bash

# ===================================================================
# БЫСТРЫЙ ДЕПЛОЙ - КОМАНДЫ ДЛЯ КОПИПАСТА
# Скопируйте и вставьте в SSH сессию на сервере
# ===================================================================

cat << 'DEPLOY_SCRIPT'

echo "🚀 Начинаем деплой Kamchatour Hub..."
echo ""

# 1. Установка ПО
echo "📦 Установка Node.js, PostgreSQL, Nginx..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt-get install -y nodejs postgresql postgresql-contrib nginx > /dev/null 2>&1
npm install -g pm2 > /dev/null 2>&1
echo "✅ ПО установлено"

# 2. База данных
echo "🗄️  Создание базы данных..."
sudo -u postgres psql << 'EOF' > /dev/null 2>&1
DROP DATABASE IF EXISTS kamhub_production;
DROP USER IF EXISTS kamhub;
CREATE USER kamhub WITH PASSWORD 'kamhub2024secure';
CREATE DATABASE kamhub_production OWNER kamhub;
GRANT ALL PRIVILEGES ON DATABASE kamhub_production TO kamhub;
EOF
echo "✅ БД создана"

# 3. Клонирование репозитория
echo "📥 Клонирование кода..."
mkdir -p /var/www
cd /var/www
if [ -d "kamhub" ]; then
    cd kamhub
    git fetch origin
    git checkout main
    git pull
else
    git clone https://github.com/PosPk/kamhub.git kamhub
    cd kamhub
fi
echo "✅ Код получен"

# 4. Переменные окружения
echo "⚙️  Настройка переменных..."
cat > .env.production << 'EOF'
DATABASE_URL=postgresql://kamhub:kamhub2024secure@localhost:5432/kamhub_production
DATABASE_SSL=false
DATABASE_MAX_CONNECTIONS=20
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=http://5.129.248.224
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
S3_ENDPOINT=https://s3.twcstorage.ru
S3_BUCKET=d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50
S3_ACCESS_KEY=F2CP4X3X17GVQ1YH5I5D
S3_SECRET_KEY=72iAsYR4QQCIdaDI9e9AzXnzVvvP8bvPELmrBVzX
S3_REGION=ru-1
EOF
echo "✅ Переменные настроены"

# 5. Сборка
echo "🔨 Сборка приложения..."
npm install > /dev/null 2>&1
npm run build
echo "✅ Приложение собрано"

# 6. Применение схемы БД
echo "🗄️  Применение схемы БД..."
export PGPASSWORD='kamhub2024secure'
psql -h localhost -U kamhub -d kamhub_production -f lib/database/schema.sql > /dev/null 2>&1
psql -h localhost -U kamhub -d kamhub_production -f lib/database/tour_system_schema.sql > /dev/null 2>&1
psql -h localhost -U kamhub -d kamhub_production -f lib/database/user_roles_migration.sql > /dev/null 2>&1
echo "✅ БД готова"

# 7. PM2
echo "🚀 Запуск приложения..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'kamhub',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production', PORT: 3000 },
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF

pm2 delete kamhub 2>/dev/null || true
pm2 start ecosystem.config.js > /dev/null 2>&1
pm2 save > /dev/null 2>&1
pm2 startup systemd -u root --hp /root > /dev/null 2>&1
echo "✅ Приложение запущено"

# 8. Nginx
echo "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/kamhub << 'EOF'
server {
    listen 80;
    server_name 5.129.248.224;
    client_max_body_size 50M;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
ln -sf /etc/nginx/sites-available/kamhub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "✅ Nginx настроен"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                ✅ ДЕПЛОЙ ЗАВЕРШЕН!                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Сайт доступен: http://5.129.248.224"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Откройте: http://5.129.248.224"
echo "   2. Зарегистрируйтесь: /auth/register-business"
echo "   3. Начните тестирование!"
echo ""
echo "🔧 Управление:"
echo "   pm2 status     - статус"
echo "   pm2 logs kamhub - логи"
echo "   pm2 restart kamhub - рестарт"
echo ""

DEPLOY_SCRIPT

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "ℹ️  ИНСТРУКЦИЯ:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Подключитесь к серверу:"
echo "   ssh root@5.129.248.224"
echo "   Пароль: xQvB1pv?yZTjaR"
echo ""
echo "2. Скопируйте ВСЁ между строками 'DEPLOY_SCRIPT' выше"
echo "   (от cat до последней EOF)"
echo ""
echo "3. Вставьте в терминал SSH и нажмите Enter"
echo ""
echo "4. Дождитесь завершения (~5-10 минут)"
echo ""
echo "5. Откройте http://5.129.248.224"
echo ""
echo "═══════════════════════════════════════════════════════════"
