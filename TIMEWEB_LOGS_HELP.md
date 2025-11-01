# 🔍 КАК ПОЛУЧИТЬ ЛОГИ TIMEWEB APPS

## 📋 Способ 1: Через GitHub Actions (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Убедитесь что токен в GitHub Secrets

1. Откройте: https://github.com/PosPk/kamhub/settings/secrets/actions
2. Проверьте что есть секрет: `TIMEWEB_API_TOKEN1`
3. Если нет - создайте:
   - Name: `TIMEWEB_API_TOKEN1`
   - Value: ваш токен из https://timeweb.cloud/my/api-keys

### Шаг 2: Запустите GitHub Action

1. Откройте: https://github.com/PosPk/kamhub/actions/workflows/get-timeweb-logs.yml
2. Нажмите **"Run workflow"**
3. Нажмите зеленую кнопку **"Run workflow"**
4. Подождите 10 секунд
5. Откройте запущенный workflow
6. Разверните **"Get Runtime Logs"**
7. Скопируйте логи и отправьте мне!

---

## 💻 Способ 2: Через терминал локально

### Если у вас есть токен:

```bash
# Экспортируйте токен
export TIMEWEB_API_TOKEN1="ваш_токен_здесь"

# Запустите скрипт
bash scripts/get-timeweb-logs.sh
```

### Результат:
- Покажет Runtime Logs (последние 100 строк)
- Покажет статус приложения
- Покажет переменные окружения

---

## 🌐 Способ 3: Через браузер (API напрямую)

### Получить логи:

```bash
curl -X GET \
  "https://api.timeweb.cloud/api/v1/apps/125051/logs?type=runtime&limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Получить статус:

```bash
curl -X GET \
  "https://api.timeweb.cloud/api/v1/apps/125051" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🔐 Где взять токен?

1. Откройте: https://timeweb.cloud/my/api-keys
2. Нажмите **"Создать токен"**
3. Назовите: `debug-logs`
4. Скопируйте токен
5. **ВАЖНО:** После использования - удалите токен!

---

## 📊 Что показывает скрипт?

### Runtime Logs:
```
2025-10-30 22:20:54 | INFO | Starting application...
2025-10-30 22:20:55 | ERROR | Database connection failed
2025-10-30 22:20:55 | ERROR | Application crashed
```

### App Status:
```json
{
  "name": "kamchatour-hub",
  "status": "running" или "crashed",
  "framework": "nextjs",
  "env_vars": ["NODE_ENV", "PORT", "JWT_SECRET"],
  "domains": ["pospk-kamhub-70c4.twc1.net"],
  "resources": {"cpu": "1", "memory": "1GB"}
}
```

---

## 🆘 ЕСЛИ НЕ РАБОТАЕТ

### Ошибка: "Failed to fetch logs"

**Причина:** Неправильный токен или нет прав

**Решение:**
1. Проверьте токен в GitHub Secrets
2. Создайте новый токен на Timeweb
3. Обновите секрет в GitHub

### Ошибка: "jq: command not found"

**Решение:**
```bash
# Ubuntu/Debian
sudo apt install jq

# macOS
brew install jq
```

---

## ✅ ПОСЛЕ ПОЛУЧЕНИЯ ЛОГОВ

**Отправьте мне:**
1. Runtime Logs (последние 50 строк)
2. App Status (весь JSON)

**Я сразу найду проблему!** 🔧

---

**Дата:** 30.10.2025  
**Приложение:** kamchatour-hub (ID: 125051)
