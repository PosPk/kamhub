# 🏗️ TIMEWEB CLOUD AI - АРХИТЕКТУРА ИНТЕГРАЦИИ

**Агент:** https://timeweb.cloud/my/cloud-ai/agents/12805/

---

## 📐 АРХИТЕКТУРА

```
┌─────────────────────────────────────────────────────────────────┐
│                     KAMCHATOUR HUB                              │
│                   (Next.js 14 + React 18)                       │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │
    ┌──────────────────────────┼──────────────────────────┐
    │                          │                          │
    ▼                          ▼                          ▼
┌─────────┐              ┌──────────┐              ┌──────────┐
│  Users  │              │  Admin   │              │  API     │
│  Chat   │              │  Panel   │              │  Routes  │
└─────────┘              └──────────┘              └──────────┘
    │                          │                          │
    │ POST /api/ai/timeweb-ai  │                          │
    └──────────────────────────┴──────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │  app/api/ai/timeweb-ai/route.ts│
              │  - Валидация запроса            │
              │  - Обработка ошибок             │
              │  - Логирование                  │
              └────────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │  lib/timeweb-ai/client.ts      │
              │  - TimewebAIClient              │
              │  - Управление запросами         │
              │  - Работа с conversations       │
              └────────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │  TIMEWEB CLOUD AI API          │
              │  https://api.timeweb.cloud     │
              │  /ai/v1/agents/{id}/chat       │
              └────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
    ┌──────────┐         ┌──────────┐        ┌──────────┐
    │ Agent    │         │ Agent    │        │ Agent    │
    │ #12805   │         │ #12806   │        │ #12808   │
    │ Guide    │         │ Transfer │        │ Support  │
    └──────────┘         └──────────┘        └──────────┘
          │                    │                    │
          └────────────────────┴────────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │   AI Models      │
                    │  GPT-4 / Claude  │
                    │  LLaMA / Custom  │
                    └──────────────────┘
```

---

## 🔄 ПОТОК ДАННЫХ

### **1. Пользовательский запрос**

```typescript
// Пользователь пишет в чат на сайте
User Input: "Посоветуй тур на 3 дня"

// Frontend (components/AIChatWidget.tsx)
fetch('/api/ai/timeweb-ai', {
  method: 'POST',
  body: JSON.stringify({
    message: "Посоветуй тур на 3 дня",
    agentId: "12805",
    conversationId: "conv_abc123"  // для контекста
  })
})
```

---

### **2. API endpoint обработка**

```typescript
// app/api/ai/timeweb-ai/route.ts

export async function POST(req: NextRequest) {
  // ✅ Валидация
  const { message, agentId, conversationId } = await req.json();
  
  // ✅ Проверка длины
  if (message.length > 4000) return error;
  
  // ✅ Вызов клиента
  const result = await timewebAI.chat({
    agentId,
    message,
    conversationId
  });
  
  // ✅ Логирование
  await logAIUsage({
    agentId,
    message,
    response: result.response,
    tokensUsed: result.tokensUsed,
    responseTime: Date.now() - startTime
  });
  
  // ✅ Ответ
  return NextResponse.json({
    ok: true,
    answer: result.response,
    conversationId: result.conversationId
  });
}
```

---

### **3. Клиент отправляет запрос**

```typescript
// lib/timeweb-ai/client.ts

class TimewebAIClient {
  async chat(request: ChatRequest) {
    // ✅ HTTP запрос к Timeweb API
    const response = await fetch(
      `https://api.timeweb.cloud/ai/v1/agents/${request.agentId}/chat`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: request.message,
          conversation_id: request.conversationId
        })
      }
    );
    
    // ✅ Парсинг ответа
    const data = await response.json();
    
    return {
      response: data.response,
      conversationId: data.conversation_id,
      tokensUsed: data.tokens_used
    };
  }
}
```

---

### **4. Timeweb AI обрабатывает**

```
Timeweb Cloud AI API
    ↓
Маршрутизация к агенту #12805
    ↓
Загрузка System Prompt агента
    ↓
Загрузка Knowledge Base (если есть)
    ↓
Загрузка контекста диалога (conversation_id)
    ↓
Отправка в AI модель (GPT-4 / Claude / etc)
    ↓
Генерация ответа
    ↓
Сохранение в conversation history
    ↓
Возврат ответа
```

---

### **5. Ответ пользователю**

```typescript
// Frontend получает ответ
{
  "ok": true,
  "answer": "Я рекомендую тур \"Вулканы и термальные источники\" на 3 дня...",
  "conversationId": "conv_abc123",
  "meta": {
    "agentId": "12805",
    "model": "gpt-4-turbo",
    "tokensUsed": 342,
    "responseTime": 1523
  }
}

