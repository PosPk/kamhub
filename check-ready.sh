#!/bin/bash

# =====================================================
# ПРОВЕРКА ГОТОВНОСТИ К ДЕПЛОЮ
# =====================================================

echo "🔍 Kamchatour Hub - Проверка готовности к деплою"
echo "================================================"
echo ""

ERRORS=0
WARNINGS=0

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# =====================================================
# 1. ПРОВЕРКА ФАЙЛОВ
# =====================================================

echo "📁 Проверка файлов..."

check_file() {
    if [ -f "$1" ]; then
        echo -e "  ${GREEN}✅${NC} $1"
    else
        echo -e "  ${RED}❌${NC} $1 - НЕ НАЙДЕН"
        ((ERRORS++))
    fi
}

check_file "package.json"
check_file "next.config.js"
check_file "tsconfig.json"
check_file "deploy-production.sh"
check_file "ecosystem.config.js"
check_file ".env.local"
check_file ".env.production.tour"

# Проверка директорий
if [ -d "app/api" ]; then
    echo -e "  ${GREEN}✅${NC} app/api/"
else
    echo -e "  ${RED}❌${NC} app/api/ - НЕ НАЙДЕНА"
    ((ERRORS++))
fi

if [ -d "lib" ]; then
    echo -e "  ${GREEN}✅${NC} lib/"
else
    echo -e "  ${RED}❌${NC} lib/ - НЕ НАЙДЕНА"
    ((ERRORS++))
fi

if [ -d "components" ]; then
    echo -e "  ${GREEN}✅${NC} components/"
else
    echo -e "  ${RED}❌${NC} components/ - НЕ НАЙДЕНА"
    ((ERRORS++))
fi

echo ""

# =====================================================
# 2. ПРОВЕРКА ЗАВИСИМОСТЕЙ
# =====================================================

echo "📦 Проверка зависимостей..."

if [ -d "node_modules" ]; then
    echo -e "  ${GREEN}✅${NC} node_modules установлены"
else
    echo -e "  ${YELLOW}⚠️${NC}  node_modules не установлены"
    echo "     Запустите: npm install"
    ((WARNINGS++))
fi

# Проверка package.json на критичные зависимости
check_dependency() {
    if grep -q "\"$1\"" package.json; then
        echo -e "  ${GREEN}✅${NC} $1"
    else
        echo -e "  ${RED}❌${NC} $1 - НЕ НАЙДЕН"
        ((ERRORS++))
    fi
}

check_dependency "next"
check_dependency "react"
check_dependency "typescript"
check_dependency "pg"
check_dependency "zod"

echo ""

# =====================================================
# 3. ПРОВЕРКА ENVIRONMENT
# =====================================================

echo "🔧 Проверка environment..."

if [ -f ".env.local" ]; then
    # Проверка DATABASE_URL
    if grep -q "DATABASE_URL=" .env.local; then
        DB_URL=$(grep "DATABASE_URL=" .env.local | cut -d '=' -f 2- | tr -d '"')
        if [ -n "$DB_URL" ] && [ "$DB_URL" != "postgresql://localhost:5432/kamchatour" ]; then
            echo -e "  ${GREEN}✅${NC} DATABASE_URL настроен"
        else
            echo -e "  ${YELLOW}⚠️${NC}  DATABASE_URL = default (нужно изменить)"
            ((WARNINGS++))
        fi
    else
        echo -e "  ${RED}❌${NC} DATABASE_URL не найден"
        ((ERRORS++))
    fi
    
    # Проверка JWT_SECRET
    if grep -q "JWT_SECRET=" .env.local; then
        JWT_SECRET=$(grep "JWT_SECRET=" .env.local | cut -d '=' -f 2)
        if [ -n "$JWT_SECRET" ] && [ "$JWT_SECRET" != "your-secret-key" ]; then
            echo -e "  ${GREEN}✅${NC} JWT_SECRET настроен"
        else
            echo -e "  ${YELLOW}⚠️${NC}  JWT_SECRET = default (измените для production)"
            ((WARNINGS++))
        fi
    fi
    
    # Проверка PORT
    if grep -q "PORT=" .env.local; then
        echo -e "  ${GREEN}✅${NC} PORT настроен"
    else
        echo -e "  ${YELLOW}⚠️${NC}  PORT не найден (будет использован 3000)"
        ((WARNINGS++))
    fi
fi

echo ""

# =====================================================
# 4. ПРОВЕРКА TYPESCRIPT
# =====================================================

echo "📝 Проверка TypeScript..."

if command -v npx &> /dev/null && [ -d "node_modules" ]; then
    if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
        echo -e "  ${RED}❌${NC} TypeScript ошибки найдены"
        echo "     Запустите: npm run type-check"
        ((ERRORS++))
    else
        echo -e "  ${GREEN}✅${NC} TypeScript OK"
    fi
