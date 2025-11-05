#!/bin/bash

# =====================================================
# ПОЛНОЕ РАЗВЕРТЫВАНИЕ KAMCHATOUR HUB
# Timeweb Cloud Production Deployment
# =====================================================

set -e  # Exit on error

echo "🚀 Kamchatour Hub - Production Deployment"
echo "=========================================="
echo ""

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Конфигурация
APP_NAME="kamchatour-hub"
APP_DIR="/var/www/kamchatour-hub"
DOMAIN="your-domain.com"  # ИЗМЕНИТЬ!
NODE_VERSION="20"
PM2_INSTANCES=2

echo -e "${YELLOW}⚠️  ВАЖНО: Перед запуском убедитесь что вы изменили:${NC}"
echo "   1. DOMAIN в этом скрипте"
echo "   2. DATABASE_URL в .env.production"
echo "   3. API ключи в .env.production"
echo ""
read -p "Продолжить? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Отменено."
    exit 0
fi

# =====================================================
# 1. УСТАНОВКА СИСТЕМНЫХ ЗАВИСИМОСТЕЙ
# =====================================================

echo ""
echo "📦 Шаг 1: Установка системных зависимостей..."

# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js 20
if ! command -v node &> /dev/null; then
    echo "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt install -y nginx
fi

# Install PostgreSQL client (for management)
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL client..."
    sudo apt install -y postgresql-client
fi

# Install certbot for SSL
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
fi

echo -e "${GREEN}✅ Системные зависимости установлены${NC}"

# =====================================================
# 2. СОЗДАНИЕ ДИРЕКТОРИИ ПРОЕКТА
# =====================================================

echo ""
echo "📁 Шаг 2: Создание директории проекта..."

# Создаем директорию
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

echo -e "${GREEN}✅ Директория создана: $APP_DIR${NC}"

# =====================================================
# 3. КЛОНИРОВАНИЕ/КОПИРОВАНИЕ КОДА
# =====================================================

echo ""
echo "📥 Шаг 3: Копирование кода..."

# Если запущено из проекта, копируем файлы
if [ -f "package.json" ]; then
    echo "Копирование файлов из текущей директории..."
    rsync -av --progress \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.git' \
        --exclude 'backups' \
        --exclude '*.log' \
        ./ $APP_DIR/
    
    echo -e "${GREEN}✅ Файлы скопированы${NC}"
else
    echo -e "${RED}❌ Ошибка: package.json не найден${NC}"
    echo "Запустите скрипт из корневой директории проекта"
    exit 1
fi

# Переходим в директорию проекта
cd $APP_DIR

# =====================================================
# 4. НАСТРОЙКА ENVIRONMENT
# =====================================================

echo ""
echo "🔧 Шаг 4: Настройка environment..."

# Создаем .env.production если не существует
if [ ! -f ".env.production" ]; then
    echo "Создание .env.production..."
    cat > .env.production << 'EOF'
# Kamchatour Hub - Production Environment

# Node Environment
NODE_ENV=production
PORT=3000

# Database (Timeweb Cloud PostgreSQL)
DATABASE_URL="postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require"
DATABASE_SSL=true
DATABASE_MAX_CONNECTIONS=20

# JWT
JWT_SECRET=CHANGE_ME_TO_RANDOM_SECRET_KEY_HERE
JWT_EXPIRES_IN=7d

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com

# AI APIs
GROQ_API_KEY=
DEEPSEEK_API_KEY=
OPENROUTER_API_KEY=

# Payments
CLOUDPAYMENTS_PUBLIC_ID=
CLOUDPAYMENTS_API_SECRET=

# Maps
YANDEX_MAPS_API_KEY=
YANDEX_WEATHER_API_KEY=

# Notifications
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@kamchatour.ru

# SMS
SMS_RU_API_ID=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Security
CRON_SECRET=CHANGE_ME_TO_RANDOM_SECRET

# Rate Limiting
REDIS_URL=redis://localhost:6379
EOF
    
    echo -e "${YELLOW}⚠️  ВАЖНО: Отредактируйте .env.production с реальными данными!${NC}"
    echo "   nano .env.production"
fi

echo -e "${GREEN}✅ Environment настроен${NC}"

# =====================================================
# 5. УСТАНОВКА ЗАВИСИМОСТЕЙ И СБОРКА
# =====================================================

echo ""
echo "📦 Шаг 5: Установка зависимостей и сборка..."

# Установка зависимостей
echo "Установка npm пакетов..."
npm ci --production=false

# Сборка проекта
echo "Сборка Next.js приложения..."
npm run build

# Очистка dev зависимостей
echo "Очистка dev зависимостей..."
npm prune --production

echo -e "${GREEN}✅ Проект собран${NC}"

# =====================================================
# 6. НАСТРОЙКА PM2
# =====================================================

echo ""
echo "⚙️  Шаг 6: Настройка PM2..."

# Создаем ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    instances: $PM2_INSTANCES,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Создаем директорию для логов
mkdir -p logs

# Запускаем PM2
echo "Запуск приложения через PM2..."
pm2 start ecosystem.config.js

