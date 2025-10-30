# 🔐 НАСТРОЙКА СЕКРЕТОВ В TIMEWEB CLOUD

> **Как правильно настроить секреты для проекта**

---

## 🎯 ПРОЕКТ В TIMEWEB CLOUD

**Ваш проект:** https://timeweb.cloud/my/projects/1883095

---

## ⚡ БЫСТРАЯ НАСТРОЙКА (5 минут)

### Шаг 1: Перейти в проект

1. Открыть: https://timeweb.cloud/my/projects/1883095
2. Перейти в: **Settings** → **Environment Variables**

### Шаг 2: Добавить обязательные переменные

**ОБЯЗАТЕЛЬНЫЕ (без них не запустится):**

```env
# Database (создать Managed PostgreSQL в Timeweb)
DATABASE_URL=postgresql://user:password@host:port/db
DATABASE_SSL=true
DATABASE_MAX_CONNECTIONS=20

# Security (сгенерировать новый!)
JWT_SECRET=<сгенерировать_openssl_rand_-base64_32>
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ваш-проект.timeweb.app
```

### Шаг 3: Добавить опциональные переменные

**ДЛЯ AI ФУНКЦИОНАЛА:**

```env
# AI APIs (получить на соотв. сайтах)
GROQ_API_KEY=gsk_...
DEEPSEEK_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
```

**ДЛЯ ПЛАТЕЖЕЙ:**

```env
# CloudPayments
CLOUDPAYMENTS_PUBLIC_ID=pk_...
CLOUDPAYMENTS_API_SECRET=...
```

**ДЛЯ УВЕДОМЛЕНИЙ:**

```env
# Email
SMTP_HOST=smtp.timeweb.ru
SMTP_PORT=587
SMTP_USER=ваш@email.ru
SMTP_PASS=пароль
EMAIL_FROM=noreply@kamchatour.ru

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# SMS
SMS_RU_API_ID=...
```

**ДЛЯ МОНИТОРИНГА:**

```env
# Sentry
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

---

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

### 1. Создать Managed PostgreSQL

**В Timeweb Cloud:**

1. Databases → Create → PostgreSQL
2. Выбрать тариф (рекомендуется: PostgreSQL-2)
3. Имя: `kamchatour-db`
4. Получить `DATABASE_URL` из email или dashboard

**Применить миграции:**

```bash
# Подключиться к БД через SSH туннель или Timeweb CLI
psql $DATABASE_URL

# Или через Timeweb Cloud Apps terminal
npm run migrate:up
```

### 2. Сгенерировать JWT_SECRET

**На своем компьютере:**

```bash
openssl rand -base64 32
```

**Результат (пример):**
```
8FcKPmQ2vN7sL9xR4tY1wZ3bA6dE5gH/jK0mN=
```

**Скопировать в Timeweb Environment Variables:**
```
JWT_SECRET=8FcKPmQ2vN7sL9xR4tY1wZ3bA6dE5gH/jK0mN=
```

### 3. Получить API ключи

#### GROQ (AI модели):

1. Перейти: https://console.groq.com/
2. Sign up / Log in
3. API Keys → Create API Key
4. Скопировать `GROQ_API_KEY`

#### DeepSeek (AI модели):

1. Перейти: https://platform.deepseek.com/
2. Sign up / Log in
3. API Keys → Create
4. Скопировать `DEEPSEEK_API_KEY`

#### CloudPayments (платежи):

1. Перейти: https://cloudpayments.ru/
2. Личный кабинет → API
3. Скопировать `Public ID` и `API Secret`

#### Yandex Maps (карты):

1. Перейти: https://developer.tech.yandex.ru/
2. Получить API ключ для JavaScript API и HTTP Geocoder
3. Добавить `YANDEX_MAPS_API_KEY`

### 4. Настроить Telegram Bot (опционально)

```bash
# 1. Создать бота через @BotFather
/newbot
# Название: Kamchatour Hub
# Username: kamchatour_hub_bot

# 2. Получить токен
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# 3. Создать группу и добавить бота

# 4. Получить chat_id
curl https://api.telegram.org/bot<TOKEN>/getUpdates
```

---

## 🔒 БЕЗОПАСНОСТЬ

### ❌ НИКОГДА НЕ:

- ❌ Коммитить секреты в git
- ❌ Хранить .env в репозитории
- ❌ Отправлять секреты в публичных каналах
- ❌ Использовать одинаковые секреты для dev и prod
- ❌ Хардкодить API ключи в коде

### ✅ ВСЕГДА:

- ✅ Использовать Environment Variables в Timeweb UI
- ✅ Генерировать новые секреты для каждого окружения
- ✅ Ротировать ключи каждые 90 дней
- ✅ Использовать 2FA для всех аккаунтов
- ✅ Ограничивать права доступа

---

## 📊 ПРОВЕРКА НАСТРОЙКИ

### После добавления переменных:

1. **Перезапустить приложение:**
   - В Timeweb Cloud: Restart

2. **Проверить логи:**
   ```
   Logs → Application logs
   ```

3. **Проверить подключение к БД:**
   ```
   curl https://ваш-проект.timeweb.app/api/health/db
   ```

4. **Проверить что AI работает:**
   ```
   curl https://ваш-проект.timeweb.app/api/ai -X POST \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Привет"}'
   ```

---

## 🆘 ПРОБЛЕМЫ

### "Cannot connect to database"

**Проверить:**
- `DATABASE_URL` правильный
- PostgreSQL создан и запущен
- Миграции применены

**Решение:**
```bash
# В Timeweb Cloud Apps terminal:
echo $DATABASE_URL
npm run migrate:up
```

### "JWT_SECRET not configured"

**Проверить:**
- Переменная `JWT_SECRET` добавлена
- Длина минимум 32 символа
- Приложение перезапущено

### "AI API failed"

**Проверить:**
- API ключи правильные
- Есть баланс на счету (для платных API)
- Ключи не истекли

---

## 📋 ЧЕКЛИСТ

### Обязательные переменные:

- [ ] `DATABASE_URL` - из Managed PostgreSQL
- [ ] `JWT_SECRET` - сгенерирован openssl
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_APP_URL` - URL проекта
- [ ] Приложение перезапущено
- [ ] Миграции применены

### Опциональные (по функциям):

- [ ] `GROQ_API_KEY` - для AI чата
- [ ] `CLOUDPAYMENTS_*` - для платежей
- [ ] `YANDEX_MAPS_API_KEY` - для карт
- [ ] `TELEGRAM_BOT_TOKEN` - для уведомлений
- [ ] `SENTRY_DSN` - для мониторинга

---

## 🎯 ИТОГОВАЯ КОНФИГУРАЦИЯ

### Минимум для запуска:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=<32+ символов>
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://...
```

### Полная конфигурация:

См. `.env.example` в репозитории

---

## 📞 ПОДДЕРЖКА

**Timeweb Cloud:**
- Панель: https://timeweb.cloud/my/projects/1883095
- Docs: https://timeweb.cloud/help/
- Support: support@timeweb.ru

**Проект:**
- См. `SECURITY_SCAN_REPORT.md`
- См. `TIMEWEB_ДЕПЛОЙ.md`

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Для проекта:** https://timeweb.cloud/my/projects/1883095
