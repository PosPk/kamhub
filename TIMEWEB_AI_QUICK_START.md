# 🚀 TIMEWEB CLOUD AI - БЫСТРЫЙ СТАРТ

**Агент:** https://timeweb.cloud/my/cloud-ai/agents/12805/

---

## ✅ ЧТО УЖЕ ГОТОВО

✅ **Клиент для Timeweb AI** → `lib/timeweb-ai/client.ts`  
✅ **API endpoint** → `app/api/ai/timeweb-ai/route.ts`  
✅ **Переменные окружения** → `.env.timeweb-ai`  
✅ **Документация** → `TIMEWEB_CLOUD_AI_INTEGRATION.md`  

---

## 🔧 3 ШАГА ДО ЗАПУСКА

### ШАГ 1: Получите API ключ

1. Откройте: https://timeweb.cloud/my/cloud-ai/agents/12805/
2. Найдите раздел **"API"** или **"Settings"** или **"Integration"**
3. Скопируйте API ключ

**Если не нашли:**
- Напишите в поддержку: support@timeweb.ru
- Тема: "Как получить API ключ для Cloud AI агента 12805"

---

### ШАГ 2: Добавьте переменные

#### **Локально (.env.local):**
```bash
echo "TIMEWEB_AI_KEY=ваш_api_ключ" >> .env.local
```

#### **В Timeweb Cloud Apps:**
1. Откройте: https://timeweb.cloud/my/apps
2. Выберите ваше приложение
3. Settings → Environment Variables → Add
4. Добавьте:
   ```
   TIMEWEB_AI_KEY = ваш_api_ключ
   ```

---

### ШАГ 3: Протестируйте

#### **Тест 1: API endpoint**
```bash
# Локально
curl -X POST http://localhost:3000/api/ai/timeweb-ai \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет! Расскажи о турах на Камчатке"}'

# На проде
curl -X POST https://your-app.timeweb.cloud/api/ai/timeweb-ai \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет! Расскажи о турах на Камчатке"}'
```

**Ожидаемый ответ:**
```json
{
  "ok": true,
  "answer": "На Камчатке доступны различные туры...",
  "conversationId": "conv_xxx",
  "meta": {
    "agentId": "12805",
    "model": "...",
    "tokensUsed": 123,
    "responseTime": 456
  }
}
```

#### **Тест 2: В браузере**
```typescript
// Откройте консоль браузера на вашем сайте
const response = await fetch('/api/ai/timeweb-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: 'Посоветуй тур на 2 дня' 
  })
});

const data = await response.json();
console.log(data);
```

---

## 🎨 ИНТЕГРАЦИЯ В КОМПОНЕНТЫ

### **AIChatWidget.tsx** (Чат на сайте)

**Найдите строку:**
```typescript
const response = await fetch('/api/ai', { ... })
```

**Замените на:**
```typescript
const response = await fetch('/api/ai/timeweb-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    conversationId: chatHistory.id  // Сохраняет контекст
  })
});

const data = await response.json();

if (data.ok) {
  setMessages([...messages, {
    role: 'assistant',
    content: data.answer,
    timestamp: new Date()
  }]);
  
  // Сохраняем conversation ID для следующих сообщений
  if (data.conversationId) {
    setChatHistory({ id: data.conversationId });
  }
}
```

---

### **Прямое использование клиента**

```typescript
// В любом server-side файле (API routes, Server Actions)
import { timewebAI, AGENTS } from '@/lib/timeweb-ai/client';

// Простой запрос
const result = await timewebAI.chat({
  agentId: AGENTS.GUIDE,
  message: 'Какие вулканы посетить?'
});

console.log(result.response);

// С сохранением контекста
const conversationId = 'conv_123';  // из предыдущего ответа

const result2 = await timewebAI.chat({
  agentId: AGENTS.GUIDE,
  message: 'А какой из них самый высокий?',
  conversationId  // Агент помнит предыдущий вопрос!
});
```

---

## 🤖 ИСПОЛЬЗОВАНИЕ АГЕНТОВ

### **Агент #12805 - Гид по Камчатке**

```typescript
import { timewebAI, AGENTS } from '@/lib/timeweb-ai/client';

// Подбор туров
const tourAdvice = await timewebAI.chat({
  agentId: AGENTS.GUIDE,
  message: `Подбери тур на 3 дня.
    Бюджет: 50000 RUB
    Интересы: вулканы, термальные источники
    Даты: 15-18 сентября`
});

// Информация о местах
const placeInfo = await timewebAI.chat({
  agentId: AGENTS.GUIDE,
  message: 'Расскажи про Долину Гейзеров'
});

// Советы по сезонности
const seasonAdvice = await timewebAI.chat({
  agentId: AGENTS.GUIDE,
  message: 'Когда лучше ехать на Камчатку для рыбалки?'
});
```

---

### **Создайте дополнительных агентов**

**В панели Timeweb Cloud AI:**

#### **Агент #12806 - Трансферы**
```
System Prompt:
Ты - помощник по расчёту трансферов на Камчатке.
- Знаешь расстояния между городами и достопримечательностями
- Рассчитываешь примерную стоимость и время в пути
- Рекомендуешь оптимальные маршруты
```

