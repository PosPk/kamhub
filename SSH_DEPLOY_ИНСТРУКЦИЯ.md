# 🚀 ДЕПЛОЙ KAMHUB ЧЕРЕЗ SSH С ПАРОЛЕМ

**IP:** 147.45.158.166  
**ОС:** Ubuntu 6.8.0 (x86_64)  
**Статус:** ✅ ПОДКЛЮЧЕНИЕ УСПЕШНО  
**Дата:** 26 ноября 2025

---

## ⚡ БЫСТРЫЙ ДЕПЛОЙ (ОДНА КОМАНДА)

### Вариант 1: Полностью автоматический деплой

```bash
./quick-deploy-ssh.sh
```

**Что делает:**
- ✅ Проверяет подключение
- ✅ Обновляет систему
- ✅ Устанавливает Node.js 20
- ✅ Устанавливает PostgreSQL
- ✅ Создает базу данных
- ✅ Устанавливает Nginx
- ✅ Устанавливает PM2
- ✅ Клонирует проект
- ✅ Создает .env
- ✅ Устанавливает зависимости
- ✅ Собирает проект
- ✅ Применяет миграции
- ✅ Запускает PM2
- ✅ Настраивает Nginx
- ✅ Настраивает firewall

**Время выполнения:** 10-15 минут

---

### Вариант 2: Детальный деплой с логами

```bash
./auto-deploy-ssh.sh
```

**Преимущества:**
- Подробные логи каждого шага
- Цветной вывод
- Сохранение credentials
- Проверки на каждом этапе

---

## 📋 ДАННЫЕ ДОСТУПА

```
IP:       147.45.158.166
User:     root
Password: eiGo@VK4.,,VH7
SSH:      ssh root@147.45.158.166
ОС:       Ubuntu 6.8.0-87-generic
```

---

## 🔧 РУЧНЫЕ КОМАНДЫ SSH

### Подключение к серверу

```bash
# С паролем (через sshpass)
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166

# Обычное подключение (интерактивное)
ssh root@147.45.158.166
# Пароль: eiGo@VK4.,,VH7
```

### Выполнение команды на сервере

```bash
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "команда"
```

### Копирование файла на сервер

```bash
sshpass -p 'eiGo@VK4.,,VH7' scp файл root@147.45.158.166:/путь/
```

---

## 📝 ПОШАГОВЫЙ ДЕПЛОЙ (если нужно вручную)

### ШАГ 1: Подключиться

```bash
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166
```

### ШАГ 2: Обновить систему

```bash
apt update && apt upgrade -y
```

