# 🤖 Автоматическая настройка Timeweb Cloud через API

## 📋 Обзор

Этот гайд описывает как автоматически настроить всю инфраструктуру Timeweb Cloud для проекта KamchaTour Hub через API.

---

## 🎯 Что будет создано автоматически

Скрипт `timeweb-setup.ts` создаст:

✅ **VDS сервер**
- OS: Ubuntu 22.04 LTS
- CPU: 2 vCPU
- RAM: 4 GB
- Disk: 60 GB SSD

✅ **PostgreSQL база данных**
- Version: PostgreSQL 15
- CPU: 2 vCPU
- RAM: 4 GB
- Disk: 50 GB

✅ **S3 Object Storage**
- Bucket: kamchatour-media
- Region: ru-1 (Москва)
- Type: Public

✅ **Firewall правила**
- SSH (22)
- HTTP (80)
- HTTPS (443)
- Next.js временный (3000)

✅ **Конфигурационные файлы**
- `.env.production.timeweb` - переменные окружения
- `timeweb-resources.json` - информация о созданных ресурсах

---

## 🔑 Шаг 1: Получение API токена

### Через веб-интерфейс:

1. **Войдите в панель управления:**
   ```
   https://timeweb.cloud/my
   ```

2. **Перейдите в раздел API:**
   - В левом меню найдите "API"
   - Или перейдите напрямую: https://timeweb.cloud/my/api

3. **Создайте новый токен:**
   - Нажмите "Создать токен"
   - Укажите название: `kamchatour-hub-automation`
   - Выберите права доступа:
     - ✅ Управление серверами
     - ✅ Управление базами данных
     - ✅ Управление S3
     - ✅ Управление Firewall
   - Нажмите "Создать"

4. **Сохраните токен:**
   ```bash
   # ВАЖНО: Токен показывается только один раз!
   # Сохраните его в безопасном месте
   ```

5. **Экспортируйте токен:**
   ```bash
   export TIMEWEB_TOKEN=your_token_here
   
   # Или добавьте в ~/.bashrc для постоянного использования
   echo 'export TIMEWEB_TOKEN=your_token_here' >> ~/.bashrc
   source ~/.bashrc
   ```

---

## 🚀 Шаг 2: Установка зависимостей

```bash
# Перейдите в директорию проекта
cd /workspace

# Установите tsx (если еще не установлен)
npm install -g tsx

# Или используйте npx
npx tsx scripts/timeweb-setup.ts
```

---

## ⚙️ Шаг 3: Настройка конфигурации (опционально)

Если нужно изменить параметры по умолчанию, отредактируйте `scripts/timeweb-setup.ts`:

```typescript
const config: TimewebConfig = {
  project: {
    name: 'kamchatour-hub',
    region: 'ru-1', // Изменить регион
  },
  vds: {
    os: 'ubuntu-22.04',
    cpu: 2,      // Изменить количество CPU
    ram: 4,      // Изменить количество RAM
    disk: 60,    // Изменить размер диска
  },
  database: {
    type: 'postgres',
    version: '15',
    cpu: 2,
    ram: 4,
    disk: 50,
  },
  s3: {
    bucketName: 'kamchatour-media', // Изменить имя bucket
    region: 'ru-1',
  },
};
```

---

## 🏃 Шаг 4: Запуск автоматической настройки

```bash
# Проверьте, что токен экспортирован
echo $TIMEWEB_TOKEN

# Запустите скрипт
tsx scripts/timeweb-setup.ts
```

### Что происходит:

```
🚀 Начинаем настройку Timeweb Cloud для KamchaTour Hub
============================================================

🔍 Проверка доступности Timeweb Cloud API...
✅ API доступен
   Аккаунт: your@email.com

🌍 Получение списка регионов...
✅ Доступно регионов: 3

📦 Создание VDS сервера...
   OS: ubuntu-22.04
   CPU: 2 vCPU
   RAM: 4 GB
   Disk: 60 GB
✅ VDS сервер создан
   ID: 12345678
   IP: 185.xxx.xxx.xxx
   Пароль: генерируется_автоматически

🗄️ Создание PostgreSQL базы данных...
   Версия: 15
   CPU: 2 vCPU
   RAM: 4 GB
✅ База данных создана
   ID: 87654321
   Host: kamchatour-hub-db.timeweb.cloud
   Port: 5432
   User: admin
   Password: генерируется_автоматически

💾 Создание S3 bucket...
   Имя: kamchatour-media
✅ S3 bucket создан
   ID: bucket-id
   Endpoint: s3.timeweb.cloud
   Access Key: AKI***
   Secret Key: ***

🔥 Настройка Firewall...
✅ Firewall группа создана (ID: fw-123)
   ✅ Правило добавлено: SSH (22)
   ✅ Правило добавлено: HTTP (80)
   ✅ Правило добавлено: HTTPS (443)
   ✅ Правило добавлено: Next.js (3000)
✅ Firewall применен к серверу

📝 Генерация .env.production файла...
✅ Файл .env.production.timeweb создан
   ⚠️  Не забудьте добавить API ключи для внешних сервисов!

💾 Сохранение информации о ресурсах...
✅ Информация сохранена в timeweb-resources.json

============================================================
🎉 Настройка завершена успешно!
============================================================

📋 Следующие шаги:
1. SSH подключение к серверу:
   ssh root@185.xxx.xxx.xxx
   Пароль: см. в timeweb-resources.json

2. Запустите настройку сервера:
   bash scripts/setup-timeweb-server.sh

3. Настройте переменные окружения:
   mv .env.production.timeweb .env.production
   nano .env.production  # добавьте API ключи

4. Разверните приложение:
   bash scripts/deploy-to-timeweb.sh
```

