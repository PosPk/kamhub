# 🚀 ДЕПЛОЙ KAMCHATOUR HUB

> **Быстрый запуск проекта** - от 0 до работающего приложения за 10 минут

---

## ⚡ БЫСТРЫЙ СТАРТ (Локально)

### Шаг 1: Настройка базы данных

```bash
# Если PostgreSQL не установлен:
# Ubuntu/Debian:
sudo apt update && sudo apt install -y postgresql postgresql-contrib

# macOS:
brew install postgresql

# Запустить PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS

# Создать базу данных
sudo -u postgres createdb kamchatour

# Создать пользователя
sudo -u postgres psql -c "CREATE USER kamuser WITH PASSWORD 'kampass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kamchatour TO kamuser;"

# Обновить .env с реальными данными:
DATABASE_URL=postgresql://kamuser:kampass@localhost:5432/kamchatour
```

### Шаг 2: Применить миграции

```bash
cd /workspace

# Установить зависимости (если еще не установлены)
npm install

# Применить основные миграции
npm run migrate:up

# Применить seat_holds таблицу
psql $DATABASE_URL -f lib/database/seat_holds_schema.sql

# Проверить подключение
npm run db:test
```

### Шаг 3: Запустить приложение

```bash
# Development режим
npm run dev

# Откроется на http://localhost:3002
```

---

## 🌐 ДЕПЛОЙ НА VERCEL (Production)

### Вариант 1: Через Vercel Dashboard (РЕКОМЕНДУЕТСЯ)

1. **Подключить репозиторий:**
   - Перейти на https://vercel.com
   - New Project → Import Git Repository
   - Выбрать ваш GitHub/GitLab репозиторий

2. **Настроить базу данных:**
   - В Vercel: Storage → Create → Postgres
   - Скопировать DATABASE_URL
   - Добавить в Environment Variables

3. **Добавить переменные окружения:**
   ```
   Settings → Environment Variables → Add
   ```
   
   **Минимум для запуска:**
   ```
   DATABASE_URL=postgres://...  (из Vercel Postgres)
   JWT_SECRET=<сгенерировать случайный>
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
   
   **Для полного функционала:**
   ```
   GROQ_API_KEY=...
   CLOUDPAYMENTS_PUBLIC_ID=...
   CLOUDPAYMENTS_API_SECRET=...
   SENTRY_DSN=...
   ```

4. **Deploy:**
   - Vercel автоматически задеплоит при push в main
   - Или нажать "Deploy" в dashboard

5. **Применить миграции (после первого деплоя):**
   ```bash
   # В локальном терминале с DATABASE_URL из Vercel:
   DATABASE_URL="postgres://..." npm run migrate:up
   DATABASE_URL="postgres://..." psql -f lib/database/seat_holds_schema.sql
   ```

### Вариант 2: Через Vercel CLI

```bash
# Установить Vercel CLI
npm install -g vercel

# Login
vercel login

# Первый деплой
vercel

# Production деплой
vercel --prod

# После деплоя применить миграции через Vercel Postgres console
```

---

## 🐳 ДЕПЛОЙ ЧЕРЕЗ DOCKER

### Создать Docker образ:

```bash
# Создать Dockerfile (уже есть в проекте)
docker build -t kamchatour-hub .

# Запустить с PostgreSQL
docker-compose up -d
```

### docker-compose.yml:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kamchatour
      POSTGRES_USER: kamuser
      POSTGRES_PASSWORD: kampass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3002:3002"
    environment:
      DATABASE_URL: postgresql://kamuser:kampass@postgres:5432/kamchatour
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    depends_on:
      - postgres

volumes:
  postgres_data:
```

```bash
# Запустить
docker-compose up -d

# Применить миграции
docker-compose exec app npm run migrate:up
docker-compose exec app psql $DATABASE_URL -f lib/database/seat_holds_schema.sql

# Открыть http://localhost:3002
```

---

## 📦 ДЕПЛОЙ НА VPS (Ubuntu/Debian)

### Автоматическая установка:

```bash
# Скачать и запустить setup скрипт
curl -o setup.sh https://raw.githubusercontent.com/your-repo/kamchatour-hub/main/scripts/setup-production.sh
chmod +x setup.sh
./setup.sh
```

