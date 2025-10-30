# 🚀 ДЕПЛОЙ НА TIMEWEB CLOUD

> **Полное руководство по развертыванию Kamchatour Hub на Timeweb Cloud**

---

## 📋 СОДЕРЖАНИЕ

1. [Что нужно](#что-нужно)
2. [Быстрый старт (1 команда)](#быстрый-старт)
3. [Ручная установка](#ручная-установка)
4. [Настройка домена](#настройка-домена)
5. [SSL сертификат](#ssl-сертификат)
6. [Обновление приложения](#обновление-приложения)
7. [Мониторинг и логи](#мониторинг-и-логи)
8. [Решение проблем](#решение-проблем)

---

## 🎯 ЧТО НУЖНО

### На Timeweb Cloud:

1. **VDS/VPS сервер**
   - Минимум: 2 CPU, 2GB RAM, 20GB SSD
   - Рекомендуется: 4 CPU, 4GB RAM, 40GB SSD
   - ОС: Ubuntu 20.04/22.04 или CentOS 7/8

2. **Домен (опционально)**
   - Можно подключить свой домен
   - Или использовать IP адрес

### Тарифы Timeweb Cloud (примерно):

```
VDS-2: 2 CPU, 2GB RAM, 20GB SSD  - ~300₽/мес
VDS-4: 4 CPU, 4GB RAM, 40GB SSD  - ~600₽/мес ← Рекомендуется
VDS-8: 8 CPU, 8GB RAM, 80GB SSD  - ~1200₽/мес
```

---

## ⚡ БЫСТРЫЙ СТАРТ

### Вариант 1: Автоматический скрипт (РЕКОМЕНДУЕТСЯ)

```bash
# 1. Подключиться к серверу по SSH
ssh root@ваш-сервер-ip

# 2. Клонировать репозиторий
cd /root
git clone <your-repo-url> kamchatour-hub
cd kamchatour-hub

# 3. Запустить автоматический деплой
chmod +x deploy-timeweb.sh
./deploy-timeweb.sh
```

**Скрипт автоматически:**
- ✅ Обновит систему
- ✅ Установит Node.js 20
- ✅ Установит PostgreSQL
- ✅ Создаст базу данных
- ✅ Установит Nginx
- ✅ Установит PM2
- ✅ Соберет проект
- ✅ Применит миграции
- ✅ Настроит автозапуск
- ✅ Настроит firewall
- ✅ Настроит backup

**⏱ Время установки: 5-10 минут**

После завершения приложение будет доступно по:
- `http://ваш-ip`
- `http://ваш-домен` (если настроен)

---

## 🔧 РУЧНАЯ УСТАНОВКА

### Шаг 1: Подключение к серверу

```bash
# SSH подключение
ssh root@ваш-сервер-ip

# Обновление системы
apt update && apt upgrade -y  # Ubuntu/Debian
# или
yum update -y                 # CentOS
```

### Шаг 2: Установка Node.js 20

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Проверка
node -v  # должно быть v20.x.x
npm -v
```

### Шаг 3: Установка PostgreSQL

```bash
# Ubuntu/Debian
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# CentOS
yum install -y postgresql-server postgresql-contrib
postgresql-setup initdb
systemctl start postgresql
systemctl enable postgresql
```

### Шаг 4: Создание базы данных

```bash
# Подключение к PostgreSQL
sudo -u postgres psql

# В консоли PostgreSQL:
CREATE DATABASE kamchatour;
CREATE USER kamuser WITH PASSWORD 'ваш-пароль';
GRANT ALL PRIVILEGES ON DATABASE kamchatour TO kamuser;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\c kamchatour
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

### Шаг 5: Клонирование проекта

```bash
# Создание директории
mkdir -p /var/www/kamchatour
cd /var/www/kamchatour

# Клонирование
git clone <your-repo-url> .

# Или загрузка через FTP/SFTP
```

### Шаг 6: Настройка .env

```bash
cd /var/www/kamchatour
nano .env
```

```env
# Основные настройки
DATABASE_URL=postgresql://kamuser:ваш-пароль@localhost:5432/kamchatour
DATABASE_SSL=false
DATABASE_MAX_CONNECTIONS=20

# Security
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://ваш-домен-или-ip

# Добавьте остальные переменные из .env.example
```

### Шаг 7: Установка зависимостей и сборка

```bash
# Установка
npm install

# Сборка
npm run build
```

### Шаг 8: Применение миграций

```bash
# Основные миграции
npm run migrate:up

# Дополнительные таблицы
psql $DATABASE_URL -f lib/database/seat_holds_schema.sql

# Проверка
npm run db:test
```

### Шаг 9: Установка PM2

```bash
# Установка PM2
npm install -g pm2

# Запуск приложения
pm2 start npm --name "kamchatour-hub" -- start

# Автозапуск при перезагрузке
pm2 save
pm2 startup
# Выполните команду которую выдаст pm2 startup
```

### Шаг 10: Настройка Nginx

```bash
# Установка Nginx
apt install -y nginx  # Ubuntu/Debian
# или
yum install -y nginx  # CentOS

# Создание конфигурации
nano /etc/nginx/sites-available/kamchatour
```

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Логи
    access_log /var/log/nginx/kamchatour_access.log;
    error_log /var/log/nginx/kamchatour_error.log;

    # Размер файлов
    client_max_body_size 10M;

    # Proxy к Next.js
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Статические файлы
    location /_next/static {
        proxy_pass http://127.0.0.1:3002;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }
}
```

```bash
# Активация конфигурации
ln -s /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # удалить default

# Проверка конфигурации
nginx -t

# Перезапуск Nginx
systemctl reload nginx
systemctl enable nginx
```

### Шаг 11: Настройка Firewall

```bash
# Ubuntu/Debian (UFW)
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable

# CentOS (firewalld)
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

---

## 🌐 НАСТРОЙКА ДОМЕНА

### В панели Timeweb Cloud:

1. **Купить/добавить домен:**
   - Услуги → Домены → Добавить домен
   - Или привязать существующий

2. **DNS записи:**
   ```
   A-запись:  @        → IP-адрес-сервера
   A-запись:  www      → IP-адрес-сервера
   CNAME:     *        → ваш-домен.ru
   ```

3. **Обновить .env:**
   ```env
   NEXT_PUBLIC_APP_URL=https://ваш-домен.ru
   ```

4. **Обновить Nginx:**
   ```bash
   nano /etc/nginx/sites-available/kamchatour
   # Изменить server_name на ваш домен
   nginx -t
   systemctl reload nginx
   ```

5. **Перезапустить приложение:**
   ```bash
   pm2 restart kamchatour-hub
   ```

---

## 🔒 SSL СЕРТИФИКАТ

### Автоматический SSL (Let's Encrypt)

```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx  # Ubuntu/Debian
# или
yum install -y certbot python3-certbot-nginx  # CentOS

# Получение сертификата (автоматически настроит Nginx)
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Автопродление
certbot renew --dry-run

# Добавить в cron для автопродления
crontab -e
```

Добавить строку:
```
0 0 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

### Проверка SSL:

После установки сертификата приложение будет доступно по HTTPS:
- `https://ваш-домен.ru`

---

## 🔄 ОБНОВЛЕНИЕ ПРИЛОЖЕНИЯ

### Через Git:

```bash
cd /var/www/kamchatour

# Остановить приложение
pm2 stop kamchatour-hub

# Получить обновления
git pull origin main

# Установить новые зависимости
npm install

# Пересобрать
npm run build

# Применить миграции (если есть новые)
npm run migrate:up

# Запустить
pm2 start kamchatour-hub
```

### Автоматический скрипт обновления:

```bash
#!/bin/bash
cd /var/www/kamchatour
pm2 stop kamchatour-hub
git pull
npm install
npm run build
npm run migrate:up
pm2 start kamchatour-hub
pm2 save
echo "✓ Обновление завершено"
```

Сохранить как `update.sh`, сделать исполняемым:
```bash
chmod +x update.sh
./update.sh
```

---

## 📊 МОНИТОРИНГ И ЛОГИ

### PM2 Мониторинг:

```bash
# Статус всех приложений
pm2 status

# Детальная информация
pm2 show kamchatour-hub

# Логи в реальном времени
pm2 logs kamchatour-hub

# Последние 100 строк
pm2 logs kamchatour-hub --lines 100

# Очистить логи
pm2 flush

# Мониторинг ресурсов
pm2 monit
```

### Nginx Логи:

```bash
# Access log
tail -f /var/log/nginx/kamchatour_access.log

# Error log
tail -f /var/log/nginx/kamchatour_error.log

# Последние ошибки
grep "error" /var/log/nginx/kamchatour_error.log | tail -20
```

### Системные ресурсы:

```bash
# CPU и память
htop

# Место на диске
df -h

# Активные подключения
netstat -tulpn | grep LISTEN

# Процессы Node.js
ps aux | grep node
```

### PostgreSQL:

```bash
# Размер базы данных
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('kamchatour'));"

# Активные подключения
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname='kamchatour';"

# Логи PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 🆘 РЕШЕНИЕ ПРОБЛЕМ

### Приложение не запускается:

```bash
# Проверить логи PM2
pm2 logs kamchatour-hub --err

# Проверить порт 3002
netstat -tulpn | grep 3002

# Перезапустить
pm2 restart kamchatour-hub

# Полная перезагрузка PM2
pm2 kill
pm2 start npm --name "kamchatour-hub" -- start
```

### "Connection refused" к базе данных:

```bash
# Проверить что PostgreSQL запущен
systemctl status postgresql

# Проверить подключение
psql -h localhost -U kamuser -d kamchatour

# Проверить DATABASE_URL в .env
cat .env | grep DATABASE_URL

# Перезапустить PostgreSQL
systemctl restart postgresql
```

### Nginx возвращает 502 Bad Gateway:

```bash
# Проверить что приложение запущено
pm2 status

# Проверить порт 3002
curl http://localhost:3002

# Проверить логи Nginx
tail -f /var/log/nginx/kamchatour_error.log

# Проверить конфигурацию
nginx -t

# Перезапустить Nginx
systemctl restart nginx
```

### Медленная работа:

```bash
# Проверить ресурсы
htop

# Оптимизация PostgreSQL
sudo -u postgres psql -d kamchatour -c "VACUUM ANALYZE;"

# Очистить логи PM2
pm2 flush

# Перезапуск с увеличенной памятью
pm2 delete kamchatour-hub
pm2 start npm --name "kamchatour-hub" --max-memory-restart 1G -- start
```

### Проблемы с SSL:

```bash
# Проверить сертификат
certbot certificates

# Тест продления
certbot renew --dry-run

# Проверить Nginx
nginx -t

# Принудительное продление
certbot renew --force-renewal
```

---

## 💾 BACKUP

### Автоматический backup:

Уже настроен скриптом `deploy-timeweb.sh`:

```bash
# Проверить cron job
crontab -l

# Ручной backup
/var/www/kamchatour/scripts/backup-db.sh

# Backup хранятся в
ls -lh /var/www/kamchatour/backups/
```

### Восстановление из backup:

```bash
cd /var/www/kamchatour
./scripts/restore-db.sh /path/to/backup.sql.gz
```

---

## 📈 ОПТИМИЗАЦИЯ

### PostgreSQL:

```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

```ini
# Увеличить максимальные подключения
max_connections = 100

# Оптимизация памяти
shared_buffers = 512MB
effective_cache_size = 2GB
maintenance_work_mem = 128MB
work_mem = 16MB
```

```bash
sudo systemctl restart postgresql
```

### PM2 Cluster Mode:

```bash
pm2 delete kamchatour-hub
pm2 start npm --name "kamchatour-hub" -i 2 -- start
pm2 save
```

### Nginx кэширование:

Добавить в конфигурацию Nginx:

```nginx
# Кэш директория
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

server {
    # ...
    
    location /api {
        proxy_cache my_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_methods GET HEAD;
        # ...
    }
}
```

---

## 🎯 ЧЕКЛИСТ ПОСЛЕ ДЕПЛОЯ

- [ ] Приложение доступно по HTTP
- [ ] База данных подключена
- [ ] Миграции применены
- [ ] PM2 настроен и работает
- [ ] Nginx работает корректно
- [ ] Firewall настроен
- [ ] Домен привязан (если есть)
- [ ] SSL сертификат установлен
- [ ] Backup настроен
- [ ] Логи пишутся
- [ ] Мониторинг работает
- [ ] API ключи добавлены в .env
- [ ] Тестовые данные созданы

---

## 📞 ПОДДЕРЖКА

### Полезные ссылки:

- **Timeweb Cloud:** https://timeweb.cloud/
- **Документация Timeweb:** https://timeweb.cloud/help/
- **Поддержка:** support@timeweb.ru

### Документация проекта:

- `ГОТОВО_ДЕПЛОЙ.md` - общие инструкции
- `START_HERE.md` - обзор проекта
- `IMPLEMENTATION_GUIDE.md` - интеграция middleware

---

## ✅ ГОТОВО!

После выполнения этих шагов ваше приложение:

- ✅ Работает на Timeweb Cloud VDS/VPS
- ✅ Доступно по домену с SSL
- ✅ Автоматически запускается при перезагрузке
- ✅ Имеет автоматические backup
- ✅ Защищено firewall
- ✅ Мониторится через PM2

**Приложение готово к production использованию! 🎉**

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Для:** Timeweb Cloud VDS/VPS
