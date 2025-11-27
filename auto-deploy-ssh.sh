#!/bin/bash

###############################################################################
# KAMHUB - АВТОМАТИЧЕСКИЙ ДЕПЛОЙ ЧЕРЕЗ SSH С ПАРОЛЕМ
# Сервер: 147.45.158.166
###############################################################################

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_step() { echo -e "${BLUE}▶${NC} $1"; }

echo "🚀 KAMHUB - Автоматический деплой через SSH"
echo "=============================================="
echo ""

# ===================================
# НАСТРОЙКИ СЕРВЕРА
# ===================================
SERVER_IP="147.45.158.166"
SERVER_USER="root"
SERVER_PASS="eiGo@VK4.,,VH7"
SERVER_PORT="22"
PROJECT_DIR="/var/www/kamchatour"

log_info "Сервер: $SERVER_USER@$SERVER_IP"
echo ""

# ===================================
# ПРОВЕРКА ЗАВИСИМОСТЕЙ
# ===================================
log_step "Проверка зависимостей..."

if ! command -v sshpass &> /dev/null; then
    log_error "sshpass не установлен"
    echo "Установите его: sudo apt install sshpass"
    exit 1
fi

if ! command -v ssh &> /dev/null; then
    log_error "ssh не установлен"
    exit 1
fi

log_info "Все зависимости установлены"
echo ""

# ===================================
# ФУНКЦИЯ SSH КОМАНДЫ
# ===================================
ssh_exec() {
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no -p $SERVER_PORT $SERVER_USER@$SERVER_IP "$@"
}

# ===================================
# ПРОВЕРКА ПОДКЛЮЧЕНИЯ
# ===================================
log_step "Проверка подключения к серверу..."

if ssh_exec "echo 'OK'" &> /dev/null; then
    log_info "Подключение успешно"
else
    log_error "Не удалось подключиться к серверу"
    echo "Проверьте:"
    echo "  - IP: $SERVER_IP"
    echo "  - Пароль: $SERVER_PASS"
    echo "  - Порт: $SERVER_PORT"
    exit 1
fi
echo ""

# ===================================
# ПРОВЕРКА ОС НА СЕРВЕРЕ
# ===================================
log_step "Проверка операционной системы..."

OS_INFO=$(ssh_exec "cat /etc/os-release | grep PRETTY_NAME" 2>/dev/null || echo "Unknown")
log_info "ОС: $OS_INFO"
echo ""

# ===================================
# ОБНОВЛЕНИЕ СИСТЕМЫ
# ===================================
log_step "Обновление системы..."

ssh_exec "export DEBIAN_FRONTEND=noninteractive && apt-get update -qq && apt-get upgrade -y -qq" 2>/dev/null || log_warn "Не удалось обновить систему (возможно не Debian/Ubuntu)"
log_info "Система обновлена"
echo ""

# ===================================
# УСТАНОВКА NODE.JS 20
# ===================================
log_step "Установка Node.js 20..."

NODE_VERSION=$(ssh_exec "node -v 2>/dev/null || echo 'none'")
if [[ "$NODE_VERSION" =~ ^v20 ]]; then
    log_info "Node.js $NODE_VERSION уже установлен"
else
    log_info "Устанавливаю Node.js 20..."
    ssh_exec "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs" 2>&1 | grep -v "^#" || true
    NODE_VERSION=$(ssh_exec "node -v")
    log_info "Node.js $NODE_VERSION установлен"
fi
echo ""

# ===================================
# УСТАНОВКА POSTGRESQL
# ===================================
log_step "Установка PostgreSQL..."

if ssh_exec "command -v psql &> /dev/null"; then
    log_info "PostgreSQL уже установлен"
else
    log_info "Устанавливаю PostgreSQL..."
    ssh_exec "apt-get install -y postgresql postgresql-contrib && systemctl start postgresql && systemctl enable postgresql" 2>&1 | tail -3
    log_info "PostgreSQL установлен"
fi
echo ""

# ===================================
# НАСТРОЙКА БАЗЫ ДАННЫХ
# ===================================
log_step "Настройка базы данных..."

DB_NAME="kamchatour"
DB_USER="kamuser"
DB_PASS=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)

