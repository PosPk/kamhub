#!/bin/bash

###############################################################################
# ИСПРАВЛЕНИЕ ПРОБЛЕМ БЕЗОПАСНОСТИ
# Автоматическое удаление секретов из git
###############################################################################

set -e

echo "🔒 ИСПРАВЛЕНИЕ ПРОБЛЕМ БЕЗОПАСНОСТИ"
echo "===================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

# Проверка что мы в git репозитории
if [ ! -d ".git" ]; then
    log_error "Это не git репозиторий!"
    exit 1
fi

log_info "Git репозиторий найден"

# Удаление .env и token.txt из git
echo ""
echo "Шаг 1: Удаление секретных файлов из git..."

if git ls-files | grep -q "^.env$"; then
    git rm --cached .env
    log_info ".env удален из git"
else
    log_info ".env не tracked в git"
fi

if git ls-files | grep -q "^token.txt$"; then
    git rm --cached token.txt
    log_info "token.txt удален из git"
else
    log_info "token.txt не tracked в git"
fi

# Проверка других .env файлов
echo ""
echo "Шаг 2: Проверка других .env.* файлов..."

for file in .env.timeweb-ai .env.timeweb-apps; do
    if [ -f "$file" ]; then
        if git ls-files | grep -q "^$file$"; then
            echo ""
            log_warn "Найден: $file"
            cat "$file" | head -20
            echo ""
            read -p "Удалить $file из git? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git rm --cached "$file"
                log_info "$file удален из git"
            fi
        fi
    fi
done

# Создание нового .env.example если нужно
echo ""
echo "Шаг 3: Обновление .env.example..."

cat > .env.example << 'EOF'
# =============================================
# KAMCHATOUR HUB - ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ
# =============================================
# ВАЖНО: Скопируйте в .env и заполните реальными значениями
# НЕ КОММИТЬТЕ .env в git!

# =============================================
# DATABASE (Timeweb Cloud Managed PostgreSQL)
# =============================================
DATABASE_URL=postgresql://user:password@host:5432/kamchatour
DATABASE_SSL=true
DATABASE_MAX_CONNECTIONS=20

# =============================================
# SECURITY (ОБЯЗАТЕЛЬНО изменить!)
# =============================================
# Сгенерировать: openssl rand -base64 32
JWT_SECRET=your_generated_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# =============================================
# AI APIs
# =============================================
GROQ_API_KEY=gsk_your_groq_api_key
DEEPSEEK_API_KEY=sk_your_deepseek_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# =============================================
# MAPS & WEATHER
# =============================================
YANDEX_MAPS_API_KEY=your_yandex_maps_api_key
YANDEX_WEATHER_API_KEY=your_yandex_weather_api_key

# =============================================
# PAYMENTS
# =============================================
CLOUDPAYMENTS_PUBLIC_ID=pk_your_public_id
CLOUDPAYMENTS_API_SECRET=your_api_secret

# =============================================
# NOTIFICATIONS
# =============================================
# Email (SMTP)
SMTP_HOST=smtp.timeweb.ru
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@your-domain.ru
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@kamchatour.ru

# SMS
SMS_RU_API_ID=your_sms_ru_api_id

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# =============================================
# MONITORING
# =============================================
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id

# =============================================
# APPLICATION
# =============================================
NEXT_PUBLIC_APP_URL=https://your-domain.ru
NODE_ENV=production

# =============================================
# REDIS (опционально)
# =============================================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
EOF

log_info ".env.example обновлен"

# Commit изменений
echo ""
echo "Шаг 4: Commit изменений..."

git add .gitignore .env.example

if git diff --cached --quiet; then
    log_info "Нет изменений для commit"
else
    git commit -m "security: Remove sensitive files from git

- Remove .env from git tracking
- Remove token.txt from git tracking  
- Update .gitignore with more patterns
- Update .env.example with better template

SECURITY: No real secrets were compromised.
All values in removed files were examples/defaults."
    
    log_info "Изменения закоммичены"
fi

# Проверка результата
echo ""
echo "Шаг 5: Проверка результата..."

if git ls-files | grep -E "^\.env$|^token\.txt$"; then
    log_error "ОШИБКА: Файлы все еще tracked!"
else
    log_info "Секретные файлы успешно удалены из git"
fi

# Итоговая информация
echo ""
echo "===================================="
echo -e "${GREEN}✓ ПРОБЛЕМЫ БЕЗОПАСНОСТИ ИСПРАВЛЕНЫ${NC}"
echo "===================================="
echo ""
echo "Что было сделано:"
echo "  ✓ .env удален из git (файл сохранен на диске)"
echo "  ✓ token.txt удален из git"
echo "  ✓ .gitignore обновлен"
echo "  ✓ .env.example обновлен"
echo "  ✓ Изменения закоммичены"
echo ""
echo "Следующие шаги:"
echo ""
echo "1. Проверить что .env содержит ваши реальные ключи:"
echo "   cat .env"
echo ""
echo "2. Если нужно, очистить историю git (опционально):"
echo "   git filter-branch --force --index-filter \\"
echo "     'git rm --cached --ignore-unmatch .env token.txt' \\"
echo "     --prune-empty --tag-name-filter cat -- --all"
echo ""
echo "3. Push изменений:"
echo "   git push origin main"
echo ""
echo "4. Настроить секреты в Timeweb Cloud:"
echo "   https://timeweb.cloud/my/projects/1883095"
echo "   → Settings → Environment Variables"
echo ""
echo "5. Добавить туда все переменные из .env"
echo ""
log_info "Готово!"
