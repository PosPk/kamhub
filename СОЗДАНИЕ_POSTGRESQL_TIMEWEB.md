# 📊 СОЗДАНИЕ POSTGRESQL В TIMEWEB CLOUD

> **Статус:** PostgreSQL нужно создать  
> **Время:** 5 минут  
> **Стоимость:** от 150₽/мес

---

## ✅ ПОШАГОВАЯ ИНСТРУКЦИЯ

### Шаг 1: Откройте раздел Базы данных

**Вариант А - Через главное меню:**

1. Откройте: https://timeweb.cloud/
2. Войдите в аккаунт
3. В левом меню найдите: **«Базы данных»** или **«Databases»**
4. Нажмите на него

**Вариант Б - Прямая ссылка:**

https://timeweb.cloud/databases

---

### Шаг 2: Создайте новую базу данных

Нажмите кнопку: **«Создать базу данных»** или **«Create Database»**

---

### Шаг 3: Выберите параметры

```
┌──────────────────────────────────────────────────┐
│ Тип СУБД:      PostgreSQL                        │
│ Версия:        15 (или новее)                    │
│ Конфигурация:  PostgreSQL-2 (рекомендуется)      │
│ Цена:          300 ₽/месяц                       │
│ Имя БД:        kamchatour-db                     │
│                (или любое другое)                │
│ Регион:        ru-1 (Москва)                     │
│                (выберите ближайший к вам)        │
│ Автобэкап:     ✓ Включить                        │
└──────────────────────────────────────────────────┘
```

**Характеристики PostgreSQL-2:**
- 💾 2 GB RAM
- 💿 10 GB SSD
- 🔌 100 одновременных подключений
- 💰 300 ₽/месяц

---

### Шаг 4: Заказать и подождать

1. Нажмите **«Заказать»** или **«Create»**
2. Подтвердите заказ
3. Подождите **2-3 минуты** пока создается БД
4. Статус изменится: `Creating...` → `Active` ✅

---

### Шаг 5: Получить данные подключения

После создания откройте вашу БД и найдите:

```
┌──────────────────────────────────────────────────┐
│ 📋 ДАННЫЕ ПОДКЛЮЧЕНИЯ:                           │
├──────────────────────────────────────────────────┤
│ Host:     pg12345.timeweb.cloud                  │
│ Port:     5432                                   │
│ Database: kamchatour_db                          │
│ User:     gen_user                               │
│ Password: Abc123Xyz789                           │
└──────────────────────────────────────────────────┘

🔗 CONNECTION STRING (главное что нужно!):

postgresql://gen_user:Abc123Xyz789@pg12345.timeweb.cloud:5432/kamchatour_db
```

**⚠️ ВАЖНО:** Скопируйте **CONNECTION STRING** целиком!

---

### Шаг 6: Добавить в Environment Variables

Теперь вернитесь в ваше приложение:

**https://timeweb.cloud/my/apps/125051**

**Settings → Environment Variables → Add:**

```env
DATABASE_URL=postgresql://gen_user:Abc123Xyz789@pg12345.timeweb.cloud:5432/kamchatour_db
DATABASE_SSL=true
DATABASE_MAX_CONNECTIONS=10
```

**Save → Restart Application**

---

## 🎯 АЛЬТЕРНАТИВНЫЕ ВАРИАНТЫ

Если не хотите создавать в Timeweb, можно использовать:

### Вариант 1: Supabase (бесплатно для старта)

https://supabase.com/

```
✓ Бесплатный план: 500 MB
✓ PostgreSQL 15
✓ Автоматические бэкапы
✓ REST API бесплатно
```

**Как подключить:**
1. Создайте проект на Supabase
2. В Settings → Database найдите Connection String
3. Добавьте в Environment Variables вашего Apps

### Вариант 2: Neon (бесплатно для разработки)

https://neon.tech/

```
✓ Бесплатно: 500 MB
✓ PostgreSQL 16
✓ Serverless (автоматическое масштабирование)
✓ Branching (копии БД для тестов)
```

### Вариант 3: Railway (платно от $5/мес)

https://railway.app/

```
✓ PostgreSQL
✓ $5 кредитов бесплатно
✓ Потом $5/месяц
```

### Вариант 4: Свой VDS (если уже есть)

Если у вас уже есть VDS/VPS с PostgreSQL:

