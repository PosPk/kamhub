# 🔧 ИСПРАВЛЕНИЕ ПРОБЛЕМЫ TIMEWEB APPS

## 🔴 Проблема

Деплой зелёный, но приложение не открывается по адресу https://timeweb.cloud/my/apps/125051/deploy

## ✅ Причина

**Несоответствие портов**: В `package.json` был захардкожен порт 3000, но Timeweb Apps передаёт динамический порт через переменную окружения `PORT`.

## 🛠️ Решение применено

### 1. Исправлен package.json

**Было:**
```json
"start": "next start -p 3000"
```

**Стало:**
```json
"start": "next start"
```

> Next.js автоматически подхватит порт из переменной окружения `PORT`

---

## 🚀 ЧТО НУЖНО СДЕЛАТЬ

### Шаг 1: Закоммитить изменения

```bash
git add package.json
git commit -m "fix: use PORT environment variable for Timeweb Apps"
git push origin <your-branch>
```

### Шаг 2: Проверить переменные окружения в Timeweb Apps

Откройте: https://timeweb.cloud/my/apps/125051/settings/env

**Обязательные переменные:**

```bash
# Node.js
NODE_ENV=production
PORT=8080

# База данных (если используете)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# AI (если используете)
GROQ_API_KEY=your_groq_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# JWT (обязательно!)
JWT_SECRET=your-super-secret-key-min-32-chars

# CloudPayments (если используете)
CLOUDPAYMENTS_PUBLIC_ID=your_public_id
CLOUDPAYMENTS_API_SECRET=your_api_secret

# Maps (если используете)
YANDEX_MAPS_API_KEY=your_yandex_maps_key

# SMS/Email (если используете)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
SMS_RU_API_ID=your_sms_ru_api_id
```

### Шаг 3: Передеплоить приложение

В Timeweb Apps:
1. Перейдите на вкладку **"Deployments"**
2. Нажмите **"Redeploy"** или **"Deploy"**
3. Дождитесь завершения (статус должен стать зелёным)
4. Нажмите **"Open App"** или **"Просмотр"**

---

## 🔍 ДИАГНОСТИКА ЕСЛИ НЕ РАБОТАЕТ

### 1. Проверьте логи приложения

```
Timeweb Apps → Logs → Runtime Logs
```

**Что искать:**
- ❌ `Error: listen EADDRINUSE` - порт уже занят (не должно быть)
- ❌ `Database connection failed` - проблема с DATABASE_URL
- ❌ `Module not found` - не установились зависимости
- ✅ `Ready on http://...` - приложение запустилось

### 2. Проверьте логи сборки

```
Timeweb Apps → Logs → Build Logs
```

**Что искать:**
- ❌ `npm ERR!` - ошибка установки зависимостей
- ❌ `Build failed` - ошибка компиляции TypeScript
- ✅ `Build completed` - сборка успешна

### 3. Проверьте Health Check

В настройках Timeweb Apps должен быть настроен health check:

```
Health Check Path: /api/health
или просто: /
```

### 4. Проверьте ресурсы

Если приложение падает из-за нехватки памяти:

```
Timeweb Apps → Settings → Resources
```

**Рекомендуется:**
- CPU: 1-2 cores
- Memory: 1-2 GB
- Instances: 1

---

## 🧪 ТЕСТИРОВАНИЕ ЛОКАЛЬНО

Перед деплоем протестируйте локально:

```bash
# Установите зависимости
npm install

# Соберите приложение
npm run build

# Запустите в production режиме с переменной PORT
PORT=8080 npm start

# Откройте http://localhost:8080
```

Если работает локально - должно работать на Timeweb Apps.

---

## 🆘 ЧАСТЫЕ ПРОБЛЕМЫ

### Проблема 1: "Cannot connect to database"

**Причина:** Неправильный DATABASE_URL

**Решение:**
```bash
# Проверьте формат:
DATABASE_URL=postgresql://username:password@host:port/database

# Пример:
DATABASE_URL=postgresql://kamuser:mypassword@db.timeweb.cloud:5432/kamchatour
```

### Проблема 2: "Port 3000 is already in use"

**Причина:** Старая версия package.json с хардкодом порта

**Решение:** Убедитесь что изменения закоммичены и задеплоены

### Проблема 3: "Module 'pg' not found"

**Причина:** Не установились зависимости

**Решение:**
1. Удалите `node_modules` и `package-lock.json`
2. Запустите `npm install`
3. Закоммитьте новый `package-lock.json`
4. Передеплойте

### Проблема 4: "Application timeout"

**Причина:** Приложение не отвечает на health check

**Решение:**
1. Создайте простой health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' });
}
```

2. Настройте в Timeweb Apps:
   - Health Check Path: `/api/health`
   - Timeout: 30 seconds

---

## 📝 ЧЕКЛИСТ ПЕРЕД ДЕПЛОЕМ

- [ ] `package.json` исправлен (`start` без `-p 3000`)
- [ ] Все переменные окружения настроены в Timeweb Apps
- [ ] DATABASE_URL правильный (если используете БД)
- [ ] JWT_SECRET установлен
- [ ] Приложение работает локально с `PORT=8080 npm start`
- [ ] Health check endpoint создан (`/api/health`)
- [ ] Изменения закоммичены и запушены в Git
- [ ] Передеплоено в Timeweb Apps

---

## 🎯 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После применения фикса:

✅ Деплой зелёный  
✅ Логи показывают `Ready on http://0.0.0.0:8080`  
✅ Приложение открывается по кнопке "Просмотр"  
✅ Главная страница загружается  
✅ API endpoints работают  

---

## 📞 ЕСЛИ НЕ ПОМОГЛО

1. **Скопируйте логи** из Timeweb Apps (Runtime Logs + Build Logs)
2. **Отправьте мне** - я помогу разобраться
3. Или напишите в **поддержку Timeweb**: support@timeweb.cloud

---

**Дата создания:** 30 октября 2025  
**Статус:** ✅ Фикс применён  
**Следующий шаг:** Закоммитить и передеплоить
