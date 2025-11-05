# 🎯 ПЛАН ВНЕДРЕНИЯ AI МЕТРИК
## Только практика для Kamchatour Hub

---

## ✅ ЧТО ВНЕДРИТЬ (Приоритет 1)

### 1. Action Completion - Выполнил ли AI задачу?

**Зачем:** Понять, помог ли чат пользователю или он ушел без результата.

**Где измерять:**
```typescript
// После каждого AI-ответа в components/AIChatWidget.tsx

interface ActionCompletion {
  taskCompleted: boolean;        // Выполнена ли задача
  userGoal: string;              // Что хотел пользователь
  aiActions: string[];           // Что сделал AI
  timestamp: Date;
}

// Пример
const completion: ActionCompletion = {
  taskCompleted: true,
  userGoal: "Найти трансфер из аэропорта",
  aiActions: [
    "Поиск трансферов",
    "Показал 5 вариантов",
    "Пользователь выбрал"
  ],
  timestamp: new Date()
};
```

**КАК РЕАЛИЗОВАТЬ:**

```typescript
// lib/ai/metrics.ts

export class AIMetrics {
  async trackCompletion(
    sessionId: string,
    userMessage: string,
    aiResponse: string,
    userFeedback?: 'completed' | 'failed'
  ) {
    // 1. Определить цель пользователя из первого сообщения
    const goal = await this.extractGoal(userMessage);
    
    // 2. Проверить, выполнена ли задача
    const completed = userFeedback === 'completed' || 
                     await this.detectCompletion(aiResponse);
    
    // 3. Сохранить в БД
    await database.query(`
      INSERT INTO ai_metrics (
        session_id, metric_type, metric_value, details, created_at
      ) VALUES ($1, 'action_completion', $2, $3, NOW())
    `, [
      sessionId,
      completed ? 1 : 0,
      JSON.stringify({ goal, aiResponse })
    ]);
    
    return completed;
  }
  
  private async detectCompletion(response: string): Promise<boolean> {
    // Простая эвристика
    const completionPhrases = [
      'вот результаты',
      'я нашел',
      'забронировал',
      'подтверждаю',
      'готово'
    ];
    
    return completionPhrases.some(phrase => 
      response.toLowerCase().includes(phrase)
    );
  }
}
```

**ДОБАВИТЬ В WIDGET:**

```typescript
// components/AIChatWidget.tsx (добавить)

import { AIMetrics } from '@/lib/ai/metrics';

const metrics = new AIMetrics();

const handleSendMessage = async () => {
  // ... существующий код отправки сообщения
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId })
  });
  
  // ДОБАВИТЬ ПОСЛЕ ПОЛУЧЕНИЯ ОТВЕТА:
  await metrics.trackCompletion(
    sessionId,
    message,
    response.message
  );
  
  // Показать пользователю кнопку обратной связи
  setShowFeedback(true);
};

// Добавить UI для обратной связи
const handleFeedback = async (feedback: 'completed' | 'failed') => {
  await metrics.trackCompletion(
    sessionId,
    lastUserMessage,
    lastAiMessage,
    feedback  // Явная обратная связь пользователя
  );
  setShowFeedback(false);
};
```

---

### 2. Conversation Quality - Доволен ли пользователь?

**Зачем:** Измерить NPS чата. Если пользователь фрустрирован - что-то не так.

**КАК:**

```typescript
// В конце каждой сессии показать:

interface ConversationQuality {
  satisfied: boolean;
  frustrationSignals: string[];  // "повторил вопрос 3 раза"
  responseTime: number;          // Среднее время ответа
  turnsToResolution: number;     // Сколько сообщений до результата
}

// Добавить в components/AIChatWidget.tsx

const trackQuality = async () => {
  const quality: ConversationQuality = {
    satisfied: userRating >= 4,  // Из звездочек
    frustrationSignals: detectFrustration(messages),
    responseTime: calculateAvgResponseTime(messages),
    turnsToResolution: messages.length
  };
  
  await database.query(`
    INSERT INTO ai_metrics (
      session_id, metric_type, metric_value, details
    ) VALUES ($1, 'conversation_quality', $2, $3)
  `, [sessionId, quality.satisfied ? 1 : 0, JSON.stringify(quality)]);
};

function detectFrustration(messages: Message[]): string[] {
  const signals = [];
  
  // Повторяет один и тот же вопрос?
  const repeated = messages.filter((m, i, arr) => 
    arr.slice(0, i).some(prev => 
      similarity(m.content, prev.content) > 0.8
    )
  );
  if (repeated.length > 0) signals.push('repeated_questions');
  
  // Негативные слова?
  const negative = ['не понимаю', 'не работает', 'не помогло', 'бесполезно'];
  if (messages.some(m => negative.some(n => m.content.includes(n)))) {
    signals.push('negative_language');
  }
  
  return signals;
}
```

