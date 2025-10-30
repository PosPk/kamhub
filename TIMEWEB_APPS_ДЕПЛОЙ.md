# 🚀 ДЕПЛОЙ НА TIMEWEB CLOUD APPS

> **Ваше приложение:** https://timeweb.cloud/my/apps/125051  
> **Managed платформа** - как Vercel, но на Timeweb

---

## ⚡ БЫСТРЫЙ ДЕПЛОЙ (5 минут)

### Проблема: GitHub заблокирован файлом core

**Решение: Загрузить код напрямую через Timeweb Cloud Apps**

---

## 📦 ВАРИАНТ 1: ЗАГРУЗКА ЧЕРЕЗ TIMEWEB INTERFACE (БЕЗ GIT)

### Шаг 1: Создать чистый архив

```bash
cd /workspace

# Создать архив без лишних файлов
tar -czf kamhub-clean.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=core \
  --exclude=.next \
  --exclude=build \
  --exclude="*.log" \
  .

echo "Архив создан: $(du -h kamhub-clean.tar.gz | cut -f1)"
```

### Шаг 2: Загрузить в Timeweb Cloud Apps

1. **Открыть:** https://timeweb.cloud/my/apps/125051/deploy

2. **Выбрать источник:**
   - Если есть опция "Upload Archive" или "Manual Upload" - использовать её
   - Загрузить `kamhub-clean.tar.gz`

3. **Или через Git:**
   - Settings → Repository
   - Можно подключить другой Git сервис (GitLab, Bitbucket)
   - Или использовать Timeweb Git (если доступен)

---

## 🔧 ВАРИАНТ 2: СОЗДАТЬ НОВЫЙ GIT РЕПОЗИТОРИЙ

### На вашем компьютере:

```bash
cd /workspace

# Создать чистую копию БЕЗ истории
rm -rf .git core
git init
git add .
git commit -m "Initial commit for Timeweb Cloud Apps"

# Создать новый репозиторий на GitHub
# https://github.com/new
# Название: kamhub-clean

# Подключить новый remote
git remote add origin https://github.com/ваш-username/kamhub-clean.git
git branch -M main
git push -u origin main
```

### В Timeweb Cloud Apps:

1. **Открыть:** https://timeweb.cloud/my/apps/125051
2. **Settings → Repository**
3. **Change repository** → указать новый репозиторий
4. **Save** → Deploy запустится автоматически

---

## ⚙️ НАСТРОЙКА ПРИЛОЖЕНИЯ

### 1. Build Settings

**В Timeweb Cloud Apps:**

Settings → Build & Deploy

```yaml
Framework: Next.js

Build Command:
  npm install && npm run build

Start Command:
  npm start

Node Version: 20.x

Root Directory: /

Output Directory: .next
```

---

### 2. Environment Variables

**Settings → Environment Variables**

**ОБЯЗАТЕЛЬНЫЕ:**

```env
# Database (создать в Timeweb Cloud → Databases → PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/kamchatour
DATABASE_SSL=true
DATABASE_MAX_CONNECTIONS=20

# Security (сгенерировать!)
JWT_SECRET=<openssl rand -base64 32>
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://kamchatour-125051.timeweb.cloud
PORT=3000
```

**ОПЦИОНАЛЬНЫЕ (добавить позже):**

```env
# AI APIs
GROQ_API_KEY=
DEEPSEEK_API_KEY=
OPENROUTER_API_KEY=

# Payments
CLOUDPAYMENTS_PUBLIC_ID=
CLOUDPAYMENTS_API_SECRET=

# Maps
YANDEX_MAPS_API_KEY=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Notifications
SMTP_HOST=smtp.timeweb.ru
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
TELEGRAM_BOT_TOKEN=
```

---

### 3. Database

**Создать Managed PostgreSQL:**

1. **Timeweb Cloud → Databases**
2. **Create → PostgreSQL**
3. **План:** PostgreSQL-2 (~300₽/мес)
4. **Имя:** kamchatour-db
5. **Получить CONNECTION_URL**
6. **Добавить в Environment Variables как DATABASE_URL**

---

### 4. Миграции

**После первого деплоя:**

**В Timeweb Cloud Apps → Terminal:**

```bash
# Применить миграции
npm run migrate:up

# Создать расширения PostgreSQL
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Применить дополнительные схемы
psql $DATABASE_URL -f lib/database/seat_holds_schema.sql
```

**Или локально с DATABASE_URL:**

