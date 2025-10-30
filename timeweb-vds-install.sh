#!/bin/bash
##############################################################################
# KamHub - Автоматическая установка на Timeweb VDS
# Версия: 2.0
# Дата: 30 октября 2025
##############################################################################

set -e  # Остановка при ошибке

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       🚀 АВТОМАТИЧЕСКАЯ УСТАНОВКА KAMHUB НА TIMEWEB VDS       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция логирования
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

##############################################################################
# ШАГ 1: ОБНОВЛЕНИЕ СИСТЕМЫ
##############################################################################

log_info "Шаг 1/10: Обновление системы..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
log_success "Система обновлена"

##############################################################################
# ШАГ 2: УСТАНОВКА БАЗОВЫХ ПАКЕТОВ
##############################################################################

log_info "Шаг 2/10: Установка базовых пакетов..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    unzip
log_success "Базовые пакеты установлены"

##############################################################################
# ШАГ 3: УСТАНОВКА NODE.JS 20
##############################################################################

log_info "Шаг 3/10: Установка Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
fi
NODE_VERSION=$(node -v)
log_success "Node.js установлен: $NODE_VERSION"

##############################################################################
# ШАГ 4: УСТАНОВКА POSTGRESQL 15
##############################################################################

log_info "Шаг 4/10: Установка PostgreSQL 15..."
if ! command -v psql &> /dev/null; then
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    apt-get update -qq
    apt-get install -y -qq postgresql-15 postgresql-contrib-15
fi
log_success "PostgreSQL установлен"

##############################################################################
# ШАГ 5: НАСТРОЙКА POSTGRESQL
##############################################################################

log_info "Шаг 5/10: Настройка PostgreSQL..."

# Генерация случайного пароля
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)

# Создание базы данных и пользователя
sudo -u postgres psql << EOSQL
-- Удаление если существует
DROP DATABASE IF EXISTS kamhub;
DROP USER IF EXISTS kamhub;

-- Создание пользователя
CREATE USER kamhub WITH PASSWORD '$DB_PASSWORD';

-- Создание базы данных
CREATE DATABASE kamhub OWNER kamhub;

-- Выдача прав
GRANT ALL PRIVILEGES ON DATABASE kamhub TO kamhub;
ALTER USER kamhub CREATEDB;

-- Дополнительные привилегии
\c kamhub
GRANT ALL ON SCHEMA public TO kamhub;
ALTER SCHEMA public OWNER TO kamhub;
EOSQL

log_success "PostgreSQL настроен"
log_info "База данных: kamhub"
log_info "Пользователь: kamhub"
log_info "Пароль: $DB_PASSWORD"

##############################################################################
# ШАГ 6: КЛОНИРОВАНИЕ РЕПОЗИТОРИЯ
##############################################################################

log_info "Шаг 6/10: Клонирование репозитория KamHub..."

# Удаление старой версии если есть
if [ -d "/opt/kamhub" ]; then
    log_warning "Удаление старой версии..."
    rm -rf /opt/kamhub
fi

# Клонирование репозитория
cd /opt
git clone https://github.com/PosPk/kamhub.git
cd /opt/kamhub

log_success "Репозиторий склонирован"

##############################################################################
# ШАГ 7: НАСТРОЙКА ОКРУЖЕНИЯ
##############################################################################

log_info "Шаг 7/10: Настройка переменных окружения..."

# Генерация JWT секретов
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Получение IP адреса сервера
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

# Создание .env.local
cat > /opt/kamhub/.env.local << ENVEOF
# Database Configuration
DATABASE_URL=postgresql://kamhub:${DB_PASSWORD}@localhost:5432/kamhub

# JWT Secrets
JWT_SECRET=${JWT_SECRET}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Application
NODE_ENV=production
NEXTAUTH_URL=http://${SERVER_IP}:3000

# API Keys (добавьте свои!)
# GROQ_API_KEY=your_groq_key
# YANDEX_MAPS_API_KEY=your_yandex_key
# DEEPSEEK_API_KEY=your_deepseek_key

# Server Configuration
PORT=3000
ENVEOF

log_success "Переменные окружения настроены"

##############################################################################
# ШАГ 8: УСТАНОВКА ЗАВИСИМОСТЕЙ И СБОРКА
##############################################################################

log_info "Шаг 8/10: Установка зависимостей и сборка приложения..."

cd /opt/kamhub

# Установка зависимостей
log_info "Установка npm пакетов..."
npm ci --omit=dev --quiet 2>&1 | tail -5

# Сборка приложения
log_info "Сборка Next.js приложения..."
npm run build 2>&1 | tail -10

log_success "Приложение собрано"

##############################################################################
# ШАГ 9: УСТАНОВКА И НАСТРОЙКА PM2
##############################################################################

log_info "Шаг 9/10: Установка PM2..."