// Отображается в чате
┌────────────────────────────────────┐
│  👤 Вы:                            │
│  Посоветуй тур на 3 дня            │
│                                    │
│  🤖 AI Ассистент:                  │
│  Я рекомендую тур "Вулканы и       │
│  термальные источники" на 3 дня... │
└────────────────────────────────────┘
```

---

## 🎯 MULTI-AGENT АРХИТЕКТУРА

### **Специализированные агенты:**

```
┌─────────────────────────────────────────────────────────┐
│                    USER REQUEST                         │
│              "Сколько стоит трансфер?"                  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Intent Detection │
              │  (определяем тип) │
              └──────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ "tour"   │    │"transfer"│    │ "help"   │
  └──────────┘    └──────────┘    └──────────┘
        │                │                │
        ▼                ▼                ▼
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ Agent    │    │ Agent    │    │ Agent    │
  │ #12805   │    │ #12806   │    │ #12808   │
  │ Guide    │    │ Transfer │    │ Support  │
  └──────────┘    └──────────┘    └──────────┘
        │                │                │
        └────────────────┴────────────────┘
                         │
                         ▼
                  ┌──────────┐
                  │ Response │
                  └──────────┘
```

### **Код для автоматического выбора агента:**

```typescript
// lib/timeweb-ai/router.ts

export const AGENTS = {
  GUIDE: '12805',      // Гид по Камчатке
  TRANSFERS: '12806',  // Трансферы
  LOYALTY: '12807',    // Программа лояльности
  SUPPORT: '12808'     // Поддержка
} as const;

// Определение намерения (intent)
export function detectIntent(message: string): keyof typeof AGENTS {
  const lower = message.toLowerCase();
  
  // Трансферы
  if (
    lower.includes('трансфер') ||
    lower.includes('такси') ||
    lower.includes('доехать') ||
    lower.includes('аэропорт')
  ) {
    return 'TRANSFERS';
  }
  
  // Программа лояльности
  if (
    lower.includes('бонус') ||
    lower.includes('баллы') ||
    lower.includes('скидка') ||
    lower.includes('статус')
  ) {
    return 'LOYALTY';
  }
  
  // Поддержка
  if (
    lower.includes('отменить') ||
    lower.includes('вернуть') ||
    lower.includes('проблема') ||
    lower.includes('не работает')
  ) {
    return 'SUPPORT';
  }
  
  // По умолчанию - гид
  return 'GUIDE';
}

// Выбор агента
export function selectAgent(message: string): string {
  const intent = detectIntent(message);
  return AGENTS[intent];
}
```

### **Использование:**

```typescript
// app/api/ai/smart-chat/route.ts
import { timewebAI } from '@/lib/timeweb-ai/client';
import { selectAgent } from '@/lib/timeweb-ai/router';

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  
  // Автоматически выбираем нужного агента
  const agentId = selectAgent(message);
  
  console.log(`Routing to agent ${agentId} for message: "${message}"`);
  
  // Отправляем к правильному агенту
  const result = await timewebAI.chat({
    agentId,
    message
  });
  
  return NextResponse.json({
    ok: true,
    answer: result.response,
    agentUsed: agentId
  });
}
```

---

## 💾 РАБОТА С КОНТЕКСТОМ

### **Сохранение истории диалога:**

```typescript
// lib/timeweb-ai/conversation.ts

interface ConversationState {
  id: string;
  userId?: string;
  agentId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  metadata?: Record<string, any>;
}

// Создание нового диалога
export async function createConversation(
  userId: string,
  agentId: string
): Promise<ConversationState> {
  // Создаём в Timeweb AI
  const result = await timewebAI.createConversation(agentId, {
    userId,
    source: 'web-chat',
    createdAt: new Date().toISOString()
  });
  
  // Сохраняем в БД
  await db.query(`
    INSERT INTO ai_conversations 
    (id, user_id, agent_id, created_at)
    VALUES ($1, $2, $3, NOW())
  `, [result.conversation_id, userId, agentId]);
  
  return {
    id: result.conversation_id,
    userId,
    agentId,
    messages: []
  };
}

// Добавление сообщения в контекст
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
) {
  await db.query(`
    INSERT INTO ai_messages 
    (conversation_id, role, content, created_at)
    VALUES ($1, $2, $3, NOW())
  `, [conversationId, role, content]);
}

// Получение истории
export async function getConversationHistory(
  conversationId: string
): Promise<ConversationState> {
  const messages = await db.query(`
    SELECT role, content, created_at 
    FROM ai_messages
    WHERE conversation_id = $1
    ORDER BY created_at ASC
  `, [conversationId]);
  
  return {
    id: conversationId,
    messages: messages.rows.map(row => ({
      role: row.role,
      content: row.content,
      timestamp: row.created_at
    }))
  };
}
```

### **SQL схема:**

```sql
-- lib/database/migrations/ai_conversations.sql

