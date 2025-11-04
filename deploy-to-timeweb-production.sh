#!/bin/bash

# ===================================================================
# АВТОМАТИЧЕСКИЙ ДЕПЛОЙ НА TIMEWEB CLOUD VPS
# Kamchatour Hub - Production Deployment
# ===================================================================

set -e

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 ДЕПЛОЙ НА TIMEWEB CLOUD VPS                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Данные сервера
SERVER_IP="5.129.248.224"
SERVER_USER="root"
APP_NAME="kamhub"
APP_DIR="/var/www/$APP_NAME"
DOMAIN="kamhub.ru"  # Измените на ваш домен

# Функции вывода
step() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Проверка SSH ключа
echo "═══════════════════════════════════════════════════════════════"
echo "1️⃣  ПРОВЕРКА SSH ПОДКЛЮЧЕНИЯ"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo 'SSH OK'" &> /dev/null; then
    step "SSH подключение работает"
else
    error "Не удалось подключиться по SSH"
    echo ""
    echo "Используйте пароль для подключения:"
    echo "Пароль: xQvB1pv?yZTjaR"
    echo ""
    echo "Или настройте SSH ключ:"
    echo "ssh-copy-id $SERVER_USER@$SERVER_IP"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "2️⃣  НАСТРОЙКА СЕРВЕРА"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Создаем скрипт для выполнения на сервере
cat > /tmp/setup-server.sh << 'SETUP_SCRIPT'
#!/bin/bash

set -e

echo "📦 Установка необходимых пакетов..."

# Обновление системы
apt-get update -qq
apt-get upgrade -y -qq

# Установка Node.js 20
if ! command -v node &> /dev/null; then
    echo "Установка Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# Установка PostgreSQL 15
if ! command -v psql &> /dev/null; then
    echo "Установка PostgreSQL 15..."
    apt-get install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
fi

echo "PostgreSQL: $(psql --version)"

# Установка Nginx
if ! command -v nginx &> /dev/null; then
    echo "Установка Nginx..."
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
fi

echo "Nginx: $(nginx -v 2>&1)"

# Установка PM2
if ! command -v pm2 &> /dev/null; then
    echo "Установка PM2..."
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
fi

echo "PM2: $(pm2 --version)"

# Установка Certbot (для SSL)
if ! command -v certbot &> /dev/null; then
    echo "Установка Certbot..."
    apt-get install -y certbot python3-certbot-nginx
fi

echo "Certbot: $(certbot --version)"

echo "✅ Все пакеты установлены!"
SETUP_SCRIPT

# Копируем и запускаем скрипт на сервере
scp -o StrictHostKeyChecking=no /tmp/setup-server.sh $SERVER_USER@$SERVER_IP:/tmp/
ssh $SERVER_USER@$SERVER_IP "bash /tmp/setup-server.sh"

step "Сервер настроен"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "3️⃣  НАСТРОЙКА БАЗЫ ДАННЫХ"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Генерируем случайный пароль для БД
DB_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=')

ssh $SERVER_USER@$SERVER_IP << DBSETUP
# Создание базы данных и пользователя
sudo -u postgres psql << 'EOF'
-- Удаляем если существует
DROP DATABASE IF EXISTS kamhub_production;
DROP USER IF EXISTS kamhub;

-- Создаем пользователя
CREATE USER kamhub WITH PASSWORD '$DB_PASSWORD';

-- Создаем базу данных
CREATE DATABASE kamhub_production OWNER kamhub;

-- Даем права
GRANT ALL PRIVILEGES ON DATABASE kamhub_production TO kamhub;

-- Выход
\q
EOF

echo "✅ База данных создана"
DBSETUP

step "PostgreSQL настроен"
info "База данных: kamhub_production"
info "Пользователь: kamhub"
info "Пароль: $DB_PASSWORD"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "4️⃣  ДЕПЛОЙ ПРИЛОЖЕНИЯ"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Создаем директорию для приложения
ssh $SERVER_USER@$SERVER_IP "mkdir -p $APP_DIR"

