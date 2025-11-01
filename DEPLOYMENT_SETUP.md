# 🚀 KAMCHATOUR HUB - СИСТЕМА ДЕПЛОЯ И ПОДКЛЮЧЕНИЯ

## 📋 СОДЕРЖАНИЕ
1. [Быстрый старт](#быстрый-старт)
2. [Требования](#требования)
3. [Локальная разработка](#локальная-разработка)
4. [Деплой на VDS](#деплой-на-vds)
5. [Деплой на Vercel](#деплой-на-vercel)
6. [Деплой на Timeweb Apps](#деплой-на-timeweb-apps)
7. [База данных PostgreSQL](#база-данных-postgresql)
8. [Переменные окружения](#переменные-окружения)
9. [Система тем](#система-тем)
10. [Погодное настроение](#погодное-настроение)
11. [Мониторинг и логи](#мониторинг-и-логи)
12. [Troubleshooting](#troubleshooting)

---

## 🚀 БЫСТРЫЙ СТАРТ

### Локально (5 минут)

```bash
# 1. Клонируем репозиторий
git clone https://github.com/PosPk/kamhub.git
cd kamhub

# 2. Устанавливаем зависимости
npm install

# 3. Копируем .env
cp .env.example .env.local

# 4. Настраиваем БД (см. раздел PostgreSQL)
# Запускаем миграции
npm run db:migrate

# 5. Запускаем в dev режиме
npm run dev

# Откройте http://localhost:3000
```

---

## 💻 ТРЕБОВАНИЯ

### Минимальные требования:
- **Node.js**: 18.17 или выше
- **npm**: 9.0 или выше
- **PostgreSQL**: 14 или выше (с PostGIS)
- **RAM**: минимум 1GB
- **Диск**: минимум 2GB

### Рекомендуемые требования:
- **Node.js**: 20.x
- **PostgreSQL**: 15 или 16
- **RAM**: 2GB+
- **Диск**: 5GB+

---

## 🛠️ ЛОКАЛЬНАЯ РАЗРАБОТКА

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка .env.local

```env
# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/kamchatour

# API Keys
OPENWEATHER_API_KEY=your_key_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# App
NODE_ENV=development
```

### 3. Запуск dev сервера

```bash
npm run dev
```

### 4. Сборка production

```bash
npm run build
npm start
```

---

## 🖥️ ДЕПЛОЙ НА VDS

### Наша конфигурация (Timeweb VDS)

**Сервер:**
- IP: `5.129.248.224`
- OS: Ubuntu 20.04
- RAM: 2GB
- User: `kamchatour`

### Пошаговая инструкция:

#### 1. Подключаемся к VDS

```bash
ssh root@5.129.248.224
```

#### 2. Создаём пользователя

```bash
adduser kamchatour
usermod -aG sudo kamchatour
```

#### 3. Устанавливаем Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

#### 4. Устанавливаем PostgreSQL + PostGIS

```bash
apt-get install -y postgresql postgresql-contrib postgis
```

#### 5. Настраиваем PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE kamchatour;
CREATE USER kamchatour WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kamchatour TO kamchatour;

\c kamchatour
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

#### 6. Устанавливаем PM2

```bash
npm install -g pm2
```

#### 7. Клонируем репозиторий

```bash
su - kamchatour
git clone https://github.com/PosPk/kamhub.git
cd kamhub
```

#### 8. Устанавливаем зависимости

```bash
npm install
```

#### 9. Настраиваем .env

```bash
nano .env
```

```env
DATABASE_URL=postgresql://kamchatour:password@localhost:5432/kamchatour
OPENWEATHER_API_KEY=your_key
NEXTAUTH_URL=http://5.129.248.224
NEXTAUTH_SECRET=generated_secret
NODE_ENV=production
```

#### 10. Запускаем миграции

```bash
cat lib/db/schema.sql | sudo -u postgres psql -d kamchatour
cat lib/db/seed.sql | sudo -u postgres psql -d kamchatour
```

#### 11. Собираем проект

```bash
npm run build
```

#### 12. Запускаем с PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 13. Настраиваем Nginx (опционально)

```bash
apt-get install -y nginx

nano /etc/nginx/sites-available/kamchatour
```

```nginx
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
```

```bash
ln -s /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## ☁️ ДЕПЛОЙ НА VERCEL

### 1. Через GitHub

```bash
# 1. Push код в GitHub
git push origin main

# 2. Зайти на vercel.com
# 3. Import Project → выбрать репозиторий
# 4. Добавить переменные окружения
# 5. Deploy
```

### 2. Через CLI

```bash
npm install -g vercel

vercel login
vercel

# Добавить переменные:
vercel env add DATABASE_URL
vercel env add OPENWEATHER_API_KEY
vercel env add NEXTAUTH_SECRET

vercel --prod
```

---

## 🌐 ДЕПЛОЙ НА TIMEWEB APPS

### 1. Создаём приложение

```bash
# Через Timeweb Cloud Panel:
# Apps → Создать приложение → Node.js
```

### 2. Подключаем GitHub

```bash
# Выбираем репозиторий: PosPk/kamhub
# Ветка: main
```

### 3. Настраиваем

```yaml
# timeweb.json
{
  "name": "kamchatour-hub",
  "runtime": "nodejs",
  "version": "20",
  "start": "npm start",
  "build": "npm run build",
  "port": 3000
}
```

### 4. Добавляем переменные

В панели Timeweb Apps → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
OPENWEATHER_API_KEY=...
NEXTAUTH_SECRET=...
NODE_ENV=production
```

### 5. Деплоим

```bash
git push origin main
# Timeweb автоматически задеплоит
```

---

## 🗄️ БАЗА ДАННЫХ POSTGRESQL

### Структура таблиц

```sql
-- Пользователи
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Партнёры
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  category VARCHAR(50),
  description TEXT,
  logo_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Туры
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID REFERENCES partners(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_from DECIMAL(10,2),
  price_to DECIMAL(10,2),
  duration_days INTEGER,
  difficulty VARCHAR(50),
  season JSONB,
  images JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Размещение
CREATE TABLE accommodations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  location_zone VARCHAR(100),
  coordinates GEOGRAPHY(POINT),
  price_per_night_from DECIMAL(10,2),
  star_rating INTEGER,
  amenities JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Eco-points
CREATE TABLE eco_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  location GEOGRAPHY(POINT),
  description TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Миграции

```bash
# Запустить все миграции
npm run db:migrate

# Или вручную:
cat lib/db/schema.sql | psql -d kamchatour
cat lib/db/seed.sql | psql -d kamchatour
```

### Бэкап и восстановление

```bash
# Бэкап
pg_dump kamchatour > backup.sql

# Восстановление
psql kamchatour < backup.sql
```

---

## 🔐 ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

### Обязательные:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=http://your-domain.com
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NODE_ENV=production
```

### Опциональные:

```env
OPENWEATHER_API_KEY=your_key
YANDEX_MAPS_API_KEY=your_key
CLOUDPAYMENTS_PUBLIC_ID=your_id
CLOUDPAYMENTS_API_SECRET=your_secret
```

### Генерация секретов:

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# Или в Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🎨 СИСТЕМА ТЕМ

### Как работает:

1. **Две темы:**
   - 🌙 Темная (по умолчанию): черная + золото
   - ☀️ Светлая: белая + ультрамарин

2. **Переключение:**
   - Кнопка в правом верхнем углу
   - Клик → меняется тема
   - Выбор сохраняется в localStorage

3. **Технически:**
```javascript
// Переключение
document.documentElement.setAttribute('data-theme', 'light');
localStorage.setItem('theme', 'light');

// CSS переменные адаптируются автоматически
```

### CSS переменные:

```css
:root {
  /* Dark Theme */
  --bg-primary: #0a0a0a;
  --accent-primary: #e6c149;
}

[data-theme="light"] {
  /* Light Theme */
  --bg-primary: #ffffff;
  --accent-primary: #3b82f6;
}
```

---

## 🌤️ ПОГОДНОЕ НАСТРОЕНИЕ

### Как работает:

1. **Получаем геолокацию пользователя**
2. **Запрашиваем погоду через API** (`/api/weather`)
3. **Меняем настроение сайта:**
   - ❄️ Снег → снежинки падают
   - 🌧️ Дождь → капли падают
   - ☀️ Солнце → блики света
   - 🌋 Пепел → вулканический пепел

### API погоды:

```typescript
// /api/weather?lat=53.0195&lng=158.6505
{
  "success": true,
  "data": {
    "temperature": -5,
    "condition": "snow",
    "windSpeed": 12,
    "humidity": 80
  }
}
```

### Настройка OpenWeather API:

1. Зарегистрируйтесь на [openweathermap.org](https://openweathermap.org)
2. Получите API ключ
3. Добавьте в `.env`: `OPENWEATHER_API_KEY=your_key`

---

## 📊 МОНИТОРИНГ И ЛОГИ

### PM2 команды:

```bash
# Статус
pm2 status

# Логи
pm2 logs kamchatour-hub

# Перезапуск
pm2 restart kamchatour-hub

# Остановка
pm2 stop kamchatour-hub

# Удаление
pm2 delete kamchatour-hub

# Мониторинг
pm2 monit
```

### Логи приложения:

```bash
# Production логи
pm2 logs kamchatour-hub --lines 100

# Только ошибки
pm2 logs kamchatour-hub --err

# Следить в реальном времени
pm2 logs kamchatour-hub -f
```

---

## 🔧 TROUBLESHOOTING

### Проблема: Сайт не открывается

```bash
# Проверить статус PM2
pm2 status

# Проверить порт
netstat -tulpn | grep 3000

# Проверить логи
pm2 logs kamchatour-hub --lines 50
```

### Проблема: Ошибка БД

```bash
# Проверить подключение
psql -U kamchatour -d kamchatour -c "SELECT 1"

# Проверить таблицы
psql -U kamchatour -d kamchatour -c "\dt"

# Перезапустить PostgreSQL
systemctl restart postgresql
```

### Проблема: Темы не переключаются

```bash
# Проверить браузер Console
# Очистить localStorage
localStorage.clear();
location.reload();

# Проверить CSS загрузился
# DevTools → Network → globals.css
```

### Проблема: Погода не загружается

```bash
# Проверить API ключ
echo $OPENWEATHER_API_KEY

# Проверить лог API
pm2 logs | grep weather

# Тестовый запрос
curl "http://localhost:3000/api/weather?lat=53.0195&lng=158.6505"
```

### Проблема: Медленная сборка

```bash
# Очистить кэш
rm -rf .next node_modules
npm install
npm run build
```

---

## 🚀 CI/CD АВТОДЕПЛОЙ

### GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VDS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VDS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VDS_HOST }}
          username: ${{ secrets.VDS_USER }}
          password: ${{ secrets.VDS_PASSWORD }}
          script: |
            cd /home/kamchatour/kamhub
            git pull origin main
            npm install
            npm run build
            pm2 restart kamchatour-hub
```

### Настройка секретов:

В GitHub → Settings → Secrets:
- `VDS_HOST`: `5.129.248.224`
- `VDS_USER`: `kamchatour`
- `VDS_PASSWORD`: `your_password`

---

## 📞 ПОДДЕРЖКА

### Контакты:
- 📧 Email: info@kamchatour.ru
- 💬 Telegram: @kamchatour
- 🌐 Сайт: http://5.129.248.224

### Полезные ссылки:
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [PM2 Docs](https://pm2.keymetrics.io/docs/)
- [Timeweb Apps Docs](https://timeweb.cloud/docs/apps)

---

## 📝 CHANGELOG

### v1.0.0 (2025-10-30)
- ✅ Система тем (светлая + темная)
- ✅ Погодное настроение
- ✅ Mobile-first дизайн
- ✅ Samsung Weather стиль
- ✅ Регистрация партнёров
- ✅ Добавление туров
- ✅ PostgreSQL + PostGIS
- ✅ VDS деплой

---

**📚 Документация обновлена: 2025-10-30**
