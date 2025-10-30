# 🐘 НАСТРОЙКА POSTGRESQL ДЛЯ TIMEWEB CLOUD

> **Статус:** ✅ Данные получены от Timeweb  
> **Дата:** 30 октября 2025

---

## 📋 ДАННЫЕ ПОДКЛЮЧЕНИЯ

### Основная информация:

```
Host: 51e6e5ca5d967b8e81fc9b75.twc1.net
Port: 5432
Database: default_db
User: gen_user
Password: q;3U+PY7XCz@Br
SSL Mode: verify-full
```

### IP адреса:
```
Внешний: 45.8.96.120
Внутренний: 192.168.0.4
```

### SSL Сертификат:
```bash
export PGSSLROOTCERT=$HOME/.cloud-certs/root.crt
```

---

## 🔐 DATABASE_URL ДЛЯ TIMEWEB APPS

### Вариант 1: С SSL верификацией (рекомендуется)

```bash
DATABASE_URL="postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=verify-full"
```

### Вариант 2: Без строгой SSL верификации (если нет сертификата)

```bash
DATABASE_URL="postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require"
```

### Вариант 3: Для локальной разработки

```bash
DATABASE_URL="postgresql://gen_user:q;3U+PY7XCz@Br@45.8.96.120:5432/default_db?sslmode=require"
```

---

## ⚙️ НАСТРОЙКА В TIMEWEB APPS

### Шаг 1: Откройте Environment Variables

```
https://timeweb.cloud/my/apps/125051
→ Settings → Environment Variables
```

### Шаг 2: Добавьте переменные окружения

**Обязательные:**

```bash
DATABASE_URL=postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require

NODE_ENV=production

NEXTAUTH_SECRET=<ваш_secret_минимум_32_символа>

NEXTAUTH_URL=<ваш_url_приложения>

JWT_SECRET=<ваш_jwt_secret_минимум_32_символа>
```

**Для платежей (опционально):**

```bash
CLOUDPAYMENTS_PUBLIC_ID=<ваш_public_id>
CLOUDPAYMENTS_API_SECRET=<ваш_api_secret>
CLOUDPAYMENTS_WEBHOOK_SECRET=<ваш_webhook_secret>
```

**Для SMS (опционально):**

```bash
SMSRU_API_KEY=<ваш_smsru_api_key>
```

**Для AI (опционально):**

```bash
GROQ_API_KEY=<ваш_groq_api_key>
DEEPSEEK_API_KEY=<ваш_deepseek_api_key>
OPENROUTER_API_KEY=<ваш_openrouter_api_key>
```

### Шаг 3: Сохраните и перезапустите

```
Settings → Restart Application
```

---

## 🔧 ЛОКАЛЬНАЯ НАСТРОЙКА (.env.local)

Создайте файл `.env.local` в корне проекта:

```bash
# PostgreSQL от Timeweb
DATABASE_URL="postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require"

# Базовые настройки
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NextAuth
NEXTAUTH_SECRET=your-secret-key-min-32-chars-for-dev
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-key-min-32-chars-for-dev

# Платежи (если есть)
CLOUDPAYMENTS_PUBLIC_ID=your_public_id
CLOUDPAYMENTS_API_SECRET=your_api_secret
CLOUDPAYMENTS_WEBHOOK_SECRET=your_webhook_secret

# SMS (если есть)
SMSRU_API_KEY=your_smsru_api_key

# AI (если есть)
GROQ_API_KEY=your_groq_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

## 🗄️ ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ

### Вариант 1: Автоматическая настройка (рекомендуется)

```bash
# Установите переменную окружения
export DATABASE_URL="postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require"

# Запустите скрипт автонастройки
chmod +x scripts/setup-postgresql.sh
./scripts/setup-postgresql.sh
```

### Вариант 2: Ручная настройка

```bash
# Подключитесь к базе данных
psql "postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require"

# Выполните SQL скрипт
\i scripts/init-postgresql.sql

# Проверьте таблицы
\dt