```bash
# Создайте базу данных
sudo -u postgres psql
CREATE DATABASE kamchatour;
CREATE USER kamchatour_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kamchatour TO kamchatour_user;

# Разрешите внешние подключения
sudo nano /etc/postgresql/15/main/postgresql.conf
# listen_addresses = '*'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

**CONNECTION STRING:**
```
postgresql://kamchatour_user:your_password@your-vds-ip:5432/kamchatour
```

---

## 💰 СРАВНЕНИЕ СТОИМОСТИ

| Провайдер | План | Цена | RAM | Storage | Подключения |
|-----------|------|------|-----|---------|-------------|
| **Timeweb** | PostgreSQL-2 | 300₽/мес | 2GB | 10GB | 100 |
| **Supabase** | Free | $0 | - | 500MB | 100 |
| **Neon** | Free | $0 | - | 500MB | 100 |
| **Railway** | Hobby | $5/мес | 512MB | 1GB | 20 |
| **Timeweb VDS** | SSD-1 | 150₽/мес | 1GB | 15GB | ∞ |

**Рекомендация для старта:**
- Бюджет = 0: **Supabase Free** или **Neon Free**
- Бюджет < 500₽: **Timeweb PostgreSQL-2** (300₽) + Apps (бесплатно)
- Полный контроль: **Timeweb VDS** (150₽) - установите всё сами

---

## ✅ ПРОВЕРКА ПОДКЛЮЧЕНИЯ

После создания БД и добавления в Environment Variables:

### Тест из локального компьютера:

```bash
psql "postgresql://gen_user:password@pg12345.timeweb.cloud:5432/kamchatour_db"
```

**Ожидается:**
```
psql (15.x)
SSL connection (protocol: TLSv1.3, cipher: ...)
Type "help" for help.

kamchatour_db=>
```

### Тест через приложение:

```bash
curl https://kamchatour-125051.timeweb.cloud/api/health/db
```

**Ожидается:**
```json
{
  "success": true,
  "database": "connected",
  "tables": 0
}
```

---

## 🛠️ ПЕРВОНАЧАЛЬНАЯ НАСТРОЙКА БД

После подключения выполните:

### 1. Создайте расширения

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
```

Или через psql:

```bash
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 2. Примените миграции

```bash
npm run migrate:up
```

Или вручную:

```bash
psql $DATABASE_URL -f lib/database/schema.sql
psql $DATABASE_URL -f lib/database/transfer_schema.sql
psql $DATABASE_URL -f lib/database/seat_holds_schema.sql
psql $DATABASE_URL -f lib/database/transfer_payments_schema.sql
psql $DATABASE_URL -f lib/database/loyalty_schema.sql
psql $DATABASE_URL -f lib/database/operators_schema.sql
```

### 3. Проверьте таблицы

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Ожидается:** ~24 таблицы

---

## 🔒 БЕЗОПАСНОСТЬ

### Обязательные настройки:

```env
# Всегда используйте SSL
DATABASE_SSL=true

# Ограничьте количество подключений
DATABASE_MAX_CONNECTIONS=10

# Не коммитьте DATABASE_URL в Git!
# (уже в .gitignore)
```

### Настройка Firewall (если создаёте свою БД):

```bash
# Разрешите только IP вашего Apps
sudo ufw allow from <apps-ip> to any port 5432
```

### Регулярные бэкапы:

В Timeweb Cloud:
- Автоматические бэкапы: включены по умолчанию
- Ручной бэкап: Dashboard → Databases → Create Backup

---

## 🆘 TROUBLESHOOTING

### Ошибка: "connection refused"

**Причина:** PostgreSQL не запущен или firewall блокирует

**Решение:**
1. Проверьте статус в Dashboard: должен быть "Active"
2. Проверьте firewall settings
3. Попробуйте подключиться с локального ПК

### Ошибка: "password authentication failed"

**Причина:** Неправильный пароль в CONNECTION STRING

**Решение:**
1. Перепроверьте пароль в Dashboard
2. Скопируйте CONNECTION STRING заново
3. Убедитесь что нет лишних пробелов

### Ошибка: "SSL connection required"

**Причина:** DATABASE_SSL=false или не установлено

**Решение:**
```env
DATABASE_SSL=true
```

### Ошибка: "too many connections"

**Причина:** Превышен лимит подключений

**Решение:**
```env
DATABASE_MAX_CONNECTIONS=5  # Уменьшите
```

Или upgrade план PostgreSQL.

---

## 📞 ПОДДЕРЖКА

**Timeweb Cloud:**
- Dashboard: https://timeweb.cloud/databases
- Docs: https://timeweb.cloud/help/databases
- Support: support@timeweb.ru
- Telegram: @timeweb_support

---

## ✅ CHECKLIST

```
[ ] PostgreSQL создан в Timeweb Cloud (или альтернатива)
[ ] CONNECTION STRING скопирован
[ ] DATABASE_URL добавлен в Environment Variables
[ ] DATABASE_SSL=true установлено
[ ] Application перезапущено
[ ] Подключение работает (тест через psql)
[ ] Расширения созданы (uuid-ossp, postgis)
[ ] Миграции применены
[ ] Таблицы созданы (проверка)
```

---

## 🎉 ГОТОВО!

После создания PostgreSQL:

1. ✅ Скопируйте CONNECTION STRING
2. ✅ Добавьте в Environment Variables
3. ✅ Restart Application
4. ✅ Примените миграции
5. ✅ Проверьте `/api/health/db`

**Переходите к деплою!** 🚀

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Статус:** PostgreSQL setup guide ✅
