# 🚀 TIMEWEB CLOUD - ГОТОВ К ДЕПЛОЮ

**Дата:** 2025-11-04  
**Сервер:** 5.129.248.224  
**Статус:** ✅ ГОТОВ К ЗАПУСКУ

---

## ✅ У ВАС ЕСТЬ ВСЁ НЕОБХОДИМОЕ

### Сервер Timeweb VPS
```
IP: 5.129.248.224
SSH User: root
SSH Password: xQvB1pv?yZTjaR
```

### S3 Storage (для изображений)
```
Endpoint: https://s3.twcstorage.ru
Bucket: d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50
Access Key: F2CP4X3X17GVQ1YH5I5D
Secret Key: (уже в скрипте)
Region: ru-1
```

### GitHub Repository
```
https://github.com/PosPk/kamhub
```

---

## 🚀 ЗАПУСК ДЕПЛОЯ (ОДНА КОМАНДА!)

### Вариант 1: Автоматический (РЕКОМЕНДУЕТСЯ)

```bash
./deploy-to-timeweb-production.sh
```

**Что сделает скрипт автоматически:**
1. ✅ Подключится к серверу по SSH
2. ✅ Установит Node.js 20
3. ✅ Установит PostgreSQL 15
4. ✅ Установит Nginx
5. ✅ Установит PM2
6. ✅ Создаст базу данных
7. ✅ Скопирует код на сервер
8. ✅ Установит зависимости
9. ✅ Соберет приложение
10. ✅ Применит схему БД
11. ✅ Запустит приложение через PM2
12. ✅ Настроит Nginx как reverse proxy

**Время:** 10-15 минут

**Результат:**
- Сайт доступен по http://5.129.248.224
- PostgreSQL настроен
- PM2 запустит приложение при рестарте сервера
- Nginx раздает приложение

---

### Вариант 2: Ручной (пошаговый)

Если хотите контролировать каждый шаг:

#### Шаг 1: Подключиться к серверу
```bash
ssh root@5.129.248.224
# Пароль: xQvB1pv?yZTjaR
```

#### Шаг 2: Установить Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version  # Должно быть v20.x
```

#### Шаг 3: Установить PostgreSQL
```bash
apt-get install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
```

#### Шаг 4: Создать базу данных
```bash
sudo -u postgres psql << EOF
CREATE USER kamhub WITH PASSWORD 'ваш-пароль';
CREATE DATABASE kamhub_production OWNER kamhub;
GRANT ALL PRIVILEGES ON DATABASE kamhub_production TO kamhub;
\q
EOF
```

#### Шаг 5: Клонировать репозиторий
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/PosPk/kamhub.git kamhub
cd kamhub
```

#### Шаг 6: Настроить переменные окружения
```bash
nano .env.production
```

Вставить:
```env
DATABASE_URL=postgresql://kamhub:ваш-пароль@localhost:5432/kamhub_production
DATABASE_SSL=false
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=http://5.129.248.224

# S3 Storage
S3_ENDPOINT=https://s3.twcstorage.ru
S3_BUCKET=d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50
S3_ACCESS_KEY=F2CP4X3X17GVQ1YH5I5D
S3_SECRET_KEY=72iAsYR4QQCIdaDI9e9AzXnzVvvP8bvPELmrBVzX
S3_REGION=ru-1
```

#### Шаг 7: Собрать приложение
```bash
npm install
npm run build
```

#### Шаг 8: Применить схему БД
```bash
export PGPASSWORD='ваш-пароль'
psql -h localhost -U kamhub -d kamhub_production -f lib/database/schema.sql
psql -h localhost -U kamhub -d kamhub_production -f lib/database/tour_system_schema.sql
psql -h localhost -U kamhub -d kamhub_production -f lib/database/user_roles_migration.sql
```

#### Шаг 9: Установить PM2
```bash
npm install -g pm2
pm2 start npm --name kamhub -- start
pm2 startup systemd
pm2 save
```

#### Шаг 10: Установить Nginx
```bash
apt-get install -y nginx

cat > /etc/nginx/sites-available/kamhub << 'EOF'
server {
    listen 80;
    server_name 5.129.248.224;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/kamhub /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

## 🧪 ПОСЛЕ ДЕПЛОЯ

### 1. Проверить, что сайт работает

```bash
# На сервере
curl http://localhost:3000

# Или откройте в браузере:
http://5.129.248.224
```

**Ожидаемый результат:** Главная страница Kamchatour Hub

### 2. Создать тестового партнера

```bash
ssh root@5.129.248.224
cd /var/www/kamhub
tsx scripts/create-test-partner.ts
```

Или через UI:
1. Открыть http://5.129.248.224/auth/register-business
2. Выбрать 4 роли
3. Email: kamchatka.all@test.ru
4. Компания: Камчатка Всё Включено

### 3. Начать тестирование

Следовать плану: **`ПЛАН_ТЕСТИРОВАНИЯ_ПАРТНЕР.md`**

---

## 🔧 УПРАВЛЕНИЕ ПРИЛОЖЕНИЕМ

### PM2 команды

```bash
# Статус
pm2 status

# Логи в реальном времени
pm2 logs kamhub

# Рестарт
pm2 restart kamhub

# Остановка
pm2 stop kamhub

# Запуск
pm2 start kamhub

# Удаление
pm2 delete kamhub

