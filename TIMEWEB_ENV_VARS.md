# ⚙️ ENVIRONMENT VARIABLES ДЛЯ TIMEWEB CLOUD APPS

> **Приложение:** Kamchatour Hub  
> **ID:** 125051  
> **Дата:** 30 октября 2025

---

## 🔑 ОБЯЗАТЕЛЬНЫЕ ПЕРЕМЕННЫЕ

Добавьте эти переменные в Timeweb Apps:
```
https://timeweb.cloud/my/apps/125051
→ Settings → Environment Variables
```

### 1. DATABASE_URL (PostgreSQL)

```bash
DATABASE_URL=postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require
```

> **⚠️ ВАЖНО:** Используйте `sslmode=require` для безопасного подключения!

---

### 2. NODE_ENV

```bash
NODE_ENV=production
```

---

### 3. NEXTAUTH_SECRET

```bash
NEXTAUTH_SECRET=<сгенерируйте_минимум_32_символа>
```

**Как сгенерировать:**
```bash
openssl rand -base64 32
```

**Пример:**
```bash
NEXTAUTH_SECRET=8kF9mX2qP7vL3wN6yT5uR4eQ1iO0pA9sD8fG7hJ6kL5m
```

---

### 4. NEXTAUTH_URL

```bash
NEXTAUTH_URL=<URL_вашего_приложения>
```

**Примеры:**
```bash
NEXTAUTH_URL=https://125051.timeweb.io
NEXTAUTH_URL=https://app-125051.timeweb.cloud
NEXTAUTH_URL=https://kamchatour.timeweb.io
```

> **⚠️ ВАЖНО:** Используйте ТОЧНЫЙ URL из Timeweb Dashboard!

---

### 5. JWT_SECRET

```bash
JWT_SECRET=<сгенерируйте_минимум_32_символа>
```

**Как сгенерировать:**
```bash
openssl rand -base64 32
```

**Пример:**
```bash
JWT_SECRET=5pL8mK3qN9vX2wB7yT6uR4eQ1iO0pA9sD8fG7hJ6kL5m
```

---

### 6. NEXT_PUBLIC_APP_URL

```bash
NEXT_PUBLIC_APP_URL=<URL_вашего_приложения>
```

**Примеры:**
```bash
NEXT_PUBLIC_APP_URL=https://125051.timeweb.io
NEXT_PUBLIC_APP_URL=https://app-125051.timeweb.cloud
```

> **⚠️ ВАЖНО:** Должен совпадать с NEXTAUTH_URL!

---

## 💳 ПЛАТЕЖНЫЕ СИСТЕМЫ (опционально)

### CloudPayments:

```bash
CLOUDPAYMENTS_PUBLIC_ID=<ваш_public_id>
CLOUDPAYMENTS_API_SECRET=<ваш_api_secret>
CLOUDPAYMENTS_WEBHOOK_SECRET=<ваш_webhook_secret>
```

> Получите в личном кабинете CloudPayments

---

## 📱 SMS (опционально)

### SMS.ru:

```bash
SMSRU_API_KEY=<ваш_smsru_api_key>
```

> Получите на https://sms.ru/

---

## 🤖 AI СЕРВИСЫ (опционально)

### GROQ (Llama 3.1):

```bash
GROQ_API_KEY=<ваш_groq_api_key>
```

> Бесплатный API: https://console.groq.com/

### DeepSeek:

```bash
DEEPSEEK_API_KEY=<ваш_deepseek_api_key>
```

> Получите на https://platform.deepseek.com/

### OpenRouter:

```bash
OPENROUTER_API_KEY=<ваш_openrouter_api_key>
```

> Получите на https://openrouter.ai/

---

## 🗺️ КАРТЫ (опционально)

### Yandex Maps:

```bash
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=<ваш_yandex_maps_api_key>
```

> Получите на https://developer.tech.yandex.ru/

---

## 📧 EMAIL (опционально)

