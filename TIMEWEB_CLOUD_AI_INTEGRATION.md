# 🤖 TIMEWEB CLOUD AI: Интеграция с KamchaTour Hub

**Исследование:** https://timeweb.cloud/my/cloud-ai/agents/12805/

---

## 🔍 ЧТО ТАКОЕ TIMEWEB CLOUD AI?

**Timeweb Cloud AI** - это новый сервис от Timeweb для работы с AI агентами.

**URL агента:** `https://timeweb.cloud/my/cloud-ai/agents/12805/`

**Предположения (на основе структуры URL):**
```
/my/cloud-ai/          - раздел Cloud AI в панели
/agents/12805/         - конкретный AI агент с ID
```

**Возможные функции:**
- 🤖 Создание и управление AI агентами
- 💬 Чат-боты с настраиваемым контекстом
- 📊 Fine-tuning моделей
- 🔗 API для интеграции в приложения
- 📝 Knowledge Base для агентов

---

## 🎯 КАК ЭТО МОЖНО ИСПОЛЬЗОВАТЬ В KAMCHATOUR HUB?

### 1️⃣ **ЗАМЕНА GROQ/DEEPSEEK НА TIMEWEB CLOUD AI**

**Текущая реализация:**
```typescript
// app/api/ai/route.ts
async function callGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${apiKey}` 
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b',
      messages: [{ role: 'user', content: prompt }]
    })
  })
}
```

**Новая реализация (Timeweb Cloud AI):**
```typescript
// app/api/ai/timeweb-ai/route.ts
async function callTimewebAI(prompt: string) {
  const apiKey = process.env.TIMEWEB_AI_KEY  // API ключ Timeweb
  const agentId = '12805'  // ID вашего агента
  
  const r = await fetch(`https://api.timeweb.cloud/ai/v1/agents/${agentId}/chat`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: prompt,
      stream: false  // или true для стриминга
    })
  })
  
  const data = await r.json()
  return data.response || data.message
}
```

---

### 2️⃣ **СПЕЦИАЛИЗИРОВАННЫЕ АГЕНТЫ**

**Создайте отдельных агентов для разных задач:**

#### 🗺️ АГЕНТ "ГИД ПО КАМЧАТКЕ"
```
ID: 12805
Задача: Составление маршрутов, рекомендации по местам
Context: База знаний о достопримечательностях Камчатки
```

#### 🚗 АГЕНТ "ТРАНСФЕРЫ"
```
ID: 12806
Задача: Расчёт стоимости, маршруты, рекомендации транспорта
Context: Цены, расстояния, время в пути
```

#### 🏆 АГЕНТ "ПРОГРАММА ЛОЯЛЬНОСТИ"
```
ID: 12807
Задача: Объяснение бонусов, акций, статусов
Context: Правила программы лояльности
```

#### 📧 АГЕНТ "ПОДДЕРЖКА"
```
ID: 12808
Задача: FAQ, помощь клиентам
Context: База знаний поддержки
```

---

### 3️⃣ **ИНТЕГРАЦИЯ В СУЩЕСТВУЮЩИЕ КОМПОНЕНТЫ**

#### A. **AIChatWidget.tsx** (Чат на сайте)

**Текущий код:**
```typescript
// components/AIChatWidget.tsx
const response = await fetch('/api/ai/groq', {
  method: 'POST',
  body: JSON.stringify({ prompt: userMessage })
})
```

**С Timeweb AI:**
```typescript
// components/AIChatWidget.tsx
const response = await fetch('/api/ai/timeweb', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    agentId: '12805',  // Гид по Камчатке
    message: userMessage,
    conversationId: chatHistory.id  // Сохранение контекста
  })
})
```

#### B. **Страница туров** (app/hub/tours/page.tsx)

```typescript
// Используем агента для подбора туров
async function generateTourPlan(params) {
  const response = await fetch('/api/ai/timeweb', {
    method: 'POST',
    body: JSON.stringify({
      agentId: '12805',
      message: `Подбери тур на Камчатке. 
        Даты: ${params.dates}
        Гостей: ${params.guests}
        Интересы: ${params.interests}
        Бюджет: ${params.budget} RUB`
    })
  })
}
```

---

### 4️⃣ **ПРЕИМУЩЕСТВА TIMEWEB CLOUD AI**

#### ✅ **Для вашего проекта:**

1. **Единая инфраструктура**
   ```
   ✅ Сервер     - Timeweb Cloud Apps
   ✅ База       - Timeweb PostgreSQL
   ✅ S3         - Timeweb Storage
   ✅ AI         - Timeweb Cloud AI ← НОВОЕ!
   ```
   **Результат:** Всё в одной экосистеме!

2. **Локализация данных**
   ```
   ✅ Данные в России
   ✅ Соответствие 152-ФЗ
   ✅ Нет CORS проблем
   ```

3. **Стоимость**
   ```
   Groq API:          $0.05-0.10 / 1K tokens
   Timeweb Cloud AI:  ~₽??? / месяц (фиксированная цена?)
   ```
   **Возможно выгоднее при большом трафике!**

4. **Управление**
   ```
   ✅ Веб-интерфейс для настройки агентов
   ✅ Обучение на своих данных
   ✅ Версионирование промптов
   ✅ Мониторинг использования
   ```

5. **Контекст и память**
   ```
   ✅ Сохранение истории диалогов
   ✅ Персонализация ответов
   ✅ База знаний специфичная для Камчатки
   ```

---

## 📋 ПЛАН ИНТЕГРАЦИИ

### ШАГ 1: Изучить возможности агента

**В панели Timeweb Cloud AI (https://timeweb.cloud/my/cloud-ai/agents/12805/):**

1. **Проверьте настройки:**
   - Модель (GPT-4, Claude, LLaMA?)
   - Temperature (креативность)
   - Max tokens (длина ответа)
   - System prompt (инструкции агенту)

2. **Найдите API ключ:**
   ```
   Settings → API Keys → Generate
   ```

3. **Тестируйте в панели:**
   ```
   Отправьте тестовые запросы
   Проверьте качество ответов
   Настройте промпт
   ```

---

### ШАГ 2: Создать API endpoint

**Создайте новый файл:**
```bash
touch app/api/ai/timeweb-ai/route.ts
```

**Код:**
```typescript
// app/api/ai/timeweb-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface TimewebAIRequest {
  agentId?: string;
  message: string;
  conversationId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: TimewebAIRequest = await req.json();
    const { agentId = '12805', message, conversationId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }

    // API ключ Timeweb AI
    const apiKey = process.env.TIMEWEB_AI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'TIMEWEB_AI_KEY not configured' }, 
        { status: 500 }
      );
    }

    // Запрос к Timeweb Cloud AI
    const response = await fetch(
      `https://api.timeweb.cloud/ai/v1/agents/${agentId}/chat`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message.slice(0, 2000),
          conversation_id: conversationId,
          stream: false
        })
      }
    );

    if (!response.ok) {
      console.error('Timeweb AI error:', await response.text());
      return NextResponse.json(
        { error: 'AI service unavailable' }, 
        { status: 503 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      ok: true,
      answer: data.response || data.message || data.text,
      conversationId: data.conversation_id || conversationId
    });

  } catch (error) {
    console.error('Timeweb AI integration error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal error' }, 
      { status: 500 }
    );
  }
}
```

---

### ШАГ 3: Обновить переменные окружения

**Добавьте в `.env.production` и Timeweb Apps:**
```bash
# Timeweb Cloud AI
TIMEWEB_AI_KEY=ваш_api_ключ_из_панели
TIMEWEB_AI_AGENT_ID=12805

