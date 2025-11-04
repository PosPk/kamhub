# ✅ PostgreSQL настроен для тестов!

## 🎉 Что сделано

### 1. ⚙️ Конфигурация
- ✅ Создан `.env.test` с настройками тестовой БД
- ✅ Создан `docker-compose.test.yml` для быстрого запуска PostgreSQL
- ✅ Обновлен `test/setup.ts` с автоматической проверкой БД

### 2. 📜 Скрипты управления
- ✅ `npm run db:test:init` - инициализация схемы и тестовых данных
- ✅ `npm run db:test:clean` - очистка всех данных
- ✅ `npm run db:test:reset` - полный сброс (clean + init)
- ✅ `npm run test:watch` - запуск тестов с auto-reload

### 3. 📚 Документация
- ✅ `POSTGRESQL_SETUP.md` - полное руководство (3 варианта установки)
- ✅ `QUICK_DB_SETUP.md` - быстрый старт за 3 шага
- ✅ `docker-compose.test.yml` - готовая конфигурация Docker

---

## 🚀 Быстрый старт

### Вариант 1: Docker (Рекомендуется)

```bash
# 1. Запустите PostgreSQL
docker-compose -f docker-compose.test.yml up -d

# 2. Инициализируйте БД
npm run db:test:init

# 3. Запустите тесты
npm test
```

### Вариант 2: Локальный PostgreSQL

```bash
# 1. Создайте БД
sudo -u postgres psql << EOF
CREATE DATABASE kamchatour_hub_test;
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE kamchatour_hub_test TO test_user;
\q
EOF

# 2. Обновите .env.test (порт 5432 для локального)
# DATABASE_URL="postgresql://test_user:test_password@localhost:5432/kamchatour_hub_test"

# 3. Инициализируйте
npm run db:test:init

# 4. Запустите тесты
npm test
```

### Вариант 3: Timeweb Cloud

```bash
# 1. Создайте тестовую БД на Timeweb
# 2. Обновите .env.test с credentials
# 3. Инициализируйте
npm run db:test:init

# 4. Запустите тесты
npm test
```

---

## 📋 Доступные команды

### Управление тестовой БД
```bash
npm run db:test:init     # Инициализация (схема + данные)
npm run db:test:clean    # Очистка всех данных  
npm run db:test:reset    # Полный сброс
```

### Запуск тестов
```bash
npm test                 # Запуск всех тестов
npm run test:watch       # Режим наблюдения
npm run test:ui          # UI интерфейс
npm run test:run         # Однократный запуск
npm run test:coverage    # С покрытием кода
```

### Docker
```bash
docker-compose -f docker-compose.test.yml up -d    # Запуск
docker-compose -f docker-compose.test.yml ps       # Статус
docker-compose -f docker-compose.test.yml logs -f  # Логи
docker-compose -f docker-compose.test.yml down     # Остановка
docker-compose -f docker-compose.test.yml down -v  # Удаление с данными
```

---

## 📊 Структура тестовой БД

### Основные таблицы
- `users` - Пользователи
- `tours` - Туры  
- `tour_schedules` - Расписание туров
- `tour_bookings_v2` - Бронирования туров
- `tour_seat_holds` - Временные удержания мест
- `transfer_bookings` - Бронирования трансферов
- `transfer_payments` - Платежи
- `loyalty_transactions` - Программа лояльности

### Тестовые данные
После `npm run db:test:init` создаются:
- **2 пользователя**: `test@example.com` (турист), `operator@example.com` (оператор)
- **1 тур**: "Тестовый тур" с базовыми параметрами

---

## 🔧 Настройка окружения

### .env.test
```bash
# Используется Docker (порт 5433)
DATABASE_URL="postgresql://test_user:test_password@localhost:5433/kamchatour_hub_test"

# Для локального PostgreSQL (порт 5432)
# DATABASE_URL="postgresql://test_user:test_password@localhost:5432/kamchatour_hub_test"

# Для Timeweb Cloud
# DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
# DATABASE_SSL=true
```

### docker-compose.test.yml
```yaml
services:
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kamchatour_hub_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5433:5432"  # Локальный порт 5433
```

---

## 🐛 Решение проблем

### ❌ "ECONNREFUSED"
**Причина:** PostgreSQL не запущен

**Решение:**
```bash
# Docker
docker-compose -f docker-compose.test.yml up -d

# Локальный
sudo systemctl start postgresql
```

### ❌ "relation does not exist"
**Причина:** Таблицы не созданы

**Решение:**
```bash
npm run db:test:reset
```

### ❌ "permission denied"  
**Причина:** Недостаточно прав

**Решение:**
```bash
sudo -u postgres psql kamchatour_hub_test
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test_user;
ALTER USER test_user CREATEDB;
\q
```

### ⚠️ "БД недоступна, тесты будут пропущены"
**Причина:** Не удается подключиться к БД

**Решение:**
1. Проверьте что PostgreSQL запущен
2. Проверьте DATABASE_URL в .env.test
3. Запустите `npm run db:test:init`
4. Попробуйте тесты снова

---

## 🎯 Проверка готовности

Запустите все проверки:

```bash
# 1. Конфигурация готова
cat .env.test | grep DATABASE_URL

# 2. Docker запущен (если используется)
docker-compose -f docker-compose.test.yml ps

# 3. БД инициализирована
npm run db:test:init

# 4. Тесты проходят
npm test

# 5. TypeScript компилируется
npm run type-check

# 6. Linter проходит
npm run lint
```

Если все команды выполнились успешно - **всё готово!** ✅

---

## 📚 Дополнительная документация

- **QUICK_DB_SETUP.md** - Быстрый старт (3 минуты)
- **POSTGRESQL_SETUP.md** - Полное руководство со всеми деталями
- **TEST_RESULTS.md** - Результаты тестирования проекта

---

## 🔒 Безопасность

### ⚠️ ВАЖНО

1. ✅ Используйте отдельную БД для тестов
2. ✅ URL тестовой БД содержит слово "test"
3. ✅ Не используйте production данные
4. ✅ `.env.test` в `.gitignore`

### Рекомендации

- Тестовая БД на отдельном сервере
- Слабые пароли только для локальных тестов
- В CI/CD используйте временные БД
- Регулярно очищайте тестовые данные

---

## 💡 Полезные команды

### Подключение к тестовой БД

```bash
# Docker
docker-compose -f docker-compose.test.yml exec postgres-test psql -U test_user -d kamchatour_hub_test

# Локальный
psql -U test_user -h localhost -d kamchatour_hub_test
```

### Просмотр таблиц

```bash
psql -U test_user -h localhost -d kamchatour_hub_test << EOF
\dt
SELECT tablename, n_live_tup as rows 
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;
\q
EOF
```

### Бэкап тестовой БД

```bash
# Создать бэкап
pg_dump -U test_user -h localhost kamchatour_hub_test > test_backup.sql

# Восстановить
psql -U test_user -h localhost kamchatour_hub_test < test_backup.sql
```

---

## ✅ Итог

PostgreSQL полностью настроен и готов для:
- ✅ Unit тестов
- ✅ Integration тестов  
- ✅ Race condition тестов
- ✅ CI/CD pipeline

**Следующие шаги:**
1. Запустите `npm run db:test:init`
2. Запустите `npm test`
3. Наслаждайтесь тестированием! 🚀

---

**Возникли вопросы?** Смотрите полную документацию в `POSTGRESQL_SETUP.md`