```typescript
const transferInfo = await timewebAI.chat({
  agentId: AGENTS.TRANSFERS,  // 12806
  message: 'Сколько стоит трансфер из аэропорта до отеля "Камчатка"?'
});
```

#### **Агент #12807 - Программа лояльности**
```
System Prompt:
Ты - эксперт по программе лояльности KamchaTour Hub.
- Объясняешь правила начисления бонусов
- Помогаешь с вопросами о статусах (Бронза, Серебро, Золото)
- Рассказываешь про акции и специальные предложения
```

```typescript
const loyaltyInfo = await timewebAI.chat({
  agentId: AGENTS.LOYALTY,  // 12807
  message: 'Как получить статус "Золото"?'
});
```

#### **Агент #12808 - Поддержка**
```
System Prompt:
Ты - агент поддержки KamchaTour Hub.
- Отвечаешь на вопросы о бронировании, оплате, отмене
- Помогаешь с техническими проблемами на сайте
- Направляешь к менеджеру, если не можешь решить вопрос
```

```typescript
const supportInfo = await timewebAI.chat({
  agentId: AGENTS.SUPPORT,  // 12808
  message: 'Как отменить бронирование?'
});
```

---

## 📊 МОНИТОРИНГ

### **Создайте таблицу для логов**

```sql
-- lib/database/migrations/add_ai_logs.sql
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id BIGSERIAL PRIMARY KEY,
  agent_id VARCHAR(50) NOT NULL,
  user_id UUID,
  message TEXT,
  response TEXT,
  tokens_used INTEGER,
  response_time INTEGER,  -- milliseconds
  conversation_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_created ON ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_logs_agent ON ai_usage_logs(agent_id);
CREATE INDEX idx_ai_logs_user ON ai_usage_logs(user_id);
```

### **Логируйте запросы**

