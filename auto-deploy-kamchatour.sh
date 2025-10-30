#!/bin/bash

# ============================================
# АВТОМАТИЧЕСКОЕ РАЗВЕРТЫВАНИЕ KAMCHATOUR HUB
# ============================================
# Дата: 30.10.2025
# Сервер: 45.8.96.120
# Это мастер-скрипт - запустите его на сервере!

set -e  # Остановка при ошибке

echo "🚀 АВТОМАТИЧЕСКОЕ РАЗВЕРТЫВАНИЕ KAMCHATOUR HUB"
echo "=============================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Переменные
APP_DIR="/var/www/kamchatour-hub"
REPO_URL="https://github.com/PosPk/kamhub.git"
BRANCH="cursor/study-timeweb-cloud-documentation-thoroughly-72f9"
APP_NAME="kamchatour-hub"

# Функция для вывода
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка root
if [ "$EUID" -ne 0 ]; then 
   log_error "Запустите скрипт с правами root: sudo bash auto-deploy-kamchatour.sh"
   exit 1
fi

echo "📋 ШАГ 1/10: Обновление системы"
echo "--------------------"
apt update
apt upgrade -y
log_info "Система обновлена"
echo ""

echo "📋 ШАГ 2/10: Установка Node.js 20"
echo "--------------------"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    log_info "Node.js установлен"
else
    log_info "Node.js уже установлен: $(node -v)"
fi
echo ""

echo "📋 ШАГ 3/10: Установка PM2"
echo "--------------------"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    log_info "PM2 установлен"
else
    log_info "PM2 уже установлен: $(pm2 -v)"
fi
echo ""

echo "📋 ШАГ 4/10: Установка Nginx"
echo "--------------------"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    log_info "Nginx установлен и запущен"
else
    log_info "Nginx уже установлен"
fi
echo ""

echo "📋 ШАГ 5/10: Установка PostgreSQL Client"
echo "--------------------"
apt install -y postgresql-client
log_info "PostgreSQL client установлен"
echo ""

echo "📋 ШАГ 6/10: Настройка Firewall (UFW)"
echo "--------------------"
apt install -y ufw
ufw --force enable
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw status
log_info "Firewall настроен"
echo ""

echo "📋 ШАГ 7/10: Клонирование репозитория"
echo "--------------------"
if [ -d "$APP_DIR" ]; then
    log_warn "Директория $APP_DIR уже существует. Обновляем..."
    cd $APP_DIR
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
else
    mkdir -p /var/www
    cd /var/www
    git clone $REPO_URL kamchatour-hub
    cd kamchatour-hub
    git checkout $BRANCH
fi
log_info "Репозиторий готов"
echo ""

echo "📋 ШАГ 8/10: Установка зависимостей"
echo "--------------------"
cd $APP_DIR
npm ci
log_info "Зависимости установлены"
echo ""

echo "📋 ШАГ 9/10: Конфигурация .env"
echo "--------------------"
if [ ! -f "$APP_DIR/.env.production" ]; then
    log_warn ".env.production не найден!"
    
    if [ -f "$APP_DIR/.env.production.kamchatour" ]; then
        log_info "Копируем из .env.production.kamchatour"
        cp $APP_DIR/.env.production.kamchatour $APP_DIR/.env.production
        
        echo ""
        log_warn "⚠️  ВАЖНО! Отредактируйте .env.production:"
        log_warn "   1. Замените DB_HOST, DB_USER, DB_PASSWORD из email Timeweb"
        log_warn "   2. Замените S3_ACCESS_KEY, S3_SECRET_KEY из email Timeweb"
        log_warn "   3. Добавьте свои API ключи (GROQ, Yandex, etc.)"
        echo ""
        log_warn "Открыть редактор? (y/n)"
        read -r EDIT_ENV
        if [ "$EDIT_ENV" = "y" ]; then
            nano $APP_DIR/.env.production
        fi
    else
        log_error ".env.production.kamchatour тоже не найден!"
        log_error "Создайте .env.production вручную"
        exit 1
    fi
else
    log_info ".env.production уже существует"
fi
echo ""

echo "📋 ШАГ 10/10: Сборка и запуск приложения"
echo "--------------------"

# Проверка подключения к БД
log_info "Проверяем подключение к БД..."
if grep -q "DB_HOST=undefined" $APP_DIR/.env.production; then
    log_error "БД не настроена! Обновите .env.production"
    log_warn "Запустите: nano $APP_DIR/.env.production"
    exit 1
fi

# Миграции БД
log_info "Применяем миграции БД..."
if npx prisma migrate deploy; then
    log_info "Миграции применены"
else
    log_warn "Миграции не применены (возможно БД ещё не готова)"
    log_warn "Запустите позже: cd $APP_DIR && npx prisma migrate deploy"
fi

# Сборка приложения
log_info "Сборка приложения..."
npm run build
log_info "Приложение собрано"

# Создание директории для логов
mkdir -p $APP_DIR/logs

# Запуск через PM2 с ecosystem.config.js
log_info "Запуск через PM2..."
if pm2 list | grep -q $APP_NAME; then
    log_info "Приложение уже запущено, перезапускаем..."
    pm2 reload ecosystem.config.js --update-env
else
    pm2 start ecosystem.config.js
fi

pm2 save

# Настройка автозапуска PM2
log_info "Настройка автозапуска PM2..."
pm2 startup | tail -n 1 | bash || log_warn "PM2 startup уже настроен"

log_info "Приложение запущено!"
echo ""

echo "📋 НАСТРОЙКА NGINX"
echo "--------------------"

# Nginx конфигурация
NGINX_CONF="/etc/nginx/sites-available/kamchatour"
if [ ! -f "$NGINX_CONF" ]; then
    cat > $NGINX_CONF << 'EOF'
server {
    listen 80;
    server_name 45.8.96.120;

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
EOF
    
    ln -sf /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/
    
    # Удаляем дефолтный конфиг если есть
    rm -f /etc/nginx/sites-enabled/default
    
    nginx -t
    systemctl reload nginx
    
    log_info "Nginx настроен"
else
    log_info "Nginx уже настроен"
fi
echo ""

echo "=============================================="
echo "🎉 РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО!"
echo "=============================================="
echo ""

echo "📊 СТАТУС:"
echo "   • Node.js: $(node -v)"
echo "   • npm: $(npm -v)"
echo "   • PM2: $(pm2 -v)"
echo ""

echo "🚀 ПРИЛОЖЕНИЕ:"
pm2 status
echo ""

echo "🌐 ДОСТУП:"
echo "   • Локально: http://localhost:3000"
echo "   • Извне: http://45.8.96.120"
echo ""

echo "📋 ПОЛЕЗНЫЕ КОМАНДЫ:"
echo "   • Статус: pm2 status"
echo "   • Логи: pm2 logs $APP_NAME"
echo "   • Рестарт: pm2 restart $APP_NAME"
echo "   • Стоп: pm2 stop $APP_NAME"
echo ""

echo "⚠️  НЕ ЗАБУДЬТЕ:"
echo "   1. Проверить .env.production (пароли БД и S3)"
echo "   2. Применить миграции если БД не была готова"
echo "   3. Добавить свои API ключи (GROQ, Yandex)"
echo "   4. Настроить SSL если есть домен"
echo ""

log_info "Откройте в браузере: http://45.8.96.120"
echo ""
