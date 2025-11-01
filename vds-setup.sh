#!/bin/bash
set -e

echo "=========================================="
echo "🚀 KAMCHATOUR HUB - АВТОМАТИЧЕСКАЯ УСТАНОВКА НА TIMEWEB VDS"
echo "=========================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Запустите скрипт с правами root: sudo bash vds-setup.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Запущено с правами root${NC}"
echo ""

# Функция для вывода статуса
print_status() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}"
}

# 1. ОБНОВЛЕНИЕ СИСТЕМЫ
print_status "1️⃣ Обновление системы..."
apt-get update -qq
apt-get upgrade -y -qq

# 2. УСТАНОВКА НЕОБХОДИМЫХ ПАКЕТОВ
print_status "2️⃣ Установка базовых пакетов..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    nginx \
    postgresql \
    postgresql-contrib \
    certbot \
    python3-certbot-nginx \
    ufw \
    htop \
    nano

# 3. УСТАНОВКА NODE.JS 20
print_status "3️⃣ Установка Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node -v)
print_status "Node.js версия: $NODE_VERSION"

# 4. УСТАНОВКА PM2
print_status "4️⃣ Установка PM2..."
npm install -g pm2

# 5. СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ ДЛЯ ПРИЛОЖЕНИЯ
print_status "5️⃣ Создание пользователя kamchatour..."
if ! id -u kamchatour > /dev/null 2>&1; then
    useradd -m -s /bin/bash kamchatour
    print_status "Пользователь kamchatour создан"
else
    print_status "Пользователь kamchatour уже существует"
fi

# 6. НАСТРОЙКА POSTGRESQL
print_status "6️⃣ Настройка PostgreSQL..."

# Запускаем PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Создаем пользователя и базу данных
sudo -u postgres psql -c "CREATE USER kamchatour WITH PASSWORD 'kamchatour_secure_password_2025';" 2>/dev/null || print_warning "Пользователь PostgreSQL уже существует"
sudo -u postgres psql -c "CREATE DATABASE kamchatour OWNER kamchatour;" 2>/dev/null || print_warning "База данных уже существует"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kamchatour TO kamchatour;" 2>/dev/null

# Устанавливаем расширения PostGIS
sudo -u postgres psql -d kamchatour -c "CREATE EXTENSION IF NOT EXISTS postgis;"
sudo -u postgres psql -d kamchatour -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

print_status "PostgreSQL настроен!"

# 7. КЛОНИРОВАНИЕ РЕПОЗИТОРИЯ
print_status "7️⃣ Клонирование репозитория..."

APP_DIR="/home/kamchatour/kamhub"

if [ -d "$APP_DIR" ]; then
    print_warning "Директория $APP_DIR уже существует, обновляем..."
    cd "$APP_DIR"
    sudo -u kamchatour git pull
else
    sudo -u kamchatour git clone https://github.com/PosPk/kamhub.git "$APP_DIR"
fi

cd "$APP_DIR"
sudo -u kamchatour git checkout cursor/analyze-repository-and-timeweb-project-79c9

print_status "Репозиторий клонирован!"

# 8. СОЗДАНИЕ .ENV ФАЙЛА
print_status "8️⃣ Создание .env файла..."

cat > "$APP_DIR/.env" << 'EOF'
# Node Environment
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://kamchatour:kamchatour_secure_password_2025@localhost:5432/kamchatour

# NextAuth
NEXTAUTH_SECRET=kamchatour-nextauth-secret-key-2025-production-vds
NEXTAUTH_URL=http://localhost:3000

# JWT
JWT_SECRET=kamchatour-super-secret-key-2025-production

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Sentry (disabled)
SKIP_SENTRY=true

# Telemetry
NEXT_TELEMETRY_DISABLED=1
EOF

chown kamchatour:kamchatour "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

print_status ".env файл создан!"

# 9. УСТАНОВКА ЗАВИСИМОСТЕЙ
print_status "9️⃣ Установка npm зависимостей..."
cd "$APP_DIR"
sudo -u kamchatour npm install

# 10. ПРИМЕНЕНИЕ МИГРАЦИЙ БД
print_status "🔟 Применение миграций базы данных..."

# Основные миграции
if [ -f "$APP_DIR/lib/database/schema.sql" ]; then
    sudo -u postgres psql -d kamchatour -f "$APP_DIR/lib/database/schema.sql" 2>/dev/null || print_warning "Некоторые миграции уже применены"
fi

# Миграции трансферов
if [ -f "$APP_DIR/lib/database/transfer_schema.sql" ]; then
    sudo -u postgres psql -d kamchatour -f "$APP_DIR/lib/database/transfer_schema.sql" 2>/dev/null || print_warning "Transfer миграции уже применены"
