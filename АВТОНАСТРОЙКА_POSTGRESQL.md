# 🤖 АВТОМАТИЧЕСКАЯ НАСТРОЙКА POSTGRESQL

> **Статус:** Готово к запуску!  
> **Время:** 5 минут  
> **Требуется:** Connection String от PostgreSQL

---

## ✅ ЧТО ПОДГОТОВЛЕНО

Я создал **полностью автоматические скрипты** для настройки PostgreSQL:

### 📄 Файлы:

```
✓ scripts/init-postgresql.sql       - SQL инициализация (все таблицы)
✓ scripts/setup-postgresql.sh       - Bash скрипт автонастройки
```

---

## 🚀 БЫСТРЫЙ СТАРТ

### Вариант 1: ПОЛНОСТЬЮ АВТОМАТИЧЕСКИ (рекомендуется)

```bash
# 1. Установите DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:5432/database"

# 2. Запустите скрипт
./scripts/setup-postgresql.sh

# Готово! Скрипт сделает всё автоматически:
#   ✓ Проверит подключение
#   ✓ Создаст расширения
#   ✓ Создаст все таблицы (17 шт)
#   ✓ Создаст индексы (9 шт)
#   ✓ Добавит начальные данные
#   ✓ Проверит результат
```

### Вариант 2: Только SQL (если нет bash)

```bash
psql "$DATABASE_URL" -f scripts/init-postgresql.sql
```

### Вариант 3: С передачей CONNECTION STRING напрямую

```bash
./scripts/setup-postgresql.sh "postgresql://user:password@host:5432/database"
```

---

## 📋 ГДЕ ВЗЯТЬ DATABASE_URL?

### Если создали PostgreSQL в Timeweb:

1. Откройте: https://timeweb.cloud/databases
2. Найдите вашу базу: `kamchatour-db`
3. Скопируйте **Connection String**:
   ```
   postgresql://gen_user:abc123@pg12345.timeweb.cloud:5432/kamchatour
   ```

### Если используете Supabase (бесплатно):

1. Откройте: https://supabase.com/dashboard
2. Project Settings → Database → Connection String
3. Выберите: **URI** (не Pooler!)
4. Скопируйте строку подключения

### Если используете Neon (бесплатно):

1. Откройте: https://console.neon.tech/
2. Dashboard → Connection Details
3. Скопируйте Connection String

---

## 🔧 ЧТО ДЕЛАЕТ СКРИПТ?

### 1. Проверяет подключение

```bash
▶ Проверка DATABASE_URL...
✓ DATABASE_URL найдена

▶ Проверка подключения к PostgreSQL...
✓ Подключение успешно
```

### 2. Создает расширения

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3. Создает таблицы (17 шт):

```
✓ users                    - Пользователи
✓ transfer_operators       - Операторы
✓ vehicles                 - Транспорт
✓ transfer_routes          - Маршруты
✓ transfer_schedules       - Расписание
✓ transfer_bookings        - Бронирования
✓ transfer_payments        - Платежи
✓ transfer_notifications   - Уведомления
✓ seat_holds              - Удержание мест (важно!)
✓ loyalty_tiers           - Уровни лояльности
✓ user_loyalty            - Баллы пользователей
✓ loyalty_transactions    - История баллов
✓ eco_points              - Эко-баллы
✓ eco_transactions        - История эко-баллов
+ 3 вспомогательные таблицы
```

### 4. Создает индексы для производительности

```sql
✓ 9 индексов на критичных полях
✓ GIST индекс для геопоиска
```

### 5. Добавляет начальные данные

```sql
✓ 4 уровня лояльности:
  - Бронзовый (0 баллов, 0% скидка)
  - Серебряный (1000 баллов, 5% скидка)
  - Золотой (5000 баллов, 10% скидка)
  - Платиновый (10000 баллов, 15% скидка)
```

### 6. Создает функции очистки

```sql
cleanup_expired_seat_holds() - Автоочистка истекших удержаний
```

### 7. Предлагает создать тестовые данные

```bash
Создать тестовые данные для разработки? (y/N): y

✓ Тестовый пользователь: test@kamhub.ru
✓ Тестовый оператор: Камчатка Трансфер
```

---

## ✅ ПРОВЕРКА ПОСЛЕ НАСТРОЙКИ

### 1. Проверьте таблицы:

```bash
psql "$DATABASE_URL" -c "\dt"
```

**Ожидается:** Список из 17 таблиц

### 2. Проверьте через API:

```bash
curl https://kamchatour-125051.timeweb.cloud/api/health/db
```

**Ожидается:**
```json
{
  "success": true,
  "database": "connected",
  "tables": 17
}
```

### 3. Проверьте расширения:

```bash
psql "$DATABASE_URL" -c "SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'postgis');"
```

**Ожидается:**
```
 extname
----------
 uuid-ossp
 postgis
```

---

## 🔒 БЕЗОПАСНОСТЬ

### Что сделано:

✅ **Нет дефолтных паролей** - используется ваш CONNECTION STRING  
✅ **Индексы на критичных полях** - защита от медленных запросов  
✅ **UNIQUE constraints** - предотвращение дубликатов  
✅ **Foreign keys** - целостность данных  
✅ **Функции очистки** - автоматическое удаление мусора  

### Рекомендации:

```env
# Всегда используйте SSL
DATABASE_SSL=true

# Ограничьте подключения
DATABASE_MAX_CONNECTIONS=10

# Не коммитьте DATABASE_URL в Git!
```

---

## 🆘 TROUBLESHOOTING

### Ошибка: "DATABASE_URL не установлена"

**Решение:**
```bash
export DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Ошибка: "connection refused"

**Причины:**
- PostgreSQL не запущен
- Firewall блокирует порт 5432
- Неправильный хост в CONNECTION STRING

**Решение:**
1. Проверьте статус PostgreSQL в Timeweb Dashboard
2. Проверьте CONNECTION STRING
3. Попробуйте подключиться вручную: `psql "$DATABASE_URL"`

### Ошибка: "permission denied"

**Причина:** У пользователя нет прав на создание таблиц

**Решение:**
```sql
GRANT ALL PRIVILEGES ON DATABASE kamchatour TO your_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO your_user;
```

### Ошибка: "extension ... does not exist"

**Причина:** Расширения не установлены

**Решение:**
```sql
-- От суперпользователя:
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION postgis;
```

Или обратитесь в поддержку Timeweb для включения расширений.

---

## 📞 ПОДДЕРЖКА

**Если скрипт не работает:**

1. Проверьте логи:
   ```bash
   ./scripts/setup-postgresql.sh 2>&1 | tee setup.log
   ```

2. Проверьте версию PostgreSQL:
   ```bash
   psql "$DATABASE_URL" -c "SELECT version();"
   ```
   
   Требуется: **PostgreSQL 12+**

3. Проверьте права пользователя:
   ```bash
   psql "$DATABASE_URL" -c "\du"
   ```

---

## 🎯 ПОСЛЕ НАСТРОЙКИ

### 1. Добавьте DATABASE_URL в Timeweb Apps

```
https://timeweb.cloud/my/apps/125051
Settings → Environment Variables:

DATABASE_URL=<ваш connection string>
DATABASE_SSL=true
DATABASE_MAX_CONNECTIONS=10
```

### 2. Restart приложения

```
Settings → Restart Application
```

### 3. Проверьте через API

```bash
curl https://kamchatour-125051.timeweb.cloud/api/health/db
```

### 4. Готово к использованию! ✅

---

## 📊 СТАТИСТИКА

**После выполнения скрипта:**

```
✓ Расширения: 2
✓ Таблицы: 17
✓ Индексы: 9
✓ Функции: 1
✓ Начальные записи: 4 (loyalty tiers)
✓ Время выполнения: ~30 секунд
```

---

## 🚀 БЫСТРЫЕ КОМАНДЫ

### Полная настройка одной командой:

```bash
export DATABASE_URL="your_connection_string" && ./scripts/setup-postgresql.sh
```

### Пересоздать базу с нуля:

```bash
# ⚠️ ВНИМАНИЕ: Удалит все данные!
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
./scripts/setup-postgresql.sh
```

### Применить только новые таблицы:

```bash
# Скрипт использует IF NOT EXISTS, безопасно запускать повторно
psql "$DATABASE_URL" -f scripts/init-postgresql.sql
```

---

## ✅ ГОТОВО!

После выполнения скрипта ваша PostgreSQL полностью настроена и готова к работе!

**Следующий шаг:** Запустите приложение и проверьте `/api/health/db`

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Статус:** Ready to run ✅
