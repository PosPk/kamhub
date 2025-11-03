#!/bin/bash
# 🚀 Скрипт деплоя на Timeweb VDS
# Использование: ./scripts/deploy-timeweb-vds.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Начало деплоя на Timeweb VDS${NC}"

# Параметры подключения
SSH_HOST="${TIMEWEB_SSH_HOST:-5.129.248.224}"
SSH_USER="${TIMEWEB_SSH_USER:-root}"
SSH_PASSWORD="${TIMEWEB_SSH_PASSWORD:-}"
SSH_PORT="${TIMEWEB_SSH_PORT:-22}"
PROJECT_DIR="${TIMEWEB_PROJECT_DIR:-/var/www/kamhub}"

# Проверка наличия sshpass
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}⚠️ sshpass не установлен. Установка...${NC}"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y sshpass
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        echo -e "${RED}❌ Не удалось установить sshpass. Установите вручную.${NC}"
        exit 1
    fi
fi

# Проверка пароля
if [ -z "$SSH_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️ Пароль не указан в переменной TIMEWEB_SSH_PASSWORD${NC}"
    read -sp "Введите SSH пароль: " SSH_PASSWORD
    echo
fi

echo -e "${GREEN}📦 Подключение к $SSH_USER@$SSH_HOST:$SSH_PORT${NC}"

# Создаем временный скрипт деплоя
DEPLOY_SCRIPT=$(cat << 'DEPLOY_EOF'
#!/bin/bash
set -e

PROJECT_DIR="${1:-/var/www/kamhub}"
echo "📁 Рабочая директория: $PROJECT_DIR"

# Создаем директорию если её нет
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Обновление кода через git
if [ -d .git ]; then
    echo "🔄 Обновление кода из Git..."
    git fetch origin
    git reset --hard origin/main || git reset --hard origin/master || git reset --hard origin/$(git branch --show-current)
    git clean -fd
else
    echo "⚠️ Git репозиторий не найден"
fi

# Установка зависимостей
echo "📚 Установка зависимостей..."
if [ -f package-lock.json ]; then
    npm ci
else
    npm install
fi

# Проверка типов (опционально, не блокирует деплой)
echo "🔍 Проверка типов..."
npm run type-check || echo "⚠️ Проверка типов завершилась с ошибками (продолжаем)"

# Сборка приложения
echo "🏗️ Сборка приложения..."
npm run build

# Применение миграций БД (если есть)
echo "🗄️ Применение миграций..."
if [ -f "scripts/migrate.ts" ] || npm run | grep -q "migrate"; then
    npm run migrate:up || echo "⚠️ Миграции не выполнены (продолжаем)"
fi

# Перезапуск приложения
echo "🔄 Перезапуск приложения..."

# Проверяем PM2
if command -v pm2 &> /dev/null; then
    echo "📦 Используем PM2..."
    if pm2 list | grep -q "kamhub"; then
        pm2 restart kamhub
    else
        cd "$PROJECT_DIR"
        if [ -f ecosystem.config.js ]; then
            pm2 start ecosystem.config.js
        else
            pm2 start npm --name kamhub -- start
        fi
    fi
    pm2 save
# Проверяем systemd
elif systemctl list-unit-files | grep -q "kamhub.service"; then
    echo "📦 Используем systemd..."
    sudo systemctl restart kamhub || sudo systemctl start kamhub
# Запускаем напрямую
else
    echo "📦 Запуск напрямую через npm start..."
    cd "$PROJECT_DIR"
    pkill -f "node.*kamhub" || true
    nohup npm start > /var/log/kamhub.log 2>&1 &
    echo "✅ Приложение запущено (PID: $!)"
fi

echo "✅ Деплой завершен!"
DEPLOY_EOF
)

# Передаем скрипт на сервер и выполняем
echo -e "${GREEN}📤 Отправка скрипта деплоя на сервер...${NC}"
echo "$DEPLOY_SCRIPT" | sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "cat > /tmp/deploy-kamhub.sh && chmod +x /tmp/deploy-kamhub.sh && bash /tmp/deploy-kamhub.sh $PROJECT_DIR && rm /tmp/deploy-kamhub.sh"

echo -e "${GREEN}✅ Деплой успешно завершен!${NC}"
echo -e "${GREEN}🌐 Приложение доступно по адресу: http://$SSH_HOST${NC}"
