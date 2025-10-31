# 🚀 KAMCHATOUR HUB - УСТАНОВКА НА TIMEWEB VDS

## 📋 БЫСТРЫЙ СТАРТ

### Шаг 1: Создайте VDS на Timeweb

1. Откройте: https://timeweb.cloud/my/vds
2. Нажмите **"Создать сервер"**
3. Выберите конфигурацию:
   - **ОС:** Ubuntu 22.04 LTS
   - **CPU:** 2 vCPU (минимум)
   - **RAM:** 2 GB (минимум)
   - **SSD:** 20 GB (минимум)
   - **Локация:** Россия (ru-1)
4. Нажмите **"Создать"**
5. Сохраните IP адрес и root пароль

---

### Шаг 2: Подключитесь к VDS

#### Windows (PowerShell):
```powershell
ssh root@ВАШ_IP
```

#### Mac/Linux:
```bash
ssh root@ВАШ_IP
```

Введите пароль, который получили от Timeweb.

---

### Шаг 3: Загрузите и запустите скрипт установки

```bash
# Скачиваем скрипт
wget https://raw.githubusercontent.com/PosPk/kamhub/cursor/analyze-repository-and-timeweb-project-79c9/vds-setup.sh

# Делаем исполняемым
chmod +x vds-setup.sh

# Запускаем установку
sudo bash vds-setup.sh
```

**Установка займет 5-10 минут.**

Скрипт автоматически:
- ✅ Обновит систему
- ✅ Установит Node.js 20, PostgreSQL, Nginx
- ✅ Создаст базу данных
- ✅ Склонирует и соберет приложение
- ✅ Настроит PM2 для автозапуска
- ✅ Настроит Nginx как reverse proxy
- ✅ Настроит firewall

---

### Шаг 4: Проверьте что работает

После завершения скрипта откройте в браузере:
```
http://ВАШ_IP
```

**Тестовые endpoints:**
- `http://ВАШ_IP/test` - тестовая страница
- `http://ВАШ_IP/api/ping` - API проверка
- `http://ВАШ_IP/api/health` - health check

---

## 🔧 РУЧНАЯ УСТАНОВКА (если автоматический скрипт не подошел)

<details>
<summary>Развернуть пошаговую инструкцию</summary>

### 1. Обновление системы

```bash
apt-get update
apt-get upgrade -y
```

### 2. Установка Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v  # Проверка версии
```

### 3. Установка PostgreSQL

```bash
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### 4. Создание базы данных

```bash
# Войти в PostgreSQL
sudo -u postgres psql

# Выполнить команды:
CREATE USER kamchatour WITH PASSWORD 'your_secure_password';
CREATE DATABASE kamchatour OWNER kamchatour;
GRANT ALL PRIVILEGES ON DATABASE kamchatour TO kamchatour;
\c kamchatour
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

### 5. Клонирование репозитория

```bash
# Создать пользователя
useradd -m -s /bin/bash kamchatour

# Клонировать репо
sudo -u kamchatour git clone https://github.com/PosPk/kamhub.git /home/kamchatour/kamhub
cd /home/kamchatour/kamhub
sudo -u kamchatour git checkout cursor/analyze-repository-and-timeweb-project-79c9
```

### 6. Создание .env файла

```bash
cat > /home/kamchatour/kamhub/.env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://kamchatour:your_secure_password@localhost:5432/kamchatour
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://YOUR_IP
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_API_URL=http://YOUR_IP/api
SKIP_SENTRY=true
NEXT_TELEMETRY_DISABLED=1
EOF