CREATE TABLE IF NOT EXISTS ai_conversations (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  agent_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id VARCHAR(100) REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_messages_created ON ai_messages(created_at DESC);
```

---

## 🔌 ИНТЕГРАЦИЯ С СУЩЕСТВУЮЩИМИ КОМПОНЕНТАМИ

### **1. AIChatWidget.tsx** (Виджет чата)

```typescript
// components/AIChatWidget.tsx

'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const [loading, setLoading] = useState(false);

  // Инициализация диалога
  useEffect(() => {
    const initConversation = async () => {
      const response = await fetch('/api/ai/conversation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: '12805' })
      });
      
      const data = await response.json();
      setConversationId(data.conversationId);
    };
    
    initConversation();
  }, []);

  // Отправка сообщения
  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    
    setLoading(true);
    
    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      // Отправляем к Timeweb AI
      const response = await fetch('/api/ai/timeweb-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          agentId: '12805',
          conversationId
        })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        // Добавляем ответ AI
        const aiMessage: Message = {
          id: Date.now().toString() + '_ai',
          role: 'assistant',
          content: data.answer,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-widget">
      {/* Список сообщений */}
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message message-${msg.role}`}>
            <div className="message-content">{msg.content}</div>
            <div className="message-time">
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {loading && <div className="typing-indicator">AI печатает...</div>}
      </div>
      
      {/* Поле ввода */}
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Спросите о турах на Камчатке..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Отправить
        </button>
      </div>
    </div>
  );
}
```

---

### **2. Страница туров** (Tours Page)

```typescript
// app/hub/tours/ai-suggestions/page.tsx

'use client';

import { useState } from 'react';
import { timewebAI } from '@/lib/timeweb-ai/client';

export default function AITourSuggestionsPage() {
  const [preferences, setPreferences] = useState({
    duration: 3,
    budget: 50000,
    interests: [] as string[]
  });
  
  const [suggestions, setSuggestions] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getSuggestions = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai/timeweb-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: '12805',
          message: `Подбери туры на Камчатке:
            Длительность: ${preferences.duration} дня
            Бюджет: до ${preferences.budget} RUB
            Интересы: ${preferences.interests.join(', ') || 'любые'}
            
            Верни 3-5 вариантов с кратким описанием.`
        })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setSuggestions(data.answer);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tour-suggestions">
      <h1>🤖 AI Подбор туров</h1>
      
      {/* Форма предпочтений */}
      <div className="preferences-form">
        <label>
          Длительность (дней):
          <input
            type="number"
            value={preferences.duration}
            onChange={(e) => setPreferences({
              ...preferences,
              duration: parseInt(e.target.value)
            })}
            min={1}
            max={14}
          />
        </label>
        
        <label>
          Бюджет (RUB):
          <input
            type="number"
            value={preferences.budget}
            onChange={(e) => setPreferences({
              ...preferences,
              budget: parseInt(e.target.value)
            })}
            step={10000}
          />
        </label>
        
        <label>
          Интересы:
          <select
            multiple
            value={preferences.interests}
            onChange={(e) => setPreferences({
              ...preferences,
              interests: Array.from(
                e.target.selectedOptions,
                option => option.value
              )
            })}
          >
            <option value="вулканы">Вулканы</option>
            <option value="термальные источники">Термальные источники</option>
            <option value="рыбалка">Рыбалка</option>
            <option value="дикая природа">Дикая природа</option>
            <option value="экстрим">Экстрим</option>
          </select>
        </label>
        
        <button onClick={getSuggestions} disabled={loading}>
          {loading ? 'Подбираем...' : 'Подобрать туры'}
        </button>
      </div>
      
      {/* Результаты */}
      {suggestions && (
        <div className="suggestions-result">
          <h2>Рекомендации AI:</h2>
          <div className="suggestions-content">
            {suggestions}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 МОНИТОРИНГ И АНАЛИТИКА

### **Dashboard для отслеживания AI использования:**

```typescript
// app/admin/ai-analytics/page.tsx

export default async function AIAnalyticsPage() {
  // Статистика использования
  const stats = await db.query(`
    SELECT 
      agent_id,
      COUNT(*) as total_requests,
      AVG(response_time) as avg_response_time,
      SUM(tokens_used) as total_tokens,
      COUNT(DISTINCT user_id) as unique_users
    FROM ai_usage_logs
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY agent_id
  `);
  
  // Популярные темы
  const topics = await db.query(`
    SELECT 
      LEFT(message, 100) as topic,
      COUNT(*) as frequency
    FROM ai_usage_logs
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY LEFT(message, 100)
    ORDER BY frequency DESC
    LIMIT 20
  `);
  
  // График по дням
  const daily = await db.query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as requests,
      AVG(response_time) as avg_time
    FROM ai_usage_logs
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date
  `);

  return (
    <div className="ai-analytics-dashboard">
      <h1>📊 AI Analytics</h1>
      
      {/* Общая статистика */}
      <div className="stats-grid">
        {stats.rows.map(stat => (
          <div key={stat.agent_id} className="stat-card">
            <h3>Agent {stat.agent_id}</h3>
            <p>Requests: {stat.total_requests}</p>
            <p>Avg Time: {Math.round(stat.avg_response_time)}ms</p>
            <p>Tokens: {stat.total_tokens}</p>
            <p>Users: {stat.unique_users}</p>
          </div>
        ))}
      </div>
      
      {/* График */}
      <div className="chart">
        <h2>Requests per Day</h2>
        {/* Chart component here */}
      </div>
      
      {/* Популярные темы */}
      <div className="topics">
        <h2>Popular Topics</h2>
        <ul>
          {topics.rows.map((topic, i) => (
            <li key={i}>
              {topic.topic} ({topic.frequency})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## 🎁 ДОПОЛНИТЕЛЬНЫЕ ВОЗМОЖНОСТИ

### **1. Streaming responses** (потоковые ответы)

```typescript
// app/api/ai/stream/route.ts
import { timewebAI } from '@/lib/timeweb-ai/client';

export async function POST(req: NextRequest) {
  const { message, agentId } = await req.json();
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Запрос с streaming=true
        const response = await fetch(
          `https://api.timeweb.cloud/ai/v1/agents/${agentId}/chat`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.TIMEWEB_AI_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message,
              stream: true
            })
          }
        );
        
        const reader = response.body?.getReader();
        
        while (true) {
          const { done, value } = await reader!.read();
          
          if (done) break;
          
          controller.enqueue(value);
        }
        
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