---

## 📁 Созданные файлы

### 1. `.env.production.timeweb`

Содержит все настройки подключения к созданным ресурсам:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=http://185.xxx.xxx.xxx

DATABASE_URL=postgresql://admin:password@kamchatour-hub-db.timeweb.cloud:5432/kamchatour?sslmode=require

S3_ACCESS_KEY_ID=AKI***
S3_SECRET_ACCESS_KEY=***
S3_BUCKET_NAME=kamchatour-media
S3_ENDPOINT=https://s3.timeweb.cloud
S3_REGION=ru-1

SERVER_IP=185.xxx.xxx.xxx
SERVER_PASSWORD=***

# ... и другие переменные
```

### 2. `timeweb-resources.json`

Содержит полную информацию о созданных ресурсах:

```json
{
  "timestamp": "2025-10-29T23:30:00.000Z",
  "project": "kamchatour-hub",
  "resources": {
    "vds": {
      "id": "12345678",
      "ip": "185.xxx.xxx.xxx",
      "name": "kamchatour-hub-vds",
      "status": "running"
    },
    "database": {
      "id": "87654321",
      "host": "kamchatour-hub-db.timeweb.cloud",
      "port": 5432,
      "name": "kamchatour",
      "type": "postgres"
    },
    "s3": {
      "id": "bucket-id",
      "name": "kamchatour-media",
      "endpoint": "s3.timeweb.cloud"
    },
    "firewall": {
      "id": "fw-123",
      "name": "kamchatour-hub-firewall"
    }
  },
  "nextSteps": [
    "1. Подключитесь к серверу через SSH",
    "2. Запустите скрипт setup-timeweb-server.sh",
    "..."
  ]
}
```

---

## 🔍 Шаг 5: Проверка созданных ресурсов

### Через веб-интерфейс:

1. **VDS сервер:**
   ```
   https://timeweb.cloud/my/servers
   ```

2. **База данных:**
   ```
   https://timeweb.cloud/my/databases
   ```

3. **S3 Storage:**
   ```
   https://timeweb.cloud/my/storages
   ```

4. **Firewall:**
   ```
   https://timeweb.cloud/my/firewall
   ```

### Через CLI:

```bash
# Проверка VDS
curl -H "Authorization: Bearer $TIMEWEB_TOKEN" \
  https://api.timeweb.cloud/api/v1/servers | jq

# Проверка БД
curl -H "Authorization: Bearer $TIMEWEB_TOKEN" \
  https://api.timeweb.cloud/api/v1/databases | jq

# Проверка S3
curl -H "Authorization: Bearer $TIMEWEB_TOKEN" \
  https://api.timeweb.cloud/api/v1/storages/buckets | jq
```

---

## 🔧 Шаг 6: Настройка сервера

После создания ресурсов, подключитесь к серверу и настройте его:

```bash
# 1. SSH подключение
ssh root@185.xxx.xxx.xxx
# Введите пароль из timeweb-resources.json

# 2. Скачайте скрипт настройки (если его нет на сервере)
wget https://raw.githubusercontent.com/your-repo/kamchatour-hub/main/scripts/setup-timeweb-server.sh

# 3. Запустите настройку
bash setup-timeweb-server.sh

# 4. Дождитесь завершения (10-15 минут)
```

---

## 📦 Шаг 7: Развертывание приложения

После настройки сервера разверните приложение:

```bash
# На локальной машине:

# 1. Скопируйте .env файл
scp .env.production.timeweb root@185.xxx.xxx.xxx:/home/kamchatour/kamchatour-hub/.env.production

# 2. Добавьте недостающие API ключи
ssh root@185.xxx.xxx.xxx
cd /home/kamchatour/kamchatour-hub
nano .env.production

# Добавьте:
# GROQ_API_KEY=...
# DEEPSEEK_API_KEY=...
# OPENROUTER_API_KEY=...
# YANDEX_MAPS_API_KEY=...
# и т.д.

# 3. Запустите развертывание
bash scripts/deploy-to-timeweb.sh
```

---

## 🛠️ Дополнительные команды

### Просмотр информации о ресурсах:

```bash
# Красивый вывод JSON
cat timeweb-resources.json | jq

