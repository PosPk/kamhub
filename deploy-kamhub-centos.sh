#!/bin/bash
#============================================
# KAMHUB AUTOMATIC DEPLOYMENT SCRIPT
# CentOS/RHEL/AlmaLinux Version
#============================================

set -e

echo "🚀 НАЧИНАЕМ УСТАНОВКУ KAMHUB (CentOS/RHEL)..."
echo "================================================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() { echo -e "${GREEN}✓ $1${NC}"; }
info() { echo -e "${YELLOW}→ $1${NC}"; }
error() { echo -e "${RED}✗ $1${NC}"; exit 1; }

#============================================
# ШАГ 1: ОБНОВЛЕНИЕ СИСТЕМЫ
#============================================
info "Шаг 1/8: Обновление системы..."
yum update -y -q
success "Система обновлена"

#============================================
# ШАГ 2: УСТАНОВКА NODE.JS 20.x
#============================================
info "Шаг 2/8: Установка Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
fi
node --version
npm --version
success "Node.js установлен: $(node --version)"

#============================================
# ШАГ 3: УСТАНОВКА POSTGRESQL + POSTGIS
#============================================
info "Шаг 3/8: Установка PostgreSQL 15 + PostGIS..."
if ! command -v psql &> /dev/null; then
    yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-$(rpm -E %{rhel})-x86_64/pgdg-redhat-repo-latest.noarch.rpm
    yum install -y postgresql15-server postgresql15-contrib postgis34_15
    /usr/pgsql-15/bin/postgresql-15-setup initdb
    systemctl start postgresql-15
    systemctl enable postgresql-15
fi
success "PostgreSQL установлен"

#============================================
# ШАГ 4: НАСТРОЙКА БАЗЫ ДАННЫХ
#============================================
info "Шаг 4/8: Настройка базы данных..."
sudo -u postgres /usr/pgsql-15/bin/psql <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'kamhub') THEN
        CREATE USER kamhub WITH PASSWORD 'kamhub_secure_password_2025';
    END IF;
END
\$\$;

SELECT 'CREATE DATABASE kamhub OWNER kamhub'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'kamhub')\gexec

GRANT ALL PRIVILEGES ON DATABASE kamhub TO kamhub;
EOF

sudo -u postgres /usr/pgsql-15/bin/psql -d kamhub <<EOF
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

success "База данных настроена"

#============================================
# ШАГ 5: УСТАНОВКА NGINX И PM2
#============================================
info "Шаг 5/8: Установка Nginx и PM2..."
yum install -y nginx
systemctl enable nginx

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
success "Nginx и PM2 установлены"

#============================================
# ШАГ 6: КЛОНИРОВАНИЕ РЕПОЗИТОРИЯ
#============================================
info "Шаг 6/8: Клонирование и сборка приложения..."

yum install -y git

rm -rf /var/www/kamhub
mkdir -p /var/www
cd /var/www
git clone https://github.com/PosPk/kamhub.git
cd kamhub
git checkout main

rm -rf node_modules package-lock.json .next

npm ci

cat > .env << 'ENVEOF'
DATABASE_URL=postgresql://kamhub:kamhub_secure_password_2025@localhost:5432/kamhub
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://5.129.248.224:3000
TIMEWEB_API_TOKEN=eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjFrYnhacFJNQGJSI0tSbE1xS1lqIn0.eyJ1c2VyIjoicGE0MjIxMDgiLCJ0eXBlIjoiYXBpX2tleSIsImFwaV9rZXlfaWQiOiI0MmZmZTY1MC02OWI4LTRmZmQtYTFkOC02OWRkMjMwM2QyY2MiLCJpYXQiOjE3NjE3ODUzNDl9.SFHpwgy9kr-EH2CwN6K1REkOl7KCpiUnMk5ivTRljEaWl8iE-B-BMjaJxaFhpdB2dqcb33ky2oyfwxkU1Sszrbo-8UINnFO5SothY4P6WC8kSSHxFlLI2i0xGCa3YzgyYZ1Wgn2a0jf__ZcyZi7ZsaJkuold9NAeeGCCrAUbdVsr39-fLDL_EKh0iekq_tuO59f_BCmg7Poe7xKlmNYzu2hy3GnfNp3ueKW52H6kFkGwibixS3tWKCHkPpyTAjRztWKCnDZOOG6xDk4sSiPPMlZOEfFzzkpKkizQ9CykBC06SXwmT2uPRR2NyZJIY-PZd4AVZ34H1jXQ-NGquRPi_aYiywt3LtOVDRarpVErBdk6I0qO0Yf33zICvMN-yFpXuY_oSlE8v3C-02XHnYLsMXcHTsUB4ISkJrhglBkv-hTzuiQxwAEZp0eHOEq8YNz6qOLU3RcaNgg0DWGXMDrMzObYx2NknrZUCMbRFftIU-C1Ilo8Ayy98MwI3J77X62p
S3_ENDPOINT=https://s3.timeweb.cloud
S3_BUCKET=d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50
S3_ACCESS_KEY=F2CP4X3X17GVQ1YH5I5D
S3_SECRET_KEY=72iAsYR4QQCIdaDI9e9AzXnzVvvP8bvPELmrBVzX
S3_REGION=ru-1
JWT_SECRET=kamhub_jwt_secret_super_secure_2025_change_me_in_production
ENVEOF