### Ручная установка:

```bash
# 1. Обновить систему
sudo apt update && sudo apt upgrade -y

# 2. Установить Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Установить PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 4. Настроить PostgreSQL
sudo -u postgres createdb kamchatour
sudo -u postgres psql -c "CREATE USER kamuser WITH PASSWORD 'secure-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kamchatour TO kamuser;"

# 5. Клонировать репозиторий
git clone https://github.com/your-repo/kamchatour-hub.git
cd kamchatour-hub

# 6. Установить зависимости
npm install

# 7. Настроить .env
cp .env.example .env
nano .env  # Заполнить реальные данные

# 8. Применить миграции
npm run migrate:up
psql $DATABASE_URL -f lib/database/seat_holds_schema.sql

# 9. Build приложения
npm run build

# 10. Настроить PM2 для автозапуска
npm install -g pm2
pm2 start npm --name "kamchatour-hub" -- start
pm2 save
pm2 startup

# 11. Настроить Nginx reverse proxy
sudo apt install -y nginx

sudo tee /etc/nginx/sites-available/kamchatour <<EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/kamchatour /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 12. Настроить SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## ✅ ПРОВЕРКА ДЕПЛОЯ

### После деплоя проверить:

```bash
# 1. Приложение работает
curl http://localhost:3002  # или ваш домен

# 2. База данных подключена
curl http://localhost:3002/api/health/db

# 3. API endpoints работают
curl http://localhost:3002/api/health

# 4. CSRF токен генерируется
curl http://localhost:3002/api/csrf-token
```

### Типичные проблемы:

1. **"Connection refused" ошибка:**
   - Проверить что PostgreSQL запущен: `sudo systemctl status postgresql`
   - Проверить DATABASE_URL в .env

2. **"Module not found" ошибка:**
   - Запустить: `npm install`

3. **"Permission denied" при миграциях:**
   - Проверить права пользователя БД
   - Попробовать с sudo: `sudo -u postgres psql`

4. **Port 3002 занят:**
   - Изменить порт в package.json: `"dev": "next dev -p 3003"`

---

## 🔧 НАСТРОЙКА BACKUP

```bash
# Настроить автоматические backup (каждые 6 часов)
chmod +x scripts/setup-backup-cron.sh
./scripts/setup-backup-cron.sh

# Проверить что cron job создан
crontab -l

# Ручной backup
./scripts/backup-db.sh

# Восстановление из backup
./scripts/restore-db.sh /path/to/backup.sql.gz
```

---

## 📊 МОНИТОРИНГ

### Sentry (Рекомендуется):

1. Создать проект на https://sentry.io
2. Добавить в .env:
   ```
   SENTRY_DSN=https://...@sentry.io/...
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   ```
3. Restart приложения

### PM2 Monitoring:

```bash
# Статус приложения
pm2 status

# Логи
pm2 logs kamchatour-hub

# Monitoring dashboard
pm2 monit
```

---

## 🎯 ЧЕКЛИСТ ПОСЛЕ ДЕПЛОЯ

- [ ] Приложение доступно по URL
- [ ] База данных подключена
- [ ] Миграции применены
- [ ] API endpoints работают
- [ ] CSRF protection активна
- [ ] Backup настроен
- [ ] SSL сертификат установлен (production)
- [ ] Sentry мониторинг работает
- [ ] Environment variables настроены
- [ ] PM2/Docker автозапуск настроен

---

## 🆘 НУЖНА ПОМОЩЬ?

### Проблемы с деплоем:
- Проверить логи: `pm2 logs` или `docker-compose logs`
- Проверить .env файл
- Проверить подключение к БД: `npm run db:test`

### Документация:
- `START_HERE.md` - быстрый старт
- `IMPLEMENTATION_GUIDE.md` - интеграция middleware
- `ЧЕКЛИСТ_ЗАПУСКА.md` - production checklist

---

## 🚀 ГОТОВО!

После выполнения этих шагов ваше приложение будет:
- ✅ Запущено и доступно
- ✅ С защитой от race conditions
- ✅ С автоматическими backup
- ✅ С мониторингом ошибок
- ✅ С security middleware

**Приложение готово к использованию!**

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Поддержка:** GitHub Issues