chown kamchatour:kamchatour /home/kamchatour/kamhub/.env
chmod 600 /home/kamchatour/kamhub/.env
```

### 7. Установка зависимостей

```bash
cd /home/kamchatour/kamhub
sudo -u kamchatour npm install
```

### 8. Применение миграций

```bash
sudo -u postgres psql -d kamchatour -f /home/kamchatour/kamhub/lib/database/schema.sql
sudo -u postgres psql -d kamchatour -f /home/kamchatour/kamhub/lib/database/transfer_schema.sql
sudo -u postgres psql -d kamchatour -f /home/kamchatour/kamhub/lib/database/accommodation_schema.sql
```

### 9. Сборка приложения

```bash
cd /home/kamchatour/kamhub
sudo -u kamchatour npm run build
```

### 10. Установка PM2

```bash
npm install -g pm2
```

### 11. Запуск приложения

```bash
cd /home/kamchatour/kamhub
sudo -u kamchatour pm2 start npm --name "kamchatour-hub" -- start
sudo -u kamchatour pm2 save
pm2 startup systemd -u kamchatour --hp /home/kamchatour
```

### 12. Установка Nginx

```bash
apt-get install -y nginx
```

Создайте конфигурацию:

```bash
nano /etc/nginx/sites-available/kamchatour
```

Вставьте:

```nginx
server {
    listen 80;
    server_name YOUR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте:

```bash
ln -s /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### 13. Настройка Firewall

```bash
apt-get install -y ufw
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

</details>

---

## 📝 ПОЛЕЗНЫЕ КОМАНДЫ

### Управление приложением

```bash
# Статус приложения
sudo -u kamchatour pm2 status

# Логи в реальном времени
sudo -u kamchatour pm2 logs kamchatour-hub

# Перезапуск
sudo -u kamchatour pm2 restart kamchatour-hub

# Остановка
sudo -u kamchatour pm2 stop kamchatour-hub
```

### Проверка сервисов

```bash
# Статус Nginx
systemctl status nginx

# Статус PostgreSQL
systemctl status postgresql

# Проверка портов
netstat -tulpn | grep LISTEN
```

### Обновление приложения

```bash
cd /home/kamchatour/kamhub
sudo -u kamchatour git pull
sudo -u kamchatour npm install
sudo -u kamchatour npm run build
sudo -u kamchatour pm2 restart kamchatour-hub
```

### Просмотр логов

```bash
# PM2 логи
sudo -u kamchatour pm2 logs

# Nginx логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PostgreSQL логи
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 🔒 БЕЗОПАСНОСТЬ

### 1. Измените пароли

```bash
# PostgreSQL
sudo -u postgres psql
ALTER USER kamchatour WITH PASSWORD 'НОВЫЙ_СЛОЖНЫЙ_ПАРОЛЬ';
\q

# Обновите .env
nano /home/kamchatour/kamhub/.env
# Измените DATABASE_URL
```

### 2. Обновите секреты в .env

```bash
nano /home/kamchatour/kamhub/.env
```

Измените:
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- Все другие ключи API

### 3. Настройка SSL (для домена)

Если у вас есть домен:

```bash
# Установка Certbot
apt-get install -y certbot python3-certbot-nginx

# Получение сертификата
certbot --nginx -d your-domain.com

# Автообновление
certbot renew --dry-run
```

### 4. Настройка fail2ban

```bash
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 🐛 РЕШЕНИЕ ПРОБЛЕМ

### Приложение не запускается

```bash
# Проверьте логи PM2
sudo -u kamchatour pm2 logs kamchatour-hub --lines 100

# Проверьте порт
netstat -tulpn | grep 3000

# Проверьте процессы
ps aux | grep node
```

### База данных недоступна

```bash
# Проверьте статус PostgreSQL
systemctl status postgresql

# Проверьте подключение
sudo -u kamchatour psql -h localhost -U kamchatour -d kamchatour

# Проверьте логи
tail -f /var/log/postgresql/postgresql-*.log
```

### Nginx возвращает 502 Bad Gateway

```bash
# Проверьте что приложение запущено
sudo -u kamchatour pm2 status

# Проверьте логи Nginx
tail -f /var/log/nginx/error.log

# Проверьте конфигурацию
nginx -t
```

### Нет места на диске

```bash
# Проверьте использование диска
df -h

# Очистите старые логи PM2
sudo -u kamchatour pm2 flush

# Очистите npm cache
sudo -u kamchatour npm cache clean --force
```

---

## 📞 ПОДДЕРЖКА

Если возникли проблемы:

1. Проверьте логи PM2: `sudo -u kamchatour pm2 logs`
2. Проверьте логи Nginx: `tail -f /var/log/nginx/error.log`
3. Проверьте статус: `systemctl status nginx postgresql`
4. Проверьте firewall: `ufw status`

---

## 🎉 ГОТОВО!

После установки ваше приложение будет доступно по адресу:
```
http://ВАШ_IP
```

**Тестовые endpoints:**
- `/test` - тестовая страница
- `/api/ping` - API проверка
- `/api/health` - health check
- `/api/trip/plan` - планировщик поездок

---

**Дата создания:** 2025-10-31  
**Версия:** 1.0  
**Ветка:** cursor/analyze-repository-and-timeweb-project-79c9
