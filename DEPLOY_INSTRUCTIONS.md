# 🚀 ИНСТРУКЦИЯ ПО ДЕПЛОЮ И ДИАГНОСТИКЕ

## 📊 ТЕКУЩИЙ СТАТУС

✅ **Код готов и запушен:**
- Ветка: `cursor/analyze-repository-and-timeweb-project-79c9`
- Последний коммит: `d9778a7` (trip planner + test page)
- Файлов изменено: 9
- Строк кода: ~3800

❌ **Сайт недоступен:**
- URL: https://pospk-kamhub-70c4.twc1.net
- Статус: HTTP 404
- Причина: Приложение не запускается

---

## 🔍 ДИАГНОСТИКА ПРОБЛЕМЫ

### **Шаг 1: Проверьте статус Timeweb Apps**

1. Откройте: **https://timeweb.cloud/my/apps/125051**

2. Проверьте:
   - ✅ Статус должен быть **"Активно"** (зеленый)
   - ✅ Ветка: `cursor/analyze-repository-and-timeweb-project-79c9`
   - ✅ Последний коммит: `d9778a7` или `05a2eeb`

### **Шаг 2: Проверьте логи**

1. Перейдите на вкладку **"Логи"**

2. Смотрите **Runtime logs** (не Build logs!)

3. Ищите ошибки:
   - ❌ `Error: Cannot find module`
   - ❌ `EADDRINUSE` (порт занят)
   - ❌ `Database connection failed`
   - ❌ `Missing environment variable`

### **Шаг 3: Проверьте переменные окружения**

На странице приложения, раздел **"Переменные окружения"** должны быть:

```
✅ NODE_ENV = production
✅ PORT = 8080
✅ JWT_SECRET = kamchatour-super-secret-key-2025-production
✅ NEXTAUTH_URL = https://pospk-kamhub-70c4.twc1.net
✅ NEXT_PUBLIC_API_URL = https://pospk-kamhub-70c4.twc1.net/api
✅ SKIP_SENTRY = true
```

**Опционально (для AI):**
```
⭕ GROQ_API_KEY = gsk_...
⭕ DEEPSEEK_API_KEY = sk-...
⭕ DATABASE_URL = postgresql://...
```

---

## 🛠️ РЕШЕНИЕ ПРОБЛЕМ

### **Проблема 1: Нет переменных окружения**

**Решение через Timeweb UI:**
1. Откройте https://timeweb.cloud/my/apps/125051
2. Раздел "Переменные окружения"
3. Добавьте все переменные из списка выше
4. Нажмите "Сохранить"
5. Кнопка "Redeploy"

**Или через API:**
```bash
curl -X PATCH "https://api.timeweb.cloud/api/v1/apps/125051" \
  -H "Authorization: Bearer YOUR_TIMEWEB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "envs": {
      "NODE_ENV": "production",
      "PORT": "8080",
      "JWT_SECRET": "kamchatour-super-secret-key-2025-production",
      "NEXTAUTH_URL": "https://pospk-kamhub-70c4.twc1.net",
      "NEXT_PUBLIC_API_URL": "https://pospk-kamhub-70c4.twc1.net/api",
      "SKIP_SENTRY": "true"
    }
  }'
```

---

### **Проблема 2: Неправильная ветка деплоя**

**Проверка:**
```bash
curl -s "https://api.timeweb.cloud/api/v1/apps/125051" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.app.branch'
```

Должно быть: `"cursor/analyze-repository-and-timeweb-project-79c9"`

**Исправление:**
```bash
curl -X PATCH "https://api.timeweb.cloud/api/v1/apps/125051" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branch": "cursor/analyze-repository-and-timeweb-project-79c9"}'
```

---

### **Проблема 3: Старый build кэш**

**Решение:**
1. Откройте Timeweb UI
2. Нажмите "Redeploy" → "Force rebuild"
3. Дождитесь завершения (2-5 минут)

---

### **Проблема 4: Ошибки в логах**

#### **Ошибка: "Cannot find module"**

**Причина:** Не установлены зависимости

**Решение:**
1. Проверьте `package.json` - все зависимости на месте
2. Force rebuild через Timeweb UI
3. Проверьте Build logs на ошибки npm install

#### **Ошибка: "EADDRINUSE: address already in use"**

**Причина:** Порт 8080 занят

**Решение:**
1. Убедитесь что `PORT=8080` в env vars
2. Проверьте что в `timeweb.json` тоже `"port": 8080`
3. Redeploy

#### **Ошибка: "Database connection failed"**

**Причина:** Нет `DATABASE_URL` или неправильные данные

**Решение:**
```bash
# Добавьте DATABASE_URL:
# Формат: postgresql://user:password@host:port/database

curl -X PATCH "https://api.timeweb.cloud/api/v1/apps/125051" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "envs": {
      "DATABASE_URL": "postgresql://user:pass@host:5432/kamchatour"
    }
  }'
```

---

## ✅ ПОШАГОВЫЙ ПЛАН ДЕПЛОЯ

### **1. Проверьте код на GitHub**

```bash
# Откройте:
https://github.com/PosPk/kamhub/tree/cursor/analyze-repository-and-timeweb-project-79c9

# Убедитесь что видите:
✅ app/api/trip/plan/route.ts
✅ lib/database/accommodation_schema.sql
✅ lib/trip-planner/logistics.ts
✅ public/trip-planner-test.html
```

