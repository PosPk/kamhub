# 🚀 РАЗВЕРТЫВАНИЕ KAMCHATOUR HUB НА TIMEWEB CLOUD

**Дата:** 30.10.2025
**IP Сервера:** 45.8.96.120

---

## ✅ СОЗДАННЫЕ РЕСУРСЫ

- ✅ **VDS Сервер:** 45.8.96.120
- ✅ **PostgreSQL:** undefined
- ✅ **S3 Storage:** kamchatour-media

---

## 🔧 РАЗВЕРТЫВАНИЕ (3 ШАГА)

### Шаг 1: Подключитесь к серверу

```bash
ssh root@45.8.96.120
```

### Шаг 2: Установите необходимое ПО

```bash
# Обновление системы
apt update && apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2
npm install -g pm2

# Nginx
apt install -y nginx

# PostgreSQL Client
apt install -y postgresql-client
```

### Шаг 3: Разверните приложение

```bash
# Клонируйте проект
cd /var/www
git clone https://github.com/PosPk/kamhub.git kamchatour-hub
cd kamchatour-hub

# Установите зависимости
npm ci

# Скопируйте .env файл
nano .env.production
# Вставьте содержимое из .env.production.kamchatour

# Примените миграции БД
npx prisma migrate deploy

# Соберите приложение
npm run build

# Запустите через PM2
pm2 start npm --name "kamchatour-hub" -- start
pm2 save
pm2 startup
```

---

## 🌐 NGINX КОНФИГУРАЦИЯ

```bash
nano /etc/nginx/sites-available/kamchatour
```

```nginx
server {
    listen 80;
    server_name 45.8.96.120;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активируйте конфигурацию
ln -s /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## ✅ ПРОВЕРКА

```bash
# Статус PM2
pm2 status

# Логи
pm2 logs kamchatour-hub --lines 50

# Проверка приложения
curl http://45.8.96.120
```

---

## 🔗 ПОДКЛЮЧЕНИЕ К БД

```bash
psql postgresql://undefined:PASSWORD@undefined:5432/Nimble Cygnus
```

---

## ⚠️ НЕ ЗАБУДЬТЕ!

1. **Отозвать временный токен Timeweb API**
2. **Проверить email** для паролей БД и S3
3. **Добавить API ключи** в .env (GROQ, Yandex, etc.)
4. **Настроить домен** и SSL (опционально)
5. **Настроить автоматические бэкапы**

---

**Откройте в браузере:** http://45.8.96.120