# Можно настроить разных агентов для разных задач
TIMEWEB_AI_AGENT_GUIDE=12805      # Гид по Камчатке
TIMEWEB_AI_AGENT_TRANSFERS=12806  # Трансферы
TIMEWEB_AI_AGENT_SUPPORT=12808    # Поддержка
```

---

### ШАГ 4: Обновить компоненты

#### **AIChatWidget.tsx**

```typescript
// components/AIChatWidget.tsx
const sendMessage = async () => {
  const response = await fetch('/api/ai/timeweb-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: process.env.NEXT_PUBLIC_TIMEWEB_AI_AGENT_GUIDE,
      message: userMessage,
      conversationId: chatHistory.id
    })
  });

  const data = await response.json();
  
  if (data.ok) {
    setMessages([...messages, {
      role: 'assistant',
      content: data.answer,
      timestamp: new Date()
    }]);
    
    // Сохраняем conversation ID для контекста
    if (data.conversationId) {
      setChatHistory({ id: data.conversationId });
    }
  }
};
```

---

### ШАГ 5: Настроить агента в панели

**В Timeweb Cloud AI (https://timeweb.cloud/my/cloud-ai/agents/12805/):**

#### **System Prompt (инструкции агенту):**
```
Ты - виртуальный гид по Камчатке для туристического сервиса KamchaTour Hub.

