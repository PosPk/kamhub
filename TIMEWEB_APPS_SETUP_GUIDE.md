# 🚀 ПОЛНАЯ ИНСТРУКЦИЯ ПО СОЗДАНИЮ ПРИЛОЖЕНИЯ В TIMEWEB APPS

## ❗ ВАЖНО

Старое приложение (ID: 125051) имеет системные проблемы.
Необходимо создать НОВОЕ приложение с правильными настройками с самого начала.

---

## 📋 ШАГИ ПО СОЗДАНИЮ НОВОГО ПРИЛОЖЕНИЯ

### Шаг 1: Удалите старое приложение

1. Откройте: https://timeweb.cloud/my/apps/125051
2. Найдите кнопку **"Удалить приложение"** / **"Delete App"**
3. Подтвердите удаление

---

### Шаг 2: Создайте новое приложение

1. Откройте: https://timeweb.cloud/my/apps
2. Нажмите кнопку **"Создать приложение"** / **"Create App"**

---

### Шаг 3: Настройки Repository

```
Repository: PosPk/kamhub
Branch: cursor/analyze-repository-and-timeweb-project-79c9
```

**⚠️ ВАЖНО:** Убедитесь что у Timeweb есть доступ к вашему GitHub репозиторию!

---

### Шаг 4: Настройки Framework

```
Framework: Next.js
Node.js Version: 20.x
```

---

### Шаг 5: Build & Start Commands

```
Build Command:    npm run build
Start Command:    npm start
```

**⚠️ КРИТИЧНО:** 

- **Index Directory / Output Directory:** ОСТАВЬТЕ ПУСТЫМ!
- **Root Directory:** ОСТАВЬТЕ ПУСТЫМ!
- **Install Command:** npm install (по умолчанию)

---

### Шаг 6: Environment Variables

Добавьте следующие переменные окружения:

```bash
NODE_ENV=production
PORT=8080
JWT_SECRET=kamchatour-super-secret-key-2025-production
SKIP_SENTRY=true
NEXTAUTH_URL=https://ВАШ-ДОМЕН.twc1.net
NEXT_PUBLIC_API_URL=https://ВАШ-ДОМЕН.twc1.net/api
```

**⚠️ ВНИМАНИЕ:** 
- `NEXTAUTH_URL` и `NEXT_PUBLIC_API_URL` нужно будет обновить после создания приложения
- Timeweb автоматически создаст домен вида: `название-приложения-XXXX.twc1.net`

---

### Шаг 7: Resources (Ресурсы)

**Минимальная конфигурация:**
```
CPU: 0.5 vCPU
RAM: 512 MB
Instances: 1
```

**Рекомендуемая конфигурация:**
```
CPU: 1 vCPU
RAM: 1 GB
Instances: 1
```

---

### Шаг 8: Auto Deploy

```
✅ Enable Auto Deploy (включить автоматический деплой)
```

Это позволит автоматически деплоить изменения при push в GitHub.

---

### Шаг 9: Создание

1. Нажмите кнопку **"Создать"** / **"Create"**
2. Подождите 3-5 минут пока приложение создается
3. Дождитесь завершения первого Build

---

## ✅ ПРОВЕРКА ПОСЛЕ СОЗДАНИЯ

### Шаг 10: Обновите URL в Environment Variables

1. Скопируйте URL вашего нового приложения (будет вида: `app-name-XXXX.twc1.net`)
2. Откройте Settings → Environment Variables
3. Обновите:
   ```
   NEXTAUTH_URL=https://app-name-XXXX.twc1.net
   NEXT_PUBLIC_API_URL=https://app-name-XXXX.twc1.net/api
   ```
4. Сохраните изменения
5. Нажмите **"Redeploy"**

---

### Шаг 11: Тестовые Endpoints

После успешного deploy проверьте:

**1. Тестовая страница:**
```
https://ваш-домен.twc1.net/test
```
Должна показать: "✅ Kamchatour Hub - TEST PAGE"

**2. API Ping:**
```
https://ваш-домен.twc1.net/api/ping
```
Должен вернуть JSON:
```json
{
  "status": "ok",
  "message": "pong",
  "timestamp": "...",
  "env": {
    "NODE_ENV": "production",
    "PORT": "8080"
  }
}
```

**3. Health Check:**
```
https://ваш-домен.twc1.net/api/health
```
Должен вернуть JSON:
```json
{
  "status": "ok",
  "service": "kamchatour-hub",
  ...
}
```

**4. Главная страница:**
```
https://ваш-домен.twc1.net/
```
Должна показать главную страницу Kamchatour Hub

---

## 🔍 ЕСЛИ НЕ РАБОТАЕТ

### Проверьте Runtime Logs:

1. Откройте: https://timeweb.cloud/my/apps/НОВЫЙ_ID/logs
2. Переключитесь на вкладку **"Runtime"**
3. Должны быть логи вида:
   ```
   Starting Next.js on port 8080
   ▲ Next.js 14.2.15
   - Local: http://localhost:8080
   ✓ Ready in ...
   ```

### Если Runtime логи пусты:

1. Проверьте Build Logs - успешно ли прошел build?
2. Проверьте Settings → убедитесь что:
   - Index Directory ПУСТОЙ
   - Start Command: `npm start`
3. Попробуйте Restart через UI

---

## 🆘 АЛЬТЕРНАТИВА: TIMEWEB VDS

Если Timeweb Apps не работает, можно использовать Timeweb VDS:

### Преимущества VDS:
- ✅ Полный контроль над сервером
- ✅ Можно использовать Docker
- ✅ Можно использовать PM2
- ✅ Больше возможностей для отладки

### Недостатки:
- ❌ Нужно настраивать сервер вручную
- ❌ Нужно настраивать Nginx
- ❌ Требует больше знаний DevOps

---

## 📞 ОБРАТНАЯ СВЯЗЬ

После создания нового приложения сообщите:

1. **Новый URL** приложения
2. **Новый ID** приложения
3. **Статус** - работает / не работает
4. **Runtime logs** - есть / нет

---

**Дата создания:** 2025-10-31  
**Последний коммит:** 98428cf  
**Ветка:** cursor/analyze-repository-and-timeweb-project-79c9
