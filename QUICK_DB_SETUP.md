# ⚡ Быстрая настройка PostgreSQL для тестов

## 🎯 Самый быстрый способ (Docker)

### 1. Запустите PostgreSQL в Docker

```bash
# Запустите тестовую БД
docker-compose -f docker-compose.test.yml up -d

# Дождитесь запуска (5-10 секунд)
docker-compose -f docker-compose.test.yml ps
```

### 2. Обновите .env.test (уже настроен!)

Файл `.env.test` уже содержит правильные настройки:
```bash
DATABASE_URL="postgresql://test_user:test_password@localhost:5433/kamchatour_hub_test"
```

Если вы изменили порт в docker-compose, обновите его в `.env.test`

### 3. Инициализируйте БД

```bash
# Создайте структуру таблиц и тестовые данные
npm run db:test:init
```

Вы должны увидеть:
```
✅ Подключение к БД установлено
✅ Расширение uuid-ossp создано
✅ Базовая схема применена
✅ Схема системы туров применена
✅ Тестовые данные созданы
```

### 4. Запустите тесты

```bash
npm test
```

---

## 🔧 Управление тестовой БД

```bash
# Очистить все данные
npm run db:test:clean

# Полный сброс (очистка + создание заново)
npm run db:test:reset

# Остановить Docker контейнер
docker-compose -f docker-compose.test.yml down

# Удалить данные полностью (включая volume)
docker-compose -f docker-compose.test.yml down -v
```

---

## 📋 Альтернатива: Локальный PostgreSQL

Если у вас уже установлен PostgreSQL:

```bash
# 1. Создайте БД и пользователя
sudo -u postgres psql << EOF
CREATE DATABASE kamchatour_hub_test;
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE kamchatour_hub_test TO test_user;
ALTER USER test_user CREATEDB;
\q
EOF

# 2. Обновите .env.test
DATABASE_URL="postgresql://test_user:test_password@localhost:5432/kamchatour_hub_test"

# 3. Инициализируйте
npm run db:test:init

# 4. Запустите тесты
npm test
```

---

## ⚠️ Решение проблем

### "ECONNREFUSED"
```bash
# Проверьте что Docker контейнер запущен
docker ps | grep kamchatour-test-db

# Если нет, запустите:
docker-compose -f docker-compose.test.yml up -d
```

### "relation does not exist"
```bash
# Переинициализируйте БД
npm run db:test:reset
```

### "permission denied"
```bash
# Для локального PostgreSQL дайте права:
sudo -u postgres psql kamchatour_hub_test
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test_user;
\q
```

---

## ✅ Проверка

Убедитесь что всё работает:

```bash
# 1. БД доступна
docker-compose -f docker-compose.test.yml ps

# 2. Инициализация прошла успешно
npm run db:test:init

# 3. Тесты проходят
npm test

# 4. TypeScript компилируется
npm run type-check
```

**Готово!** Теперь можно разрабатывать с тестами 🚀

Подробная документация: [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)
