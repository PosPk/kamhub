# 🔐 Настройка переменных окружения для Vercel

## ⚡ БЫСТРАЯ НАСТРОЙКА

### 1. Перейти в настройки проекта на Vercel

```
https://vercel.com/your-team/kamhub/settings/environment-variables
```

### 2. Добавить все переменные окружения

---

## 🌦️ ПОГОДА (КРИТИЧНО!)

### Yandex Weather - Основной провайдер

⚠️ **БЕЗ ЭТОГО КЛЮЧА ПОГОДА НЕ БУДЕТ РАБОТАТЬ!**

```bash
YANDEX_WEATHER_API_KEY=ваш_ключ_из_яндекса
```

**Как получить:**
1. https://yandex.ru/dev/weather
2. Регистрация → "Создать приложение"
3. Выбрать тариф:
   - **Тестовый:** 1000 запросов/день, БЕСПЛАТНО 30 дней
   - **Базовый:** 50k запросов/мес, ~1000₽/мес
4. Скопировать API ключ
5. Вставить в Vercel

**Почему Yandex?**
- ✅ Самая высокая точность для Камчатки (9/10)
- ✅ Локальные метеостанции Росгидромета
- ✅ Обновления каждые 15-30 минут
- ✅ Учитывает специфику Дальнего Востока

**Fallback система:**
Если Yandex недоступен → автоматически переключится на Open-Meteo (бесплатный)

---

## 🗺️ КАРТЫ (Обязательно)

```bash
YANDEX_MAPS_API_KEY=ваш_ключ_карт
```

**Как получить:**
1. https://yandex.ru/dev/maps
2. Создать JavaScript API ключ
3. Добавить домены: `kamhub.vercel.app`, `*.vercel.app`

---

## 🤖 AI (Рекомендуется)

### Вариант 1: GROQ (Рекомендуется)

```bash
GROQ_API_KEY=gsk_ваш_ключ
```

- Бесплатно: 14,400 запросов/день
- Быстрая скорость
- Llama 3.1 70B модель
- https://console.groq.com

### Вариант 2: DeepSeek (Альтернатива)

```bash
DEEPSEEK_API_KEY=sk-ваш_ключ
```

- $0.14 за 1M токенов
- Хорошее качество
- https://platform.deepseek.com

### Вариант 3: OpenRouter

```bash
OPENROUTER_API_KEY=sk-or-v1-ваш_ключ
```

- Доступ ко многим моделям
- https://openrouter.ai

---

## 🗄️ БАЗА ДАННЫХ (Критично)

```bash
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
```

**Рекомендуемые провайдеры:**

### Вариант 1: Vercel Postgres (Самый простой)

```bash
# Автоматически создаётся при подключении Vercel Postgres
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
```

1. В проекте Vercel → Storage → Create → Postgres
2. Переменные добавятся автоматически
3. Переименовать `POSTGRES_URL` → `DATABASE_URL`

### Вариант 2: Supabase (Бесплатный)

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

1. https://supabase.com → New Project
2. Settings → Database → Connection String
3. Выбрать "URI" формат

### Вариант 3: Railway / Render

```bash
DATABASE_URL=postgresql://...
```

---

## 💳 ПЛАТЕЖИ (Опционально)

### CloudPayments

```bash
CLOUDPAYMENTS_PUBLIC_ID=pk_ваш_публичный_ключ
CLOUDPAYMENTS_API_SECRET=ваш_секретный_ключ
```

https://cloudpayments.ru

### Или YooKassa (Яндекс Касса)

```bash
YANDEX_PAYMENT_SHOP_ID=ваш_shop_id
YANDEX_PAYMENT_SECRET_KEY=live_ваш_секретный_ключ
```

https://yookassa.ru

---

## 📧 EMAIL (Опционально)

### Gmail SMTP

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ваш_email@gmail.com
SMTP_PASS=ваш_app_password
EMAIL_FROM=noreply@kamchatour.ru
```

**Как получить App Password:**
1. Google Account → Security
2. 2-Step Verification → Включить
3. App Passwords → Generate
4. Скопировать пароль (16 символов)

---

## 📱 SMS (Опционально)

```bash
SMS_RU_API_KEY=ваш_api_ключ
```

https://sms.ru → API ключи

---

## 💬 TELEGRAM BOT (Опционально)

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
```