else
    echo -e "  ${YELLOW}⚠️${NC}  TypeScript проверка пропущена (node_modules не установлены)"
fi

echo ""

# =====================================================
# 5. ПРОВЕРКА API ENDPOINTS
# =====================================================

echo "🔌 Проверка API endpoints..."

check_api_file() {
    if [ -f "$1" ]; then
        echo -e "  ${GREEN}✅${NC} $(basename $(dirname $1))"
    else
        echo -e "  ${RED}❌${NC} $1 - НЕ НАЙДЕН"
        ((ERRORS++))
    fi
}

check_api_file "app/api/tours/route.ts"
check_api_file "app/api/tours/book/route.ts"
check_api_file "app/api/tours/hold/route.ts"
check_api_file "app/api/tours/availability/route.ts"
check_api_file "app/api/tours/operator/dashboard/route.ts"
check_api_file "app/api/cron/cleanup-holds/route.ts"
check_api_file "app/api/health/db/route.ts"

echo ""

# =====================================================
# 6. ПРОВЕРКА DATABASE SCHEMA
# =====================================================

echo "🗄️  Проверка database schema..."

check_schema() {
    if [ -f "$1" ]; then
        LINES=$(wc -l < "$1")
        echo -e "  ${GREEN}✅${NC} $1 ($LINES строк)"
    else
        echo -e "  ${RED}❌${NC} $1 - НЕ НАЙДЕН"
        ((ERRORS++))
    fi
}

check_schema "lib/database/schema.sql"
check_schema "lib/database/tour_system_schema.sql"

echo ""

# =====================================================
# 7. ПРОВЕРКА COMPONENTS
# =====================================================

echo "🎨 Проверка компонентов..."

check_component() {
    if [ -f "components/$1" ]; then
        echo -e "  ${GREEN}✅${NC} $1"
    else
        echo -e "  ${YELLOW}⚠️${NC}  $1 - не найден"
        ((WARNINGS++))
    fi
}

check_component "TourBookingWidget.tsx"
check_component "TourCard.tsx"
check_component "AIChatWidget.tsx"
check_component "WeatherWidget.tsx"

echo ""

# =====================================================
# 8. ПРОВЕРКА ДЕПЛОЙ СКРИПТОВ
# =====================================================

echo "🚀 Проверка деплой скриптов..."

if [ -f "deploy-production.sh" ]; then
    if [ -x "deploy-production.sh" ]; then
        echo -e "  ${GREEN}✅${NC} deploy-production.sh (executable)"
    else
        echo -e "  ${YELLOW}⚠️${NC}  deploy-production.sh (не executable)"
        echo "     Запустите: chmod +x deploy-production.sh"
        ((WARNINGS++))
    fi
    
    # Проверка домена в скрипте
    if grep -q 'DOMAIN="your-domain.com"' deploy-production.sh; then
        echo -e "  ${YELLOW}⚠️${NC}  DOMAIN не изменен (установлен default)"
        echo "     Измените DOMAIN в deploy-production.sh"
        ((WARNINGS++))
    else
        echo -e "  ${GREEN}✅${NC} DOMAIN настроен"
    fi
fi

if [ -f "ecosystem.config.js" ]; then
    echo -e "  ${GREEN}✅${NC} ecosystem.config.js"
else
    echo -e "  ${YELLOW}⚠️${NC}  ecosystem.config.js не найден"
    ((WARNINGS++))
fi

echo ""

# =====================================================
# 9. ПРОВЕРКА ДОКУМЕНТАЦИИ
# =====================================================

echo "📚 Проверка документации..."

DOC_COUNT=$(find . -maxdepth 1 -name "*.md" | wc -l)
echo -e "  ${GREEN}✅${NC} Найдено $DOC_COUNT файлов документации"

echo ""

# =====================================================
# 10. ИТОГИ
# =====================================================

echo "================================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 ВСЁ ОТЛИЧНО! Готово к деплою!${NC}"
    echo ""
    echo "Следующие шаги:"
    echo "  1. Local dev:     npm run dev"
    echo "  2. Production:    bash deploy-production.sh"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ЕСТЬ ПРЕДУПРЕЖДЕНИЯ ($WARNINGS)${NC}"
    echo ""
    echo "Можно деплоить, но рекомендуется исправить предупреждения"
    echo ""
    exit 0
else
    echo -e "${RED}❌ НАЙДЕНЫ ОШИБКИ!${NC}"
    echo ""
    echo -e "${RED}Ошибок: $ERRORS${NC}"
    echo -e "${YELLOW}Предупреждений: $WARNINGS${NC}"
    echo ""
    echo "Исправьте ошибки перед деплоем!"
    echo ""
    exit 1
fi
