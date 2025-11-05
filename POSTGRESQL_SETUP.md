# 🐘 Настройка PostgreSQL для тестов

## 📋 Обзор

Проект настроен для работы с тестовой PostgreSQL базой данных. Тесты используют отдельную БД для изоляции от production данных.

---

## 🚀 Быстрый старт

### Вариант 1: Локальный PostgreSQL (Рекомендуется)

#### 1. Установка PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Скачайте установщик с https://www.postgresql.org/download/windows/

#### 2. Создание тестовой базы данных

```bash
# Подключаемся к PostgreSQL
sudo -u postgres psql

# В psql выполняем:
CREATE DATABASE kamchatour_hub_test;
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE kamchatour_hub_test TO test_user;
\q
```

#### 3. Настройка .env.test

Файл `.env.test` уже создан, но вы можете изменить параметры подключения:

```bash
# Отредактируйте .env.test
nano .env.test

# Измените DATABASE_URL на свои параметры:
DATABASE_URL="postgresql://test_user:test_password@localhost:5432/kamchatour_hub_test"
```

#### 4. Инициализация схемы

```bash
# Применяем схему БД и создаем тестовые данные
npm run db:test:init
```

#### 5. Запуск тестов

```bash
# Запуск всех тестов
npm test

# Запуск с watch mode
npm run test:watch

# Запуск с UI
npm run test:ui
```

---

### Вариант 2: Docker (Быстро и изолировано)

#### 1. Создайте docker-compose.test.yml

```yaml
version: '3.8'

services:
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kamchatour_hub_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5433:5432"
    volumes:
      - postgres-test-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres-test-data:
```

#### 2. Запустите контейнер

```bash
docker-compose -f docker-compose.test.yml up -d
```

#### 3. Обновите .env.test

```bash
DATABASE_URL="postgresql://test_user:test_password@localhost:5433/kamchatour_hub_test"
```

#### 4. Инициализация и тесты

```bash
npm run db:test:init
npm test
```

---

### Вариант 3: Timeweb Cloud (Production-like)

Вы можете использовать отдельную тестовую БД на Timeweb Cloud:

#### 1. Создайте тестовую БД

Зайдите на https://timeweb.cloud/my/database и создайте новую БД с суффиксом `_test`

#### 2. Обновите .env.test

```bash
DATABASE_URL="postgresql://gen_user:your_password@your-db.twc1.net:5432/test_db?sslmode=require"
DATABASE_SSL=true
```

#### 3. Инициализация

```bash
npm run db:test:init
npm test
```

---

## 📜 Доступные команды

### Инициализация и управление

```bash
# Инициализация тестовой БД (схема + тестовые данные)
npm run db:test:init

# Очистка всех данных из тестовой БД
npm run db:test:clean

# Полный сброс (очистка + инициализация)
npm run db:test:reset
```

### Запуск тестов

```bash
# Запуск всех тестов
npm test

# Запуск с автоперезапуском при изменениях
npm run test:watch

# Запуск с UI интерфейсом
npm run test:ui

# Запуск конкретного теста
npm test booking-race-condition.test.ts
```

---

## 🔧 Структура тестовой БД

### Основные таблицы

- `users` - Пользователи
- `tours` - Туры
- `tour_schedules` - Расписание туров
- `tour_bookings_v2` - Бронирования туров
- `tour_seat_holds` - Временные удержания мест
- `transfer_bookings` - Бронирования трансферов
- `loyalty_transactions` - Транзакции программы лояльности

### Тестовые данные

После инициализации создаются:
- 2 тестовых пользователя (`test@example.com`, `operator@example.com`)
- 1 тестовый тур

---

## 🐛 Решение проблем

### Ошибка: ECONNREFUSED

**Проблема:** Не удается подключиться к БД

**Решение:**
```bash
# Проверьте что PostgreSQL запущен
sudo systemctl status postgresql

# Если не запущен:
sudo systemctl start postgresql

# Проверьте параметры подключения в .env.test
cat .env.test | grep DATABASE_URL
```

### Ошибка: permission denied

**Проблема:** Недостаточно прав для создания БД

**Решение:**
```bash
# Подключитесь как superuser
sudo -u postgres psql

# Выдайте права:
GRANT ALL PRIVILEGES ON DATABASE kamchatour_hub_test TO test_user;
ALTER USER test_user CREATEDB;
```

### Ошибка: uuid-ossp extension

**Проблема:** Расширение не установлено

**Решение:**
```bash
# Установите расширение
sudo -u postgres psql kamchatour_hub_test
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

### Тесты пропускаются

**Проблема:** "БД недоступна, тесты будут пропущены"

**Решение:**
```bash
# 1. Проверьте что БД доступна
psql -U test_user -h localhost -d kamchatour_hub_test

# 2. Запустите инициализацию
npm run db:test:init

# 3. Попробуйте тесты снова
npm test
```

---

## 📊 Мониторинг и отладка

### Проверка статуса БД

```bash
# Подключение к тестовой БД
psql -U test_user -h localhost -d kamchatour_hub_test

# Список таблиц
\dt

# Количество записей
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

# Выход
\q
```

### Просмотр логов

```bash
# PostgreSQL логи (Ubuntu)
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Docker логи
docker-compose -f docker-compose.test.yml logs -f
```

---

## 🔒 Безопасность

### ⚠️ ВАЖНО

1. **Никогда не используйте production БД для тестов!**
2. URL тестовой БД должен содержать слово `test`
3. Не коммитьте .env.test с реальными credentials
4. Используйте отдельного пользователя с ограниченными правами

### Рекомендации

- Тестовая БД должна быть на отдельном сервере
- Используйте слабые пароли только для локальных тестов
- В CI/CD используйте временные БД
- Регулярно очищайте тестовые данные

---

## 🎯 CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: kamchatour_hub_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Init test database
        run: npm run db:test:init
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/kamchatour_hub_test
          
      - name: Run tests
        run: npm test
```

---

## ✅ Проверка готовности

Убедитесь что все работает:

```bash
# 1. БД доступна
npm run db:test:init

# 2. Тесты проходят
npm test

# 3. TypeScript компилируется
npm run type-check

# 4. Linter не показывает ошибок
npm run lint
```

Если все команды выполнились успешно - настройка завершена! ✅

---

## 📚 Дополнительные ресурсы

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [pg (node-postgres) Documentation](https://node-postgres.com/)

---

**Вопросы или проблемы?** Создайте issue в репозитории проекта.