# Проверка существования БД
DB_EXISTS=$(ssh_exec "sudo -u postgres psql -tAc \"SELECT 1 FROM pg_database WHERE datname='$DB_NAME'\"" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" = "1" ]; then
    log_info "База данных $DB_NAME уже существует"
else
    log_info "Создаю базу данных $DB_NAME..."
    ssh_exec "sudo -u postgres psql -c \"CREATE DATABASE $DB_NAME;\"" 2>&1 | tail -1
    ssh_exec "sudo -u postgres psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';\"" 2>&1 | tail -1
    ssh_exec "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;\"" 2>&1 | tail -1
    ssh_exec "sudo -u postgres psql -d $DB_NAME -c \"CREATE EXTENSION IF NOT EXISTS \\\"uuid-ossp\\\";\"" 2>&1 | tail -1
    ssh_exec "sudo -u postgres psql -d $DB_NAME -c \"CREATE EXTENSION IF NOT EXISTS postgis;\"" 2>&1 | tail -1 || log_warn "PostGIS может быть недоступен"
    log_info "База данных создана"
fi

echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME" > /tmp/kamhub_db_credentials.txt
log_info "Данные БД сохранены в: /tmp/kamhub_db_credentials.txt"
echo ""

# ===================================
# УСТАНОВКА NGINX
# ===================================
log_step "Установка Nginx..."

if ssh_exec "command -v nginx &> /dev/null"; then
    log_info "Nginx уже установлен"
else
    log_info "Устанавливаю Nginx..."
    ssh_exec "apt-get install -y nginx && systemctl start nginx && systemctl enable nginx" 2>&1 | tail -3
    log_info "Nginx установлен"
fi
echo ""

# ===================================
# УСТАНОВКА PM2
# ===================================
log_step "Установка PM2..."

if ssh_exec "command -v pm2 &> /dev/null"; then
    log_info "PM2 уже установлен"
else
    log_info "Устанавливаю PM2..."
    ssh_exec "npm install -g pm2" 2>&1 | tail -3
    log_info "PM2 установлен"
fi
echo ""

# ===================================
# КЛОНИРОВАНИЕ ПРОЕКТА
# ===================================
log_step "Клонирование проекта..."

if ssh_exec "[ -d $PROJECT_DIR ]"; then
    log_warn "Проект уже существует, обновляю..."
    ssh_exec "cd $PROJECT_DIR && git pull origin main" 2>&1 | tail -3 || log_warn "Обновление не удалось"
else
    log_info "Клонирую репозиторий..."
    ssh_exec "mkdir -p /var/www && cd /var/www && git clone https://github.com/PosPk/kamhub.git kamchatour" 2>&1 | tail -3
    log_info "Проект клонирован"
fi
echo ""

# ===================================
# СОЗДАНИЕ .env ФАЙЛА
# ===================================
log_step "Создание .env файла..."

JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

ssh_exec "cat > $PROJECT_DIR/.env << 'ENVEOF'
# ===================================
# DATABASE
# ===================================
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
DATABASE_SSL=false
DATABASE_MAX_CONNECTIONS=20

# ===================================
# NEXT.JS
# ===================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://$SERVER_IP:3002
PORT=3002

# ===================================
# SECURITY
# ===================================
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
SESSION_SECRET=$SESSION_SECRET

# ===================================
# YANDEX SERVICES (КРИТИЧНО!)
# ===================================
# TODO: Добавьте ваш ключ от https://developer.tech.yandex.ru/
YANDEX_MAPS_API_KEY=

# Yandex Weather API (уже настроен)
YANDEX_WEATHER_API_KEY=8f6b0a53-135f-4217-8de1-de98c1316cc0

# ===================================
# AI SERVICES (хотя бы один!)
# ===================================
# TODO: Добавьте ключи от https://console.groq.com/ и https://platform.deepseek.com/
GROQ_API_KEY=
DEEPSEEK_API_KEY=
OPENROUTER_API_KEY=

# ===================================
# CLOUDPAYMENTS (опционально)
# ===================================
CLOUDPAYMENTS_PUBLIC_ID=
CLOUDPAYMENTS_API_SECRET=

# ===================================
# NOTIFICATIONS (опционально)
# ===================================
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@kamchatour.ru

SMS_RU_API_ID=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# ===================================
# MONITORING (опционально)
# ===================================
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
ENVEOF
"

log_info ".env файл создан"
echo ""

# ===================================
# УСТАНОВКА ЗАВИСИМОСТЕЙ
# ===================================
log_step "Установка зависимостей..."

ssh_exec "cd $PROJECT_DIR && npm install --production=false" 2>&1 | tail -5
log_info "Зависимости установлены"
echo ""

# ===================================
# СБОРКА ПРОЕКТА
# ===================================
log_step "Сборка проекта..."

ssh_exec "cd $PROJECT_DIR && npm run build" 2>&1 | tail -10
log_info "Проект собран"
echo ""

# ===================================
# ПРИМЕНЕНИЕ МИГРАЦИЙ
# ===================================
log_step "Применение миграций базы данных..."

if ssh_exec "[ -f $PROJECT_DIR/lib/database/schema.sql ]"; then
    ssh_exec "PGPASSWORD='$DB_PASS' psql -h localhost -U $DB_USER -d $DB_NAME -f $PROJECT_DIR/lib/database/schema.sql" 2>&1 | tail -3 || log_warn "Схема уже применена"
fi

if ssh_exec "[ -f $PROJECT_DIR/lib/database/transfer_operator_schema.sql ]"; then
    ssh_exec "PGPASSWORD='$DB_PASS' psql -h localhost -U $DB_USER -d $DB_NAME -f $PROJECT_DIR/lib/database/transfer_operator_schema.sql" 2>&1 | tail -3 || log_warn "Transfer схема уже применена"
fi

if ssh_exec "[ -f $PROJECT_DIR/lib/database/sos_schema.sql ]"; then
    ssh_exec "PGPASSWORD='$DB_PASS' psql -h localhost -U $DB_USER -d $DB_NAME -f $PROJECT_DIR/lib/database/sos_schema.sql" 2>&1 | tail -3 || log_warn "SOS схема уже применена"
fi

log_info "Миграции применены"
echo ""

# ===================================
# ЗАПУСК ЧЕРЕЗ PM2
# ===================================
log_step "Запуск приложения через PM2..."

ssh_exec "cd $PROJECT_DIR && pm2 delete kamchatour-hub 2>/dev/null || true"
ssh_exec "cd $PROJECT_DIR && pm2 start npm --name kamchatour-hub -- start"
ssh_exec "pm2 save"
ssh_exec "pm2 startup | grep -v 'PM2' | bash" 2>/dev/null || log_warn "PM2 startup уже настроен"

log_info "Приложение запущено"
echo ""

# ===================================
# НАСТРОЙКА NGINX
# ===================================
log_step "Настройка Nginx..."

ssh_exec "cat > /etc/nginx/sites-available/kamchatour << 'NGINXEOF'
server {
    listen 80;
    server_name $SERVER_IP;

    # Security headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;

    # Логи
    access_log /var/log/nginx/kamchatour_access.log;
    error_log /var/log/nginx/kamchatour_error.log;

    client_max_body_size 10M;

    # Proxy к Next.js
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Статические файлы
    location /_next/static {
        proxy_pass http://127.0.0.1:3002;
        add_header Cache-Control \"public, max-age=3600, immutable\";
    }
}
NGINXEOF
"

ssh_exec "rm -f /etc/nginx/sites-enabled/default"
ssh_exec "ln -sf /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/"
ssh_exec "nginx -t && systemctl reload nginx" 2>&1 | tail -2

log_info "Nginx настроен"
echo ""

# ===================================
# НАСТРОЙКА FIREWALL
# ===================================
log_step "Настройка firewall..."

if ssh_exec "command -v ufw &> /dev/null"; then
    ssh_exec "ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable" 2>&1 | tail -3
    log_info "UFW настроен"
else
    log_warn "UFW не установлен, пропускаю"
fi
echo ""

# ===================================
# ПРОВЕРКА СТАТУСА
# ===================================
log_step "Проверка статуса приложения..."

sleep 3

PM2_STATUS=$(ssh_exec "pm2 status kamchatour-hub | grep kamchatour-hub")
echo "$PM2_STATUS"
echo ""

# ===================================
# ИТОГОВАЯ ИНФОРМАЦИЯ
# ===================================
echo ""
echo "============================================"
echo -e "${GREEN}✅ ДЕПЛОЙ ЗАВЕРШЕН!${NC}"
echo "============================================"
echo ""
echo "📊 Информация о сервере:"
echo "  IP адрес:     $SERVER_IP"
echo "  База данных:  $DB_NAME"
echo "  DB User:      $DB_USER"
echo "  DB Password:  $DB_PASS"
echo ""
echo "🌐 Приложение доступно по адресу:"
echo "  http://$SERVER_IP"
echo ""
echo "⚠️  ВАЖНО: Заполните API ключи в .env файле!"
echo ""
echo "Подключитесь к серверу:"
echo "  sshpass -p '$SERVER_PASS' ssh $SERVER_USER@$SERVER_IP"
echo ""
echo "Отредактируйте .env:"
echo "  nano $PROJECT_DIR/.env"
echo ""
echo "Заполните обязательные поля:"
echo "  - YANDEX_MAPS_API_KEY     (https://developer.tech.yandex.ru/)"
echo "  - GROQ_API_KEY            (https://console.groq.com/)"
echo "  - DEEPSEEK_API_KEY        (https://platform.deepseek.com/)"
echo ""
echo "После заполнения перезапустите:"
echo "  pm2 restart kamchatour-hub"
echo ""
echo "📝 Полезные команды:"
echo "  pm2 status                - статус приложения"
echo "  pm2 logs kamchatour-hub   - логи"
echo "  pm2 monit                 - мониторинг"
echo ""
echo "🔧 Данные БД сохранены в: /tmp/kamhub_db_credentials.txt"
echo ""
log_info "Готово! 🎉"
