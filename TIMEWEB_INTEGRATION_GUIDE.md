# Руководство по интеграции KamchaTour Hub с Timeweb Cloud

## 🎯 Цель

Развернуть и настроить инфраструктуру для проекта KamchaTour Hub на платформе Timeweb Cloud с использованием современных практик DevOps.

## 📋 Архитектура решения

```
┌─────────────────────────────────────────────────────────────┐
│                    Timeweb Cloud Infrastructure              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐      ┌──────────────┐     ┌─────────────┐ │
│  │   VDS/VPS   │      │  PostgreSQL  │     │   S3 Bucket │ │
│  │  (Next.js)  │─────▶│   (DBaaS)    │     │   (Files)   │ │
│  │  Node.js    │      │              │     │             │ │
│  │  PM2        │      └──────────────┘     └─────────────┘ │
│  └─────────────┘                                            │
│        │                                                     │
│        ▼                                                     │
│  ┌─────────────┐      ┌──────────────┐                     │
│  │  Firewall   │      │     SSL      │                     │
│  │   Rules     │      │ Let's Encrypt│                     │
│  └─────────────┘      └──────────────┘                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 🚀 Пошаговый план развертывания

### Этап 1: Регистрация и начальная настройка

#### 1.1 Создание аккаунта
```bash
# Зарегистрироваться на https://timeweb.cloud
# Подтвердить email
# Пополнить баланс
```

#### 1.2 Установка CLI (опционально)
```bash
# Установка Timeweb Cloud CLI
curl -s https://timeweb.cloud/install-cli.sh | bash

# Авторизация
twc auth login

# Проверка
twc account info
```

### Этап 2: Создание VDS сервера

#### 2.1 Рекомендуемая конфигурация

**Для production:**
- **OS:** Ubuntu 22.04 LTS
- **CPU:** 2-4 vCPU
- **RAM:** 4-8 GB
- **SSD:** 40-80 GB
- **Тариф:** E-Commerce VDS или Облачный VDS
- **Регион:** Россия (для соответствия 152-ФЗ)

**Для development:**
- **OS:** Ubuntu 22.04 LTS
- **CPU:** 1-2 vCPU
- **RAM:** 2-4 GB
- **SSD:** 20-40 GB

#### 2.2 Создание через панель
1. Войти в панель управления
2. Перейти в раздел "Серверы"
3. Нажать "Создать сервер"
4. Выбрать конфигурацию
5. Указать SSH ключ или пароль
6. Создать сервер

#### 2.3 Первичная настройка сервера

```bash
# Подключение к серверу
ssh root@YOUR_SERVER_IP

# Обновление системы
apt update && apt upgrade -y

# Установка базовых пакетов
apt install -y curl wget git build-essential ufw

# Настройка firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Создание пользователя для приложения
adduser kamchatour
usermod -aG sudo kamchatour

# Настройка SSH (опционально)
# Отключить вход по паролю, оставить только ключи
```

### Этап 3: Установка окружения Node.js

```bash
# Установка Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Проверка установки
node --version
npm --version

# Установка PM2 (менеджер процессов)
npm install -g pm2

# Установка pnpm (если используется)
npm install -g pnpm
```

### Этап 4: Настройка PostgreSQL (DBaaS)

#### 4.1 Создание базы данных через панель
1. Перейти в "Базы данных"
2. Создать новый инстанс PostgreSQL
3. Выбрать версию (PostgreSQL 15+)
4. Выбрать конфигурацию
5. Записать credentials

#### 4.2 Параметры подключения
```env
# .env.production
DATABASE_URL="postgresql://username:password@db-host.timeweb.cloud:5432/kamchatour?sslmode=require"
```

#### 4.3 Применение миграций
```bash
# На локальной машине или в CI/CD
npx prisma migrate deploy

# Или если используете другой ORM
npm run db:migrate
```

### Этап 5: Настройка S3 Object Storage

#### 5.1 Создание bucket
1. Перейти в "S3 Storage"
2. Создать новый bucket
3. Настроить права доступа
4. Получить Access Key и Secret Key

#### 5.2 Конфигурация S3 в приложении
```typescript
// lib/s3-client.ts
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: 'ru-1', // Регион Timeweb Cloud
  endpoint: 'https://s3.timeweb.cloud',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Важно для совместимости
});

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
```

#### 5.3 Переменные окружения
```env
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=kamchatour-media
S3_ENDPOINT=https://s3.timeweb.cloud
S3_REGION=ru-1
```

### Этап 6: Настройка SSL-сертификата

#### 6.1 Установка Certbot
```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx

# Получение сертификата
certbot certonly --standalone -d kamchatour.ru -d www.kamchatour.ru

# Автоматическое обновление
certbot renew --dry-run
```

#### 6.2 Настройка Nginx как reverse proxy
```nginx
# /etc/nginx/sites-available/kamchatour
server {
    listen 80;
    server_name kamchatour.ru www.kamchatour.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kamchatour.ru www.kamchatour.ru;

    ssl_certificate /etc/letsencrypt/live/kamchatour.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kamchatour.ru/privkey.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Проксирование к Next.js
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

    # Кэширование статики
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
    }
}
```

```bash
# Активация конфигурации
ln -s /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Этап 7: Развертывание приложения

#### 7.1 Клонирование репозитория
```bash
# Переключиться на пользователя приложения
su - kamchatour

# Клонировать репозиторий
git clone https://github.com/your-username/kamchatour-hub.git
cd kamchatour-hub

# Установка зависимостей
npm install
```

#### 7.2 Настройка переменных окружения
```bash
# Создать .env.production
nano .env.production
```

```env
# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://username:password@db-host.timeweb.cloud:5432/kamchatour?sslmode=require"

# S3 Storage
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=kamchatour-media
S3_ENDPOINT=https://s3.timeweb.cloud
S3_REGION=ru-1

# Auth (NextAuth.js)
NEXTAUTH_URL=https://kamchatour.ru
NEXTAUTH_SECRET=your_secret_here

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=https://kamchatour.ru/api/telegram/webhook

# Yandex Maps
YANDEX_MAPS_API_KEY=your_api_key

# Payment (если используется)
PAYMENT_API_KEY=your_payment_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

#### 7.3 Сборка приложения
```bash
# Сборка Next.js
npm run build

# Проверка сборки
ls -la .next/
```

#### 7.4 Настройка PM2
```bash
# Создать ecosystem файл
nano ecosystem.config.js
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'kamchatour-hub',
    script: 'npm',
    args: 'start',
    cwd: '/home/kamchatour/kamchatour-hub',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
```

```bash
# Запуск приложения
pm2 start ecosystem.config.js

# Проверка статуса
pm2 status

# Просмотр логов
pm2 logs kamchatour-hub

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

### Этап 8: Настройка Firewall в Timeweb Cloud

#### 8.1 Через панель управления
1. Перейти в "Firewall"
2. Создать новую группу правил
3. Добавить правила:
   - **HTTP:** TCP, порт 80, источник 0.0.0.0/0
   - **HTTPS:** TCP, порт 443, источник 0.0.0.0/0
   - **SSH:** TCP, порт 22, источник YOUR_IP/32 (ограничить доступ)
   - **PostgreSQL:** TCP, порт 5432, только внутренняя сеть
4. Применить к серверу

#### 8.2 Через CLI (если доступно)
```bash
# Создание правил файрвола
twc firewall create --name kamchatour-fw
twc firewall rule add --firewall kamchatour-fw --protocol tcp --port 80 --source 0.0.0.0/0
twc firewall rule add --firewall kamchatour-fw --protocol tcp --port 443 --source 0.0.0.0/0
twc firewall rule add --firewall kamchatour-fw --protocol tcp --port 22 --source YOUR_IP/32

# Применить к серверу
twc server firewall attach --server-id SERVER_ID --firewall kamchatour-fw
```

### Этап 9: Настройка CI/CD

#### 9.1 GitHub Actions workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Timeweb Cloud

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/kamchatour/kamchatour-hub
            git pull origin main
            npm ci
            npm run build
            pm2 reload ecosystem.config.js
```

#### 9.2 Настройка секретов в GitHub
1. Settings → Secrets and variables → Actions
2. Добавить секреты:
   - `SERVER_HOST` - IP адрес сервера
   - `SERVER_USER` - пользователь (kamchatour)
   - `SSH_PRIVATE_KEY` - приватный SSH ключ
   - `DATABASE_URL` - строка подключения к БД

### Этап 10: Мониторинг и логирование

#### 10.1 PM2 мониторинг
```bash
# Веб-интерфейс PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Мониторинг через командную строку
pm2 monit
```

#### 10.2 Интеграция с Sentry
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### 10.3 Логи Nginx
```bash
# Просмотр логов Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Настройка ротации логов
nano /etc/logrotate.d/nginx
```

### Этап 11: Резервное копирование

#### 11.1 Автоматическое резервное копирование БД
```bash
# Создать скрипт резервного копирования
nano /home/kamchatour/scripts/backup-db.sh
```

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/kamchatour/backups"
DB_NAME="kamchatour"

# Создать директорию для бэкапов
mkdir -p $BACKUP_DIR

# Создать дамп базы данных
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h db-host.timeweb.cloud \
  -U $DB_USER \
  -d $DB_NAME \
  > $BACKUP_DIR/db_backup_$DATE.sql

# Сжать дамп
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Удалить старые бэкапы (старше 7 дней)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

```bash
# Сделать скрипт исполняемым
chmod +x /home/kamchatour/scripts/backup-db.sh

