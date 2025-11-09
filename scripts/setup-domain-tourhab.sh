#!/bin/bash

# =============================================
# НАСТРОЙКА ДОМЕНА TOURHAB.RU
# =============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE} 🌐 НАСТРОЙКА ДОМЕНА tourhab.ru${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

DOMAIN="tourhab.ru"
WWW_DOMAIN="www.tourhab.ru"
SERVER_IP="5.129.248.224"

echo -e "${YELLOW}📋 Конфигурация:${NC}"
echo -e "   Домен:     ${GREEN}$DOMAIN${NC}"
echo -e "   WWW:       ${GREEN}$WWW_DOMAIN${NC}"
echo -e "   Сервер IP: ${GREEN}$SERVER_IP${NC}"
echo ""

# =============================================
# ШАГ 1: DNS настройки в Timeweb
# =============================================
echo -e "${YELLOW}1️⃣  DNS настройки в Timeweb${NC}"
echo ""
echo -e "${BLUE}Откройте:${NC} https://timeweb.cloud/my/domains"
echo ""
echo -e "${YELLOW}Если домен уже добавлен в Timeweb:${NC}"
echo -e "   1. Найдите '$DOMAIN' в списке"
echo -e "   2. Нажмите 'Управление DNS'"
echo -e "   3. Добавьте/обновите A-записи:"
echo ""
echo -e "${GREEN}   A-запись для основного домена:${NC}"
echo -e "      Тип:    A"
echo -e "      Имя:    @"
echo -e "      Значение: $SERVER_IP"
echo -e "      TTL:    3600"
echo ""
echo -e "${GREEN}   A-запись для www:${NC}"
echo -e "      Тип:    A"
echo -e "      Имя:    www"
echo -e "      Значение: $SERVER_IP"
echo -e "      TTL:    3600"
echo ""
echo -e "${YELLOW}Если домена НЕТ в Timeweb:${NC}"
echo -e "   1. Нажмите 'Добавить домен'"
echo -e "   2. Введите: $DOMAIN"
echo -e "   3. Следуйте инструкциям выше"
echo ""
read -p "Нажмите Enter когда DNS настроен..."

# =============================================
# ШАГ 2: Nginx конфигурация на сервере
# =============================================
echo -e "${YELLOW}2️⃣  Nginx конфигурация${NC}"
echo ""

