# ⚡ Timeweb Cloud API - Quick Start

## 🚀 Быстрый старт за 5 минут

### Шаг 1: Получите API токен

```bash
# 1. Войдите в панель Timeweb Cloud
open https://timeweb.cloud/my/api

# 2. Создайте токен с правами:
#    - Управление серверами
#    - Управление базами данных
#    - Управление S3
#    - Управление Firewall

# 3. Экспортируйте токен
export TIMEWEB_TOKEN=ваш_токен_здесь
```

### Шаг 2: Запустите автоматическую настройку

```bash
# Установите tsx (если нужно)
npm install -g tsx

# Запустите скрипт настройки
tsx scripts/timeweb-setup.ts
```

### Что создастся автоматически:

✅ **VDS сервер** (2 vCPU, 4 GB RAM, 60 GB) - ~1200₽/мес  
✅ **PostgreSQL** (2 vCPU, 4 GB, 50 GB) - ~1200₽/мес  
✅ **S3 Bucket** (kamchatour-media) - ~50₽/мес  
✅ **Firewall** (SSH, HTTP, HTTPS, Next.js)  
✅ **.env.production.timeweb** - готовый конфиг  
✅ **timeweb-resources.json** - информация о ресурсах  

**Итого:** ~2450₽/мес (~$25)

---

## 📊 Управление ресурсами

### Показать все ресурсы:

```bash
tsx scripts/timeweb-manage.ts list
```

### Проверить статус проекта:

```bash
tsx scripts/timeweb-manage.ts project
```

### Другие команды:

```bash
# Список серверов
tsx scripts/timeweb-manage.ts servers

# Список баз данных
tsx scripts/timeweb-manage.ts databases

# Список S3 buckets
tsx scripts/timeweb-manage.ts buckets

# Перезагрузить сервер
tsx scripts/timeweb-manage.ts restart SERVER_ID

# Создать backup
tsx scripts/timeweb-manage.ts backup vds SERVER_ID

# Информация об аккаунте
tsx scripts/timeweb-manage.ts account

# Помощь
tsx scripts/timeweb-manage.ts help
```

---

## 📁 Созданные файлы

После выполнения `timeweb-setup.ts` у вас будут:

1. **`.env.production.timeweb`** - переменные окружения
   ```bash
   mv .env.production.timeweb .env.production
   nano .env.production  # добавьте API ключи
   ```

2. **`timeweb-resources.json`** - информация о ресурсах
   ```bash
   cat timeweb-resources.json | jq
   ```

---

## 🔧 Следующие шаги

### 1. Подключитесь к серверу:

```bash
# IP адрес из timeweb-resources.json
ssh root@185.xxx.xxx.xxx
```

### 2. Настройте сервер:

```bash
# Скачайте скрипт (если нужно)
wget https://raw.githubusercontent.com/your-repo/kamchatour-hub/main/scripts/setup-timeweb-server.sh

# Запустите
bash setup-timeweb-server.sh
```

### 3. Разверните приложение:

```bash
# На локальной машине:
bash scripts/deploy-to-timeweb.sh
```

---

## 💡 Полезные ссылки

📖 **Полная документация:** [TIMEWEB_API_SETUP_GUIDE.md](TIMEWEB_API_SETUP_GUIDE.md)

🌐 **Панель Timeweb Cloud:** https://timeweb.cloud/my

📚 **API Документация:** https://timeweb.cloud/docs/api

💬 **Поддержка:** support@timeweb.cloud

---

## 🆘 Проблемы?

### Ошибка: API токен недействителен

```bash
# Проверьте токен
echo $TIMEWEB_TOKEN

# Убедитесь, что он экспортирован
export TIMEWEB_TOKEN=ваш_токен
```

### Ошибка: Недостаточно средств

Пополните баланс в панели Timeweb Cloud (~3000₽)

### Другие проблемы:

Смотрите [TIMEWEB_API_SETUP_GUIDE.md](TIMEWEB_API_SETUP_GUIDE.md) - раздел Troubleshooting

---

**Последнее обновление:** 2025-10-29  
**Версия:** 1.0