ТВОЯ РОЛЬ:
- Помогать туристам планировать поездки на Камчатку
- Рекомендовать достопримечательности, туры, активности
- Отвечать на вопросы о климате, природе, культуре
- Помогать с выбором трансферов и логистикой

СТИЛЬ ОБЩЕНИЯ:
- Дружелюбный и профессиональный
- Краткие, но информативные ответы
- Учитываешь бюджет и предпочтения клиента

ОГРАНИЧЕНИЯ:
- Не даёшь медицинские или юридические советы
- Всегда рекомендуешь проверять актуальность информации
- При вопросах о бронировании - направляешь в поддержку

КОНТЕКСТ:
- Сезон на Камчатке: май-октябрь (лучшее время)
- Популярные активности: вулканы, термальные источники, рыбалка
- Средний бюджет тура: 50,000-150,000 RUB на человека
```

#### **Knowledge Base:**
```
Загрузите файлы с информацией:
- tours.json (каталог туров из БД)
- destinations.txt (описания мест)
- faq.md (частые вопросы)
```

---

## 💡 РАСШИРЕННЫЕ СЦЕНАРИИ ИСПОЛЬЗОВАНИЯ

### 📊 **Сценарий 1: Умный поиск туров**

```typescript
// app/api/ai/suggest-tours/route.ts
export async function POST(req: NextRequest) {
  const { preferences, budget, dates } = await req.json();
  
  // 1. Спрашиваем AI агента
  const aiSuggestions = await fetch('/api/ai/timeweb-ai', {
    method: 'POST',
    body: JSON.stringify({
      agentId: '12805',
      message: `Подбери 3 тура по параметрам:
        Бюджет: ${budget} RUB
        Даты: ${dates}
        Интересы: ${preferences.join(', ')}`
    })
  });
  
  const { answer } = await aiSuggestions.json();
  
  // 2. Извлекаем ID туров из ответа AI
  const tourIds = extractTourIds(answer);
  
  // 3. Загружаем полные данные туров из БД
  const tours = await db.query(`
    SELECT * FROM tours 
    WHERE id = ANY($1)
    ORDER BY price ASC
  `, [tourIds]);
  
  return NextResponse.json({
    aiRecommendation: answer,
    tours: tours.rows
  });
}
```

---

### 📝 **Сценарий 2: Автогенерация описаний**

```typescript
// Генерация SEO-оптимизированных описаний туров
export async function generateTourDescription(tourData) {
  const response = await fetch('/api/ai/timeweb-ai', {
    method: 'POST',
    body: JSON.stringify({
      agentId: '12805',
      message: `Создай привлекательное описание тура:
        Название: ${tourData.title}
        Маршрут: ${tourData.route}
        Длительность: ${tourData.duration}
        Уникальность: ${tourData.highlights}
        
        Требования:
        - SEO-оптимизация
        - 150-200 слов
        - Эмоциональный стиль
        - Призыв к действию`
    })
  });
  
  return response.answer;
}
```

---

### 🎨 **Сценарий 3: Персональные рекомендации**

```typescript
// Используем историю заказов клиента
export async function getPersonalizedRecommendations(userId) {
  // 1. Получаем историю клиента
  const history = await db.query(`
    SELECT * FROM bookings 
    WHERE user_id = $1 
    ORDER BY created_at DESC LIMIT 10
  `, [userId]);
  
  // 2. Спрашиваем AI агента
  const response = await fetch('/api/ai/timeweb-ai', {
    method: 'POST',
    body: JSON.stringify({
      agentId: '12805',
      message: `Клиент ранее бронировал:
        ${history.rows.map(h => `- ${h.tour_name}`).join('\n')}
        
        Что ещё можно ему предложить?
        Учти его предпочтения и сезонность.`
    })
  });
  
  return response.answer;
}
```

---

### 📧 **Сценарий 4: Автоответы в Email**

```typescript
// lib/notifications/ai-email.ts
export async function generateEmailResponse(customerMessage: string) {
  const response = await fetch('/api/ai/timeweb-ai', {
    method: 'POST',
    body: JSON.stringify({
      agentId: '12808',  // Агент поддержки
      message: `Клиент написал:
        "${customerMessage}"
        
        Составь вежливый и информативный ответ.
        Если нужно уточнение - запроси детали.
        Если нужна поддержка - предложи связаться с менеджером.`
    })
  });
  
  return response.answer;
}
```

---

## 🔧 КОД ДЛЯ ИНТЕГРАЦИИ

### **Создайте универсальный клиент:**

```typescript
// lib/timeweb-ai/client.ts