# Добавить в cron (ежедневно в 2:00)
crontab -e
# Добавить строку:
# 0 2 * * * /home/kamchatour/scripts/backup-db.sh
```

#### 11.2 Резервное копирование в S3
```bash
# Скрипт для копирования бэкапов в S3
nano /home/kamchatour/scripts/backup-to-s3.sh
```

```bash
#!/bin/bash
# backup-to-s3.sh

# Установить AWS CLI
apt install -y awscli

# Настроить AWS CLI для Timeweb S3
aws configure set aws_access_key_id $S3_ACCESS_KEY_ID
aws configure set aws_secret_access_key $S3_SECRET_ACCESS_KEY
aws configure set default.region ru-1

# Копировать бэкапы в S3
aws s3 sync /home/kamchatour/backups/ \
  s3://kamchatour-backups/ \
  --endpoint-url https://s3.timeweb.cloud
```

## 📊 Мониторинг производительности

### Метрики для отслеживания:
- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- Response time
- Error rate
- Active connections

### Инструменты:
1. **PM2 Plus** (платный) - расширенный мониторинг
2. **Grafana + Prometheus** - самостоятельная настройка
3. **Timeweb Cloud Dashboard** - базовый мониторинг в панели

## 🔒 Безопасность

### Чеклист безопасности:
- ✅ SSH доступ только по ключам
- ✅ Firewall настроен корректно
- ✅ SSL сертификаты установлены
- ✅ База данных доступна только изнутри сети
- ✅ Секреты не в коде, только в переменных окружения
- ✅ Регулярные обновления системы
- ✅ Резервное копирование настроено
- ✅ Логирование включено
- ✅ Rate limiting настроен
- ✅ CORS настроен правильно

## 💰 Оптимизация затрат

### Рекомендации:
1. **Начать с минимальной конфигурации**
   - 2 vCPU, 4 GB RAM
   - Масштабировать по мере роста нагрузки

2. **Использовать S3 для статики**
   - Дешевле чем хранение на SSD сервера
   - Лучшая производительность

3. **Настроить кэширование**
   - Redis для сессий (если нужно)
   - CDN для статических файлов

4. **Мониторить использование ресурсов**
   - Своевременно масштабировать
   - Избегать overpro provisioning

## 🆘 Troubleshooting

### Проблема: Приложение не запускается
```bash
# Проверить логи PM2
pm2 logs kamchatour-hub --lines 100

# Проверить порты
netstat -tlnp | grep 3000

# Проверить переменные окружения
pm2 env 0
```

### Проблема: Не работает подключение к БД
```bash
# Проверить подключение
psql -h db-host.timeweb.cloud -U username -d kamchatour

# Проверить firewall
ufw status
```

### Проблема: SSL сертификат не работает
```bash
# Проверить сертификаты
certbot certificates

# Обновить сертификаты
certbot renew

# Проверить конфигурацию Nginx
nginx -t
```

### Проблема: Медленная работа S3
```bash
# Проверить подключение к S3
aws s3 ls s3://kamchatour-media/ --endpoint-url https://s3.timeweb.cloud

# Проверить настройки S3 client
# Убедиться что используется правильный endpoint и region
```

## 📞 Поддержка Timeweb Cloud

- **Техподдержка 24/7:** support@timeweb.cloud
- **Telegram:** @timeweb_support
- **Телефон:** 8 (800) 555-00-00
- **Панель управления:** https://timeweb.cloud
- **Документация:** https://timeweb.cloud/docs

## 📝 Чеклист готовности к production

- [ ] VDS сервер создан и настроен
- [ ] PostgreSQL (DBaaS) создана и доступна
- [ ] S3 bucket создан и настроен
- [ ] SSL сертификаты установлены
- [ ] Firewall настроен
- [ ] Приложение успешно развернуто
- [ ] PM2 настроен и автозапуск работает
- [ ] Nginx настроен как reverse proxy
- [ ] CI/CD pipeline настроен
- [ ] Резервное копирование настроено
- [ ] Мониторинг настроен
- [ ] Домен настроен и работает
- [ ] Тестирование в production среде завершено
- [ ] Документация обновлена

---

**Последнее обновление:** 2025-10-29
**Версия:** 1.0