```bash
# На своем компьютере
export DATABASE_URL="postgresql://..." # из Timeweb

npm run migrate:up
psql $DATABASE_URL -f lib/database/seat_holds_schema.sql
```

---

## 🔥 СУПЕР БЫСТРЫЙ СПОСОБ (БЕЗ GIT)

### Если нужно запустить ПРЯМО СЕЙЧАС:

```bash
# 1. Создать архив
cd /workspace
zip -r deploy.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "core" \
  -x ".next/*" \
  -x "*.log"

# 2. Загрузить через Timeweb File Manager
# https://timeweb.cloud/my/apps/125051/files
# Upload deploy.zip
# Распаковать через interface

# 3. В Terminal:
npm install
npm run build
npm start

# ГОТОВО!
```

---

## 📋 ЧЕКЛИСТ ДЕПЛОЯ

### Перед деплоем:

- [ ] Создан Managed PostgreSQL в Timeweb
- [ ] DATABASE_URL скопирован
- [ ] JWT_SECRET сгенерирован
- [ ] Environment Variables добавлены
- [ ] Build settings настроены

### Деплой:

- [ ] Код загружен (через Git или Archive)
- [ ] Build запущен и успешен
- [ ] Application запущена

### После деплоя:

- [ ] Миграции применены
- [ ] Приложение открывается
- [ ] API endpoints работают
- [ ] База данных подключена

---

## 🌐 ПРОВЕРКА

**После деплоя приложение будет доступно:**

```
https://kamchatour-125051.timeweb.cloud
```

**Или с custom доменом (если настроите):**

```
https://kamchatour.ru
```

### Проверить здоровье:

```bash
curl https://kamchatour-125051.timeweb.cloud/api/health
curl https://kamchatour-125051.timeweb.cloud/api/health/db
```

---

## 🎯 ЧТО ДЕЛАТЬ ПРЯМО СЕЙЧАС

### Рекомендую ВАРИАНТ 2 (новый Git):

**5 минут:**

```bash
# 1. Создать чистый репозиторий
cd /workspace
rm -rf .git core
git init
git add .
git commit -m "Production ready for Timeweb Cloud Apps"

# 2. Создать на GitHub
# https://github.com/new → kamhub-clean

# 3. Push
git remote add origin https://github.com/ваш-username/kamhub-clean.git
git push -u origin main

# 4. В Timeweb Cloud Apps
# Settings → Repository → Change → указать новый репо

# 5. Настроить Environment Variables
# См. раздел выше

# ГОТОВО! Deploy запустится автоматически
```

---

## 🆘 ПРОБЛЕМЫ

### "Build failed"

**Проверить:**
- Логи в Deployments → Latest Deploy → Logs
- Environment Variables установлены
- Build Command правильный: `npm install && npm run build`

### "Cannot connect to database"

**Проверить:**
- DATABASE_URL правильный
- PostgreSQL создан и запущен
- Whitelist IP добавлен (если требуется)

**Решение:**
```bash
# В Terminal Timeweb Apps
echo $DATABASE_URL
psql $DATABASE_URL -c "SELECT 1;"
```

### "Application not starting"

**Проверить:**
- Start Command: `npm start`
- PORT=3000 в Environment Variables
- Логи: Logs → Application Logs

---

## 💡 ПРЕИМУЩЕСТВА TIMEWEB CLOUD APPS

```
✅ Автоматический deploy при git push
✅ Встроенный SSL сертификат
✅ Автоматическое масштабирование
✅ Managed PostgreSQL
✅ Встроенный мониторинг
✅ Бесплатный домен .timeweb.cloud
✅ Простая настройка environment variables
✅ Terminal доступ для команд
```

---

## 📊 СТОИМОСТЬ

```
Timeweb Cloud Apps:      от 300₽/мес
Managed PostgreSQL-2:    ~300₽/мес
Домен .ru:               ~200₽/год (опционально)
SSL:                     БЕСПЛАТНО
--------------------------------------
ИТОГО:                   ~600₽/мес
```

---

## 🎉 ГОТОВО!

**После выполнения шагов:**

✅ Приложение работает на Timeweb Cloud Apps  
✅ Автоматический deploy при push  
✅ SSL сертификат активен  
✅ База данных подключена  
✅ Мониторинг работает  

**URL:** https://kamchatour-125051.timeweb.cloud

---

**Начинайте с создания нового Git репозитория - это самый быстрый путь!** 🚀
