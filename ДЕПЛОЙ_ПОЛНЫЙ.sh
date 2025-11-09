#!/bin/bash

# =============================================
# ПОЛНЫЙ АВТОДЕПЛОЙ НА TIMEWEB + TOURHAB.RU
# =============================================

set -e

# Загружаем credentials
if [ -f ".env.timeweb.local" ]; then
    export $(grep -v '^#' .env.timeweb.local | xargs)
else
    echo "❌ Файл .env.timeweb.local не найден!"
    exit 1
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

clear

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        🚀 ПОЛНЫЙ ДЕПЛОЙ KAMHUB → TOURHAB.RU${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Что будет сделано:${NC}"
echo -e "  1. ✅ Установка зависимостей"
echo -e "  2. ✅ Сборка production"
echo -e "  3. ✅ Коммит и push в GitHub"
echo -e "  4. ✅ Деплой на VDS (5.129.248.224)"
echo -e "  5. ✅ Настройка домена tourhab.ru"
echo -e "  6. ✅ Установка SSL сертификата"
echo ""
read -p "Продолжить? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Отменено"
    exit 1
fi

# =============================================
# 1. УСТАНОВКА ЗАВИСИМОСТЕЙ
# =============================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📦 1/6 Установка зависимостей...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

npm install
echo -e "${GREEN}✅ Зависимости установлены${NC}"

# =============================================
# 2. СБОРКА
# =============================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🔨 2/6 Сборка production...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

npm run build
echo -e "${GREEN}✅ Сборка завершена${NC}"

# =============================================
# 3. GIT COMMIT & PUSH
# =============================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📝 3/6 Git commit и push...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

git add .
git commit -m "deploy: Full deploy to tourhab.ru

Features:
- Samsung Weather homepage design
- AI metrics system (Galileo.ai)
- Redis caching layer
- GROQ AI integration (Llama 3.1 70B)
- Email notifications (Nodemailer)
- Weather API integration (OpenWeatherMap)
- Critical fixes and improvements
- Domain tourhab.ru configuration

Deployed: $(date '+%Y-%m-%d %H:%M:%S')
Server: 5.129.248.224
Domain: https://tourhab.ru
" || {
    echo -e "${YELLOW}⚠️  Нет новых изменений для коммита${NC}"
}

BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin "$BRANCH"
echo -e "${GREEN}✅ Код отправлен в GitHub${NC}"

# =============================================
# 4. ДЕПЛОЙ НА VDS
# =============================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🚢 4/6 Деплой на VDS сервер...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Создаем скрипт деплоя
cat > /tmp/deploy_kamhub.sh << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e

echo "🔄 Проверка/создание директории..."
if [ ! -d "/var/www/kamhub" ]; then
    echo "📁 Клонирование репозитория..."
    cd /var/www
    git clone https://github.com/PosPk/kamhub.git || {
        echo "❌ Не удалось клонировать репозиторий"
        echo "   Возможно нужен приватный доступ"
        exit 1
    }
fi

cd /var/www/kamhub

echo "🔄 Обновление кода..."
git pull origin main || git pull origin cursor/deep-repository-scan-for-cursor-e699

echo "📦 Установка зависимостей..."
npm install --production

echo "🔨 Сборка приложения..."
npm run build

echo "🔄 Перезапуск PM2..."
if pm2 list | grep -q kamhub; then
    pm2 restart kamhub
else
    pm2 start npm --name kamhub -- start
    pm2 save
fi

echo "✅ Деплой на VDS завершен!"
DEPLOY_SCRIPT

# Проверяем доступность инструментов
if command -v sshpass &> /dev/null; then
    echo -e "${GREEN}Автоматический деплой...${NC}"
    
    # Загружаем и выполняем скрипт
    sshpass -p "$VDS_PASSWORD" scp -o StrictHostKeyChecking=no \
        /tmp/deploy_kamhub.sh root@$VDS_HOST:/tmp/
    
    sshpass -p "$VDS_PASSWORD" ssh -o StrictHostKeyChecking=no \
        root@$VDS_HOST "bash /tmp/deploy_kamhub.sh"
    
    echo -e "${GREEN}✅ Деплой на VDS завершен${NC}"
else
    echo -e "${YELLOW}⚠️  sshpass не установлен${NC}"
    echo -e "${YELLOW}   Подключитесь вручную и выполните деплой${NC}"
    echo ""
    echo -e "${BLUE}SSH команда:${NC}"
    echo -e "${GREEN}ssh root@$VDS_HOST${NC}"
    echo ""
    echo -e "${BLUE}Команды на сервере:${NC}"
    cat /tmp/deploy_kamhub.sh
    echo ""
    read -p "Нажмите Enter после выполнения деплоя..."
fi