fi

# Миграции размещения
if [ -f "$APP_DIR/lib/database/accommodation_schema.sql" ]; then
    sudo -u postgres psql -d kamchatour -f "$APP_DIR/lib/database/accommodation_schema.sql" 2>/dev/null || print_warning "Accommodation миграции уже применены"
fi

print_status "Миграции применены!"

# 11. BUILD ПРИЛОЖЕНИЯ
print_status "1️⃣1️⃣ Сборка Next.js приложения..."
cd "$APP_DIR"
sudo -u kamchatour npm run build

print_status "Приложение собрано!"

# 12. НАСТРОЙКА PM2
print_status "1️⃣2️⃣ Настройка PM2..."

# Создаем ecosystem файл
cat > "$APP_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'kamchatour-hub',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/home/kamchatour/kamhub',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/kamchatour/logs/err.log',
    out_file: '/home/kamchatour/logs/out.log',
    log_file: '/home/kamchatour/logs/combined.log',
    time: true
  }]
};
EOF

# Создаем директорию для логов
mkdir -p /home/kamchatour/logs
chown -R kamchatour:kamchatour /home/kamchatour/logs

# Запускаем приложение через PM2
cd "$APP_DIR"
sudo -u kamchatour pm2 delete kamchatour-hub 2>/dev/null || true
sudo -u kamchatour pm2 start ecosystem.config.js
sudo -u kamchatour pm2 save

# Настраиваем автозапуск PM2
env PATH=$PATH:/usr/bin pm2 startup systemd -u kamchatour --hp /home/kamchatour

print_status "PM2 настроен и приложение запущено!"

# 13. НАСТРОЙКА NGINX
print_status "1️⃣3️⃣ Настройка Nginx..."

# Получаем IP сервера
SERVER_IP=$(curl -s ifconfig.me)

cat > /etc/nginx/sites-available/kamchatour << EOF
server {
    listen 80;
    server_name $SERVER_IP;

    client_max_body_size 10M;

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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000/_next/static;
        proxy_cache_valid 200 60m;
        proxy_cache_bypass \$http_pragma \$http_authorization;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }
}
EOF

# Активируем конфигурацию
ln -sf /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
nginx -t

# Перезапускаем Nginx
systemctl restart nginx
systemctl enable nginx

print_status "Nginx настроен!"

# 14. НАСТРОЙКА FIREWALL
print_status "1️⃣4️⃣ Настройка firewall (UFW)..."

ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5432/tcp comment 'PostgreSQL'

print_status "Firewall настроен!"

# 15. ФИНАЛЬНАЯ ПРОВЕРКА
print_status "1️⃣5️⃣ Финальная проверка..."

sleep 5

# Проверяем статус PM2
print_status "Статус PM2:"
sudo -u kamchatour pm2 status

echo ""

# Проверяем доступность приложения
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" 2>&1)

echo ""
echo "=========================================="
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}🎉🎉🎉 УСПЕХ! ПРИЛОЖЕНИЕ РАБОТАЕТ! 🎉🎉🎉${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP код: $HTTP_CODE${NC}"
fi
echo "=========================================="
echo ""

echo -e "${GREEN}✅ УСТАНОВКА ЗАВЕРШЕНА!${NC}"
echo ""
echo "📊 ИНФОРМАЦИЯ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 URL приложения: http://$SERVER_IP"
echo "📁 Директория: $APP_DIR"
echo "👤 Пользователь: kamchatour"
echo "📝 Логи PM2: /home/kamchatour/logs/"
echo "🗄️  База данных: kamchatour"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 ПОЛЕЗНЫЕ КОМАНДЫ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Статус приложения:   sudo -u kamchatour pm2 status"
echo "Логи приложения:     sudo -u kamchatour pm2 logs kamchatour-hub"
echo "Перезапуск:          sudo -u kamchatour pm2 restart kamchatour-hub"
echo "Остановка:           sudo -u kamchatour pm2 stop kamchatour-hub"
echo "Статус Nginx:        systemctl status nginx"
echo "Статус PostgreSQL:   systemctl status postgresql"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔒 БЕЗОПАСНОСТЬ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Измените пароль PostgreSQL:"
echo "   sudo -u postgres psql -c \"ALTER USER kamchatour WITH PASSWORD 'НОВЫЙ_ПАРОЛЬ';\""
echo "   Затем обновите DATABASE_URL в $APP_DIR/.env"
echo ""
echo "2. Обновите все секреты в .env файле!"
echo ""
echo "3. Для SSL сертификата (после привязки домена):"
echo "   certbot --nginx -d ваш-домен.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ ГОТОВО! Откройте http://$SERVER_IP в браузере!"