# Копируем файлы (исключая node_modules, .git, .next)
info "Копирование файлов на сервер..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next' \
  --exclude '.env*' \
  --exclude '*.log' \
  ./ $SERVER_USER@$SERVER_IP:$APP_DIR/

step "Файлы скопированы"

# Создаем .env файл на сервере
info "Настройка переменных окружения..."

# Генерируем JWT secret
JWT_SECRET=$(openssl rand -base64 32)

ssh $SERVER_USER@$SERVER_IP << ENVSETUP
cat > $APP_DIR/.env.production << 'EOF'
# Database
DATABASE_URL=postgresql://kamhub:$DB_PASSWORD@localhost:5432/kamhub_production
DATABASE_SSL=false
DATABASE_MAX_CONNECTIONS=20

# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://$DOMAIN

# Security
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Timeweb S3 Storage
S3_ENDPOINT=https://s3.twcstorage.ru
S3_BUCKET=d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50
S3_ACCESS_KEY=F2CP4X3X17GVQ1YH5I5D
S3_SECRET_KEY=72iAsYR4QQCIdaDI9e9AzXnzVvvP8bvPELmrBVzX
S3_REGION=ru-1

# Optional (can be added later)
GROQ_API_KEY=
CLOUDPAYMENTS_PUBLIC_ID=
CLOUDPAYMENTS_API_SECRET=
YANDEX_MAPS_API_KEY=
EOF

chmod 600 $APP_DIR/.env.production
ENVSETUP

step "Переменные окружения настроены"

# Установка зависимостей и сборка
info "Установка зависимостей..."
ssh $SERVER_USER@$SERVER_IP << BUILDAPP
cd $APP_DIR
export NODE_ENV=production

# Установка зависимостей
npm install --production=false

# Сборка приложения
npm run build

echo "✅ Приложение собрано"
BUILDAPP

step "Приложение собрано"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "5️⃣  ПРИМЕНЕНИЕ СХЕМЫ БАЗЫ ДАННЫХ"
echo "═══════════════════════════════════════════════════════════════"
echo ""

ssh $SERVER_USER@$SERVER_IP << DBMIGRATION
cd $APP_DIR

# Применяем схему БД
export PGPASSWORD='$DB_PASSWORD'
psql -h localhost -U kamhub -d kamhub_production -f lib/database/schema.sql
psql -h localhost -U kamhub -d kamhub_production -f lib/database/tour_system_schema.sql
psql -h localhost -U kamhub -d kamhub_production -f lib/database/user_roles_migration.sql

echo "✅ Схема БД применена"
DBMIGRATION

step "Схема базы данных применена"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "6️⃣  НАСТРОЙКА PM2"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Создаем конфигурацию PM2
ssh $SERVER_USER@$SERVER_IP << PM2SETUP
cd $APP_DIR

# Создаем ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'kamhub',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/kamhub/error.log',
    out_file: '/var/log/kamhub/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF

# Создаем директорию для логов
mkdir -p /var/log/kamhub

# Останавливаем если запущено
pm2 delete kamhub 2>/dev/null || true

# Запускаем приложение
pm2 start ecosystem.config.js
pm2 save

echo "✅ PM2 настроен и приложение запущено"
PM2SETUP

step "PM2 настроен"
step "Приложение запущено"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "7️⃣  НАСТРОЙКА NGINX"
echo "═══════════════════════════════════════════════════════════════"
echo ""