# Только IP адрес
cat timeweb-resources.json | jq -r '.resources.vds.ip'

# Только connection string БД
cat .env.production.timeweb | grep DATABASE_URL
```

### Удаление созданных ресурсов:

```bash
# ВНИМАНИЕ: Это удалит все созданные ресурсы!

# VDS сервер
curl -X DELETE \
  -H "Authorization: Bearer $TIMEWEB_TOKEN" \
  https://api.timeweb.cloud/api/v1/servers/{server_id}

# База данных
curl -X DELETE \
  -H "Authorization: Bearer $TIMEWEB_TOKEN" \
  https://api.timeweb.cloud/api/v1/databases/{database_id}

# S3 bucket
curl -X DELETE \
  -H "Authorization: Bearer $TIMEWEB_TOKEN" \
  https://api.timeweb.cloud/api/v1/storages/buckets/{bucket_id}
```

---

## 🆘 Troubleshooting

### Ошибка: API токен недействителен

```bash
# Проверьте токен
echo $TIMEWEB_TOKEN

# Убедитесь, что он не содержит лишних пробелов
export TIMEWEB_TOKEN=$(echo $TIMEWEB_TOKEN | tr -d ' ')

# Проверьте доступ к API
curl -H "Authorization: Bearer $TIMEWEB_TOKEN" \
  https://api.timeweb.cloud/api/v1/account
```

### Ошибка: Недостаточно средств

```
❌ Ошибка создания VDS: Insufficient funds
```

**Решение:**
1. Пополните баланс в панели Timeweb Cloud
2. Запустите скрипт снова

### Ошибка: Регион недоступен

```
❌ Ошибка: Region ru-1 is not available
```

**Решение:**
1. Получите список доступных регионов:
   ```bash
   curl -H "Authorization: Bearer $TIMEWEB_TOKEN" \
     https://api.timeweb.cloud/api/v1/locations | jq
   ```
2. Измените регион в конфигурации

### Ошибка: Имя bucket занято

```
❌ Ошибка создания S3 bucket: Bucket name already exists
```

**Решение:**
Измените имя bucket в конфигурации на уникальное:
```typescript
s3: {
  bucketName: 'kamchatour-media-unique-12345',
  region: 'ru-1',
}
```

---

## 💰 Стоимость созданных ресурсов

### Ежемесячная стоимость:

```
VDS (2 vCPU, 4 GB, 60 GB):      ~1200₽/мес
PostgreSQL (2 vCPU, 4 GB):      ~1200₽/мес
S3 (50 GB):                     ~50₽/мес
Firewall:                       Бесплатно
────────────────────────────────────────
ИТОГО:                          ~2450₽/мес (~$25)
```

---

## 📊 Мониторинг ресурсов

### Через API:

```bash
# Статус VDS
curl -H "Authorization: Bearer $TIMEWEB_TOKEN" \
  https://api.timeweb.cloud/api/v1/servers/{server_id} | jq

# Использование БД
curl -H "Authorization: Bearer $TIMEWEB_TOKEN" \
  https://api.timeweb.cloud/api/v1/databases/{database_id}/stats | jq

# Использование S3
curl -H "Authorization: Bearer $TIMEWEB_TOKEN" \
  https://api.timeweb.cloud/api/v1/storages/buckets/{bucket_id}/stats | jq
```

---

## 🔐 Безопасность

### Важные рекомендации:

1. **API токен:**
   - Никогда не коммитьте токен в git
   - Храните в переменных окружения
   - Регулярно обновляйте

2. **Пароли:**
   - Сразу смените пароль root на сервере
   - Используйте SSH ключи вместо паролей
   - Храните пароли в безопасном месте

3. **Firewall:**
   - Ограничьте SSH доступ по IP
   - Закройте порт 3000 после настройки Nginx
   - Регулярно проверяйте правила

4. **S3:**
   - Настройте CORS правильно
   - Используйте приватный bucket для sensitive данных
   - Ротируйте access keys регулярно

---

## 📚 Дополнительная информация

### Официальная документация Timeweb Cloud API:
- https://timeweb.cloud/docs/api

### Поддержка:
- Email: support@timeweb.cloud
- Telegram: @timeweb_support
- Телефон: 8 (800) 555-00-00

---

## ✅ Чеклист готовности

- [ ] API токен получен и экспортирован
- [ ] Баланс пополнен (~3000₽)
- [ ] Зависимости установлены (tsx)
- [ ] Скрипт запущен успешно
- [ ] Файлы .env и timeweb-resources.json созданы
- [ ] SSH подключение к серверу работает
- [ ] Сервер настроен (setup-timeweb-server.sh)
- [ ] API ключи добавлены в .env
- [ ] Приложение развернуто
- [ ] Firewall настроен
- [ ] SSL сертификат получен
- [ ] Домен настроен

---

**Дата создания:** 2025-10-29  
**Версия:** 1.0  
**Статус:** ✅ Готово к использованию

🚀 **Удачи в автоматизации настройки Timeweb Cloud!**