### Nodemailer (SMTP):

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<ваш_email>
SMTP_PASS=<ваш_пароль_приложения>
EMAIL_FROM=<ваш_email>
```

> Для Gmail используйте App Password: https://myaccount.google.com/apppasswords

---

## 📋 ПОЛНЫЙ СПИСОК (КОПИРОВАТЬ В TIMEWEB)

### Минимальная конфигурация:

```bash
# PostgreSQL
DATABASE_URL=postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require

# Node
NODE_ENV=production

# NextAuth (сгенерируйте свои значения!)
NEXTAUTH_SECRET=<ваш_secret_32_символа>
NEXTAUTH_URL=<ваш_url_приложения>

# JWT (сгенерируйте свои значения!)
JWT_SECRET=<ваш_jwt_secret_32_символа>

# Public URL (замените на ваш URL!)
NEXT_PUBLIC_APP_URL=<ваш_url_приложения>
```

### Расширенная конфигурация (с платежами и AI):

```bash
# PostgreSQL
DATABASE_URL=postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require

# Node
NODE_ENV=production

# NextAuth
NEXTAUTH_SECRET=<ваш_secret_32_символа>
NEXTAUTH_URL=<ваш_url_приложения>

# JWT
JWT_SECRET=<ваш_jwt_secret_32_символа>

# Public URL
NEXT_PUBLIC_APP_URL=<ваш_url_приложения>

# CloudPayments (если есть)
CLOUDPAYMENTS_PUBLIC_ID=<ваш_public_id>
CLOUDPAYMENTS_API_SECRET=<ваш_api_secret>
CLOUDPAYMENTS_WEBHOOK_SECRET=<ваш_webhook_secret>

# SMS (если есть)
SMSRU_API_KEY=<ваш_smsru_api_key>

# AI (если есть)
GROQ_API_KEY=<ваш_groq_api_key>
DEEPSEEK_API_KEY=<ваш_deepseek_api_key>
OPENROUTER_API_KEY=<ваш_openrouter_api_key>

# Yandex Maps (если есть)
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=<ваш_yandex_maps_api_key>

# Email (если есть)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<ваш_email>
SMTP_PASS=<ваш_пароль_приложения>
EMAIL_FROM=<ваш_email>
```

---

## 🔧 КАК ДОБАВИТЬ В TIMEWEB APPS

### Шаг 1: Откройте настройки

```
https://timeweb.cloud/my/apps/125051
→ Settings → Environment Variables
```

### Шаг 2: Добавьте переменные

Для каждой переменной:

1. Нажмите **"Add Variable"** или **"Добавить переменную"**
2. **Key:** Имя переменной (например, `DATABASE_URL`)
3. **Value:** Значение переменной
4. Нажмите **"Add"** или **"Добавить"**

### Шаг 3: Сохраните

После добавления всех переменных нажмите **"Save"** или **"Сохранить"**

### Шаг 4: Перезапустите приложение

```
Settings → Restart Application
```

> **⚠️ ВАЖНО:** Приложение НЕ подхватит новые переменные без перезапуска!

---

## 🔐 БЕЗОПАСНОСТЬ

### ✅ ПРАВИЛА БЕЗОПАСНОСТИ:

1. **НИКОГДА не коммитьте .env файлы в Git**
2. **Используйте разные секреты для production и development**
3. **Генерируйте секреты минимум 32 символа**
4. **Используйте `sslmode=require` для PostgreSQL**
5. **Регулярно ротируйте секреты (раз в 3-6 месяцев)**

### ⚠️ НЕ ДЕЛАЙТЕ ТАК:

```bash
❌ NEXTAUTH_SECRET=12345
❌ JWT_SECRET=secret
❌ DATABASE_URL=postgresql://user:pass@localhost/db (без sslmode)
❌ NODE_ENV=development (в production)
```

### ✅ ДЕЛАЙТЕ ТАК:

```bash
✓ NEXTAUTH_SECRET=8kF9mX2qP7vL3wN6yT5uR4eQ1iO0pA9sD8fG7hJ6kL5m
✓ JWT_SECRET=5pL8mK3qN9vX2wB7yT6uR4eQ1iO0pA9sD8fG7hJ6kL5m
✓ DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
✓ NODE_ENV=production
```

---

## 🧪 ТЕСТИРОВАНИЕ

### Проверка переменных в приложении:

```javascript
// В API route или server component:
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✓' : 'MISSING ✗');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET ✓' : 'MISSING ✗');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET ✓' : 'MISSING ✗');
console.log('NODE_ENV:', process.env.NODE_ENV);
```

### Проверка подключения к БД:

```bash
# Локально
npm run db:check

