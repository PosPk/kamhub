# 🗺️ ROADMAP И СПИСОК ЗАДАЧ

**Быстрый старт для немедленного начала работы**

---

## 📅 ВИЗУАЛЬНЫЙ ROADMAP

```
НЕДЕЛЯ 1-2: БЕЗОПАСНОСТЬ И ОСНОВА
┌─────────────────────────────────────────┐
│ ✅ CSRF защита                          │
│ ✅ Rate Limiting                        │
│ ✅ JWT аутентификация                   │
│ ✅ Logger (убрать console.log)          │
└─────────────────────────────────────────┘

НЕДЕЛЯ 2-3: ДИЗАЙН И UX
┌─────────────────────────────────────────┐
│ ✅ Sidebar Navigation                   │
│ ✅ Упрощение главной                    │
│ ✅ Отдельные страницы                   │
│ ✅ Slide-over компоненты                │
└─────────────────────────────────────────┘

НЕДЕЛЯ 3-4: ПРОИЗВОДИТЕЛЬНОСТЬ
┌─────────────────────────────────────────┐
│ ✅ Исправить N+1 запросы                │
│ ✅ Redis кэширование                   │
│ ✅ Пагинация везде                      │
└─────────────────────────────────────────┘

НЕДЕЛЯ 4-5: АРХИТЕКТУРА (опционально)
┌─────────────────────────────────────────┐
│ ⚪ Service Layer                        │
│ ⚪ Repository Pattern                   │
└─────────────────────────────────────────┘

НЕДЕЛЯ 5-6: ТЕСТИРОВАНИЕ
┌─────────────────────────────────────────┐
│ ✅ Unit тесты (критические модули)      │
│ ✅ Integration тесты (API)              │
│ ✅ Покрытие до 80%+                     │
└─────────────────────────────────────────┘

НЕДЕЛЯ 6-7: ПОЛИРОВКА
┌─────────────────────────────────────────┐
│ ⚪ Command Palette (⌘K)                 │
│ ⚪ Анимации                             │
│ ⚪ Мобильная оптимизация                │
└─────────────────────────────────────────┘
```

---

## 🎯 ЧТО ДЕЛАТЬ СЕЙЧАС (Первый день)

### ✅ Задача 1: Создать Logger (1 час)

**Файл:** `lib/logger.ts`

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(`[INFO] ${message}`, context || '');
  }

  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorInfo = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    
    console.error(`[ERROR] ${message}`, {
      ...context,
      error: errorInfo,
    });

    // TODO: Отправка в Sentry в production
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { extra: context });
    // }
  }
}

export const logger = new Logger();
```

**Использование:**
```typescript
// Вместо:
console.log('Transfer search', { from, to });

// Использовать:
logger.info('Transfer search', { from, to });
```

---

### ✅ Задача 2: Заменить console.log (2 часа)

**Команда для поиска:**
```bash
grep -r "console\." app/ lib/ components/ | wc -l
# Найдено: 58+ вхождений
```

**Приоритетные файлы:**
1. `app/api/transfers/book/route.ts` - 4 console.log
2. `app/api/transfers/search/route.ts` - 3 console.log
3. `app/api/chat/route.ts` - 5 console.log
4. `app/api/webhooks/cloudpayments/route.ts` - 6 console.log
5. `lib/transfers/booking.ts` - 2 console.log

**Шаги:**
1. Импортировать logger в каждый файл
2. Заменить console.log → logger.info
3. Заменить console.error → logger.error
4. Заменить console.warn → logger.warn
5. Заменить console.debug → logger.debug

---

### ✅ Задача 3: CSRF Wrapper для клиента (30 мин)

**Файл:** `lib/utils/csrf-client.ts`

```typescript
// Получение CSRF токена из cookie
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

// Получение токена (с запросом если нет)
export async function ensureCsrfToken(): Promise<string> {
  let token = getCsrfToken();
  
  if (!token) {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    token = data.token;
  }
  
  return token;
}

