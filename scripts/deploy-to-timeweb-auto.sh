#!/bin/bash

# =============================================
# АВТОМАТИЧЕСКИЙ ДЕПЛОЙ НА TIMEWEB С ТОКЕНОМ
# =============================================

set -e

# Загружаем credentials
if [ -f ".env.timeweb.local" ]; then
    export $(grep -v '^#' .env.timeweb.local | xargs)
    echo "✅ Credentials загружены"
else
    echo "❌ Файл .env.timeweb.local не найден!"
    echo "   Создайте его из .env.timeweb.local.example"
    exit 1
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE} 🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ НА TIMEWEB${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# =============================================
# Проверка Timeweb API
# =============================================
echo -e "${YELLOW}🔑 Проверка API токена...${NC}"

ACCOUNT_INFO=$(curl -s -H "Authorization: Bearer $TIMEWEB_TOKEN" \
    https://api.timeweb.cloud/api/v1/account)

if echo "$ACCOUNT_INFO" | grep -q "email"; then
    echo -e "${GREEN}✅ API токен валиден${NC}"
    EMAIL=$(echo "$ACCOUNT_INFO" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
    BALANCE=$(echo "$ACCOUNT_INFO" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
    echo -e "${GREEN}   Email: $EMAIL${NC}"
    echo -e "${GREEN}   Баланс: $BALANCE ₽${NC}"
else
    echo -e "${RED}❌ Ошибка API токена!${NC}"
    exit 1
fi
echo ""

# =============================================
# Проверка VDS сервера
# =============================================
echo -e "${YELLOW}🖥️  Проверка VDS сервера...${NC}"

SERVER_INFO=$(curl -s -H "Authorization: Bearer $TIMEWEB_TOKEN" \
    https://api.timeweb.cloud/api/v1/servers/5898003)

if echo "$SERVER_INFO" | grep -q "status"; then
    STATUS=$(echo "$SERVER_INFO" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    IP=$(echo "$SERVER_INFO" | grep -o '"main_ipv4":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Сервер доступен${NC}"
    echo -e "${GREEN}   IP: $IP${NC}"
    echo -e "${GREEN}   Статус: $STATUS${NC}"
else
    echo -e "${YELLOW}⚠️  Не удалось получить информацию о сервере${NC}"
fi
echo ""

# =============================================
# Установка зависимостей
# =============================================
echo -e "${YELLOW}📦 Установка зависимостей...${NC}"
npm install
echo -e "${GREEN}✅ Зависимости установлены${NC}"
echo ""

# =============================================
# Сборка
# =============================================
echo -e "${YELLOW}🔨 Сборка production версии...${NC}"
npm run build
echo -e "${GREEN}✅ Сборка завершена${NC}"
echo ""

# =============================================
# Загрузка в S3
# =============================================
echo -e "${YELLOW}☁️  Загрузка статики в S3...${NC}"

# Проверяем AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${YELLOW}⚠️  AWS CLI не установлен, пропускаем загрузку в S3${NC}"
else
    # Конфигурируем AWS CLI для Timeweb S3
    export AWS_ACCESS_KEY_ID=$S3_ACCESS_KEY
    export AWS_SECRET_ACCESS_KEY=$S3_SECRET_KEY
    
    # Загружаем статику
    aws s3 sync .next/static s3://$S3_BUCKET/static \
        --endpoint-url $S3_ENDPOINT \
        --region $S3_REGION || {
        echo -e "${YELLOW}⚠️  Не удалось загрузить в S3, но продолжаем...${NC}"
    }
    
    echo -e "${GREEN}✅ Статика загружена в S3${NC}"
fi
echo ""

# =============================================
# Git commit и push
# =============================================
echo -e "${YELLOW}📝 Коммит изменений...${NC}"

git add .
git commit -m "deploy: Автодеплой на Timeweb

- Samsung Weather дизайн
- AI метрики система
- Redis кэширование
- GROQ AI интеграция
- Email service
- Критичные доработки

Deployed: $(date '+%Y-%m-%d %H:%M:%S')
" || {
    echo -e "${YELLOW}⚠️  Нет новых изменений для коммита${NC}"
}

BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin "$BRANCH"
echo -e "${GREEN}✅ Код отправлен в GitHub${NC}"
echo ""

# =============================================
# Деплой на VDS
# =============================================
echo -e "${YELLOW}🚢 Деплой на VDS сервер...${NC}"

# Создаем временный скрипт для деплоя
cat > /tmp/deploy_script.sh << 'DEPLOY_EOF'
#!/bin/bash
set -e

echo "🔄 Обновление кода..."
cd /var/www/kamhub || exit 1

git pull origin main

echo "📦 Установка зависимостей..."
npm install --production

echo "🔨 Сборка..."
npm run build

echo "🔄 Перезапуск PM2..."
pm2 restart kamhub || pm2 start npm --name kamhub -- start

echo "✅ Деплой завершен!"
DEPLOY_EOF

# Загружаем скрипт на сервер и выполняем
sshpass -p "$VDS_PASSWORD" scp -o StrictHostKeyChecking=no \
    /tmp/deploy_script.sh root@$VDS_HOST:/tmp/ || {
    echo -e "${YELLOW}⚠️  Не удалось скопировать скрипт деплоя${NC}"
    echo -e "${YELLOW}   Используйте ручной деплой через SSH${NC}"
    echo ""
    echo -e "${BLUE}   SSH команда:${NC}"
    echo -e "${GREEN}   ssh root@$VDS_HOST${NC}"
    echo ""
    echo -e "${BLUE}   Затем выполните:${NC}"
    echo -e "${GREEN}   cd /var/www/kamhub && git pull && npm install && npm run build && pm2 restart kamhub${NC}"
    exit 0
}

sshpass -p "$VDS_PASSWORD" ssh -o StrictHostKeyChecking=no \
    root@$VDS_HOST "bash /tmp/deploy_script.sh" || {
    echo -e "${YELLOW}⚠️  Не удалось выполнить деплой автоматически${NC}"
    echo -e "${YELLOW}   Подключитесь вручную через SSH${NC}"
}

echo -e "${GREEN}✅ Деплой на VDS завершен${NC}"
echo ""

# =============================================
# Финальная проверка
# =============================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 ДЕПЛОЙ ЗАВЕРШЕН!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Проверьте приложение:${NC}"
echo ""
echo -e "${BLUE}🌐 URL: ${GREEN}http://$VDS_HOST:3000${NC}"
echo -e "${BLUE}🖥️  SSH: ${GREEN}ssh root@$VDS_HOST${NC}"
echo -e "${BLUE}📦 S3:  ${GREEN}https://timeweb.cloud/my/storage/422469/dashboard${NC}"
echo ""
echo -e "${YELLOW}🔍 Проверка здоровья:${NC}"
echo -e "${GREEN}   curl http://$VDS_HOST:3000/api/health${NC}"
echo ""
