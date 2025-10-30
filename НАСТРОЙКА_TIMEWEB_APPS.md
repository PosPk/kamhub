# ⚙️ НАСТРОЙКА TIMEWEB CLOUD APPS

> **План:** 200k запросов/мес, 1GB  
> **Приложение:** https://timeweb.cloud/my/apps/125051

---

## 📋 CHECKLIST НАСТРОЙКИ

### ✅ ШАГ 1: ПОДКЛЮЧЕНИЕ РЕПОЗИТОРИЯ

**Settings → Repository**

```
Repository URL: https://github.com/PosPk/kamhub
Branch: main
Auto Deploy: ✓ ON (автоматический деплой при push)
```

**Save**

---

### ✅ ШАГ 2: BUILD & DEPLOY НАСТРОЙКИ

**Settings → Build & Deploy**

```yaml
Framework: Next.js

Build Command:
  npm install --production=false && npm run build

Start Command:
  npm start

Node Version: 20.x

Root Directory: /

Port: 3000

Environment: production
```

**Save**

---

### ✅ ШАГ 3: СОЗДАТЬ БАЗУ ДАННЫХ PostgreSQL

**Timeweb Cloud → Databases → Create Database**

```
Тип: PostgreSQL
Версия: 15
План: PostgreSQL-2 (300₽/мес)
Имя: kamchatour-db
Регион: ru-1
```

**Create**

После создания скопируйте **CONNECTION STRING**:
```
postgresql://user:password@host:5432/database
```

---

### ✅ ШАГ 4: ENVIRONMENT VARIABLES

**Settings → Environment Variables**

#### Обязательные переменные:

```env
# Database (скопируйте из PostgreSQL)
DATABASE_URL=postgresql://user:password@host.timeweb.cloud:5432/kamchatour
DATABASE_SSL=true
DATABASE_MAX_CONNECTIONS=10

# Security (сгенерируйте новый ключ!)
JWT_SECRET=<выполните: openssl rand -base64 32>
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://kamchatour-125051.timeweb.cloud
PORT=3000
```

**Как сгенерировать JWT_SECRET:**

На вашем компьютере (Mac/Linux):
```bash
openssl rand -base64 32
```

На Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Или онлайн: https://generate-secret.vercel.app/32

#### Опциональные (добавить позже):

```env
# AI Services
GROQ_API_KEY=gsk_...
DEEPSEEK_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...

# Payment
CLOUDPAYMENTS_PUBLIC_ID=pk_...
CLOUDPAYMENTS_API_SECRET=...

# Maps
YANDEX_MAPS_API_KEY=...

# Notifications
SMTP_HOST=smtp.timeweb.ru
SMTP_PORT=465
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=...
SMTP_FROM=KamHub <noreply@yourdomain.com>
SMS_API_KEY=...
TELEGRAM_BOT_TOKEN=...
```

**Save → Restart Application**

---

### ✅ ШАГ 5: ЗАПУСТИТЬ DEPLOY

**Deployments → Trigger Deploy**

Или дождитесь автоматического деплоя (если Auto Deploy ON)

**Следите за логами:**
- Deployments → Latest → View Logs
- Время: ~3-5 минут

**Ожидаемые логи:**

```
✓ Pulling from GitHub
✓ Installing dependencies
✓ Building application
✓ Starting server
✓ Server listening on port 3000
✓ Deploy successful!
```

---

### ✅ ШАГ 6: ПРИМЕНИТЬ МИГРАЦИИ БД

**После успешного деплоя в Terminal:**

```bash
# Основные миграции
npm run migrate:up

# PostgreSQL расширения
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Дополнительные таблицы
psql $DATABASE_URL -f lib/database/seat_holds_schema.sql
psql $DATABASE_URL -f lib/database/transfer_payments_schema.sql
psql $DATABASE_URL -f lib/database/loyalty_schema.sql
psql $DATABASE_URL -f lib/database/operators_schema.sql
```

Или через SSH:

```bash
ssh app@kamchatour-125051.timeweb.cloud
cd /app
npm run migrate:up
```

---

### ✅ ШАГ 7: ПРОВЕРИТЬ ПРИЛОЖЕНИЕ

#### В браузере:

```
https://kamchatour-125051.timeweb.cloud
```

#### API Health Check:

```bash
curl https://kamchatour-125051.timeweb.cloud/api/health
```

**Ожидается:**
```json
{"success":true,"status":"healthy"}
```

#### Database Health:

```bash
curl https://kamchatour-125051.timeweb.cloud/api/health/db
```

**Ожидается:**
```json
{"success":true,"database":"connected","tables":24}
```

---

## 📊 ЛИМИТЫ ВАШЕГО ПЛАНА

```
✓ 200,000 запросов/месяц
✓ 1 GB трафика
✓ 1 приложение
✓ Автоматический SSL
```

### Достаточно ли этого?

