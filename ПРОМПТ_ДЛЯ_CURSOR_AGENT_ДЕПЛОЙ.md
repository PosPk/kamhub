# 🚀 ПРОМПТ ДЛЯ CURSOR AGENT: ДЕПЛОЙ KAMHUB

---

## 📋 ЗАДАЧА

Выполни полный деплой приложения **KamHub** на Timeweb VDS сервер с IP `5.129.248.224`.

---

## ✅ ЧТО УЖЕ ГОТОВО

### **1. Приложение собирается успешно**
```bash
npm run build
# ✓ Compiled successfully
# ✓ Generating static pages (20/20)
```

### **2. Все основные компоненты реализованы:**
- ✅ Главная страница (`app/page.tsx`)
- ✅ Layout с header (`app/layout.tsx`)
- ✅ Все Hub страницы (tourist, operator, guide, transfer, etc.)
- ✅ Компоненты (TourCard, WeatherWidget, EcoPointsWidget, AIChatWidget)
- ✅ API routes (23 endpoints)
- ✅ Дизайн (Premium Black & Gold theme)
- ✅ База данных (PostgreSQL schemas)

### **3. Документация:**
- ✅ `КАРТА_НАВИГАЦИИ_И_СТРАНИЦ.md` - Полная карта приложения
- ✅ `ДИЗАЙН_ГЛАВНОЙ_СТРАНИЦЫ.md` - Детальный анализ дизайна
- ✅ `ПОЛНЫЙ_АНАЛИЗ_РОЛЕЙ_И_БИЗНЕС_ПРОЦЕССОВ.md` - Архитектура
- ✅ `operators_schema.sql` - Схема операторов (критическое исправление)

### **4. Доступы к серверу:**
```
IP: 5.129.248.224
User: root
Password: xQvB1pv?yZTjaR
SSH: ssh root@5.129.248.224
```

### **5. Timeweb API Token:**
```
eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjFrYnhacFJNQGJSI0tSbE1xS1lqIn0...
```

### **6. S3 Bucket (для файлов):**
```
Endpoint: https://s3.timeweb.cloud/
Bucket: d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50
Access Key: F2CP4X3X17GVQ1YH5I5D
Secret Key: 72iAsYR4QQCIdaDI9e9AzXnzVvvP8bvPELmrBVzX
```

---

## 🎯 ЧТО НУЖНО СДЕЛАТЬ

### **ШАГ 1: Подготовка сервера (если не выполнено)**

#### **1.1. Подключение к серверу:**
```bash
# Используй Timeweb Web Console (https://timeweb.cloud/my/servers)
# Или SSH (если доступен из твоего окружения):
ssh root@5.129.248.224
# Пароль: xQvB1pv?yZTjaR
```

#### **1.2. Установка зависимостей:**
```bash
# Обновление системы
apt-get update && apt-get upgrade -y

# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Установка PostgreSQL 15
apt-get install -y postgresql postgresql-contrib postgis

# Установка Nginx
apt-get install -y nginx

# Установка PM2 (для управления Node.js процессом)
npm install -g pm2

# Установка Git
apt-get install -y git
```

---

### **ШАГ 2: Настройка PostgreSQL**

#### **2.1. Создание пользователя и базы данных:**
```bash
# Переключаемся на пользователя postgres
sudo -u postgres psql

# В psql выполняем:
CREATE USER kamhub WITH PASSWORD 'kamhub_secure_password_2025';
CREATE DATABASE kamhub OWNER kamhub;
GRANT ALL PRIVILEGES ON DATABASE kamhub TO kamhub;

# Включаем PostGIS
\c kamhub
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Выходим
\q
```

#### **2.2. Выполнение миграций:**
```bash
# Переходим в директорию проекта (после клонирования)
cd /var/www/kamhub

# Применяем все SQL схемы
sudo -u postgres psql -d kamhub -f lib/database/schema.sql
sudo -u postgres psql -d kamhub -f lib/database/operators_schema.sql
sudo -u postgres psql -d kamhub -f lib/database/transfer_schema.sql
sudo -u postgres psql -d kamhub -f lib/database/loyalty_schema.sql
sudo -u postgres psql -d kamhub -f lib/database/transfer_payments_schema.sql

# Проверяем таблицы
sudo -u postgres psql -d kamhub -c "\dt"
```

