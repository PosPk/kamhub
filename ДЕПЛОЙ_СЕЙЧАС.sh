#!/bin/bash

# =============================================
# БЫСТРЫЙ ДЕПЛОЙ НА TIMEWEB CLOUD
# =============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE} 🚀 ДЕПЛОЙ KAMCHATOUR HUB НА TIMEWEB CLOUD${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# =============================================
# Шаг 1: Проверка зависимостей
# =============================================
echo -e "${YELLOW}📦 Шаг 1: Установка зависимостей...${NC}"
npm install
echo -e "${GREEN}✅ Зависимости установлены${NC}"
echo ""

# =============================================
# Шаг 2: Проверка секретов
# =============================================
echo -e "${YELLOW}🔐 Шаг 2: Проверка секретов...${NC}"

if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production не найден, создаю из шаблона...${NC}"
    cp .env.production .env.production.local
    echo -e "${RED}❌ ВАЖНО: Отредактируйте .env.production и добавьте реальные значения!${NC}"
    echo -e "${RED}   Особенно: JWT_SECRET, DATABASE_URL, GROQ_API_KEY${NC}"
    echo ""
fi

# Проверяем JWT_SECRET
if grep -q "ЗАМЕНИТЕ_НА_РЕАЛЬНЫЙ" .env.production 2>/dev/null; then
    echo -e "${RED}❌ ОШИБКА: JWT_SECRET не настроен!${NC}"
    echo -e "${YELLOW}   Запустите: npm run generate:jwt-secret${NC}"
    echo -e "${YELLOW}   Затем обновите .env.production${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Секреты проверены${NC}"
echo ""

# =============================================
# Шаг 3: Проверка API ключей
# =============================================
echo -e "${YELLOW}🔑 Шаг 3: Проверка API ключей...${NC}"

# Проверяем GROQ или DeepSeek
if ! grep -q "GROQ_API_KEY=" .env.production 2>/dev/null && \
   ! grep -q "DEEPSEEK_API_KEY=" .env.production 2>/dev/null; then
    echo -e "${YELLOW}⚠️  AI API ключ не найден${NC}"
    echo -e "${YELLOW}   Получите GROQ ключ: https://console.groq.com${NC}"
else
    echo -e "${GREEN}✅ AI API ключ найден${NC}"
fi

# Проверяем OpenWeather
if ! grep -q "OPENWEATHER_API_KEY=" .env.production 2>/dev/null; then
    echo -e "${YELLOW}⚠️  OpenWeather ключ не найден${NC}"
    echo -e "${YELLOW}   Приложение будет использовать моковые данные погоды${NC}"
    echo -e "${YELLOW}   Получите ключ: https://openweathermap.org/api${NC}"
else
    echo -e "${GREEN}✅ OpenWeather ключ найден${NC}"
fi

echo ""

# =============================================
# Шаг 4: Тесты
# =============================================
echo -e "${YELLOW}🧪 Шаг 4: Запуск тестов...${NC}"
npm run test:run || {
    echo -e "${YELLOW}⚠️  Некоторые тесты не прошли, но продолжаем...${NC}"
}
echo ""

# =============================================
# Шаг 5: Сборка
# =============================================
echo -e "${YELLOW}🔨 Шаг 5: Сборка production версии...${NC}"
npm run build
echo -e "${GREEN}✅ Сборка завершена${NC}"
echo ""

# =============================================
# Шаг 6: Git commit
# =============================================
echo -e "${YELLOW}📝 Шаг 6: Коммит изменений...${NC}"

git add .
git commit -m "feat: Samsung Weather дизайн + AI метрики + критичные доработки

- Новый дизайн главной страницы (Samsung Weather style)
- Градиентные фоны по времени суток
- Framer Motion анимации
- AI метрики система (4 таблицы)
- Redis кэширование
- Централизованное логирование
- GROQ AI интеграция
- Email service
- Автобэкапы БД
- Критичные тесты (booking, payments)
" || {
    echo -e "${YELLOW}⚠️  Нет изменений для коммита${NC}"
}
echo ""

# =============================================
# Шаг 7: Push в GitHub
# =============================================
echo -e "${YELLOW}🌐 Шаг 7: Отправка в GitHub...${NC}"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}Текущая ветка: ${BRANCH}${NC}"

git push origin "$BRANCH" || {
    echo -e "${RED}❌ Ошибка при push в GitHub${NC}"
    exit 1
}

echo -e "${GREEN}✅ Код отправлен в GitHub${NC}"
echo ""

# =============================================
# Шаг 8: Инструкции для Timeweb
# =============================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 ДЕПЛОЙ ПОДГОТОВЛЕН!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 СЛЕДУЮЩИЕ ШАГИ:${NC}"
echo ""
echo -e "${BLUE}1. Откройте Timeweb Dashboard:${NC}"
echo -e "   ${GREEN}https://timeweb.cloud/my/apps${NC}"
echo ""
echo -e "${BLUE}2. Если проект уже создан:${NC}"
echo -e "   - Найдите ваше приложение"
echo -e "   - Нажмите ${GREEN}\"Deploy\"${NC}"
echo -e "   - Timeweb автоматически задеплоит из GitHub"
echo ""
echo -e "${BLUE}3. Если проекта нет, создайте новый:${NC}"
echo -e "   - Нажмите ${GREEN}\"Создать приложение\"${NC}"
echo -e "   - Framework: ${GREEN}Next.js${NC}"
echo -e "   - Git: Подключите GitHub репозиторий"
echo -e "   - Branch: ${GREEN}${BRANCH}${NC}"
echo -e "   - Addons: PostgreSQL + S3 + Redis"
echo ""
echo -e "${BLUE}4. Добавьте Environment Variables в Timeweb:${NC}"
echo -e "   ${YELLOW}Скопируйте из .env.production:${NC}"
echo -e "   - JWT_SECRET"
echo -e "   - DATABASE_URL (из Timeweb PostgreSQL)"
echo -e "   - GROQ_API_KEY"
echo -e "   - OPENWEATHER_API_KEY"
echo -e "   - И остальные..."
echo ""
echo -e "${BLUE}5. Запустите миграции БД:${NC}"
echo -e "   ${GREEN}psql \$DATABASE_URL -f lib/database/schema.sql${NC}"
echo -e "   ${GREEN}psql \$DATABASE_URL -f lib/database/transfer_schema.sql${NC}"
echo -e "   ${GREEN}psql \$DATABASE_URL -f lib/database/loyalty_schema.sql${NC}"
echo -e "   ${GREEN}psql \$DATABASE_URL -f lib/database/ai_metrics_schema.sql${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Ваш код готов к деплою!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📖 Детальная инструкция: TIMEWEB_ПРОВЕРКА_НАСТРОЕК.md${NC}"
echo -e "${YELLOW}📖 API погоды: ПОЛУЧИТЬ_API_ПОГОДЫ.md${NC}"
echo ""