**Для старта - ДА!** ✅

**Расчет:**
- 200k запросов/мес = ~6,600 запросов/день
- 1 GB трафика = ~250 MB в неделю
- Средний запрос: ~50 KB HTML + API
- **Поддерживает:** ~150-200 уникальных пользователей/день

### Когда обновлять план?

⚠️ **Мониторьте:**
- Deployments → Metrics
- Если использование > 80% - обновите план

**Upgrade на:**
- Apps Pro (500k запросов, 5GB) - 500₽/мес
- Apps Business (1M запросов, 10GB) - 1000₽/мес

---

## 🔒 ВАЖНЫЕ НАСТРОЙКИ БЕЗОПАСНОСТИ

### 1. SSL Certificate

**Автоматически активируется** для `*.timeweb.cloud`

Проверить:
```bash
curl -I https://kamchatour-125051.timeweb.cloud
```

Ожидается: `HTTP/2 200` с `strict-transport-security`

### 2. Custom Domain (опционально)

**Settings → Domains → Add Domain**

```
Domain: kamchatour.ru
```

**DNS настройки у регистратора:**
```
A    @    → IP из Timeweb Apps
A    www  → IP из Timeweb Apps
```

**SSL:** настроится автоматически через Let's Encrypt

### 3. Firewall Rules

**Settings → Security**

```
Allowed IPs: All (или ограничить для admin панели)
Rate Limiting: ON (защита от DDoS)
```

---

## 🚀 ОПТИМИЗАЦИЯ ПРОИЗВОДИТЕЛЬНОСТИ

### 1. Кэширование

Добавьте Redis для кэширования (опционально):

```bash
# В Timeweb Cloud → Databases → Redis
# Создайте Redis instance

# Добавьте в Environment Variables:
REDIS_URL=redis://default:password@host.timeweb.cloud:6379
```

### 2. Database Connection Pooling

Уже настроено в `lib/database.ts`:
```javascript
max: 20 connections
idle: 30s timeout
```

Для Timeweb Apps оптимально:
```env
DATABASE_MAX_CONNECTIONS=10
```

### 3. Static Files

Next.js автоматически оптимизирует:
- ✓ Сжатие gzip/brotli
- ✓ Cache headers
- ✓ Image optimization

---

## 📝 МОНИТОРИНГ

### Встроенные метрики Timeweb:

**Runtime → Metrics:**
- CPU usage
- Memory usage
- Request rate
- Response times

**Runtime → Logs:**
- Application logs (console.log)
- Error logs
- Access logs

### Настройка алертов:

**Settings → Notifications:**
```
✓ Deploy success/failure
✓ Application down
✓ High resource usage (> 80%)
```

**Email/Telegram:**
```
your@email.com
```

---

## 🆘 TROUBLESHOOTING

### Deploy failed

**Проверить:**
1. Logs в Deployments → Latest → View Logs
2. Build Command правильная
3. Start Command правильная
4. Node version = 20.x

**Решение:**
```bash
# Если ошибка с dependencies:
Build Command: npm ci && npm run build

# Если ошибка с start:
Start Command: npm start -- -p 3000
```

### Application not responding

**Проверить:**
1. Runtime → Logs (ищите ошибки)
2. Database подключена (DATABASE_URL)
3. Port = 3000 в env vars

**Решение:**
- Restart Application
- Проверить DATABASE_URL валидный

### Database connection error

**Проверить:**
1. DATABASE_URL правильный
2. PostgreSQL запущен
3. Firewall разрешает подключения

**Тест подключения:**
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

---

## 📞 ПОДДЕРЖКА

### Timeweb Cloud:

- **Dashboard:** https://timeweb.cloud/my/apps/125051
- **Docs:** https://timeweb.cloud/help/
- **Support:** support@timeweb.ru
- **Telegram:** @timeweb_support

### Документация проекта:

- README.md
- DEPLOYMENT_GUIDE.md
- ИСПРАВЛЕНИЕ_СТАТИКИ.md

---

## ✅ ФИНАЛЬНЫЙ CHECKLIST

```
[ ] Репозиторий подключен
[ ] Build & Deploy настроены
[ ] PostgreSQL создан
[ ] Environment Variables добавлены
[ ] Deploy запущен успешно
[ ] Миграции применены
[ ] Health check проходит
[ ] SSL работает
[ ] Логи чистые
[ ] Мониторинг настроен
```

---

## 🎉 ГОТОВО!

После выполнения всех шагов ваше приложение будет:

✅ **Работает:** https://kamchatour-125051.timeweb.cloud  
✅ **Безопасно:** SSL, CSRF, Rate Limiting  
✅ **Масштабируемо:** Connection pooling, готово к росту  
✅ **Мониторится:** Логи + метрики в Timeweb  

**Начинайте с Шага 1!** 🚀

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Статус:** Ready for deployment ✅