---

### **2. Knowledge Base интеграция**

```typescript
// lib/timeweb-ai/knowledge-base.ts

// Загрузка Knowledge Base в агента
export async function uploadKnowledgeBase(
  agentId: string,
  data: {
    tours: any[];
    destinations: any[];
    faq: any[];
  }
) {
  const formattedData = `
# База знаний KamchaTour Hub

## Туры:
${data.tours.map(t => `
- ${t.title}
  Цена: ${t.price} RUB
  Длительность: ${t.duration} дней
  Описание: ${t.description}
`).join('\n')}

## Направления:
${data.destinations.map(d => `
- ${d.name}
  Информация: ${d.info}
`).join('\n')}

## FAQ:
${data.faq.map(q => `
Q: ${q.question}
A: ${q.answer}
`).join('\n')}
  `;
  
  // Загрузка через API (если доступно)
  const response = await fetch(
    `https://api.timeweb.cloud/ai/v1/agents/${agentId}/knowledge-base`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TIMEWEB_AI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: formattedData,
        type: 'markdown'
      })
    }
  );
  
  return await response.json();
}
```

---

## ✅ ИТОГОВАЯ АРХИТЕКТУРА

```
┌─────────────────────────────────────────────────────────────┐
│                    KAMCHATOUR HUB                           │
│                 (Timeweb Cloud Apps)                        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Chat     │  │ Tours    │  │ Admin    │  │ API      │  │
│  │ Widget   │  │ Page     │  │ Panel    │  │ Routes   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│       │              │              │              │       │
│       └──────────────┴──────────────┴──────────────┘       │
│                           │                                │
│              app/api/ai/timeweb-ai/route.ts                │
│                           │                                │
│              lib/timeweb-ai/client.ts                      │
└───────────────────────────┼─────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
┌─────────▼─────────┐ ┌────▼────┐ ┌────────▼─────────┐
│ Timeweb Cloud AI  │ │Timeweb  │ │ Timeweb S3      │
│ Agents            │ │PostgreSQL│ │ Storage         │
│                   │ │         │ │                 │
│ #12805 Guide      │ │ Database│ │ Media files     │
│ #12806 Transfers  │ │ Users   │ │ Images          │
│ #12808 Support    │ │ Tours   │ │ Documents       │
└───────────────────┘ └─────────┘ └─────────────────┘
```

**Единая экосистема Timeweb Cloud! 🚀**

---

**Документы:**
- 📖 Полная документация: `TIMEWEB_CLOUD_AI_INTEGRATION.md`
- 🚀 Быстрый старт: `TIMEWEB_AI_QUICK_START.md`
- 🏗️ Архитектура: `TIMEWEB_AI_ARCHITECTURE.md` (этот файл)

**Агент:** https://timeweb.cloud/my/cloud-ai/agents/12805/