cat > /tmp/tourhab-nginx.conf << 'EOF'
# =============================================
# KAMHUB - tourhab.ru
# =============================================

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

    # Логи
    access_log /var/log/nginx/tourhab-access.log;
    error_log /var/log/nginx/tourhab-error.log;

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Прокси к Next.js
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
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Статика Next.js
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }

    # Favicon и robots.txt
    location = /favicon.ico {
        proxy_pass http://localhost:3000;
        access_log off;
    }

    location = /robots.txt {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
EOF

echo -e "${GREEN}✅ Конфиг создан: /tmp/tourhab-nginx.conf${NC}"
echo ""

# =============================================
# ШАГ 3: Загрузка на сервер
# =============================================
echo -e "${YELLOW}3️⃣  Загрузка на сервер${NC}"
echo ""

# Проверяем sshpass
if command -v sshpass &> /dev/null; then
    echo -e "${GREEN}Автоматическая загрузка...${NC}"
    
    # Загружаем конфиг
    sshpass -p "xQvB1pv?yZTjaR" scp -o StrictHostKeyChecking=no \
        /tmp/tourhab-nginx.conf root@$SERVER_IP:/etc/nginx/sites-available/tourhab.conf
    
    # Активируем и перезапускаем Nginx
    sshpass -p "xQvB1pv?yZTjaR" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << 'REMOTE_COMMANDS'
        # Создаем симлинк
        ln -sf /etc/nginx/sites-available/tourhab.conf /etc/nginx/sites-enabled/
        
        # Удаляем дефолтный конфиг если есть
        rm -f /etc/nginx/sites-enabled/default
        
        # Тестируем конфиг
        nginx -t
        
        # Перезапускаем Nginx
        systemctl restart nginx
        
        echo "✅ Nginx настроен и перезапущен"
REMOTE_COMMANDS
    
    echo -e "${GREEN}✅ Конфиг загружен и активирован${NC}"
else
    echo -e "${YELLOW}⚠️  sshpass не установлен, используйте ручную загрузку:${NC}"
    echo ""
    echo -e "${BLUE}Команды для выполнения на сервере:${NC}"
    echo ""
    echo -e "${GREEN}# 1. Подключитесь по SSH:${NC}"
    echo -e "ssh root@$SERVER_IP"
    echo ""
    echo -e "${GREEN}# 2. Создайте конфиг Nginx:${NC}"
    echo -e "cat > /etc/nginx/sites-available/tourhab.conf << 'EOF'"
    cat /tmp/tourhab-nginx.conf
    echo -e "EOF"
    echo ""
    echo -e "${GREEN}# 3. Активируйте конфиг:${NC}"
    echo -e "ln -sf /etc/nginx/sites-available/tourhab.conf /etc/nginx/sites-enabled/"
    echo -e "rm -f /etc/nginx/sites-enabled/default"
    echo ""
    echo -e "${GREEN}# 4. Проверьте конфиг:${NC}"
    echo -e "nginx -t"
    echo ""
    echo -e "${GREEN}# 5. Перезапустите Nginx:${NC}"
    echo -e "systemctl restart nginx"
    echo ""
    read -p "Нажмите Enter после выполнения команд на сервере..."
fi

echo ""

# =============================================
# ШАГ 4: SSL сертификат (Let's Encrypt)
# =============================================
echo -e "${YELLOW}4️⃣  SSL сертификат (Let's Encrypt)${NC}"
echo ""
echo -e "${BLUE}⏰ Подождите 5-10 минут пока DNS записи обновятся${NC}"
echo ""
echo -e "${GREEN}Проверьте DNS командой:${NC}"
echo -e "   dig $DOMAIN +short"
echo -e "   (Должен вернуться IP: $SERVER_IP)"
echo ""
read -p "Нажмите Enter когда DNS обновится..."

if command -v sshpass &> /dev/null; then
    echo -e "${GREEN}Автоматическая установка SSL...${NC}"
    
    sshpass -p "xQvB1pv?yZTjaR" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << REMOTE_SSL
        # Устанавливаем certbot если нет
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
        
        # Получаем сертификат
        certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect
        
        # Включаем автообновление
        systemctl enable certbot.timer
        systemctl start certbot.timer
        
        echo "✅ SSL сертификат установлен"
REMOTE_SSL
    
    echo -e "${GREEN}✅ SSL настроен${NC}"
else
    echo -e "${YELLOW}Команды для SSL на сервере:${NC}"
    echo ""
    echo -e "${GREEN}# Подключитесь по SSH:${NC}"
    echo -e "ssh root@$SERVER_IP"
    echo ""
    echo -e "${GREEN}# Установите certbot:${NC}"
    echo -e "apt-get update"
    echo -e "apt-get install -y certbot python3-certbot-nginx"
    echo ""
    echo -e "${GREEN}# Получите сертификат:${NC}"
    echo -e "certbot --nginx -d $DOMAIN -d $WWW_DOMAIN"
    echo ""
    echo -e "${GREEN}# Включите автообновление:${NC}"
    echo -e "systemctl enable certbot.timer"
    echo -e "systemctl start certbot.timer"
    echo ""
fi

# =============================================
# ЗАВЕРШЕНИЕ
# =============================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 ДОМЕН НАСТРОЕН!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Ваши URL:${NC}"
echo ""
echo -e "   ${GREEN}https://$DOMAIN${NC} (основной)"
echo -e "   ${GREEN}https://$WWW_DOMAIN${NC} (редирект на основной)"
echo ""
echo -e "${YELLOW}🔍 Проверка:${NC}"
echo ""
echo -e "   ${BLUE}curl -I https://$DOMAIN${NC}"
echo -e "   ${BLUE}curl -I http://$DOMAIN${NC} (должен редиректить на https)"
echo ""
echo -e "${YELLOW}📊 Полезные команды на сервере:${NC}"
echo ""
echo -e "   ${GREEN}nginx -t${NC}             # Проверка конфига"
echo -e "   ${GREEN}systemctl status nginx${NC} # Статус Nginx"
echo -e "   ${GREEN}certbot renew --dry-run${NC} # Тест обновления SSL"
echo -e "   ${GREEN}pm2 list${NC}             # Статус приложения"
echo ""
echo -e "${GREEN}Готово! 🚀${NC}"
echo ""