# Установка PM2 глобально
npm install -g pm2 --quiet

# Настройка PM2
cat > /opt/kamhub/ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: 'kamhub',
    script: 'npm',
    args: 'start',
    cwd: '/opt/kamhub',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/kamhub-error.log',
    out_file: '/var/log/kamhub-out.log',
    log_file: '/var/log/kamhub-combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false
  }]
};
PM2EOF

# Запуск приложения через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

log_success "PM2 установлен и настроен"

##############################################################################
# ШАГ 10: НАСТРОЙКА NGINX (опционально)
##############################################################################

log_info "Шаг 10/10: Установка и настройка Nginx..."

# Установка Nginx
apt-get install -y -qq nginx

# Создание конфигурации Nginx
cat > /etc/nginx/sites-available/kamhub << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

# Активация конфигурации
ln -sf /etc/nginx/sites-available/kamhub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка и перезапуск Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

log_success "Nginx установлен и настроен"

##############################################################################
# ШАГ 11: НАСТРОЙКА FIREWALL
##############################################################################

log_info "Настройка firewall..."

# Настройка UFW
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Next.js (на случай если нужен прямой доступ)

log_success "Firewall настроен"

##############################################################################
# ФИНАЛ
##############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  🎉 УСТАНОВКА ЗАВЕРШЕНА! 🎉                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

log_success "KamHub успешно установлен и запущен!"
echo ""
echo "📊 ИНФОРМАЦИЯ О СИСТЕМЕ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 URL приложения:       http://${SERVER_IP}"
echo "🔗 URL через Nginx:      http://${SERVER_IP}:80"
echo "📁 Директория:           /opt/kamhub"
echo "🗄️  База данных:          kamhub"
echo "👤 Пользователь БД:      kamhub"
echo "🔑 Пароль БД:            $DB_PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log_info "СОХРАНИТЕ ЭТИ ДАННЫЕ В БЕЗОПАСНОМ МЕСТЕ!"
echo ""

# Сохранение данных в файл
cat > /root/kamhub-credentials.txt << CREDSEOF
╔════════════════════════════════════════════════════════════════╗
║              УЧЁТНЫЕ ДАННЫЕ KAMHUB                             ║
╚════════════════════════════════════════════════════════════════╝

Дата установки: $(date)

🌐 ДОСТУП К ПРИЛОЖЕНИЮ:
   URL: http://${SERVER_IP}
   
🗄️ POSTGRESQL:
   Database: kamhub
   User: kamhub
   Password: ${DB_PASSWORD}
   Connection: postgresql://kamhub:${DB_PASSWORD}@localhost:5432/kamhub

🔐 JWT SECRETS:
   JWT_SECRET: ${JWT_SECRET}
   NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}

📁 ДИРЕКТОРИИ:
   Application: /opt/kamhub
   Logs: /var/log/kamhub-*.log
   Env: /opt/kamhub/.env.local

🔧 ПОЛЕЗНЫЕ КОМАНДЫ:
   
   Статус приложения:
   pm2 status
   
   Логи:
   pm2 logs kamhub
   
   Перезапуск:
   pm2 restart kamhub
   
   Остановка:
   pm2 stop kamhub
   
   Статус Nginx:
   systemctl status nginx
   
   Проверка БД:
   sudo -u postgres psql -d kamhub
   
   Обновление из Git:
   cd /opt/kamhub && git pull && npm ci && npm run build && pm2 restart kamhub

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ВАЖНО: Сохраните этот файл в безопасном месте!
CREDSEOF

log_success "Учётные данные сохранены в /root/kamhub-credentials.txt"

echo ""
echo "🔍 ПРОВЕРКА СОСТОЯНИЯ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Проверка PM2
pm2 status

echo ""
log_info "Проверка работы приложения..."
sleep 5

# Проверка HTTP
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    log_success "✅ Приложение отвечает на HTTP запросы!"
else
    log_warning "⚠️ Приложение пока не отвечает (может требоваться больше времени для запуска)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 СЛЕДУЮЩИЕ ШАГИ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 🌐 Откройте в браузере: http://${SERVER_IP}"
echo ""
echo "2. 🔑 Добавьте API ключи в /opt/kamhub/.env.local:"
echo "   - GROQ_API_KEY"
echo "   - YANDEX_MAPS_API_KEY"
echo "   - DEEPSEEK_API_KEY"
echo ""
echo "3. 🔄 После добавления ключей перезапустите:"
echo "   pm2 restart kamhub"
echo ""
echo "4. 🌍 Настройте домен (опционально):"
echo "   - Добавьте A-запись на ${SERVER_IP}"
echo "   - Обновите /etc/nginx/sites-available/kamhub"
echo "   - Установите SSL: certbot --nginx"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_success "🎉 ГОТОВО! ПРИЛОЖЕНИЕ РАБОТАЕТ!"
echo ""
