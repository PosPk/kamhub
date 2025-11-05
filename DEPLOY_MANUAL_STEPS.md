# 🚀 РУЧНОЙ ДЕПЛОЙ - ПОШАГОВАЯ ИНСТРУКЦИЯ

**Я не могу напрямую подключиться к вашему серверу по SSH из соображений безопасности.**

Но я подготовил всё необходимое! Вам нужно выполнить несколько команд.

---

## ⚡ БЫСТРЫЙ СПОСОБ (5 минут)

### На вашем компьютере:

```bash
# 1. Перейти в папку проекта
cd /workspace

# 2. Запустить скрипт деплоя
./deploy-to-timeweb-production.sh

# Введите пароль когда попросит: xQvB1pv?yZTjaR
```

**Готово!** Скрипт всё сделает сам за 10-15 минут.

---

## 📋 РУЧНОЙ СПОСОБ (если нужен контроль)

### Шаг 1: Подключиться к серверу

```bash
ssh root@5.129.248.224
# Пароль: xQvB1pv?yZTjaR
```

### Шаг 2: Установить необходимое ПО

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# PostgreSQL 15
apt-get install -y postgresql postgresql-contrib

# Nginx
apt-get install -y nginx

# PM2
npm install -g pm2

echo "✅ Всё установлено"
```

### Шаг 3: Создать базу данных

```bash
# Создать БД и пользователя
sudo -u postgres psql << 'EOF'
DROP DATABASE IF EXISTS kamhub_production;
DROP USER IF EXISTS kamhub;
CREATE USER kamhub WITH PASSWORD 'kamhub2024secure';
CREATE DATABASE kamhub_production OWNER kamhub;
GRANT ALL PRIVILEGES ON DATABASE kamhub_production TO kamhub;
\q
EOF

echo "✅ База данных создана"
```

### Шаг 4: Клонировать репозиторий

```bash
# Создать директорию
mkdir -p /var/www
cd /var/www

# Клонировать (используйте текущую ветку)
git clone https://github.com/PosPk/kamhub.git kamhub
cd kamhub

# Или если уже есть - обновить
cd /var/www/kamhub
git fetch origin
git checkout main  # или нужная ветка
git pull

echo "✅ Код скачан"
```

### Шаг 5: Настроить переменные окружения

```bash
cd /var/www/kamhub

cat > .env.production << 'EOF'
# Database
DATABASE_URL=postgresql://kamhub:kamhub2024secure@localhost:5432/kamhub_production
DATABASE_SSL=false
DATABASE_MAX_CONNECTIONS=20

# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=http://5.129.248.224

# Security
JWT_SECRET=your-generated-secret-32-chars-here-change-this
JWT_EXPIRES_IN=7d

# Timeweb S3 Storage
S3_ENDPOINT=https://s3.twcstorage.ru
S3_BUCKET=d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50
S3_ACCESS_KEY=F2CP4X3X17GVQ1YH5I5D
S3_SECRET_KEY=72iAsYR4QQCIdaDI9e9AzXnzVvvP8bvPELmrBVzX
S3_REGION=ru-1
EOF

echo "✅ Переменные окружения настроены"
```

### Шаг 6: Собрать приложение

```bash
cd /var/www/kamhub

# Установить зависимости
npm install

# Собрать
npm run build

echo "✅ Приложение собрано"
```

### Шаг 7: Применить схему БД

```bash
cd /var/www/kamhub

export PGPASSWORD='kamhub2024secure'
psql -h localhost -U kamhub -d kamhub_production -f lib/database/schema.sql
psql -h localhost -U kamhub -d kamhub_production -f lib/database/tour_system_schema.sql  
psql -h localhost -U kamhub -d kamhub_production -f lib/database/user_roles_migration.sql

echo "✅ База данных готова"
```

### Шаг 8: Запустить с PM2

```bash
cd /var/www/kamhub

# Создать конфиг PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'kamhub',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF

# Запустить
pm2 delete kamhub 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd

echo "✅ Приложение запущено"
```

### Шаг 9: Настроить Nginx

```bash
cat > /etc/nginx/sites-available/kamhub << 'EOF'
server {
    listen 80;
    server_name 5.129.248.224;
    
    client_max_body_size 50M;
    
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
}
EOF

# Активировать
ln -sf /etc/nginx/sites-available/kamhub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверить и перезагрузить
nginx -t && systemctl reload nginx

echo "✅ Nginx настроен"
```

### Шаг 10: Проверить

```bash
# Проверить что всё работает
curl http://localhost:3000
pm2 status

echo "✅ ВСЁ ГОТОВО!"
echo "Откройте в браузере: http://5.129.248.224"
```

---

## 🧪 СОЗДАТЬ ТЕСТОВЫЕ ДАННЫЕ

```bash
ssh root@5.129.248.224
cd /var/www/kamhub
npm install -g tsx
tsx scripts/create-test-partner.ts
```

---

## 🔧 УПРАВЛЕНИЕ

```bash
# Статус
pm2 status

# Логи
pm2 logs kamhub

# Рестарт
pm2 restart kamhub

# Обновление
cd /var/www/kamhub
git pull
npm install
npm run build
pm2 restart kamhub
```

---

## ⚠️ ЕСЛИ ПРОБЛЕМЫ

### Приложение не запускается

```bash
# Смотреть логи
pm2 logs kamhub --lines 100

# Проверить порт
netstat -tulpn | grep 3000

# Проверить переменные
cat /var/www/kamhub/.env.production
```

### База данных

```bash
# Проверить подключение
psql -U kamhub -d kamhub_production -c "SELECT 1"

# Если ошибка - пересоздать
sudo -u postgres psql << 'EOF'
DROP DATABASE IF EXISTS kamhub_production;
DROP USER IF EXISTS kamhub;
CREATE USER kamhub WITH PASSWORD 'kamhub2024secure';
CREATE DATABASE kamhub_production OWNER kamhub;
EOF
```

### Nginx 502

```bash
# Проверить что приложение работает
pm2 status

# Рестарт всего
pm2 restart kamhub
systemctl reload nginx
```

---

## 🎉 ГОТОВО!

После выполнения всех шагов:
- Сайт: http://5.129.248.224
- Регистрация: /auth/register-business
- Начать тестирование!