### **2. Настройте Timeweb Apps**

1. Откройте: https://timeweb.cloud/my/apps/125051

2. **Переменные окружения:**
   - NODE_ENV = production
   - PORT = 8080
   - JWT_SECRET = kamchatour-super-secret-key-2025-production
   - NEXTAUTH_URL = https://pospk-kamhub-70c4.twc1.net
   - NEXT_PUBLIC_API_URL = https://pospk-kamhub-70c4.twc1.net/api
   - SKIP_SENTRY = true

3. **Настройки:**
   - Ветка: `cursor/analyze-repository-and-timeweb-project-79c9`
   - Node.js версия: 20
   - Build команда: `npm run build`
   - Start команда: `npm start` (или `node .next/standalone/server.js`)

4. Нажмите **"Redeploy"** → **"Force rebuild"**

### **3. Дождитесь деплоя (2-5 минут)**

Следите за статусом:
- 🔄 Building... (1-3 мин)
- 🔄 Deploying... (30 сек)
- ✅ Active (готово!)

### **4. Проверьте работу**

```bash
# Health check
curl https://pospk-kamhub-70c4.twc1.net/api/health

# Должно вернуть:
# {"status":"ok","service":"kamchatour-hub",...}
```

### **5. Настройте БД (опционально для trip planner)**

Если хотите протестировать планировщик поездок:

```bash
# Подключитесь к БД и выполните:
npm run migrate:accommodation:seed

# Или вручную:
psql -h HOST -U USER -d DATABASE -f lib/database/accommodation_schema.sql
```

### **6. Протестируйте новую функциональность**

Откройте в браузере:
```
https://pospk-kamhub-70c4.twc1.net/trip-planner-test.html
```

Или через curl:
```bash
curl -X POST https://pospk-kamhub-70c4.twc1.net/api/trip/plan \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Я планирую поездку на 5 дней. Хочу вулканы и медведей.",
    "days": 5
  }'
```

---

## 🆘 ЕСЛИ ВСЁ ЕЩЁ НЕ РАБОТАЕТ

### **Вариант А: Деплой на другую платформу**

#### **Vercel (рекомендуется)**

```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Логин
vercel login

# 3. Деплой
vercel --prod

# Готово! Получите URL типа: kamhub.vercel.app
```

#### **Railway**

1. Откройте https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Выберите ветку `cursor/analyze-repository-and-timeweb-project-79c9`
4. Добавьте env vars
5. Deploy!

---

### **Вариант Б: Локальный тест**

```bash
# 1. Клонируйте ветку
git checkout cursor/analyze-repository-and-timeweb-project-79c9

# 2. Установите зависимости
npm install

# 3. Создайте .env.local
echo "NODE_ENV=development
PORT=3002
JWT_SECRET=test-secret
SKIP_SENTRY=true" > .env.local

# 4. Запустите dev сервер
npm run dev

# 5. Откройте браузер
open http://localhost:3002/trip-planner-test.html
```

---

## 📞 ПОДДЕРЖКА

Если проблема не решается, соберите диагностическую информацию:

### **1. Статус приложения:**
```bash
curl -s "https://api.timeweb.cloud/api/v1/apps/125051" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '{status, branch, commit_sha, envs}'
```

### **2. Runtime логи:**
```bash
curl -s "https://api.timeweb.cloud/api/v1/apps/125051/logs?type=runtime&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.app_logs[] | .message'
```

### **3. Build логи:**
```bash
curl -s "https://api.timeweb.cloud/api/v1/apps/125051/logs?type=build&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.app_logs[] | .message'
```

---

## 📝 ЧЕКЛИСТ ДЕПЛОЯ

- [ ] Код запушен на GitHub в ветку `cursor/analyze-repository-and-timeweb-project-79c9`
- [ ] Timeweb Apps настроен на правильную ветку
- [ ] Все переменные окружения добавлены
- [ ] Выполнен Force rebuild
- [ ] Статус приложения "Active" (зеленый)
- [ ] Health check возвращает `{"status":"ok"}`
- [ ] (Опционально) Применены миграции БД
- [ ] (Опционально) Добавлены тестовые данные
- [ ] Страница https://pospk-kamhub-70c4.twc1.net/trip-planner-test.html работает
- [ ] API endpoint `/api/trip/plan` отвечает

---

## 🎉 ПОСЛЕ УСПЕШНОГО ДЕПЛОЯ

### **Тестовые URL:**

1. **Главная страница:**
   https://pospk-kamhub-70c4.twc1.net

2. **Тестовая страница планировщика:**
   https://pospk-kamhub-70c4.twc1.net/trip-planner-test.html

3. **API endpoints:**
   - Health: `/api/health`
   - Trip Plan: `/api/trip/plan` (POST)
   - Tours: `/api/tours`
   - AI Chat: `/api/ai` (POST)

### **Документация:**

- 📖 API документация: `/docs/TRIP_PLANNER_API.md`
- 📋 Технический отчет: `/TRIP_PLANNER_IMPLEMENTATION.md`
- 🚀 Инструкция по деплою: `/QUICK_DEPLOY_AND_TEST.md`

---

**Дата:** 30.10.2025  
**Версия:** 1.0.0  
**Для:** Kamchatour Hub 🌋

**УДАЧИ С ДЕПЛОЕМ! 🚀**