---

### **ШАГ 3: Клонирование и сборка приложения**

#### **3.1. Клонирование репозитория:**
```bash
# Создаём директорию
mkdir -p /var/www
cd /var/www

# Клонируем репозиторий
git clone https://github.com/PosPk/kamhub.git
cd kamhub

# Переключаемся на main ветку
git checkout main
git pull origin main
```

#### **3.2. Установка зависимостей:**
```bash
# Очистка (если нужно)
rm -rf node_modules package-lock.json .next

# Установка
npm ci
```

#### **3.3. Настройка .env:**
```bash
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://kamhub:kamhub_secure_password_2025@localhost:5432/kamhub

# Server
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://5.129.248.224:3000

# Timeweb API
TIMEWEB_API_TOKEN=eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjFrYnhacFJNQGJSI0tSbE1xS1lqIn0.eyJ1c2VyIjoicGE0MjIxMDgiLCJ0eXBlIjoiYXBpX2tleSIsImFwaV9rZXlfaWQiOiI0MmZmZTY1MC02OWI4LTRmZmQtYTFkOC02OWRkMjMwM2QyY2MiLCJpYXQiOjE3NjE3ODUzNDl9.SFHpwgy9kr-EH2CwN6K1REkOl7KCpiUnMk5ivTRljEaWl8iE-B-BMjaJxaFhpdB2dqcb33ky2oyfwxkU1Sszrbo-8UINnFO5SothY4P6WC8kSSHxFlLI2i0xGCa3YzgyYZ1Wgn2a0jf__ZcyZi7ZsaJkuold9NAeeGCCrAUbdVsr39-fLDL_EKh0iekq_tuO59f_BCmg7Poe7xKlmNYzu2hy3GnfNp3ueKW52H6kFkGwibixS3tWKCHkPpyTAjRztWKCnDZOOG6xDk4sSiPPMlZOEfFzzkpKkizQ9CykBC06SXwmT2uPRR2NyZJIY-PZd4AVZ34H1jXQ-NGquRPi_aYiywt3LtOVDRarpVErBdk6I0qO0Yf33zICvMN-yFpXuY_oSlE8v3C-02XHnYLsMXcHTsUB4ISkJrhglBkv-hTzuiQxwAEZp0eHOEq8YNz6qOLU3RcaNgg0DWGXMDrMzObYx2NknrZUCMbRFftIU-C1Ilo8Ayy98MwI3J77X62p

# S3 Storage
S3_ENDPOINT=https://s3.timeweb.cloud
S3_BUCKET=d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50
S3_ACCESS_KEY=F2CP4X3X17GVQ1YH5I5D
S3_SECRET_KEY=72iAsYR4QQCIdaDI9e9AzXnzVvvP8bvPELmrBVzX
S3_REGION=ru-1

# SMS.ru (опционально, для SMS уведомлений)
# SMS_RU_API_KEY=your_sms_ru_api_key

# AWS SES (опционально, для email уведомлений)
# AWS_SES_REGION=eu-west-1
# AWS_SES_ACCESS_KEY=your_ses_access_key
# AWS_SES_SECRET_KEY=your_ses_secret_key
# AWS_SES_FROM_EMAIL=noreply@kamhub.ru

# Telegram Bot (опционально, для Telegram уведомлений)
# TELEGRAM_BOT_TOKEN=your_bot_token

# Groq API (для AI-чата)
# GROQ_API_KEY=your_groq_api_key

# Deepseek API (fallback для AI)
# DEEPSEEK_API_KEY=your_deepseek_api_key

# JWT Secret (для аутентификации)
JWT_SECRET=kamhub_jwt_secret_super_secure_2025_change_me_in_production

# Yandex Maps API (для карт)
# YANDEX_MAPS_API_KEY=your_yandex_maps_key

# CloudPayments (для оплаты)
# CLOUDPAYMENTS_PUBLIC_ID=your_public_id
# CLOUDPAYMENTS_API_SECRET=your_api_secret
EOF
```

#### **3.4. Сборка приложения:**
```bash
npm run build
```

**Ожидаемый результат:**
```
✓ Compiled successfully
✓ Generating static pages (20/20)
✓ Finalizing page optimization
```

