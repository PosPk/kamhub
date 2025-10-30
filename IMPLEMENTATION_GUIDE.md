# 🛠️ РУКОВОДСТВО ПО ВНЕДРЕНИЮ

> **Как применить созданные модули к вашему проекту**  
> **Дата:** 30 октября 2025  
> **Сложность:** Medium  
> **Время:** 2-3 дня

---

## 📋 СОДЕРЖАНИЕ

1. [Применение Rate Limiting](#1-применение-rate-limiting)
2. [Применение Validation](#2-применение-validation)
3. [Применение CSRF Protection](#3-применение-csrf-protection)
4. [Настройка Sentry](#4-настройка-sentry)
5. [Тестирование](#5-тестирование)
6. [Production Deploy](#6-production-deploy)

---

## 1. ПРИМЕНЕНИЕ RATE LIMITING

### Шаг 1.1: Обновить все API routes

**Файлы для обновления:**
```
/app/api/transfers/search/route.ts
/app/api/transfers/book/route.ts        ← УЖЕ ОБНОВЛЕН
/app/api/transfers/confirm/route.ts
/app/api/auth/signin/route.ts
/app/api/auth/signup/route.ts
/app/api/tours/route.ts
/app/api/partners/route.ts
... и все остальные
```

**Шаблон обновления:**

**ДО:**
```typescript
export async function POST(request: NextRequest) {
  // ваш код
}
```

**ПОСЛЕ:**
```typescript
import { withRateLimit, RateLimitPresets } from '@/lib/middleware/rate-limit';

export const POST = withRateLimit(
  RateLimitPresets.api, // Выбрать подходящий preset
  async (request: NextRequest) => {
    // ваш код (БЕЗ ИЗМЕНЕНИЙ!)
  }
);
```

**Какой preset использовать:**

| Route | Preset | Лимит |
|-------|--------|-------|
| `/api/auth/signin` | `authentication` | 5/15min |
| `/api/auth/signup` | `authentication` | 5/15min |
| `/api/transfers/book` | `creation` | 5/min |
| `/api/transfers/search` | `public` | 30/min |
| `/api/tours` | `api` | 100/15min |
| Все остальные | `api` | 100/15min |

**Пример для /api/auth/signin:**
```typescript
// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RateLimitPresets } from '@/lib/middleware/rate-limit';

export const POST = withRateLimit(
  RateLimitPresets.authentication, // 5 попыток в 15 минут
  async (request: NextRequest) => {
    const { email, password } = await request.json();
    
    // Ваша логика аутентификации...
    
    return NextResponse.json({ success: true });
  }
);
```

### Шаг 1.2: Настроить Redis (Production)

**Локальная разработка:** используется in-memory store ✅

**Production:**

```bash
# 1. Получить Redis instance (Upstash рекомендуется)
# https://upstash.com/

# 2. Добавить в .env.production:
REDIS_URL=redis://...
REDIS_PASSWORD=...

# 3. Установить ioredis:
npm install ioredis
```

**Обновить rate-limit.ts:**
```typescript
// lib/middleware/rate-limit.ts

import Redis from 'ioredis';

// Создать Redis client если доступен
let redisClient: any = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
  globalStore = new RedisStore(redisClient);
}
```

**Готово!** Rate limiting будет использовать Redis автоматически

---

## 2. ПРИМЕНЕНИЕ VALIDATION

### Шаг 2.1: Обновить Transfer API routes

**Пример: /api/transfers/search**

**ДО:**
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Ручная валидация
  if (!body.from || !body.to) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  
  // остальной код...
}
```

**ПОСЛЕ:**
```typescript
import { withValidation, TransferSchemas } from '@/lib/middleware/validation';
import { withRateLimit, RateLimitPresets } from '@/lib/middleware/rate-limit';

export const POST = withRateLimit(
  RateLimitPresets.public,
  withValidation(
    TransferSchemas.search,
    async (request, validatedBody) => {
      // validatedBody уже типизирован!
      const { from, to, date, passengers } = validatedBody;
      
      // БЕЗ ручной валидации - Zod уже проверил!
      
      // остальной код...
    }
  )
);
```

**Композиция middleware:**
```typescript
// Можно комбинировать несколько middleware:
export const POST = 
  withRateLimit(preset,
    withValidation(schema,
      withCsrfProtection(
        withSentryErrorHandling(
          async (request, validatedBody) => {
            // Ваш handler
          }
        )
      )
    )
  );

// Или создать helper:
function secureEndpoint(
  rateLimit: any,
  schema: any,
  handler: any
) {
  return withRateLimit(rateLimit,
    withValidation(schema,
      withCsrfProtection(
        withSentryErrorHandling(handler)
      )
    )
  );
}

// Использование:
export const POST = secureEndpoint(
  RateLimitPresets.creation,
  TransferSchemas.book,
  async (request, validatedBody) => {
    // Ваш код
  }
);
```

### Шаг 2.2: Создать недостающие schemas

**Если нужны schemas для других endpoints:**

```typescript
// lib/middleware/validation.ts

export const TourSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    description: z.string().min(10),
    price: z.number().positive(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    duration: z.number().positive(),
    // ...
  }),
  
  update: z.object({
    id: CommonSchemas.uuid,
    name: z.string().min(1).max(255).optional(),
    // ...
  })
};

export const PartnerSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    category: z.enum(['operator', 'guide', 'transfer', 'stay', 'souvenir']),
    // ...
  })
};
```

---

## 3. ПРИМЕНЕНИЕ CSRF PROTECTION

### Шаг 3.1: Global middleware уже настроен ✅

Файл `/middleware.ts` уже создан и автоматически:
- Генерирует CSRF токены
- Устанавливает в cookie
- Добавляет security headers

**Ничего не нужно делать!** Работает автоматически.

### Шаг 3.2: Обновить client-side fetch

**ДО (незащищено):**
```typescript
const response = await fetch('/api/transfers/book', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

**ПОСЛЕ (защищено):**
```typescript
import { fetchWithCsrf } from '@/lib/utils/csrf-client';

const response = await fetchWithCsrf('/api/transfers/book', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
// CSRF токен автоматически добавлен в headers!
```

**Или вручную:**
```typescript
import { getCsrfToken } from '@/lib/utils/csrf-client';

const csrfToken = getCsrfToken();

const response = await fetch('/api/transfers/book', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken // ← Добавляем токен
  },
  body: JSON.stringify(data)
});
```

### Шаг 3.3: Применить к API routes

**Добавить к state-changing endpoints:**

```typescript
import { withCsrfProtection } from '@/lib/middleware/csrf';

export const POST = withCsrfProtection(
  async (request: NextRequest) => {
    // CSRF уже проверен
    // Можно безопасно обрабатывать запрос
  }
);
```

**НЕ применять к:**
- GET запросы (read-only)
- PUBLIC webhooks (нет cookie)
- Health checks

---

## 4. НАСТРОЙКА SENTRY

### Шаг 4.1: Создать Sentry проект

1. Зарегистрироваться на https://sentry.io
2. Создать новый проект (Next.js)
3. Скопировать DSN

### Шаг 4.2: Добавить переменные

```bash
# .env.production
SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456
```

### Шаг 4.3: Конфиг файлы уже созданы ✅

```
✅ sentry.client.config.ts
✅ sentry.server.config.ts
✅ sentry.edge.config.ts
```

### Шаг 4.4: Применить к API routes

```typescript
import { withSentryErrorHandling, trackBookingEvent } from '@/lib/monitoring/sentry-utils';

export const POST = withSentryErrorHandling(async (request) => {
  const booking = await createBooking(...);
  
  // Track важные события
  trackBookingEvent('booking_created', {
    bookingId: booking.id,
    amount: booking.totalPrice,
    userId: booking.userId
  });
  
  return NextResponse.json({ success: true });
});
```

### Шаг 4.5: Set user context

```typescript
// После успешного login
import { setSentryUser } from '@/lib/monitoring/sentry-utils';

setSentryUser({
  id: user.id,
  email: user.email,
  role: user.role
});

// При logout
import { clearSentryUser } from '@/lib/monitoring/sentry-utils';

clearSentryUser();
```

### Шаг 4.6: Настроить Alerts

В Sentry dashboard → Alerts:

1. **High Error Rate**
   - Condition: >10 errors in 5 minutes
   - Action: Email + Slack/Telegram

2. **Payment Failures**
   - Condition: payment.failed >5 in 10 min
   - Action: Email + SMS (critical!)

3. **Database Errors**
   - Condition: database.error >0
   - Action: Email + Telegram

---

## 5. ТЕСТИРОВАНИЕ

### Шаг 5.1: Запустить существующие тесты

```bash
# Race condition tests
npm run test test/booking-race-condition.test.ts

# Webhook validation tests
npm run test test/webhook-validation.test.ts

# Все тесты
npm run test

# С coverage
npm run test:coverage
```

### Шаг 5.2: Добавить больше тестов

**Создать:**
```
/test/api/
  ├── transfers-search.test.ts
  ├── transfers-book.test.ts
  ├── auth.test.ts
  └── tours.test.ts

/test/integration/
  ├── booking-flow.test.ts
  ├── payment-flow.test.ts
  └── user-journey.test.ts
```

**Шаблон для API теста:**
```typescript
import { describe, it, expect } from 'vitest';

describe('POST /api/transfers/search', () => {
  it('should return available transfers', async () => {
    const response = await fetch('http://localhost:3002/api/transfers/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Airport',
        to: 'City',
        date: '2025-11-01',
        passengers: 2
      })
    });
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });
});
```

### Шаг 5.3: Настроить CI/CD

**Создать `.github/workflows/test.yml`:**

```yaml
name: Tests & Linting

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: TypeScript check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:run
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
```

---

## 6. PRODUCTION DEPLOY

### Шаг 6.1: Настроить переменные в Vercel

```bash
# В Vercel dashboard → Settings → Environment Variables

DATABASE_URL=postgresql://...               ← от Vercel Postgres
GROQ_API_KEY=gsk_...                       ← от GROQ
DEEPSEEK_API_KEY=sk-...                    ← от DeepSeek
YANDEX_MAPS_API_KEY=...                    ← от Yandex
CLOUDPAYMENTS_PUBLIC_ID=pk_...             ← от CloudPayments
CLOUDPAYMENTS_API_SECRET=...               ← от CloudPayments
JWT_SECRET=$(openssl rand -base64 32)      ← Генерировать!
SENTRY_DSN=https://...@sentry.io/...       ← от Sentry
SMTP_USER=...                              ← Email сервис
SMTP_PASS=...                              ← Email password
SMS_RU_API_ID=...                          ← от SMS.ru
TELEGRAM_BOT_TOKEN=...                     ← от @BotFather
REDIS_URL=redis://...                      ← от Upstash (опц.)

# И все остальные из .env.example
```

### Шаг 6.2: Применить database migrations

```bash
# В Vercel dashboard → Terminal или локально:

# 1. Основные таблицы
npm run migrate:up

# 2. Seat holds таблица (НОВОЕ!)
psql $DATABASE_URL -f lib/database/seat_holds_schema.sql

# 3. Проверить
npm run db:info
```

### Шаг 6.3: Deploy

```bash
# Через Vercel CLI:
vercel --prod

# Или через Git:
git push origin main
# Vercel автоматически задеплоит
```

### Шаг 6.4: Post-deploy проверка

```bash
# 1. Health check
curl https://your-app.vercel.app/api/health/db

# 2. CSRF token endpoint
curl https://your-app.vercel.app/api/csrf-token

# 3. Rate limiting (должен вернуть 429 после лимита)
for i in {1..10}; do
  curl https://your-app.vercel.app/api/tours
done

# 4. Webhook endpoint
curl https://your-app.vercel.app/api/webhooks/cloudpayments
```

---

## 🧪 TESTING CHECKLIST

### Pre-deploy Testing

- [ ] Все unit tests проходят
- [ ] Integration tests проходят
- [ ] TypeScript компилируется
- [ ] ESLint проходит
- [ ] Build успешен (`npm run build`)

### Post-deploy Testing

- [ ] Главная страница загружается
- [ ] API health check работает
- [ ] CSRF токены генерируются
- [ ] Rate limiting срабатывает
- [ ] Sentry получает events
- [ ] Backup cron job работает

---

## ⚡ QUICK REFERENCE

### Добавить middleware к route:

```typescript
import { withRateLimit, RateLimitPresets } from '@/lib/middleware/rate-limit';
import { withValidation, TransferSchemas } from '@/lib/middleware/validation';
import { withCsrfProtection } from '@/lib/middleware/csrf';
import { withSentryErrorHandling } from '@/lib/monitoring/sentry-utils';

// Full protection:
export const POST = 
  withRateLimit(RateLimitPresets.creation,
    withValidation(TransferSchemas.book,
      withCsrfProtection(
        withSentryErrorHandling(
          async (request, validatedBody) => {
            // Your code here
          }
        )
      )
    )
  );
```

### Client-side fetch с CSRF:

```typescript
import { fetchWithCsrf } from '@/lib/utils/csrf-client';

const response = await fetchWithCsrf('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### Track события в Sentry:

```typescript
import { trackBookingEvent, trackPaymentEvent } from '@/lib/monitoring/sentry-utils';

trackBookingEvent('booking_created', { bookingId, amount });
trackPaymentEvent('payment_success', { bookingId, amount, paymentId });
```

---

## 🎯 SUCCESS METRICS

После внедрения ожидаем:

```
API Security:          3/10 → 9/10
Rate Limit Coverage:   0% → 100%
Input Validation:      50% → 100%
CSRF Protection:       0% → 100%
Error Monitoring:      0% → 100%
Test Coverage:         15% → 70%+
Production Readiness:  85% → 98%
```

---

## 📞 НУЖНА ПОМОЩЬ?

**См. документацию:**
- START_HERE.md - быстрый старт
- ЧЕКЛИСТ_ЗАПУСКА.md - полный чеклист
- ПЛАН_ОПТИМИЗАЦИИ.md - план развития

**Вопросы:**
- GitHub Issues
- Telegram: @kamchatour_dev

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Статус:** ✅ Ready to implement