### ШАГ 3: Установить Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # Проверка
```

### ШАГ 4: Установить PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### ШАГ 5: Создать базу данных

```bash
sudo -u postgres psql << EOF
CREATE DATABASE kamchatour;
CREATE USER kamuser WITH PASSWORD 'ваш_пароль';
GRANT ALL PRIVILEGES ON DATABASE kamchatour TO kamuser;
\c kamchatour
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
\q
EOF
```

### ШАГ 6: Установить Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### ШАГ 7: Установить PM2

```bash
npm install -g pm2
```

### ШАГ 8: Клонировать проект

```bash
cd /var/www
git clone https://github.com/PosPk/kamhub.git kamchatour
cd kamchatour
```

### ШАГ 9: Создать .env

```bash
nano .env
```

**Содержимое:**

```env
DATABASE_URL=postgresql://kamuser:ваш_пароль@localhost:5432/kamchatour
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://147.45.158.166:3002
PORT=3002
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
YANDEX_WEATHER_API_KEY=8f6b0a53-135f-4217-8de1-de98c1316cc0
YANDEX_MAPS_API_KEY=
GROQ_API_KEY=
DEEPSEEK_API_KEY=
```

### ШАГ 10: Установить зависимости

```bash
npm install
```

### ШАГ 11: Собрать проект

```bash
npm run build
```

### ШАГ 12: Применить миграции

```bash
psql -U kamuser -d kamchatour -h localhost < lib/database/schema.sql
psql -U kamuser -d kamchatour -h localhost < lib/database/transfer_operator_schema.sql
psql -U kamuser -d kamchatour -h localhost < lib/database/sos_schema.sql
```

### ШАГ 13: Запустить PM2

```bash
pm2 start npm --name kamchatour-hub -- start
pm2 save
pm2 startup
```

### ШАГ 14: Настроить Nginx

```bash
nano /etc/nginx/sites-available/kamchatour
```

**Содержимое:**

```nginx
server {
    listen 80;
    server_name 147.45.158.166;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Активировать:**

```bash
ln -s /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### ШАГ 15: Настроить firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## ✅ ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ

### На сервере:

```bash
# Статус PM2
pm2 status

# Логи
pm2 logs kamchatour-hub

# Nginx
systemctl status nginx

# База данных
sudo -u postgres psql -d kamchatour -c "SELECT count(*) FROM users;"
```

### С локальной машины:

```bash
# Проверка HTTP
curl http://147.45.158.166

# В браузере
http://147.45.158.166
```

---

## 🔑 ЗАПОЛНЕНИЕ API КЛЮЧЕЙ

### После деплоя подключитесь и отредактируйте .env:

```bash
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166
cd /var/www/kamchatour
nano .env
```

### Заполните обязательные ключи:

```env
# Yandex Maps (https://developer.tech.yandex.ru/)
YANDEX_MAPS_API_KEY=ваш_ключ

# GROQ API (https://console.groq.com/)
GROQ_API_KEY=gsk_ваш_ключ

# DeepSeek API (https://platform.deepseek.com/)
DEEPSEEK_API_KEY=sk_ваш_ключ
```

### Перезапустите PM2:

```bash
pm2 restart kamchatour-hub
```

---

## 📊 СОЗДАННЫЕ СКРИПТЫ

### 1. `quick-deploy-ssh.sh` ⚡

**Быстрый деплой одной командой**

```bash
./quick-deploy-ssh.sh
```

- Минимальный вывод
- Быстрое выполнение
- Все автоматически

### 2. `auto-deploy-ssh.sh` 📝

**Детальный деплой с логами**

```bash
./auto-deploy-ssh.sh
```

- Подробные логи
- Цветной вывод
- Проверки на каждом шаге
- Сохранение credentials

---

## 🔧 ПОЛЕЗНЫЕ КОМАНДЫ

### Подключение к серверу

```bash
# С паролем
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166

# Интерактивное
ssh root@147.45.158.166
```

### Выполнение команд на сервере

```bash
# PM2
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "pm2 status"
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "pm2 logs kamchatour-hub --lines 50"
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "pm2 restart kamchatour-hub"

# Nginx
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "systemctl status nginx"
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "tail -50 /var/log/nginx/kamchatour_access.log"

# База данных
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "sudo -u postgres psql -d kamchatour -c 'SELECT count(*) FROM users;'"
```

### Копирование файлов

```bash
# На сервер
sshpass -p 'eiGo@VK4.,,VH7' scp файл root@147.45.158.166:/var/www/kamchatour/

# С сервера
sshpass -p 'eiGo@VK4.,,VH7' scp root@147.45.158.166:/var/www/kamchatour/.env ./
```

---

## ⚠️ РЕШЕНИЕ ПРОБЛЕМ

### Проблема: "Permission denied"

**Решение:**

```bash
# Проверьте пароль
ssh root@147.45.158.166
# Пароль: eiGo@VK4.,,VH7
```

### Проблема: "sshpass command not found"

**Решение:**

```bash
sudo apt install -y sshpass
```

### Проблема: Приложение не запускается

**Диагностика:**

```bash
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "pm2 logs kamchatour-hub --lines 100"
```

**Решение:**

```bash
# Проверить .env
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "cat /var/www/kamchatour/.env"

# Перезапустить
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "cd /var/www/kamchatour && pm2 restart kamchatour-hub"
```

### Проблема: Nginx 502

**Решение:**

```bash
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "pm2 status && systemctl status nginx"
```

---

## 📋 ЧЕКЛИСТ ДЕПЛОЯ

```
☐ 1. Проверить подключение к серверу
☐ 2. Запустить quick-deploy-ssh.sh или auto-deploy-ssh.sh
☐ 3. Подождать 10-15 минут
☐ 4. Получить API ключи:
     ☐ Yandex Maps
     ☐ GROQ
     ☐ DeepSeek
☐ 5. Подключиться к серверу
☐ 6. Отредактировать .env
☐ 7. Перезапустить PM2
☐ 8. Проверить работу (http://147.45.158.166)
☐ 9. Настроить домен (опционально)
☐ 10. Установить SSL (опционально)
```

---

## 🎯 БЫСТРЫЙ СТАРТ (3 КОМАНДЫ)

### Команда 1: Запустить деплой

```bash
./quick-deploy-ssh.sh
```

### Команда 2: Заполнить API ключи

```bash
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "nano /var/www/kamchatour/.env"
```

### Команда 3: Перезапустить

```bash
sshpass -p 'eiGo@VK4.,,VH7' ssh root@147.45.158.166 "pm2 restart kamchatour-hub"
```

**ГОТОВО!** Откройте: `http://147.45.158.166`

---

## 💰 СТОИМОСТЬ

```
VDS сервер:           ~700₽/мес
PostgreSQL:           БЕСПЛАТНО (локальная)
SSL:                  БЕСПЛАТНО (Let's Encrypt)
AI APIs:              БЕСПЛАТНО (в лимитах)
─────────────────────────────────────
ИТОГО:                ~700₽/мес
```

---

## 📚 ДОКУМЕНТАЦИЯ

- **ДЕПЛОЙ_НА_147.45.158.166.md** - полная инструкция (800+ строк)
- **quick-deploy-ssh.sh** - быстрый деплой
- **auto-deploy-ssh.sh** - детальный деплой
- **КОМАНДЫ_ДЕПЛОЯ.sh** - шпаргалка
- **СТАРТ_ДЕПЛОЯ.txt** - быстрый старт

---

## ✅ ГОТОВО К ДЕПЛОЮ!

**Сервер проверен:** ✅ Ubuntu 6.8.0  
**Подключение:** ✅ Успешно  
**Скрипты:** ✅ Готовы

**Запустите деплой:**

```bash
./quick-deploy-ssh.sh
```

---

**Дата:** 26 ноября 2025  
**IP:** 147.45.158.166  
**Статус:** ✅ ГОТОВ К ДЕПЛОЮ

🚀 **Удачи!** 🏔️