success ".env файл создан"

info "Применение SQL миграций..."
sudo -u postgres /usr/pgsql-15/bin/psql -d kamhub -f lib/database/schema.sql 2>&1 | grep -v "NOTICE" || true
sudo -u postgres /usr/pgsql-15/bin/psql -d kamhub -f lib/database/operators_schema.sql 2>&1 | grep -v "NOTICE" || true
sudo -u postgres /usr/pgsql-15/bin/psql -d kamhub -f lib/database/transfer_schema.sql 2>&1 | grep -v "NOTICE" || true
sudo -u postgres /usr/pgsql-15/bin/psql -d kamhub -f lib/database/loyalty_schema.sql 2>&1 | grep -v "NOTICE" || true
sudo -u postgres /usr/pgsql-15/bin/psql -d kamhub -f lib/database/transfer_payments_schema.sql 2>&1 | grep -v "NOTICE" || true
success "SQL миграции применены"

info "Сборка Next.js приложения..."
npm run build
success "Приложение собрано"

#============================================
# ШАГ 7: НАСТРОЙКА PM2
#============================================
info "Шаг 7/8: Настройка PM2..."

mkdir -p /var/log/kamhub

cat > ecosystem.config.js << 'PMEOF'
module.exports = {
  apps: [{
    name: 'kamhub',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/kamhub',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/kamhub/error.log',
    out_file: '/var/log/kamhub/out.log',
    log_file: '/var/log/kamhub/combined.log',
    time: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false
  }]
};
PMEOF

pm2 delete kamhub 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

success "PM2 настроен и приложение запущено"

#============================================
# ШАГ 8: НАСТРОЙКА NGINX
#============================================
info "Шаг 8/8: Настройка Nginx..."

cat > /etc/nginx/conf.d/kamhub.conf << 'NGINXEOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    access_log /var/log/nginx/kamhub_access.log;
    error_log /var/log/nginx/kamhub_error.log;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /graphics/ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

nginx -t
systemctl restart nginx

success "Nginx настроен"

#============================================
# ШАГ 9: НАСТРОЙКА FIREWALL
#============================================
info "Настройка Firewall (firewalld)..."

if ! command -v firewall-cmd &> /dev/null; then
    yum install -y firewalld
    systemctl start firewalld
    systemctl enable firewalld
fi

firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

success "Firewall настроен"

#============================================
# ФИНАЛЬНАЯ ПРОВЕРКА
#============================================
echo ""
echo "================================================"
echo "🎉 УСТАНОВКА ЗАВЕРШЕНА!"
echo "================================================"
echo ""
echo "📊 СТАТУС:"
echo "  • PostgreSQL: $(systemctl is-active postgresql-15)"
echo "  • Nginx: $(systemctl is-active nginx)"
echo "  • PM2: $(pm2 list | grep -c online) инстансов online"
echo ""
echo "🌐 ПРИЛОЖЕНИЕ ДОСТУПНО:"
echo "  → http://5.129.248.224"
echo ""
echo "📝 ЛОГИ:"
echo "  • PM2: pm2 logs kamhub"
echo "  • PM2 монитор: pm2 monit"
echo "  • Nginx: tail -f /var/log/nginx/kamhub_access.log"
echo ""
echo "================================================"

sleep 3
info "Проверка доступности приложения..."
if curl -f -s http://127.0.0.1:3000 > /dev/null; then
    success "✅ Приложение отвечает на http://127.0.0.1:3000"
else
    error "⚠️  Приложение не отвечает. Проверьте логи: pm2 logs kamhub"
fi

if curl -f -s http://127.0.0.1:80 > /dev/null; then
    success "✅ Nginx работает на http://127.0.0.1:80"
else
    error "⚠️  Nginx не работает. Проверьте: systemctl status nginx"
fi

echo ""
success "🚀 ДЕПЛОЙ УСПЕШНО ЗАВЕРШЁН!"
echo ""
echo "Откройте в браузере: http://5.129.248.224"
echo ""