// Обертка для fetch с CSRF
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await ensureCsrfToken();
  
  const headers = new Headers(options.headers);
  headers.set('X-CSRF-Token', token);
  headers.set('Content-Type', 'application/json');
  
  return fetch(url, {
    ...options,
    headers,
  });
}
```

**Использование:**
```typescript
// Вместо:
fetch('/api/transfers/book', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Использовать:
fetchWithCsrf('/api/transfers/book', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

---

### ✅ Задача 4: Применить CSRF к критичным routes (2 часа)

**Файлы:**
1. `app/api/transfers/book/route.ts`
2. `app/api/auth/signin/route.ts`
3. `app/api/auth/signup/route.ts`
4. `app/api/tours/route.ts` (POST, PUT, DELETE)

**Шаблон изменения:**
```typescript
// БЫЛО:
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Handler код
}

// СТАЛО:
import { NextRequest, NextResponse } from 'next/server';
import { withCsrfProtection } from '@/lib/middleware/csrf';

async function handler(request: NextRequest) {
  // Handler код (CSRF уже проверен)
}

export const POST = withCsrfProtection(handler);
```

---

## 📋 TODO СПИСОК (Первая неделя)

### День 1 (Сегодня)
- [ ] ✅ Создать `lib/logger.ts`
- [ ] ✅ Заменить console.log в 5 приоритетных файлах
- [ ] ✅ Создать `lib/utils/csrf-client.ts`
- [ ] ✅ Применить CSRF к 3 критичным routes

### День 2
- [ ] ✅ Применить CSRF к остальным routes (7 файлов)
- [ ] ✅ Начать JWT аутентификацию (`lib/auth/jwt.ts`)
- [ ] ✅ Создать `withAuth` middleware

### День 3
- [ ] ✅ Завершить JWT аутентификацию
- [ ] ✅ Обновить все API routes для использования JWT (10+ файлов)
- [ ] ✅ Обновить фронтенд для отправки токенов

### День 4
- [ ] ✅ Применить Rate Limiting к всем API routes
- [ ] ✅ Завершить замену console.log (остальные файлы)
- [ ] ✅ Протестировать все изменения

### День 5
- [ ] ✅ Ревью кода
- [ ] ✅ Исправление найденных проблем
- [ ] ✅ Завершение Фазы 1

---

## 🎯 БЫСТРЫЙ СТАРТ (Прямо сейчас)

### Шаг 1: Создать logger (5 минут)
```bash
# Создать файл
touch lib/logger.ts

# Скопировать код из задачи выше
# Импортировать в один файл и протестировать
```

### Шаг 2: Заменить в одном файле (10 минут)
```bash
# Открыть app/api/transfers/book/route.ts
# Заменить все console.log/error на logger.info/error
# Импортировать logger
# Протестировать
```

### Шаг 3: CSRF wrapper (15 минут)
```bash
# Создать lib/utils/csrf-client.ts
# Скопировать код из задачи выше
# Использовать в одном компоненте
```

### Шаг 4: Применить CSRF (20 минут)
```bash
# Обновить app/api/transfers/book/route.ts
# Использовать withCsrfProtection
# Протестировать
```

**Итого за 50 минут:** 
- ✅ Logger готов
- ✅ Один файл очищен
- ✅ CSRF wrapper создан
- ✅ CSRF применен к критичному route

---

## 📊 ПРОГРЕСС ТРЕКЕР

### Фаза 1: Безопасность
- [ ] 1.1 CSRF защита (0/10 routes)
- [ ] 1.2 Rate Limiting (0/25 endpoints)
- [ ] 1.3 JWT аутентификация (0%)
- [ ] 1.4 Logger (0/58 console.log)

### Фаза 2: Дизайн
- [ ] 2.1 Sidebar Navigation (0%)
- [ ] 2.2 Упрощение главной (0%)
- [ ] 2.3 Отдельные страницы (0%)
- [ ] 2.4 Slide-over (0%)

### Фаза 3: Производительность
- [ ] 3.1 N+1 запросы (0/5 проблем)
- [ ] 3.2 Кэширование (0%)
- [ ] 3.3 Пагинация (0/10 endpoints)

### Фаза 4: Архитектура
- [ ] 4.1 Service Layer (0%)
- [ ] 4.2 Repository Pattern (0%)

### Фаза 5: Тестирование
- [ ] 5.1 Unit тесты (0%)
- [ ] 5.2 Integration тесты (0%)

### Фаза 6: Полировка
- [ ] 6.1 Command Palette (0%)
- [ ] 6.2 Анимации (0%)
- [ ] 6.3 Мобильная оптимизация (0%)

---

## 🚀 КОМАНДЫ ДЛЯ БЫСТРОГО СТАРТА

### Создать все базовые файлы сразу:
```bash
# Logger
touch lib/logger.ts

# CSRF Client
touch lib/utils/csrf-client.ts

# Auth
mkdir -p lib/auth
touch lib/auth/jwt.ts
touch lib/auth/middleware.ts
touch lib/auth/utils.ts

# Cache
mkdir -p lib/cache
touch lib/cache/redis.ts
touch lib/cache/memory.ts

# Layout
mkdir -p components/Layout
touch components/Layout/AppLayout.tsx
touch components/Layout/Sidebar.tsx
touch components/Layout/Header.tsx
touch components/Layout/MobileNav.tsx

# Services (позже)
mkdir -p lib/services
```

### Найти все проблемы:
```bash
# Найти все console.log
grep -r "console\." app/ lib/ components/

# Найти все TODO
grep -r "TODO" app/ lib/

# Найти все routes без CSRF
grep -r "export.*POST\|export.*PUT\|export.*DELETE" app/api/ --files-without-match "withCsrf"

# Найти все routes без Rate Limiting
grep -r "export.*GET\|export.*POST" app/api/ --files-without-match "withRateLimit"
```

---

## 💡 СОВЕТЫ ПО РЕАЛИЗАЦИИ

### 1. Работать маленькими шагами
- Не пытаться сделать все сразу
- Закончить одну задачу → протестировать → коммит

### 2. Тестировать после каждого изменения
- Не накапливать изменения без тестирования
- Легче найти баги в маленьких изменениях

### 3. Коммитить часто
```bash
# Хороший паттерн:
git add lib/logger.ts
git commit -m "feat: add logger utility"

git add app/api/transfers/book/route.ts
git commit -m "fix: apply CSRF protection to transfer booking"
```

### 4. Создавать PR для ревью
- Даже если работаешь один
- Создавать PR для каждой фазы
- Документировать изменения

---

## 🎯 ЦЕЛИ НА ПЕРВУЮ НЕДЕЛЮ

### Минимальная цель:
- ✅ Logger создан и используется
- ✅ CSRF защита на критичных routes
- ✅ Rate Limiting на 5 основных endpoints
- ✅ JWT аутентификация работает (базовая)

### Хорошая цель:
- ✅ Все из минимальной цели
- ✅ CSRF защита везде
- ✅ Rate Limiting везде
- ✅ console.log убран из всех файлов

### Отличная цель:
- ✅ Все из хорошей цели
- ✅ Начата работа над Sidebar
- ✅ JWT полностью интегрирован

---

## ❓ ВОПРОСЫ ПЕРЕД НАЧАЛОМ

1. **С чего начать?**
   - Рекомендую: Logger → CSRF → Rate Limiting
   - Или можно параллельно: Logger + CSRF wrapper

2. **Что делать если что-то не работает?**
   - Проверить консоль браузера
   - Проверить логи сервера
   - Использовать logger для отладки

3. **Как тестировать изменения?**
   - Запустить `npm run dev`
   - Проверить в браузере
   - Протестировать основные сценарии

---

**ГОТОВ К НАЧАЛУ! 🚀**

Выбери задачу и начнем!