# Выход
\q
```

### Вариант 3: Через Node.js скрипт

```bash
npm run db:init
```

---

## 🔍 ПРОВЕРКА ПОДКЛЮЧЕНИЯ

### Быстрая проверка:

```bash
psql "postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require" -c "SELECT version();"
```

### Ожидаемый результат:

```
PostgreSQL 14.x (или выше)
```

### Проверка таблиц:

```bash
psql "postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require" -c "\dt"
```

### Ожидаемый результат (после инициализации):

```
users
transfers
bookings
payments
loyalty_tiers
eco_points
... (всего 17 таблиц)
```

---

## 🛡️ SSL СЕРТИФИКАТ (опционально)

### Если требуется verify-full:

#### Шаг 1: Скачайте сертификат

В Timeweb Cloud:
```
Базы данных → Ваша БД → SSL Certificate → Download
```

#### Шаг 2: Сохраните сертификат

```bash
mkdir -p ~/.cloud-certs
# Сохраните сертификат в ~/.cloud-certs/root.crt
```

#### Шаг 3: Используйте с verify-full

```bash
export PGSSLROOTCERT=$HOME/.cloud-certs/root.crt
export DATABASE_URL="postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=verify-full"
```

### Для Timeweb Apps:

```bash
# В Environment Variables добавьте:
DATABASE_URL=postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require
```

> **Примечание:** `sslmode=require` достаточно для большинства случаев.  
> `sslmode=verify-full` требует сертификата, но более безопасен.

---

## 🚀 МИГРАЦИИ И SEED DATA

### Создание начальных данных:

```bash
# Loyalty tiers (уже включены в init-postgresql.sql)
# Bronze, Silver, Gold, Platinum

# Тестовые пользователи (опционально)
npm run db:seed
```

### Backup базы данных:

```bash
pg_dump "postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require" > backup.sql
```

### Restore базы данных:

```bash
psql "postgresql://gen_user:q;3U+PY7XCz@Br@51e6e5ca5d967b8e81fc9b75.twc1.net:5432/default_db?sslmode=require" < backup.sql
```

---

## 🔧 TROUBLESHOOTING

### Ошибка: "connection refused"

**Проверьте:**
1. Host правильный: `51e6e5ca5d967b8e81fc9b75.twc1.net`
2. Port правильный: `5432`
3. База данных запущена в Timeweb Cloud

### Ошибка: "password authentication failed"

**Проверьте:**
1. User: `gen_user`
2. Password: `q;3U+PY7XCz@Br` (точно, с спецсимволами)
3. Экранирование в URL: используйте кавычки вокруг всего URL

### Ошибка: "SSL connection required"

**Решение:**
```bash
# Добавьте sslmode=require в конец URL:
?sslmode=require
```

### Ошибка: "database does not exist"

**Решение:**
```bash
# Используйте default_db, а не другое имя
DATABASE_URL="...@host:5432/default_db?..."
```

### Таймаут подключения

**Возможные причины:**
1. Firewall блокирует порт 5432
2. Неправильный IP/host
3. База данных остановлена

**Решение:**
- Проверьте статус БД в Timeweb Cloud
- Попробуйте внутренний IP: `192.168.0.4` (если приложение в той же сети)

---

## 📊 МОНИТОРИНГ

### Проверка активных подключений:

```sql
SELECT * FROM pg_stat_activity;
```

### Размер базы данных:

```sql
SELECT pg_size_pretty(pg_database_size('default_db'));
```

### Список таблиц и их размеры:

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## ✅ ЧЕКЛИСТ НАСТРОЙКИ

- [ ] Добавлен `DATABASE_URL` в Timeweb Apps Environment Variables
- [ ] Добавлены остальные env vars (NEXTAUTH_SECRET, JWT_SECRET, etc.)
- [ ] Перезапущено приложение в Timeweb Apps
- [ ] Выполнен `scripts/init-postgresql.sql` (создание таблиц)
- [ ] Проверено наличие 17 таблиц в БД
- [ ] Создан `.env.local` для локальной разработки
- [ ] Проверено подключение через `psql`
- [ ] Протестировано приложение (регистрация/логин)

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **Добавьте DATABASE_URL в Timeweb Apps:**
   ```
   Settings → Environment Variables → Add Variable
   ```

2. **Перезапустите приложение:**
   ```
   Settings → Restart Application
   ```

3. **Инициализируйте базу данных:**
   ```bash
   ./scripts/setup-postgresql.sh
   ```

4. **Проверьте приложение:**
   - Откройте URL приложения
   - Попробуйте зарегистрироваться
   - Проверьте что данные сохраняются

5. **Сообщите мне:**
   ```
   "База данных настроена! URL: <ваш_url>"
   ```

И мы начнем работать над дизайном! 🎨

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Статус:** ✅ Ready to configure