---

### **ШАГ 4: Запуск приложения с PM2**

#### **4.1. Создание ecosystem.config.js:**
```bash
cat > ecosystem.config.js << 'EOF'
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
EOF
```

#### **4.2. Создание директории для логов:**
```bash
mkdir -p /var/log/kamhub
chown -R root:root /var/log/kamhub
```

#### **4.3. Запуск приложения:**
```bash
# Останавливаем предыдущий процесс (если был)
pm2 delete kamhub || true

# Запускаем приложение
pm2 start ecosystem.config.js

# Сохраняем конфигурацию PM2 для автозапуска
pm2 save
pm2 startup systemd

# Проверяем статус
pm2 status
pm2 logs kamhub --lines 50
```

**Ожидаемый результат:**
```
┌────┬────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id │ name       │ mode        │ ↺       │ status  │ cpu      │
├────┼────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0  │ kamhub     │ cluster     │ 0       │ online  │ 0%       │
│ 1  │ kamhub     │ cluster     │ 0       │ online  │ 0%       │
└────┴────────────┴─────────────┴─────────┴─────────┴──────────┘
```

---

### **ШАГ 5: Настройка Nginx (Reverse Proxy)**

#### **5.1. Создание конфигурации Nginx:**
```bash
cat > /etc/nginx/sites-available/kamhub << 'EOF'
server {
    listen 80;
    server_name 5.129.248.224;

    # Логи
    access_log /var/log/nginx/kamhub_access.log;
    error_log /var/log/nginx/kamhub_error.log;

    # Максимальный размер загружаемых файлов
    client_max_body_size 50M;

    # Proxy для Next.js приложения
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
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Кэширование статических файлов
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 60m;
        proxy_cache_bypass $http_pragma $http_authorization;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Публичные файлы
    location /graphics/ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
```

#### **5.2. Активация конфигурации:**
```bash
# Создаём символическую ссылку
ln -sf /etc/nginx/sites-available/kamhub /etc/nginx/sites-enabled/kamhub

# Удаляем дефолтную конфигурацию
rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
nginx -t

# Перезапускаем Nginx
systemctl restart nginx
systemctl enable nginx
```

**Ожидаемый результат:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

### **ШАГ 6: Настройка Firewall (UFW)**

```bash
# Установка UFW (если не установлен)
apt-get install -y ufw

# Разрешаем SSH (ВАЖНО! Иначе потеряем доступ)
ufw allow 22/tcp

# Разрешаем HTTP
ufw allow 80/tcp

# Разрешаем HTTPS (для будущего SSL)
ufw allow 443/tcp

# Включаем firewall
ufw --force enable

# Проверяем статус
ufw status verbose
```

---

### **ШАГ 7: Проверка деплоя**

#### **7.1. Проверка локально на сервере:**
```bash
# Проверяем, что приложение работает
curl -I http://127.0.0.1:3000

# Проверяем через Nginx
curl -I http://127.0.0.1:80
```

#### **7.2. Проверка извне:**
```bash
# С твоей машины (или из браузера)
curl -I http://5.129.248.224
```

#### **7.3. Открываем в браузере:**
```
http://5.129.248.224
```

**Ожидаемый результат:**
- ✅ Главная страница открывается
- ✅ Видно видео Hero section
- ✅ Золотой дизайн (Premium Black & Gold)
- ✅ Карточки туров загружаются
- ✅ Виджеты погоды и Eco-points работают

---

### **ШАГ 8: Мониторинг и логи**

#### **8.1. Просмотр логов приложения:**
```bash
# PM2 логи (в реальном времени)
pm2 logs kamhub

# PM2 логи (последние 100 строк)
pm2 logs kamhub --lines 100

# Файлы логов
tail -f /var/log/kamhub/out.log
tail -f /var/log/kamhub/error.log
```

#### **8.2. Просмотр логов Nginx:**
```bash
tail -f /var/log/nginx/kamhub_access.log
tail -f /var/log/nginx/kamhub_error.log
```

#### **8.3. Мониторинг PM2:**
```bash
pm2 monit
```

---

## 🔧 ДОПОЛНИТЕЛЬНЫЕ КОМАНДЫ

