# 🔧 АДАПТАЦИЯ ПОД TIMEWEB CLOUD

**Дата:** 30.10.2025  
**Было:** Vercel + Yandex Cloud  
**Стало:** Timeweb Cloud (Node.js VDS)

---

## ✅ ЧТО ИЗМЕНЕНО

### 1. **Edge Runtime → Node.js Runtime**

**Файл:** `app/api/ai/route.ts`

**Было (Vercel):**
```typescript
export const runtime = 'edge'  // ❌ Только Vercel!
```

**Стало (Timeweb):**
```typescript
export const runtime = 'nodejs'  // ✅ Работает на Node.js VDS
```

**Почему:** Edge runtime есть только на Vercel. На обычном Node.js сервере используется стандартный runtime.

---

### 2. **Добавлен PM2 конфигурация**

**Файл:** `ecosystem.config.js` (новый)

**Для чего:** Управление процессом Next.js на VDS

```javascript
module.exports = {
  apps: [{
    name: 'kamchatour-hub',
    script: 'npm',
    args: 'start',
    instances: 2,        // 2 процесса (cluster mode)
    exec_mode: 'cluster',
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

**Замена для:** Vercel автоматически управляет процессами

---

### 3. **Добавлен .env.example**

**Файл:** `.env.example` (новый)

**Для чего:** Шаблон переменных окружения для Timeweb Cloud

**Отличия от Vercel:**
- Нет автоматических переменных Vercel (VERCEL_URL, etc.)
- Явно указаны все необходимые переменные
- Добавлены переменные для Timeweb ресурсов

---

### 4. **Помечен vercel.json**

**Файл:** `vercel.json` (обновлён)

Добавлен комментарий:
```json
{
  "_comment": "Этот файл для Vercel, но проект теперь на Timeweb Cloud",
  "_note": "Для Timeweb используется ecosystem.config.js (PM2)"
}
```

**Можно удалить?** Да, но оставил для совместимости (если захотите вернуться на Vercel)

---

## 📊 СРАВНЕНИЕ: VERCEL vs TIMEWEB

| Аспект | Vercel | Timeweb Cloud |
|--------|--------|---------------|
| **Деплой** | git push → авто | git push → GitHub Actions → rsync |
| **Runtime** | Edge + Node.js | Node.js только |
| **База данных** | Vercel Postgres | Timeweb PostgreSQL |
| **Хранилище** | Vercel Blob | Timeweb S3 |
| **Процесс менеджер** | Автоматический | PM2 (вручную) |
| **SSL** | Автоматический | Certbot (вручную) |
| **Масштабирование** | Автоматическое | Вручную (увеличить VDS) |
| **Стоимость** | $0-20/мес | ~581₽/мес (~$6) |

---

## 🔧 ЧТО НУЖНО НАСТРОИТЬ ВРУЧНУЮ

### На Timeweb Cloud (в отличие от Vercel):

1. **Nginx** - reverse proxy
   - Vercel: автоматически
   - Timeweb: вручную через конфигурацию

2. **SSL сертификат**
   - Vercel: автоматически
   - Timeweb: Certbot вручную

3. **PM2** - процесс менеджер
   - Vercel: не нужен
   - Timeweb: обязательно

4. **Firewall**
   - Vercel: автоматически
   - Timeweb: UFW вручную

5. **Мониторинг**
   - Vercel: встроенный
   - Timeweb: Sentry/PM2 logs

---

## ✅ ЧТО РАБОТАЕТ БЕЗ ИЗМЕНЕНИЙ

### Приложение:
- ✅ Next.js 14
- ✅ React 18
- ✅ TypeScript
- ✅ TailwindCSS
- ✅ API Routes

### Интеграции:
- ✅ AI провайдеры (GROQ, DeepSeek, OpenRouter)
- ✅ Yandex Maps API
- ✅ Yandex Weather API
- ✅ PostgreSQL
- ✅ Платёжные системы

**lib/config.ts универсальный!** Работает на любой платформе!

---

## 🚀 ОБНОВЛЁННЫЙ СКРИПТ ДЕПЛОЯ

**Файл:** `auto-deploy-kamchatour.sh` (обновлён)

**Теперь использует:**
- ✅ `ecosystem.config.js` вместо простого `npm start`
- ✅ Cluster mode (2 процесса)
- ✅ Логи в `./logs/`
- ✅ Auto-restart при падении

---

## 📋 МИГРАЦИЯ С VERCEL НА TIMEWEB

### Если у вас уже работает на Vercel:

**1. Экспортируйте данные из Vercel Postgres:**
```bash
# Локально
pg_dump $VERCEL_DATABASE_URL > backup.sql
```

**2. Импортируйте в Timeweb PostgreSQL:**
```bash
psql $TIMEWEB_DATABASE_URL < backup.sql
```

**3. Обновите DNS:**
```
A    kamchatour.ru    45.8.96.120
```

**4. Настройте SSL на Timeweb:**
```bash
certbot --nginx -d kamchatour.ru
```

---

## 🔍 ЧТО ЕЩЁ ПРОВЕРИТЬ

Ищу другие зависимости от платформы:

<function_calls>
<invoke name="Grep">
<parameter name="pattern">process\.env\.VERCEL