# Настройка автозапуска
pm2 startup systemd -u $USER --hp /home/$USER
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
pm2 save

echo -e "${GREEN}✅ PM2 настроен и запущен${NC}"

# =====================================================
# 7. НАСТРОЙКА NGINX
# =====================================================

echo ""
echo "🌐 Шаг 7: Настройка Nginx..."

# Создаем конфигурацию Nginx
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOF
# Kamchatour Hub - Nginx Configuration
# Domain: $DOMAIN

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL certificates (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Logging
    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Client max body size
    client_max_body_size 10M;
    
    # Proxy to Next.js
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }
    
    # Public files
    location /public {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF

# Включаем конфигурацию
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Удаляем default конфигурацию
sudo rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
sudo nginx -t

# Перезапускаем Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo -e "${GREEN}✅ Nginx настроен${NC}"

# =====================================================
# 8. НАСТРОЙКА SSL (Let's Encrypt)
# =====================================================

echo ""
echo "🔒 Шаг 8: Настройка SSL..."

# Создаем директорию для certbot
sudo mkdir -p /var/www/certbot

echo -e "${YELLOW}Запуск certbot для получения SSL сертификата...${NC}"
echo "Введите ваш email для уведомлений:"
read -p "Email: " EMAIL

sudo certbot --nginx \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --redirect

# Настройка автообновления сертификата
sudo systemctl enable certbot.timer

echo -e "${GREEN}✅ SSL настроен${NC}"

# =====================================================
# 9. НАСТРОЙКА FIREWALL
# =====================================================

echo ""
echo "🛡️  Шаг 9: Настройка firewall..."

# Настройка UFW
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw allow 3000  # Next.js (опционально, для дебага)
    sudo ufw status
    
    echo -e "${GREEN}✅ Firewall настроен${NC}"
else
    echo -e "${YELLOW}⚠️  UFW не установлен, пропускаем${NC}"
fi

# =====================================================
# 10. НАСТРОЙКА CRON JOBS
# =====================================================

echo ""
echo "⏰ Шаг 10: Настройка cron jobs..."

# Добавляем cron job для cleanup
(crontab -l 2>/dev/null; echo "* * * * * curl -H 'X-Cron-Secret: YOUR_CRON_SECRET' https://$DOMAIN/api/cron/cleanup-holds") | crontab -

# Добавляем backup job
(crontab -l 2>/dev/null; echo "0 3 * * * cd $APP_DIR && bash scripts/backup-db.sh") | crontab -

echo -e "${GREEN}✅ Cron jobs настроены${NC}"

# =====================================================
# 11. ПРОВЕРКА ДЕПЛОЯ
# =====================================================

echo ""
echo "🔍 Шаг 11: Проверка деплоя..."

# Проверка PM2
echo "PM2 status:"
pm2 status

# Проверка Nginx
echo ""
echo "Nginx status:"
sudo systemctl status nginx --no-pager

# Проверка портов
echo ""
echo "Открытые порты:"
sudo netstat -tlnp | grep -E ':(80|443|3000)'

# Проверка доступности
echo ""
echo "Проверка доступности..."
sleep 3
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Приложение отвечает на localhost:3000${NC}"
else
    echo -e "${RED}❌ Приложение не отвечает на localhost:3000${NC}"
fi

# =====================================================
# 12. ФИНАЛЬНЫЕ ИНСТРУКЦИИ
# =====================================================

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  🎉 ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО!                  ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "📋 Информация о деплое:"
echo "   • Приложение: $APP_NAME"
echo "   • Директория: $APP_DIR"
echo "   • Домен: https://$DOMAIN"
echo "   • Порт: 3000"
echo "   • PM2 instances: $PM2_INSTANCES"
echo ""
echo "📝 Полезные команды:"
echo "   • Просмотр логов:     pm2 logs $APP_NAME"
echo "   • Рестарт:            pm2 restart $APP_NAME"
echo "   • Остановка:          pm2 stop $APP_NAME"
echo "   • Статус:             pm2 status"
echo "   • Nginx логи:         sudo tail -f /var/log/nginx/${APP_NAME}_error.log"
echo "   • Перезапуск Nginx:   sudo systemctl restart nginx"
echo ""
echo "🔧 Что нужно сделать вручную:"
echo "   1. Отредактировать .env.production:"
echo "      nano $APP_DIR/.env.production"
echo ""
echo "   2. Добавить API ключи (GROQ, CloudPayments, и т.д.)"
echo ""
echo "   3. Изменить JWT_SECRET и CRON_SECRET"
echo ""
echo "   4. Проверить работу сайта:"
echo "      https://$DOMAIN"
echo ""
echo "   5. Проверить API:"
echo "      curl https://$DOMAIN/api/health/db"
echo ""
echo "   6. Настроить мониторинг (Sentry)"
echo ""
echo "🚀 Сайт доступен по адресу: https://$DOMAIN"
echo ""
echo "📚 Документация: $APP_DIR/DEPLOYMENT_SUCCESS_REPORT.md"
echo ""
echo "✅ Готово!"