**Как создать бота:**
1. Написать [@BotFather](https://t.me/botfather)
2. `/newbot` → указать имя
3. Скопировать Token
4. Добавить бота в группу
5. Узнать Chat ID через [@userinfobot](https://t.me/userinfobot)

---

## 🔐 БЕЗОПАСНОСТЬ (Критично)

### JWT Secret

```bash
JWT_SECRET=ваш_очень_длинный_случайный_секрет_минимум_32_символа
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
```

**Генерация:**

```bash
# Linux/Mac
openssl rand -base64 64

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## 🌐 ОКРУЖЕНИЕ

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://kamhub.vercel.app
```

---

## 📊 МОНИТОРИНГ (Опционально)

### Sentry

```bash
SENTRY_DSN=https://ваш_ключ@sentry.io/проект
NEXT_PUBLIC_SENTRY_DSN=https://ваш_ключ@sentry.io/проект
```

https://sentry.io

---

## ✅ ПРОВЕРКА НАСТРОЕК

После добавления всех переменных:

### 1. Проверить обязательные переменные

```bash
✅ YANDEX_WEATHER_API_KEY (КРИТИЧНО!)
✅ YANDEX_MAPS_API_KEY
✅ DATABASE_URL
✅ JWT_SECRET
✅ NODE_ENV=production
```

### 2. Сделать Redeploy

```
Vercel Dashboard → Deployments → Redeploy
```

### 3. Проверить логи

```
Vercel Dashboard → Deployments → Latest → View Function Logs
```

### 4. Тестовый запрос

```bash
# Проверка погоды
curl "https://kamhub.vercel.app/api/weather?lat=53&lng=158"

# Проверка здоровья приложения
curl "https://kamhub.vercel.app/api/health"
```

---

## 🎯 ПРИОРИТЕТЫ

### Минимум для запуска:

```bash
1. ✅ YANDEX_WEATHER_API_KEY    # Погода не будет работать без этого!
2. ✅ YANDEX_MAPS_API_KEY        # Карты не будут работать
3. ✅ DATABASE_URL                # База данных
4. ✅ JWT_SECRET                  # Безопасность
```

### Рекомендуется добавить:

```bash
5. ⭐ GROQ_API_KEY               # AI-ассистент
6. ⭐ SMTP настройки             # Email уведомления
```

### Можно добавить позже:

```bash
7. 📱 SMS_RU_API_KEY
8. 💬 TELEGRAM_BOT_TOKEN
9. 💳 CLOUDPAYMENTS настройки
10. 📊 SENTRY_DSN
```

---

## 🚨 ЧАСТЫЕ ОШИБКИ

### 1. Погода не работает

**Проблема:** `Weather API error` или пустой виджет

**Решение:**
```bash
# Проверить что YANDEX_WEATHER_API_KEY добавлен
# Проверить лимиты на https://yandex.ru/dev/weather
# Fallback на Open-Meteo работает автоматически
```

### 2. База данных не подключается

**Проблема:** `DATABASE_URL is required`

**Решение:**
```bash
# Проверить формат: postgresql://username:password@host:5432/database
# Добавить ?sslmode=require для Vercel/Supabase
# Проверить что база создана
```

### 3. JWT ошибка

**Проблема:** `JWT_SECRET must be set to a secure value`

**Решение:**
```bash
# Сгенерировать новый секрет (минимум 32 символа)
openssl rand -base64 64
```

---

## 📞 ПОМОЩЬ

Если что-то не работает:

1. **Проверить логи:** Vercel Dashboard → Function Logs
2. **Проверить переменные:** Settings → Environment Variables
3. **Redeploy:** Deployments → Redeploy
4. **Документация:** 
   - `/WEATHER_PROVIDERS_KAMCHATKA.md` - про погоду
   - `/WEATHER_API_UPDATE.md` - про Weather API
   - `/READY_TO_DEPLOY.md` - общая инструкция

---

**Дата:** 2025-11-12  
**Версия:** 2.0  
**Статус:** Yandex Weather - основной провайдер 🌦️