# Мониторинг ресурсов
pm2 monit
```

### Обновление кода

```bash
# Подключиться к серверу
ssh root@5.129.248.224

# Перейти в директорию
cd /var/www/kamhub

# Получить последние изменения
git pull

# Установить новые зависимости
npm install

# Пересобрать
npm run build

# Рестарт
pm2 restart kamhub
```

### База данных

```bash
# Подключиться к БД
psql -U kamhub -d kamhub_production

# Бэкап
pg_dump -U kamhub kamhub_production > backup.sql

# Восстановление
psql -U kamhub kamhub_production < backup.sql
```

---

## 🌐 НАСТРОЙКА ДОМЕНА (опционально)

Если у вас есть домен (например kamhub.ru):

### 1. Настроить DNS

В панели вашего регистратора доменов добавить A-записи:
```
@ (или kamhub.ru)     A    5.129.248.224
www                   A    5.129.248.224
```

### 2. Обновить Nginx

```bash
ssh root@5.129.248.224

# Редактировать конфиг
nano /etc/nginx/sites-available/kamhub
```

Изменить `server_name`:
```nginx
server_name kamhub.ru www.kamhub.ru;
```

Перезагрузить:
```bash
nginx -t
systemctl reload nginx
```

### 3. Настроить SSL (HTTPS)

```bash
# Установить Certbot
apt-get install -y certbot python3-certbot-nginx

# Получить SSL сертификат
certbot --nginx -d kamhub.ru -d www.kamhub.ru

# Автообновление сертификата
certbot renew --dry-run
```

**Готово!** Сайт доступен по https://kamhub.ru

---

## 🔐 БЕЗОПАСНОСТЬ

### Обязательно сделать после деплоя:

#### 1. Изменить пароль SSH
```bash
passwd root
# Установить новый надежный пароль
```

#### 2. Настроить Firewall
```bash
# Установить ufw
apt-get install -y ufw

# Разрешить только необходимое
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

# Включить
ufw enable
```

#### 3. Настроить SSH ключ (рекомендуется)
```bash
# На вашем компьютере
ssh-copy-id root@5.129.248.224

# На сервере отключить вход по паролю
nano /etc/ssh/sshd_config
# Изменить: PasswordAuthentication no
systemctl restart sshd
```

#### 4. Обновлять систему
```bash
# Регулярно обновлять пакеты
apt-get update && apt-get upgrade -y
```

---

## 📊 МОНИТОРИНГ

### Логи

```bash
# Application logs
pm2 logs kamhub --lines 100

# Nginx access log
tail -f /var/log/nginx/access.log

# Nginx error log
tail -f /var/log/nginx/error.log

# PostgreSQL log
tail -f /var/log/postgresql/postgresql-15-main.log
```

### Метрики

```bash
# Использование ресурсов
pm2 monit

# Статистика PM2
pm2 describe kamhub

# Диск
df -h

# Память
free -h

# CPU
top
```

---

## 🐛 ТРАБЛШУТИНГ

### Сайт не открывается

```bash
# Проверить статус PM2
pm2 status

# Проверить логи
pm2 logs kamhub --lines 50

# Рестарт
pm2 restart kamhub
```

### Ошибка подключения к БД

```bash
# Проверить PostgreSQL
systemctl status postgresql

# Проверить подключение
psql -U kamhub -d kamhub_production -c "SELECT 1"

# Проверить пароль в .env.production
cat /var/www/kamhub/.env.production | grep DATABASE_URL
```

### Nginx 502 Bad Gateway

```bash
# Проверить что приложение запущено
pm2 status

# Проверить порт 3000
netstat -tulpn | grep 3000

# Проверить конфиг Nginx
nginx -t

# Перезапустить всё
pm2 restart kamhub
systemctl reload nginx
```

---

## 📞 БЫСТРЫЕ КОМАНДЫ

### Подключение
```bash
ssh root@5.129.248.224
```

### Проверка
```bash
# Статус всего
pm2 status && systemctl status nginx && systemctl status postgresql

# Открыть сайт
curl http://5.129.248.224
```

### Рестарт всего
```bash
pm2 restart kamhub && systemctl reload nginx
```

### Обновление кода
```bash
cd /var/www/kamhub && git pull && npm install && npm run build && pm2 restart kamhub
```

---

## 🎯 РЕКОМЕНДАЦИИ

### Для тестирования:

1. **Сначала запустите автоматический скрипт:**
   ```bash
   ./deploy-to-timeweb-production.sh
   ```

2. **Проверьте что всё работает:**
   - Откройте http://5.129.248.224
   - Зарегистрируйтесь
   - Создайте тестовые данные

3. **Начните тестирование:**
   - Следуйте ПЛАН_ТЕСТИРОВАНИЯ_ПАРТНЕР.md
   - 3 бизнес-процесса
   - Чеклист 100+ пунктов

4. **Соберите обратную связь:**
   - От партнера
   - Что работает
   - Что нужно доработать

---

## 🎉 ГОТОВО!

**Всё подготовлено для деплоя!**

**Просто запустите:**
```bash
./deploy-to-timeweb-production.sh
```

**И через 15 минут можно тестировать!**

---

**Дата создания:** 2025-11-04  
**Статус:** ✅ ГОТОВ К ЗАПУСКУ  
**Следующий шаг:** Запустить скрипт деплоя!
