#!/bin/bash

# ============================================================================
# Скрипт первоначальной настройки сервера на Timeweb Cloud
# Запускать от root: bash setup-timeweb-server.sh
# ============================================================================

set -e

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
section() { echo -e "\n${BLUE}═══════════════════════════════════════${NC}\n${BLUE}  $1${NC}\n${BLUE}═══════════════════════════════════════${NC}\n"; }

# Проверка, что скрипт запущен от root
if [ "$EUID" -ne 0 ]; then 
    error "Пожалуйста, запустите скрипт от root (sudo)"
    exit 1
fi

section "Обновление системы"
info "Обновление списка пакетов..."
apt update

info "Обновление установленных пакетов..."
apt upgrade -y

section "Установка базовых пакетов"
info "Установка необходимых пакетов..."
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    ufw \
    nginx \
    certbot \
    python3-certbot-nginx \
    postgresql-client \
    awscli \
    htop \
    tmux

section "Настройка файрвола UFW"
info "Настройка правил файрвола..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable
info "✅ Файрвол настроен и активирован"

section "Установка Node.js 20.x LTS"
info "Добавление репозитория NodeSource..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

info "Установка Node.js..."
apt install -y nodejs

info "Проверка установки..."
node --version
npm --version

section "Установка глобальных npm пакетов"
info "Установка PM2..."
npm install -g pm2

info "Установка pnpm (опционально)..."
npm install -g pnpm

section "Создание пользователя для приложения"
APP_USER="kamchatour"

if id "$APP_USER" &>/dev/null; then
    warn "Пользователь $APP_USER уже существует"
else
    info "Создание пользователя $APP_USER..."
    adduser --disabled-password --gecos "" $APP_USER
    usermod -aG sudo $APP_USER
    info "✅ Пользователь $APP_USER создан"
fi

# Создание директорий
info "Создание рабочих директорий..."
sudo -u $APP_USER mkdir -p /home/$APP_USER/kamchatour-hub
sudo -u $APP_USER mkdir -p /home/$APP_USER/backups
sudo -u $APP_USER mkdir -p /home/$APP_USER/scripts
sudo -u $APP_USER mkdir -p /home/$APP_USER/logs

section "Настройка SSH"
info "Настройка SSH для безопасности..."

# Резервная копия конфигурации SSH
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Настройки SSH
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

warn "⚠️  ВАЖНО: Убедитесь, что вы добавили свой SSH ключ перед перезапуском SSH!"
read -p "Вы добавили SSH ключ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    info "Перезапуск SSH..."
    systemctl restart sshd
else
    warn "SSH не перезапущен. Перезапустите вручную после добавления ключа."
fi

section "Настройка Nginx"
info "Создание базовой конфигурации Nginx..."

# Удаление дефолтной конфигурации
rm -f /etc/nginx/sites-enabled/default

# Создание конфигурации для приложения
cat > /etc/nginx/sites-available/kamchatour << 'EOF'
server {
    listen 80;
    server_name _;

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
EOF

# Активация конфигурации
ln -sf /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/kamchatour

# Проверка конфигурации
nginx -t

# Перезапуск Nginx
systemctl restart nginx
systemctl enable nginx

info "✅ Nginx настроен"

section "Настройка PM2"
info "Настройка PM2 для автозапуска..."
sudo -u $APP_USER pm2 startup systemd -u $APP_USER --hp /home/$APP_USER
# Команда выше выведет команду, которую нужно выполнить от root
# Выполняем её автоматически:
PM2_STARTUP_CMD=$(sudo -u $APP_USER pm2 startup systemd -u $APP_USER --hp /home/$APP_USER | grep "sudo env" | tail -1)
eval $PM2_STARTUP_CMD

section "Настройка мониторинга"
info "Установка инструментов мониторинга..."
apt install -y sysstat

info "Настройка логротации для PM2..."
sudo -u $APP_USER pm2 install pm2-logrotate
sudo -u $APP_USER pm2 set pm2-logrotate:max_size 10M
sudo -u $APP_USER pm2 set pm2-logrotate:retain 7

section "Настройка автоматических обновлений безопасности"
info "Установка unattended-upgrades..."
apt install -y unattended-upgrades

cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

info "✅ Автоматические обновления настроены"

section "Создание скрипта резервного копирования"
cat > /home/$APP_USER/scripts/backup-db.sh << 'BACKUP_SCRIPT'
#!/bin/bash
# Скрипт резервного копирования базы данных

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/kamchatour/backups"
DB_NAME="kamchatour"

# Загрузка переменных окружения
if [ -f /home/kamchatour/kamchatour-hub/.env.production ]; then
    source /home/kamchatour/kamchatour-hub/.env.production
fi

# Извлечение данных подключения из DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

mkdir -p $BACKUP_DIR

echo "Creating database backup..."
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  > $BACKUP_DIR/db_backup_$DATE.sql

if [ $? -eq 0 ]; then
    gzip $BACKUP_DIR/db_backup_$DATE.sql
    echo "✅ Backup created: db_backup_$DATE.sql.gz"
    
    # Удаление старых бэкапов (старше 7 дней)
    find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
    echo "Old backups cleaned up"
else
    echo "❌ Backup failed!"
    exit 1
fi
BACKUP_SCRIPT

chmod +x /home/$APP_USER/scripts/backup-db.sh
chown $APP_USER:$APP_USER /home/$APP_USER/scripts/backup-db.sh

info "✅ Скрипт резервного копирования создан"

section "Настройка cron для резервного копирования"
# Добавление задачи в cron (ежедневно в 2:00)
(crontab -u $APP_USER -l 2>/dev/null; echo "0 2 * * * /home/$APP_USER/scripts/backup-db.sh >> /home/$APP_USER/logs/backup.log 2>&1") | crontab -u $APP_USER -

info "✅ Cron задача для резервного копирования настроена"

section "Оптимизация системы"
info "Настройка лимитов..."
cat >> /etc/security/limits.conf << 'EOF'
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
EOF

info "Настройка sysctl..."
cat >> /etc/sysctl.conf << 'EOF'
# Network optimizations
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30

# Memory optimizations
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 2
EOF

sysctl -p

section "Проверка установки"
info "Проверка установленных компонентов..."

echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo "PostgreSQL client: $(psql --version)"

section "🎉 Настройка сервера завершена!"

info "Следующие шаги:"
echo "1. Добавьте SSH ключи для пользователя $APP_USER"
echo "2. Настройте переменные окружения в .env.production"
echo "3. Настройте домен и получите SSL сертификат:"
echo "   sudo certbot --nginx -d your-domain.ru"
echo "4. Разверните приложение с помощью deploy-to-timeweb.sh"

warn "⚠️  ВАЖНО: Сохраните информацию о пользователе и паролях!"
echo ""
info "Информация о пользователе приложения:"
echo "  Пользователь: $APP_USER"
echo "  Домашняя директория: /home/$APP_USER"
echo "  Директория приложения: /home/$APP_USER/kamchatour-hub"

section "Рекомендации по безопасности"
echo "1. ✅ Измените SSH порт (опционально)"
echo "2. ✅ Установите fail2ban для защиты от брутфорса"
echo "3. ✅ Настройте файрвол в панели Timeweb Cloud"
echo "4. ✅ Регулярно обновляйте систему"
echo "5. ✅ Мониторьте логи приложения и системы"

info "✨ Готово! Сервер настроен и готов к развертыванию приложения."