**UI ДЛЯ ОБРАТНОЙ СВЯЗИ:**

```tsx
// Добавить в конце чата

{showFeedback && (
  <div className="fixed bottom-20 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl">
    <p className="mb-2">Помог ли вам этот чат?</p>
    <div className="flex gap-2">
      <button 
        onClick={() => handleQualityFeedback('satisfied')}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        👍 Да
      </button>
      <button 
        onClick={() => handleQualityFeedback('frustrated')}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        👎 Нет
      </button>
    </div>
  </div>
)}
```

---

### 3. Tool Error - Отслеживание ошибок

**Зачем:** Если AI пытается найти трансферы, но API падает - нужно знать.

**КАК:**

```typescript
// lib/ai/tools.ts

export class TransferSearchTool {
  async execute(params: SearchParams) {
    const startTime = Date.now();
    
    try {
      const results = await fetch('/api/transfers/search', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      
      const latency = Date.now() - startTime;
      
      // ✅ Успех
      await this.recordMetric({
        tool: 'transfer_search',
        success: true,
        latency,
        params
      });
      
      return results;
      
    } catch (error) {
      // ❌ Ошибка
      await this.recordMetric({
        tool: 'transfer_search',
        success: false,
        error: error.message,
        params
      });
      
      throw error;
    }
  }
  
  private async recordMetric(data: ToolMetric) {
    await database.query(`
      INSERT INTO ai_metrics (
        metric_type, tool_name, success, latency, error_message, details
      ) VALUES ('tool_execution', $1, $2, $3, $4, $5)
    `, [
      data.tool,
      data.success,
      data.latency || null,
      data.error || null,
      JSON.stringify(data.params)
    ]);
  }
}
```

---

### 4. Agent Efficiency - Быстро ли отвечает?

**Зачем:** Если AI делает 10 запросов вместо 2 - тратим деньги и время.

**КАК:**

```typescript
// Измерять в каждом AI запросе

interface EfficiencyMetric {
  totalSteps: number;        // Сколько действий сделал AI
  optimalSteps: number;      // Сколько должен был
  apiCalls: number;          // Сколько API вызовов
  totalLatency: number;      // Общее время
  efficiency: number;        // optimalSteps / totalSteps
}

// В app/api/chat/route.ts

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let steps = 0;
  
  // ... обработка запроса
  
  steps++; // Каждое действие AI
  
  const efficiency: EfficiencyMetric = {
    totalSteps: steps,
    optimalSteps: 2,  // Для простого поиска трансфера
    apiCalls: apiCallCount,
    totalLatency: Date.now() - startTime,
    efficiency: 2 / steps
  };
  
  // Если efficiency < 0.5 - AI делает лишние шаги!
  if (efficiency.efficiency < 0.5) {
    console.warn('⚠️ AI неэффективен:', efficiency);
  }
  
  await saveMetric('agent_efficiency', efficiency);
}
```

---

## 📊 СОЗДАТЬ ТАБЛИЦУ В БД

```sql
-- lib/database/ai_metrics_schema.sql

CREATE TABLE IF NOT EXISTS ai_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255),
  user_id UUID REFERENCES users(id),
  
  -- Тип метрики
  metric_type VARCHAR(50) NOT NULL,
  -- 'action_completion', 'conversation_quality', 'tool_execution', 'agent_efficiency'
  
  -- Значение (0-1)
  metric_value DECIMAL(5,4),
  
  -- Для tool errors
  tool_name VARCHAR(100),
  success BOOLEAN,
  latency INTEGER,
  error_message TEXT,
  
  -- Детали (JSON)
  details JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_ai_metrics_session ON ai_metrics(session_id);
CREATE INDEX idx_ai_metrics_type ON ai_metrics(metric_type);
CREATE INDEX idx_ai_metrics_created ON ai_metrics(created_at);
```

---

## 📈 DASHBOARD ДЛЯ ПРОСМОТРА