# Или напрямую через psql
psql "postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require" -c "SELECT version();"
```

---

## 📱 ЛОКАЛЬНАЯ РАЗРАБОТКА

### Создайте .env.local:

```bash
# Скопируйте .env.example
cp .env.example .env.local

# Отредактируйте значения
nano .env.local
```

### Пример .env.local:

```bash
# PostgreSQL (используйте продакшн БД или локальную)
DATABASE_URL=postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require

# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NextAuth (используйте другие значения для dev!)
NEXTAUTH_SECRET=dev-secret-key-min-32-chars-12345678
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=dev-jwt-secret-key-min-32-chars-12345678

# Остальные как в production (если нужны)
```

> **⚠️ ВАЖНО:** НЕ используйте продакшн секреты в .env.local!

---

## 🆘 TROUBLESHOOTING

### Ошибка: "Environment variable not found"

**Решение:**
1. Проверьте что переменная добавлена в Timeweb Apps
2. Перезапустите приложение: Settings → Restart
3. Проверьте правильность имени переменной (регистр важен!)

### Ошибка: "Database connection failed"

**Решение:**
1. Проверьте DATABASE_URL (точность каждого символа!)
2. Проверьте что `sslmode=require` в конце URL
3. Проверьте что БД запущена в Timeweb Cloud

### Ошибка: "Invalid NEXTAUTH_URL"

**Решение:**
1. NEXTAUTH_URL должен быть полным URL с протоколом
2. Должен совпадать с реальным URL приложения
3. Должен совпадать с NEXT_PUBLIC_APP_URL

### Ошибка: "NextAuth configuration error"

**Решение:**
1. Проверьте что NEXTAUTH_SECRET минимум 32 символа
2. Проверьте что JWT_SECRET минимум 32 символа
3. Перезапустите приложение после изменений

---

## ✅ ЧЕКЛИСТ

- [ ] Добавлен `DATABASE_URL` в Timeweb Apps
- [ ] Добавлен `NODE_ENV=production`
- [ ] Сгенерирован и добавлен `NEXTAUTH_SECRET` (32+ символа)
- [ ] Добавлен `NEXTAUTH_URL` (точный URL приложения)
- [ ] Сгенерирован и добавлен `JWT_SECRET` (32+ символа)
- [ ] Добавлен `NEXT_PUBLIC_APP_URL` (совпадает с NEXTAUTH_URL)
- [ ] (Опционально) Добавлены ключи CloudPayments
- [ ] (Опционально) Добавлены ключи AI сервисов
- [ ] Приложение перезапущено: Settings → Restart
- [ ] Проверено что приложение запускается без ошибок
- [ ] Протестирована регистрация/логин
- [ ] База данных инициализирована (17 таблиц)

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **Добавьте все обязательные переменные в Timeweb Apps**
2. **Сгенерируйте секреты:**
   ```bash
   openssl rand -base64 32  # Для NEXTAUTH_SECRET
   openssl rand -base64 32  # Для JWT_SECRET
   ```
3. **Найдите точный URL приложения в Timeweb Dashboard**
4. **Перезапустите приложение**
5. **Инициализируйте базу данных:**
   ```bash
   ./scripts/quick-db-setup.sh
   ```
6. **Откройте приложение и протестируйте**
7. **Сообщите мне: "Env vars настроены! URL: <ваш_url>"**

И мы начнем работать над дизайном! 🎨

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Статус:** ✅ Ready to configure
