#!/bin/bash
# 🚀 Первый деплой на сервер
# Использование: ./scripts/first-deploy.sh

set -e

SSH_HOST="${TIMEWEB_SSH_HOST:-5.129.248.224}"
SSH_USER="${TIMEWEB_SSH_USER:-root}"
SSH_PASSWORD="${TIMEWEB_SSH_PASSWORD:-xQvB1pv?yZTjaR}"
SSH_PORT="${TIMEWEB_SSH_PORT:-22}"
PROJECT_DIR="${TIMEWEB_PROJECT_DIR:-/var/www/kamhub}"

echo "🚀 Первый деплой на $SSH_USER@$SSH_HOST:$SSH_PORT"

# Проверка sshpass
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass не установлен. Устанавливаю..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y sshpass
    else
        echo "Установите sshpass вручную"
        exit 1
    fi
fi

# Проверка подключения
echo "📡 Проверка подключения..."
sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "echo '✅ Подключение установлено'"

# Создаем скрипт деплоя
DEPLOY_SCRIPT=$(cat << 'DEPLOY_EOF'
#!/bin/bash
set -e

PROJECT_DIR="${1:-/var/www/kamhub}"
cd "$PROJECT_DIR"

echo "📦 Клонирование репозитория..."
if [ ! -d .git ]; then
    # Если Git не настроен, создадим базовую структуру
    echo "⚠️ Git не найден, создаем базовую структуру..."
    mkdir -p "$PROJECT_DIR"
else
    echo "🔄 Обновление кода..."
    git fetch origin
    git reset --hard origin/main || git reset --hard origin/master || true
    git clean -fd
fi

# Если нет package.json, значит проект еще не загружен
if [ ! -f package.json ]; then
    echo "❌ Проект не найден. Сначала загрузите код через:"
    echo "   git clone https://github.com/ВАШ_USERNAME/kamhub.git $PROJECT_DIR"
    exit 1
fi

# Установка зависимостей
echo "📚 Установка зависимостей..."
npm ci || npm install

# Создание .env если нет
if [ ! -f .env ]; then
    echo "📝 Создание .env файла..."
    cat > .env << 'ENV_EOF'
NODE_ENV=production
PORT=3000
# DATABASE_URL=postgresql://user:password@localhost:5432/kamchatour
# JWT_SECRET=сгенерируйте_через_openssl_rand_-base64_32
ENV_EOF
    echo "⚠️ .env создан с шаблоном. Отредактируйте его!"
fi

# Проверка типов
echo "🔍 Проверка типов..."
npm run type-check || echo "⚠️ Проверка типов завершилась с ошибками (продолжаем)"

# Сборка
echo "🏗️ Сборка приложения..."
npm run build

# Применение миграций
echo "🗄️ Применение миграций..."
npm run migrate:up || echo "⚠️ Миграции не выполнены (продолжаем)"

# Запуск через PM2
echo "🔄 Запуск приложения..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "kamchatour-hub"; then
        pm2 restart kamchatour-hub
        echo "✅ Приложение перезапущено"
    else
        if [ -f ecosystem.config.js ]; then
            pm2 start ecosystem.config.js
        else
            pm2 start npm --name kamchatour-hub -- start
        fi
        pm2 save
        echo "✅ Приложение запущено"
    fi
    pm2 list
else
    echo "⚠️ PM2 не установлен. Запускаем напрямую..."
    nohup npm start > /var/log/kamhub.log 2>&1 &
    echo "✅ Приложение запущено (PID: $!)"
fi

echo "✅ Деплой завершен!"
DEPLOY_EOF
)

# Выполняем деплой
echo "$DEPLOY_SCRIPT" | sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "bash -s" -- "$PROJECT_DIR"

echo ""
echo "✅ Первый деплой выполнен!"
echo "🌐 Приложение должно быть доступно по адресу: http://$SSH_HOST:3000"
echo ""
echo "📋 Проверка статуса:"
sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "pm2 list || echo 'PM2 не установлен'"