```typescript
// app/hub/operator/ai-metrics/page.tsx

export default function AIMetricsPage() {
  const [metrics, setMetrics] = useState<Metrics>();
  
  useEffect(() => {
    fetch('/api/ai-metrics/summary').then(r => r.json()).then(setMetrics);
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Chat Метрики</h1>
      
      {/* Action Completion Rate */}
      <Card>
        <h2>Успешность выполнения задач</h2>
        <div className="text-4xl font-bold">
          {metrics?.completionRate}%
        </div>
        <p className="text-gray-500">
          {metrics?.completedTasks} из {metrics?.totalTasks} задач выполнены
        </p>
      </Card>
      
      {/* Conversation Quality */}
      <Card>
        <h2>Удовлетворенность пользователей</h2>
        <div className="text-4xl font-bold">
          {metrics?.satisfactionRate}%
        </div>
        <p className="text-gray-500">
          {metrics?.satisfiedUsers} довольных пользователей
        </p>
      </Card>
      
      {/* Tool Errors */}
      <Card>
        <h2>Ошибки инструментов</h2>
        <div className="text-4xl font-bold text-red-500">
          {metrics?.toolErrorRate}%
        </div>
        <ul>
          {metrics?.topErrors.map(err => (
            <li key={err.tool}>
              {err.tool}: {err.count} ошибок
            </li>
          ))}
        </ul>
      </Card>
      
      {/* Efficiency */}
      <Card>
        <h2>Эффективность AI</h2>
        <div className="text-4xl font-bold">
          {metrics?.avgEfficiency}%
        </div>
        <p className="text-gray-500">
          Среднее время ответа: {metrics?.avgLatency}ms
        </p>
      </Card>
    </div>
  );
}
```

```typescript
// app/api/ai-metrics/summary/route.ts

export async function GET() {
  const last7days = await database.query(`
    SELECT 
      -- Completion Rate
      ROUND(AVG(CASE WHEN metric_type = 'action_completion' THEN metric_value ELSE NULL END) * 100, 1) as completion_rate,
      
      -- Satisfaction Rate
      ROUND(AVG(CASE WHEN metric_type = 'conversation_quality' THEN metric_value ELSE NULL END) * 100, 1) as satisfaction_rate,
      
      -- Tool Error Rate
      ROUND((1 - AVG(CASE WHEN metric_type = 'tool_execution' AND success = false THEN 1 ELSE 0 END)) * 100, 1) as tool_error_rate,
      
      -- Average Efficiency
      ROUND(AVG(CASE WHEN metric_type = 'agent_efficiency' THEN metric_value ELSE NULL END) * 100, 1) as avg_efficiency,
      
      -- Average Latency
      ROUND(AVG(latency)) as avg_latency
      
    FROM ai_metrics
    WHERE created_at >= NOW() - INTERVAL '7 days'
  `);
  
  return Response.json(last7days.rows[0]);
}
```

---

## 🚀 ПЛАН ВНЕДРЕНИЯ (1 неделя)

### День 1-2: База
```bash
✅ Создать таблицу ai_metrics
✅ Добавить базовый класс AIMetrics
✅ Интегрировать в AIChatWidget
```

### День 3-4: Метрики
```bash
✅ Action Completion tracking
✅ Conversation Quality с UI обратной связи
✅ Tool Error tracking
```

### День 5: Dashboard
```bash
✅ Создать страницу /hub/operator/ai-metrics
✅ API endpoint для статистики
✅ Графики (опционально)
```

### День 6-7: Тестирование
```bash
✅ Протестировать все метрики
✅ Проверить что данные собираются
✅ Оптимизировать запросы
```

---

## 💰 СТОИМОСТЬ

| Задача | Часы | Стоимость |
|--------|------|-----------|
| Таблица БД + миграция | 4 | ₽20,000 |
| AIMetrics класс | 8 | ₽40,000 |
| Интеграция в Widget | 8 | ₽40,000 |
| Dashboard | 12 | ₽60,000 |
| Тестирование | 8 | ₽40,000 |
| **ИТОГО** | **40 ч** | **₽200,000** |

---

## 📊 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

### Через неделю после внедрения:

```
✅ Знаем: Помогает ли AI чат пользователям
✅ Знаем: Довольны ли пользователи
✅ Знаем: Какие ошибки происходят чаще всего
✅ Знаем: Насколько быстро и эффективно работает AI
✅ Можем: Улучшать на основе данных
```

### Метрики успеха:

- **Action Completion Rate:** >70% (хорошо), >85% (отлично)
- **Satisfaction Rate:** >80% (хорошо), >90% (отлично)  
- **Tool Error Rate:** <5% (хорошо), <2% (отлично)
- **Avg Latency:** <3000ms (хорошо), <2000ms (отлично)

---

## ⚡ ЧТО ДЕЛАТЬ ДАЛЬШЕ

1. **Запустите миграцию:**
```bash
npm run migrate
```

2. **Создайте файлы:**
```bash
touch lib/ai/metrics.ts
touch lib/database/ai_metrics_schema.sql
touch app/api/ai-metrics/summary/route.ts
```

3. **Интегрируйте в AIChatWidget.tsx**

4. **Через неделю - смотрите данные в dashboard**

---

## 🎯 САМОЕ ВАЖНОЕ

**Не нужно внедрять все 8 метрик Galileo сразу!**

Начните с этих **4-х критических**:
1. ✅ Action Completion
2. ✅ Conversation Quality  
3. ✅ Tool Error
4. ✅ Agent Efficiency

Этого **достаточно** для понимания работы AI в вашем приложении.

---

**Готов помочь с кодом, если начнете внедрять!** 🚀