### **Перезапуск приложения:**
```bash
cd /var/www/kamhub
git pull origin main
npm ci
npm run build
pm2 restart kamhub
```

### **Остановка/запуск:**
```bash
pm2 stop kamhub
pm2 start kamhub
pm2 restart kamhub
```

### **Очистка и пересборка:**
```bash
cd /var/www/kamhub
rm -rf .next node_modules
npm ci
npm run build
pm2 restart kamhub
```

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

### **1. Безопасность:**
- ⚠️ **Измени пароль PostgreSQL** в production!
- ⚠️ **Измени JWT_SECRET** в `.env`!
- ⚠️ **Настрой SSL/TLS** (Let's Encrypt) после успешного деплоя

### **2. Performance:**
- ✅ PM2 запускает 2 инстанса (cluster mode)
- ✅ Nginx кэширует статические файлы
- ✅ PostgreSQL оптимизирован (indexes, triggers)

### **3. Мониторинг:**
- 📊 PM2 автоматически перезапускает при падении
- 📊 Логи пишутся в `/var/log/kamhub/`
- 📊 Nginx логирует все запросы

---

## 🎯 ЧЕКЛИСТ ПОСЛЕ ДЕПЛОЯ

```bash
# 1. Приложение работает
curl -I http://5.129.248.224
# Ожидаем: HTTP/1.1 200 OK

# 2. PM2 статус "online"
pm2 status
# Ожидаем: status: online (2 инстанса)

# 3. База данных подключена
sudo -u postgres psql -d kamhub -c "SELECT COUNT(*) FROM users;"
# Ожидаем: count (0 или больше)

# 4. Nginx работает
systemctl status nginx
# Ожидаем: active (running)

# 5. Firewall настроен
ufw status
# Ожидаем: Status: active, 80/tcp ALLOW

# 6. Нет ошибок в логах
pm2 logs kamhub --lines 20 --err
# Ожидаем: нет критических ошибок
```

---

## 🚀 ДОПОЛНИТЕЛЬНО: SSL/TLS (HTTPS)

### **Установка Certbot (Let's Encrypt):**
```bash
# Установка Certbot
apt-get install -y certbot python3-certbot-nginx

# Получение сертификата (ВАЖНО: нужен домен!)
# Для IP адреса Let's Encrypt не работает!
# Поэтому пока используем HTTP, а HTTPS настроим после привязки домена

# Если есть домен (например, kamhub.ru):
# certbot --nginx -d kamhub.ru -d www.kamhub.ru
# certbot renew --dry-run
```

---

## 📝 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После выполнения всех шагов:

✅ **Приложение доступно:** `http://5.129.248.224`  
✅ **Дизайн работает:** Premium Black & Gold theme  
✅ **Hero section:** Видео + Aurora animation  
✅ **Туры загружаются:** API `/api/tours` работает  
✅ **Виджеты работают:** Погода, Eco-points  
✅ **AI-чат:** Может отвечать (если настроен GROQ_API_KEY)  
✅ **База данных:** PostgreSQL + PostGIS  
✅ **Автозапуск:** PM2 + systemd  
✅ **Reverse proxy:** Nginx  
✅ **Firewall:** UFW настроен  

---

## 🆘 TROUBLESHOOTING

### **Проблема: Приложение не запускается**
```bash
# Проверяем логи PM2
pm2 logs kamhub --err

# Проверяем .env файл
cat /var/www/kamhub/.env

# Проверяем подключение к БД
cd /var/www/kamhub
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()', (err, res) => { console.log(err || res.rows); pool.end(); });"
```

### **Проблема: Nginx показывает 502 Bad Gateway**
```bash
# Проверяем, что приложение запущено
pm2 status

# Проверяем, что порт 3000 слушается
netstat -tlnp | grep 3000

# Перезапускаем
pm2 restart kamhub
systemctl restart nginx
```

### **Проблема: База данных не подключается**
```bash
# Проверяем статус PostgreSQL
systemctl status postgresql

# Проверяем подключение
sudo -u postgres psql -d kamhub -c "SELECT 1;"

# Проверяем пароль в .env
grep DATABASE_URL /var/www/kamhub/.env
```

---

**ПРОМПТ ГОТОВ!** 🚀  
**Выполни все шаги последовательно, и приложение будет задеплоено!** ✅