interface TimewebAIConfig {
  apiKey: string;
  baseUrl?: string;
}

interface ChatRequest {
  agentId: string;
  message: string;
  conversationId?: string;
  stream?: boolean;
}

export class TimewebAIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: TimewebAIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.timeweb.cloud/ai/v1';
  }

  async chat(request: ChatRequest) {
    try {
      const response = await fetch(
        `${this.baseUrl}/agents/${request.agentId}/chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: request.message,
            conversation_id: request.conversationId,
            stream: request.stream || false
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Timeweb AI error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Timeweb AI client error:', error);
      throw error;
    }
  }

  async getConversationHistory(conversationId: string) {
    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    
    return await response.json();
  }

  async listAgents() {
    const response = await fetch(
      `${this.baseUrl}/agents`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    
    return await response.json();
  }
}

// Экспорт синглтона
export const timewebAI = new TimewebAIClient({
  apiKey: process.env.TIMEWEB_AI_KEY!
});
```

---

### **Используйте в API routes:**

```typescript
// app/api/ai/chat/route.ts
import { timewebAI } from '@/lib/timeweb-ai/client';

export async function POST(req: NextRequest) {
  const { message, agentId = '12805' } = await req.json();
  
  try {
    const result = await timewebAI.chat({
      agentId,
      message,
      conversationId: req.headers.get('x-conversation-id') || undefined
    });
    
    return NextResponse.json({
      answer: result.response,
      conversationId: result.conversation_id
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'AI service error' }, 
      { status: 500 }
    );
  }
}
```

---

## 🎯 РЕКОМЕНДУЕМАЯ АРХИТЕКТУРА

### **Multi-Agent система:**

```typescript
// lib/timeweb-ai/agents.ts

export const AGENTS = {
  GUIDE: '12805',        // Гид по Камчатке
  TRANSFERS: '12806',    // Расчёт трансферов
  LOYALTY: '12807',      // Программа лояльности
  SUPPORT: '12808'       // Поддержка клиентов
} as const;

// Роутинг по типу запроса
export function selectAgent(intent: string): string {
  const intentMap = {
    'tour': AGENTS.GUIDE,
    'transfer': AGENTS.TRANSFERS,
    'bonus': AGENTS.LOYALTY,
    'help': AGENTS.SUPPORT
  };
  
  return intentMap[intent] || AGENTS.GUIDE;
}
```

**Использование:**
```typescript
// Автоматический выбор нужного агента
const agentId = selectAgent(detectIntent(userMessage));

const response = await timewebAI.chat({
  agentId,
  message: userMessage
});
```

---

## 📊 МОНИТОРИНГ И АНАЛИТИКА

### **Добавьте трекинг использования:**

```typescript
// lib/timeweb-ai/analytics.ts

export async function logAIUsage(data: {
  agentId: string;
  userId?: string;
  message: string;
  response: string;
  tokensUsed?: number;
  responseTime: number;
}) {
  await db.query(`
    INSERT INTO ai_usage_logs 
    (agent_id, user_id, message, response, tokens_used, response_time)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    data.agentId,
    data.userId,
    data.message.slice(0, 500),
    data.response.slice(0, 1000),
    data.tokensUsed,
    data.responseTime
  ]);
}
```

**SQL для создания таблицы:**
```sql
-- lib/database/migrations/add_ai_logs.sql
CREATE TABLE ai_usage_logs (
  id BIGSERIAL PRIMARY KEY,
  agent_id VARCHAR(50) NOT NULL,
  user_id UUID,
  message TEXT,
  response TEXT,
  tokens_used INTEGER,
  response_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_created ON ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_logs_agent ON ai_usage_logs(agent_id);
```

---

## 💰 СТОИМОСТЬ И ROI

### **Сравнение вариантов:**

| Провайдер | Модель | Цена | Для KamchaTour |
|-----------|--------|------|----------------|
| **Groq** | LLaMA 3.1 70B | $0.59/M tokens | ~$20-50/мес |
| **OpenAI** | GPT-4 Turbo | $10/M tokens | ~$100-200/мес |
| **Timeweb Cloud AI** | ??? | ~₽???/мес | **???** |

**Уточните в Timeweb:**
- Модель тарификации (токены vs фиксированная цена)
- Лимиты запросов
- Включённые модели

---

## ✅ ЧТО ДЕЛАТЬ ДАЛЬШЕ?

### 🔍 **1. ИЗУЧИТЕ АГЕНТА В ПАНЕЛИ**

**Откройте:**
```
https://timeweb.cloud/my/cloud-ai/agents/12805/
```

**Проверьте:**
- ✅ Какая модель используется?
- ✅ Какие настройки доступны?
- ✅ Есть ли API ключ?
- ✅ Можно ли загрузить Knowledge Base?
- ✅ Есть ли примеры использования?

---

### 📖 **2. НАЙДИТЕ ДОКУМЕНТАЦИЮ API**

**Возможные источники:**
```
https://timeweb.cloud/api-docs  (проверьте раздел AI)
https://community.timeweb.com   (ищите "Cloud AI")
```

**Или в панели:**
```
Cloud AI → Documentation → API Reference
```

---

### 🧪 **3. ТЕСТИРУЙТЕ В ПАНЕЛИ**

**Отправьте тестовые запросы:**
```
Тест 1: "Посоветуй тур на 2 дня по Камчатке"
Тест 2: "Сколько стоит трансфер из аэропорта до Петропавловска?"
Тест 3: "Какие вулканы можно посетить в сентябре?"
```

**Оцените:**
- Качество ответов
- Скорость генерации
- Соответствие контексту

---

### 🔌 **4. ИНТЕГРИРУЙТЕ В ПРОЕКТ**

**Если всё OK:**

```bash
# 1. Создайте API endpoint
touch app/api/ai/timeweb-ai/route.ts

# 2. Добавьте клиент
touch lib/timeweb-ai/client.ts

# 3. Обновите переменные
echo "TIMEWEB_AI_KEY=your_key" >> .env.production

# 4. Обновите компоненты
# AIChatWidget.tsx → использует новый endpoint
```

---

## 🎁 БОНУСЫ ИСПОЛЬЗОВАНИЯ

### **Почему Timeweb Cloud AI может быть лучше?**

1. **Единая экосистема**
   ```
   App + DB + S3 + AI = всё в Timeweb!
   → Упрощённый биллинг
   → Единая поддержка
   → Нет CORS проблем
   ```

2. **Локализация**
   ```
   → Данные в РФ
   → 152-ФЗ compliance
   → Быстрее для RU пользователей
   ```

3. **Возможная кастомизация**
   ```
   → Обучение на ваших данных
   → Специфичная терминология Камчатки
   → Интеграция с вашей БД
   ```

4. **Cost optimization**
   ```
   → Возможно фиксированная цена
   → Без переплат за токены
   → Предсказуемый бюджет
   ```

---

## ⚠️ ВАЖНЫЕ ВОПРОСЫ К TIMEWEB

**Уточните в поддержке:**

1. **API доступ:**
   ```
   - Есть ли публичный API для Cloud AI?
   - Как получить API ключ?
   - Какие эндпоинты доступны?
   ```

2. **Тарификация:**
   ```
   - Стоимость за запрос/токен/месяц?
   - Лимиты запросов?
   - Включено ли в существующий план?
   ```

3. **Возможности:**
   ```
   - Какие модели доступны?
   - Можно ли загружать свои данные?
   - Есть ли streaming ответов?
   - Сохраняется ли контекст диалогов?
   ```

4. **Документация:**
   ```
   - Где найти API docs?
   - Есть ли примеры интеграции?
   - SDK для Node.js/TypeScript?
   ```

---

## 📞 КАК УЗНАТЬ БОЛЬШЕ?

### **1. Панель управления**
```
https://timeweb.cloud/my/cloud-ai/agents/12805/
→ Settings → API
→ Documentation
→ Examples
```

### **2. Поддержка Timeweb**
```
Email: support@timeweb.ru
Чат: https://timeweb.cloud (правый нижний угол)
Ticket: Панель → Поддержка → Новый тикет
```

**Вопрос для поддержки:**
```
Тема: API доступ к Cloud AI агенту

Здравствуйте!

У меня есть AI агент (ID: 12805) в панели Cloud AI.
Хочу интегрировать его в Next.js приложение.

Вопросы:
1. Как получить API ключ для доступа к агенту?
2. Какой endpoint использовать для отправки сообщений?
3. Есть ли документация API?
4. Какая тарификация (токены/фикс. цена)?
5. Можно ли загружать Knowledge Base через API?

Спасибо!
```

---

## 🚀 БЫСТРЫЙ СТАРТ (ЕСЛИ API УЖЕ ЕСТЬ)

### **1 минута интеграции:**

```bash
# 1. Добавьте переменную
export TIMEWEB_AI_KEY=ваш_ключ

# 2. Создайте endpoint
cat > app/api/ai/tw/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { message } = await req.json();
  const r = await fetch('https://api.timeweb.cloud/ai/v1/agents/12805/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TIMEWEB_AI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });
  const data = await r.json();
  return NextResponse.json({ answer: data.response });
}
EOF

# 3. Тестируйте
curl -X POST http://localhost:3000/api/ai/tw \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет! Расскажи о турах на Камчатке"}'
```

---

## 📈 МЕТРИКИ УСПЕХА

**После интеграции отслеживайте:**

```sql
-- Запросы к AI
SELECT 
  DATE(created_at) as date,
  agent_id,
  COUNT(*) as requests,
  AVG(response_time) as avg_time_ms
FROM ai_usage_logs
GROUP BY DATE(created_at), agent_id
ORDER BY date DESC;

-- Популярные темы
SELECT 
  substring(message from 1 for 50) as topic,
  COUNT(*) as frequency
FROM ai_usage_logs
GROUP BY topic
ORDER BY frequency DESC
LIMIT 10;
```

---

## ✅ ИТОГ

### **Timeweb Cloud AI агент может:**

✅ **Заменить Groq/DeepSeek** - единая инфраструктура  
✅ **Улучшить UX** - персонализированные ответы  
✅ **Снизить нагрузку на поддержку** - автоматические ответы  
✅ **Увеличить конверсию** - умные рекомендации туров  
✅ **Сэкономить деньги** - возможно выгоднее токенов  

### **Что нужно сделать:**

1. **СЕЙЧАС:**
   - Изучить агента в панели: https://timeweb.cloud/my/cloud-ai/agents/12805/
   - Найти API ключ
   - Протестировать в панели

2. **ЕСЛИ ЕСТЬ API:**
   - Создать endpoint `/api/ai/timeweb-ai/route.ts`
   - Добавить `TIMEWEB_AI_KEY` в переменные
   - Обновить `AIChatWidget.tsx`

3. **ДЕПЛОЙ:**
   - Добавить переменные в Timeweb Apps
   - Протестировать на проде

---

**Документация:** [Timeweb Cloud AI Docs](https://timeweb.cloud/api-docs)  
**Поддержка:** support@timeweb.ru  
**Агент:** https://timeweb.cloud/my/cloud-ai/agents/12805/

**СЛЕДУЮЩИЙ ШАГ:** Откройте панель и найдите раздел "API" или "Integration" в настройках агента! 🚀