```typescript
// app/api/ai/timeweb-ai/route.ts
import { db } from '@/lib/database';

// После успешного ответа
await db.query(`
  INSERT INTO ai_usage_logs 
  (agent_id, user_id, message, response, tokens_used, response_time, conversation_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
`, [
  agentId,
  userId || null,
  message.slice(0, 500),
  result.response.slice(0, 1000),
  result.tokensUsed,
  responseTime,
  result.conversationId
]);
```

### **Анализируйте использование**

```sql
-- Запросы за последние 7 дней
SELECT 
  DATE(created_at) as date,
  agent_id,
  COUNT(*) as requests,
  AVG(response_time) as avg_time_ms,
  SUM(tokens_used) as total_tokens
FROM ai_usage_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), agent_id
ORDER BY date DESC;

-- Популярные темы
SELECT 
  LEFT(message, 50) as topic,
  COUNT(*) as frequency
FROM ai_usage_logs
GROUP BY LEFT(message, 50)
ORDER BY frequency DESC
LIMIT 20;
```

---

## 💰 ОПТИМИЗАЦИЯ СТОИМОСТИ

### **Кэширование частых ответов**

```typescript
// lib/timeweb-ai/cache.ts
import { cache } from '@/lib/cache';

export async function getCachedAIResponse(
  agentId: string, 
  message: string
): Promise<string | null> {
  const cacheKey = `ai:${agentId}:${hashString(message)}`;
  return await cache.get(cacheKey);
}

export async function setCachedAIResponse(
  agentId: string,
  message: string,
  response: string,
  ttl: number = 3600  // 1 час
) {
  const cacheKey = `ai:${agentId}:${hashString(message)}`;
  await cache.set(cacheKey, response, ttl);
}
```

**Использование:**
```typescript
// app/api/ai/timeweb-ai/route.ts

// Проверяем кэш для частых вопросов
const cached = await getCachedAIResponse(agentId, message);
if (cached) {
  return NextResponse.json({
    ok: true,
    answer: cached,
    cached: true
  });
}

// Запрос к AI
const result = await timewebAI.chat({ agentId, message });

// Сохраняем в кэш
await setCachedAIResponse(agentId, message, result.response);
```

---

## ⚠️ FALLBACK НА GROQ

**Если Timeweb AI недоступен:**

```typescript
// app/api/ai/timeweb-ai/route.ts

try {
  // Пробуем Timeweb AI
  const result = await timewebAI.chat({ agentId, message });
  return NextResponse.json({ ok: true, answer: result.response });
  
} catch (error) {
  console.error('Timeweb AI failed, trying Groq...', error);
  
  // Fallback на Groq
  try {
    const groqResult = await callGroq(message);
    return NextResponse.json({ 
      ok: true, 
      answer: groqResult,
      fallback: 'groq' 
    });
  } catch (groqError) {
    // Fallback на статичный ответ
    return NextResponse.json({
      ok: true,
      answer: 'Извините, сервис временно недоступен. Пожалуйста, напишите нам на support@kamchatour.ru',
      fallback: 'static'
    });
  }
}
```

---

## 🎓 РАСШИРЕННЫЕ ПРИМЕРЫ

### **1. Подбор туров с AI + БД**

```typescript
// app/api/tours/ai-suggest/route.ts
import { timewebAI, AGENTS } from '@/lib/timeweb-ai/client';
import { db } from '@/lib/database';

export async function POST(req: NextRequest) {
  const { preferences, budget, dates } = await req.json();
  
  // 1. Спрашиваем AI
  const aiResult = await timewebAI.chat({
    agentId: AGENTS.GUIDE,
    message: `Подбери 3 тура по параметрам:
      Бюджет: ${budget} RUB
      Даты: ${dates.start} - ${dates.end}
      Интересы: ${preferences.join(', ')}
      
      Верни только ID туров в формате: [1, 5, 12]`
  });
  
  // 2. Извлекаем ID
  const tourIds = extractIdsFromResponse(aiResult.response);
  
  // 3. Загружаем из БД
  const tours = await db.query(`
    SELECT * FROM tours 
    WHERE id = ANY($1) AND is_active = true
    ORDER BY price ASC
  `, [tourIds]);
  
  return NextResponse.json({
    aiRecommendation: aiResult.response,
    tours: tours.rows
  });
}
```

### **2. Генерация описаний туров**

```typescript
// app/api/tours/[id]/generate-description/route.ts
import { timewebAI, AGENTS } from '@/lib/timeweb-ai/client';

export async function POST(req: NextRequest, { params }) {
  const tourId = params.id;
  
  // Загружаем тур из БД
  const tour = await db.query('SELECT * FROM tours WHERE id = $1', [tourId]);
  const tourData = tour.rows[0];
  
  // Генерируем описание
  const result = await timewebAI.chat({
    agentId: AGENTS.GUIDE,
    message: `Создай SEO-оптимизированное описание тура:
      Название: ${tourData.title}
      Маршрут: ${tourData.route}
      Длительность: ${tourData.duration} дней
      Особенности: ${tourData.highlights}
      
      Требования:
      - 150-200 слов
      - Эмоциональный стиль
      - Включи ключевые слова: Камчатка, ${tourData.title}
      - Призыв к действию в конце`
  });
  
  // Сохраняем в БД
  await db.query(
    'UPDATE tours SET description = $1, updated_at = NOW() WHERE id = $2',
    [result.response, tourId]
  );
  
  return NextResponse.json({
    ok: true,
    description: result.response
  });
}
```

### **3. Email автоответчик**

```typescript
// app/api/support/auto-reply/route.ts
import { timewebAI, AGENTS } from '@/lib/timeweb-ai/client';

export async function POST(req: NextRequest) {
  const { customerEmail, customerMessage } = await req.json();
  
  // Генерируем ответ
  const result = await timewebAI.chat({
    agentId: AGENTS.SUPPORT,
    message: `Клиент написал:
      "${customerMessage}"
      
      Составь профессиональный ответ:
      - Вежливый тон
      - Конкретная информация
      - Если нужно уточнение - попроси
      - Если нужен менеджер - предложи связаться`
  });
  
  // Отправляем email
  await sendEmail({
    to: customerEmail,
    subject: 'Re: Ваш вопрос в KamchaTour Hub',
    html: `
      <p>Здравствуйте!</p>
      <p>${result.response}</p>
      <p>С уважением,<br>Команда KamchaTour Hub</p>
    `
  });
  
  return NextResponse.json({ ok: true });
}
```

---

## ✅ ЧЕКЛИСТ ПЕРЕД ПРОДОМ

- [ ] Получен API ключ Timeweb AI
- [ ] Добавлен `TIMEWEB_AI_KEY` в Timeweb Cloud Apps
- [ ] Протестирован endpoint `/api/ai/timeweb-ai`
- [ ] Обновлён `AIChatWidget.tsx` (если нужно)
- [ ] Настроен System Prompt агента в панели
- [ ] Создана таблица `ai_usage_logs` в БД
- [ ] Добавлен fallback на Groq/статичные ответы
- [ ] Проверена работа на проде

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- **Панель агента:** https://timeweb.cloud/my/cloud-ai/agents/12805/
- **Документация:** `TIMEWEB_CLOUD_AI_INTEGRATION.md`
- **API клиент:** `lib/timeweb-ai/client.ts`
- **API endpoint:** `app/api/ai/timeweb-ai/route.ts`

---

## 🆘 ПОМОЩЬ

**Если что-то не работает:**

1. **Проверьте API ключ:**
   ```bash
   echo $TIMEWEB_AI_KEY
   ```

2. **Проверьте логи:**
   ```bash
   # В Timeweb Cloud Apps
   Apps → Your App → Logs
   ```

3. **Тестируйте вручную:**
   ```bash
   curl -X POST https://api.timeweb.cloud/ai/v1/agents/12805/chat \
     -H "Authorization: Bearer YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"message": "test"}'
   ```

4. **Напишите в поддержку:**
   - Email: support@timeweb.ru
   - Тикет: https://timeweb.cloud/my/tickets/create

---

**ГОТОВО! 🚀**

Теперь у вас есть полная интеграция с Timeweb Cloud AI!
