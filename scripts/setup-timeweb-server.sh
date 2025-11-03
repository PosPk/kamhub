#!/bin/bash
# 🔧 Скрипт первичной настройки сервера Timeweb VDS
# Использование: ./scripts/setup-timeweb-server.sh

set -e

SSH_HOST="${TIMEWEB_SSH_HOST:-5.129.248.224}"
SSH_USER="${TIMEWEB_SSH_USER:-root}"
SSH_PASSWORD="${TIMEWEB_SSH_PASSWORD:-xQvB1pv?yZTjaR}"
SSH_PORT="${TIMEWEB_SSH_PORT:-22}"

echo "🚀 Настройка сервера $SSH_USER@$SSH_HOST:$SSH_PORT"

# Установка sshpass если нужно
if ! command -v sshpass &> /dev/null; then
    echo "📦 Установка sshpass..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y sshpass
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass || echo "Установите sshpass вручную: brew install hudochenkov/sshpass/sshpass"
    fi
fi

# Создаем скрипт настройки
SETUP_SCRIPT=$(cat << 'SETUP_EOF'
#!/bin/bash
set -e

echo "🔧 Начало настройки сервера..."

# Обновление системы
echo "📦 Обновление системы..."
apt-get update
apt-get upgrade -y

# Установка Node.js 20.x
echo "📦 Установка Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "✅ Node.js версия: $(node --version)"
echo "✅ npm версия: $(npm --version)"

# Установка PM2
echo "📦 Установка PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup || echo "⚠️ PM2 startup не настроен (нужен sudo)"
fi
echo "✅ PM2 установлен: $(pm2 --version)"

# Установка PostgreSQL клиента
echo "📦 Установка PostgreSQL клиента..."
if ! command -v psql &> /dev/null; then
    apt-get install -y postgresql-client
fi
echo "✅ PostgreSQL клиент установлен"

# Установка Git (если нужно)
echo "📦 Проверка Git..."
if ! command -v git &> /dev/null; then
    apt-get install -y git
fi
echo "✅ Git установлен: $(git --version)"

# Создание директорий
echo "📁 Создание директорий..."
mkdir -p /var/www/kamhub
mkdir -p /var/log/kamhub
chown -R $USER:$USER /var/www/kamhub || true
chown -R $USER:$USER /var/log/kamhub || true

# Установка основных утилит
echo "📦 Установка утилит..."
apt-get install -y curl wget nano htop

# Настройка firewall (базовая)
echo "🔥 Настройка firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    echo "y" | ufw enable || echo "⚠️ Firewall уже включен"
fi

echo "✅ Настройка сервера завершена!"
echo ""
echo "📋 Что установлено:"
echo "  - Node.js $(node --version)"
echo "  - npm $(npm --version)"
echo "  - PM2 $(pm2 --version)"
echo "  - PostgreSQL клиент"
echo "  - Git"
echo ""
echo "📁 Директории созданы:"
echo "  - /var/www/kamhub (проект)"
echo "  - /var/log/kamhub (логи)"
SETUP_EOF
)

# Выполняем настройку на сервере
echo "📤 Выполнение настройки на сервере..."
echo "$SETUP_SCRIPT" | sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "bash"

echo ""
echo "✅ Сервер настроен!"
echo "🌐 IP: $SSH_HOST"
echo "📁 Директория проекта: /var/www/kamhub"