# =============================================
# 5. НАСТРОЙКА ДОМЕНА
# =============================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🌐 5/6 Настройка домена tourhab.ru...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Открываем Timeweb DNS панель...${NC}"
echo -e "${BLUE}URL:${NC} https://timeweb.cloud/my/domains"
echo ""
echo -e "${YELLOW}Добавьте/проверьте A-записи:${NC}"
echo ""
echo -e "${GREEN}Запись 1:${NC}"
echo -e "  Тип: A"
echo -e "  Имя: @"
echo -e "  Значение: $VDS_HOST"
echo -e "  TTL: 3600"
echo ""
echo -e "${GREEN}Запись 2:${NC}"
echo -e "  Тип: A"
echo -e "  Имя: www"
echo -e "  Значение: $VDS_HOST"
echo -e "  TTL: 3600"
echo ""
read -p "DNS настроен? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Пропускаем настройку домена${NC}"
    echo -e "${YELLOW}Запустите позже: bash scripts/setup-domain-tourhab.sh${NC}"
    exit 0
fi

# Создаем конфиг Nginx
cat > /tmp/tourhab-nginx.conf << 'NGINX_CONF'
# Редирект с www на без www
server {
    listen 80;
    listen [::]:80;
    server_name www.tourhab.ru;
    return 301 http://tourhab.ru$request_uri;
}

# Основной сервер
server {
    listen 80;
    listen [::]:80;
    server_name tourhab.ru;

    access_log /var/log/nginx/tourhab-access.log;
    error_log /var/log/nginx/tourhab-error.log;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_CONF

if command -v sshpass &> /dev/null; then
    echo -e "${GREEN}Загружаем конфиг Nginx...${NC}"
    
    sshpass -p "$VDS_PASSWORD" scp -o StrictHostKeyChecking=no \
        /tmp/tourhab-nginx.conf root@$VDS_HOST:/etc/nginx/sites-available/tourhab.conf
    
    sshpass -p "$VDS_PASSWORD" ssh -o StrictHostKeyChecking=no root@$VDS_HOST << 'NGINX_SETUP'
        ln -sf /etc/nginx/sites-available/tourhab.conf /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        nginx -t && systemctl restart nginx
        echo "✅ Nginx настроен"
NGINX_SETUP
    
    echo -e "${GREEN}✅ Nginx конфиг применен${NC}"
fi

# =============================================
# 6. SSL СЕРТИФИКАТ
# =============================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🔒 6/6 SSL сертификат (Let's Encrypt)...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⏰ Ожидание обновления DNS (5-10 минут)...${NC}"
echo ""
echo -e "${BLUE}Проверьте DNS командой:${NC}"
echo -e "${GREEN}dig tourhab.ru +short${NC}"
echo ""
read -p "DNS обновился? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Пропускаем SSL${NC}"
    echo -e "${YELLOW}Установите позже вручную:${NC}"
    echo -e "${GREEN}ssh root@$VDS_HOST${NC}"
    echo -e "${GREEN}certbot --nginx -d tourhab.ru -d www.tourhab.ru${NC}"
    exit 0
fi

if command -v sshpass &> /dev/null; then
    echo -e "${GREEN}Установка SSL...${NC}"
    
    sshpass -p "$VDS_PASSWORD" ssh -o StrictHostKeyChecking=no root@$VDS_HOST << 'SSL_SETUP'
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
        certbot --nginx -d tourhab.ru -d www.tourhab.ru --non-interactive --agree-tos --email admin@tourhab.ru --redirect
        systemctl enable certbot.timer
        systemctl start certbot.timer
        echo "✅ SSL установлен"
SSL_SETUP
    
    echo -e "${GREEN}✅ SSL сертификат установлен${NC}"
fi

# =============================================
# ЗАВЕРШЕНИЕ
# =============================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}       🎉 ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО! 🎉${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Ваше приложение:${NC}"
echo ""
echo -e "  🌐 ${GREEN}https://tourhab.ru${NC}"
echo -e "  🌐 ${GREEN}http://$VDS_HOST:3000${NC} (для проверки)"
echo ""
echo -e "${YELLOW}📊 Мониторинг:${NC}"
echo ""
echo -e "  SSH: ${GREEN}ssh root@$VDS_HOST${NC}"
echo -e "  PM2: ${GREEN}pm2 list${NC}"
echo -e "  Логи: ${GREEN}pm2 logs kamhub${NC}"
echo -e "  Nginx: ${GREEN}systemctl status nginx${NC}"
echo ""
echo -e "${YELLOW}🔍 Проверка:${NC}"
echo ""
echo -e "  ${BLUE}curl -I https://tourhab.ru${NC}"
echo ""
echo -e "${GREEN}Готово! Откройте https://tourhab.ru в браузере! 🚀${NC}"
echo ""
