#!/bin/bash

###############################################################################
# СКРИПТ ИСПРАВЛЕНИЯ ПРОБЛЕМ БЕЗОПАСНОСТИ
# Автоматически удаляет секреты из git репозитория
###############################################################################

echo "🔒 ИСПРАВЛЕНИЕ ПРОБЛЕМ БЕЗОПАСНОСТИ"
echo "===================================="
echo ""

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_error() { echo -e "${RED}✗${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }

# Проверка что мы в git репозитории
if [ ! -d .git ]; then
    log_error "Не git репозиторий!"
    exit 1
fi

echo "🔍 Сканирование репозитория..."
echo ""

# Проверка файлов отслеживаемых git
TRACKED_ENV=$(git ls-files | grep "^\.env$")
TRACKED_TOKEN=$(git ls-files | grep "^token\.txt$")

if [ -z "$TRACKED_ENV" ] && [ -z "$TRACKED_TOKEN" ]; then
    log_success "Секретные файлы не отслеживаются git"
    log_success "Репозиторий безопасен!"
    exit 0
fi

echo "🚨 НАЙДЕНЫ ПРОБЛЕМЫ:"
echo ""

if [ ! -z "$TRACKED_ENV" ]; then
    log_error ".env файл отслеживается git"
fi

if [ ! -z "$TRACKED_TOKEN" ]; then
    log_error "token.txt отслеживается git"
fi

echo ""
echo "❓ Что делать?"
echo ""
echo "1) Удалить только из git (файлы останутся локально)"
echo "2) Удалить из git + очистить историю (НЕОБРАТИМО!)"
echo "3) Отмена"
echo ""
read -p "Выберите (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📝 Удаление файлов из git..."
        
        # Удаляем из git но оставляем локально
        if [ ! -z "$TRACKED_ENV" ]; then
            git rm --cached .env
            log_success ".env удален из git (файл сохранен локально)"
        fi
        
        if [ ! -z "$TRACKED_TOKEN" ]; then
            git rm token.txt
            log_success "token.txt удален"
        fi
        
        # Удаляем лишние .env примеры
        git rm --cached .env.timeweb-ai .env.timeweb-apps 2>/dev/null || true
        git rm --cached .env.production.example .env.local.example 2>/dev/null || true
        
        echo ""
        echo "Создать commit? (y/n)"
        read -p "> " commit_choice
        
        if [[ $commit_choice =~ ^[Yy]$ ]]; then
            git commit -m "security: remove sensitive files from git"
            log_success "Commit создан"
            
            echo ""
            echo "Push в remote? (y/n)"
            read -p "> " push_choice
            
            if [[ $push_choice =~ ^[Yy]$ ]]; then
                git push
                log_success "Изменения отправлены в remote"
            fi
        fi
        
        echo ""
        log_warn "⚠️  ВАЖНО: Файлы удалены только из текущей версии"
        log_warn "История git ещё содержит секреты!"
        log_warn "Для полной очистки запустите опцию 2"
        ;;
        
    2)
        echo ""
        log_error "⚠️  ВНИМАНИЕ: Это необратимая операция!"
        log_error "История git будет изменена"
        log_error "Все члены команды должны пересинхронизировать репо"
        echo ""
        echo "Продолжить? (введите YES для подтверждения)"
        read -p "> " confirm
        
        if [ "$confirm" != "YES" ]; then
            log_warn "Отменено"
            exit 0
        fi
        
        echo ""
        echo "📝 Проверка git-filter-repo..."
        
        if ! command -v git-filter-repo &> /dev/null; then
            echo "Установка git-filter-repo..."
            
            if command -v pip3 &> /dev/null; then
                pip3 install git-filter-repo
            elif command -v pip &> /dev/null; then
                pip install git-filter-repo
            else
                log_error "pip не найден. Установите вручную:"
                log_error "pip install git-filter-repo"
                exit 1
            fi
        fi
        
        log_success "git-filter-repo доступен"
        
        echo ""
        echo "🔄 Создание backup..."
        BACKUP_DIR="git-backup-$(date +%Y%m%d-%H%M%S)"
        git clone . "../$BACKUP_DIR"
        log_success "Backup создан: ../$BACKUP_DIR"
        
        echo ""
        echo "🗑️  Удаление файлов из истории..."
        
        # Удаляем .env из всей истории
        if [ ! -z "$TRACKED_ENV" ]; then
            git filter-repo --invert-paths --path .env --force
            log_success ".env удален из истории"
        fi
        
        # Удаляем token.txt
        if [ ! -z "$TRACKED_TOKEN" ]; then
            git filter-repo --invert-paths --path token.txt --force
            log_success "token.txt удален из истории"
        fi
        
        echo ""
        log_success "История git очищена!"
        echo ""
        log_warn "⚠️  Следующие шаги:"
        echo "1. Проверьте репозиторий: git log --all"
        echo "2. Force push: git push origin --force --all"
        echo "3. Уведомите команду о необходимости re-clone"
        echo ""
        echo "Команда для других разработчиков:"
        echo "  cd .."
        echo "  rm -rf kamchatour"
        echo "  git clone <repo-url>"
        ;;
        
    3)
        log_warn "Отменено"
        exit 0
        ;;
        
    *)
        log_error "Неверный выбор"
        exit 1
        ;;
esac

echo ""
echo "✅ ГОТОВО!"
echo ""
echo "📋 Что делать дальше:"
echo ""
echo "1. Сгенерируйте новый JWT_SECRET:"
echo "   openssl rand -base64 32"
echo ""
echo "2. Создайте новый .env файл:"
echo "   cp .env.example .env"
echo "   nano .env  # Добавьте секреты"
echo ""
echo "3. В Timeweb Cloud добавьте секреты через UI:"
echo "   https://timeweb.cloud/my/projects/1883095"
echo "   Settings → Environment Variables"
echo ""
echo "4. Проверьте .gitignore:"
echo "   cat .gitignore | grep .env"
echo ""

log_success "Безопасность улучшена! 🔒"