ssh $SERVER_USER@$SERVER_IP << NGINXSETUP
# Создаем конфигурацию Nginx
cat > /etc/nginx/sites-available/kamhub << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN $SERVER_IP;

    # Ограничение размера загружаемых файлов
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Статические файлы Next.js
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Публичные файлы
    location /public {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF

# Создаем симлинк
ln -sf /etc/nginx/sites-available/kamhub /etc/nginx/sites-enabled/

# Удаляем дефолтный сайт
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
nginx -t

# Перезагружаем Nginx
systemctl reload nginx

echo "✅ Nginx настроен"
NGINXSETUP

step "Nginx настроен"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "8️⃣  НАСТРОЙКА SSL (HTTPS)"
echo "═══════════════════════════════════════════════════════════════"
echo ""

warn "SSL сертификат нужно настроить вручную после привязки домена"
info "Команда для настройки SSL:"
echo "  ssh root@$SERVER_IP"
echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ ДЕПЛОЙ ЗАВЕРШЕН!                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 Приложение успешно задеплоено!"
echo ""
echo "📊 ИНФОРМАЦИЯ О ДЕПЛОЕ:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 URLs:"
echo "   HTTP:  http://$SERVER_IP"
echo "   HTTP:  http://$DOMAIN (после настройки DNS)"
echo "   HTTPS: https://$DOMAIN (после настройки SSL)"
echo ""
echo "🗄️  База данных:"
echo "   Host:     localhost"
echo "   Database: kamhub_production"
echo "   User:     kamhub"
echo "   Password: $DB_PASSWORD"
echo ""
echo "🔐 Безопасность:"
echo "   JWT Secret: $JWT_SECRET"
echo ""
echo "📂 Директория:"
echo "   $APP_DIR"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📋 СЛЕДУЮЩИЕ ШАГИ:"
echo ""
echo "1️⃣  Проверить сайт:"
echo "   curl http://$SERVER_IP"
echo "   Или откройте в браузере: http://$SERVER_IP"
echo ""
echo "2️⃣  Настроить DNS (если есть домен):"
echo "   A запись: $DOMAIN → $SERVER_IP"
echo "   A запись: www.$DOMAIN → $SERVER_IP"
echo ""
echo "3️⃣  Настроить SSL:"
echo "   ssh root@$SERVER_IP"
echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "4️⃣  Создать тестовые данные:"
echo "   ssh root@$SERVER_IP"
echo "   cd $APP_DIR"
echo "   npm run db:test:init"
echo "   tsx scripts/create-test-partner.ts"
echo ""
echo "5️⃣  Начать тестирование!"
echo "   Откройте сайт и зарегистрируйтесь"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🔧 ПОЛЕЗНЫЕ КОМАНДЫ:"
echo ""
echo "Подключиться к серверу:"
echo "  ssh root@$SERVER_IP"
echo ""
echo "Посмотреть логи приложения:"
echo "  pm2 logs kamhub"
echo ""
echo "Посмотреть статус:"
echo "  pm2 status"
echo ""
echo "Рестарт приложения:"
echo "  pm2 restart kamhub"
echo ""
echo "Обновить код (git pull и rebuild):"
echo "  ssh root@$SERVER_IP 'cd $APP_DIR && git pull && npm install && npm run build && pm2 restart kamhub'"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Сохраняем пароли в файл (локально)
cat > .deployment-info.txt << DEPLOYMENT_INFO
TIMEWEB CLOUD DEPLOYMENT INFO
Generated: $(date)

Server IP: $SERVER_IP
Domain: $DOMAIN

Database:
  Host: localhost
  Database: kamhub_production
  User: kamhub
  Password: $DB_PASSWORD

Security:
  JWT_SECRET: $JWT_SECRET

SSH:
  ssh root@$SERVER_IP

PM2:
  pm2 status
  pm2 logs kamhub
  pm2 restart kamhub

URLs:
  HTTP:  http://$SERVER_IP
  HTTP:  http://$DOMAIN
  HTTPS: https://$DOMAIN (after SSL setup)
DEPLOYMENT_INFO

step "Информация о деплое сохранена в .deployment-info.txt"
warn "⚠️  СОХРАНИТЕ ФАЙЛ .deployment-info.txt - в нем пароли!"

echo ""
echo "✅ Деплой завершен успешно!"
echo ""
