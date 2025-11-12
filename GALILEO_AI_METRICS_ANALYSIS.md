# 🤖 GALILEO AI AGENTIC METRICS
## Анализ и применение к Kamchatour Hub

**Дата:** 2025-11-05  
**Источник:** Galileo AI Documentation  
**Применение:** Kamchatour Hub AI Agent System

---

## 📋 EXECUTIVE SUMMARY

Galileo AI предоставляет комплексный набор метрик для оценки производительности AI агентов. Эти метрики особенно важны для multi-agent систем, таких как AI-ассистент в Kamchatour Hub.

### Ключевые выводы

✅ **8 критических метрик** для оценки AI агентов  
✅ **Multi-agent системы** требуют специального подхода  
✅ **Observability** - ключ к успеху production AI  
✅ **Context Engineering** - основа качественных агентов  

---

## 🎯 GALILEO AGENTIC METRICS OVERVIEW

### Полный список метрик

| # | Метрика | Назначение | Когда использовать | Пример применения |
|---|---------|------------|-------------------|-------------------|
| 1 | **Action Sequence** | Правильность последовательности действий агента | Для оценки workflow агентов | Агент бронирования: перелет → отель → активности |
| 2 | **Action Completion** | Выполнение всех целей пользователя | Оценка достижения целей | Coding агент закрывающий тикеты |
| 3 | **Agent Efficiency** | Эффективность пути к решению | Оптимизация времени отклика | Быстрый multi-agent чатбот |
| 4 | **Agent Flow** | Корректность траектории агента | Multi-agent системы с множеством tools | Агент следующий строгим процессам |
| 5 | **Conversation Quality** | Удовлетворенность пользователя | Customer-facing чатботы | Страховой чатбот |
| 6 | **Tool Error** | Ошибки выполнения инструментов | Агенты использующие external APIs | Coding assistant с внешними API |
| 7 | **Tool Selection Quality** | Правильность выбора инструментов | Оптимизация использования tools | Data analysis агент |
| 8 | **User Intent Change** | Изменение намерений пользователя | Анализ сессий пользователей | Многоцелевой банковский чатбот |

---

## 🔍 ДЕТАЛЬНЫЙ АНАЛИЗ МЕТРИК

### 1. Action Sequence (Последовательность действий)

**Описание:**  
Оценивает правильность порядка выполнения действий агентом для достижения цели.

**Формула оценки:**
```
Score = (Correct Steps in Correct Order) / (Total Required Steps)
```

**Ключевые аспекты:**
- ✅ Соблюдение логической последовательности
- ✅ Отсутствие пропущенных критических шагов
- ✅ Правильные зависимости между действиями

**Пример для Kamchatour Hub:**
```
Правильная последовательность бронирования трансфера:
1. Поиск доступных трансферов
2. Проверка свободных мест
3. Создание временной блокировки (hold)
4. Оформление платежа
5. Подтверждение бронирования
6. Освобождение hold / Создание booking

Неправильная последовательность:
1. Создание booking
2. ❌ Проверка мест (уже поздно!)
3. Оформление платежа
```

**Критичность для Kamchatour Hub:** 🔴 Высокая
- Система трансферов требует строгой последовательности
- Race conditions могут возникнуть при нарушении порядка

---

### 2. Action Completion (Завершенность действий)

**Описание:**  
Определяет успешность выполнения всех целей пользователя.

**Формула оценки:**
```
Completion Rate = (Completed Goals) / (Total User Goals) × 100%
```

**Уровни завершенности:**
- 🟢 100% - Полное выполнение
- 🟡 75-99% - Частичное выполнение
- 🔴 <75% - Неудовлетворительно

**Пример для Kamchatour Hub:**
```
Запрос пользователя: "Хочу трансфер из аэропорта в Паратунку 
                      завтра утром с детским креслом"

Цели:
✅ 1. Найти трансфер по маршруту
✅ 2. Выбрать утреннее время
✅ 3. Транспорт с детским креслом
✅ 4. Забронировать на завтра

Action Completion = 4/4 = 100% ✅
```

**Критичность:** 🟢 Критическая для UX

---

### 3. Agent Efficiency (Эффективность агента)

**Описание:**  
Оценивает оптимальность пути агента к решению задачи.

**Метрики эффективности:**
```typescript
interface AgentEfficiency {
  stepsToSolution: number;        // Количество шагов
  optimalSteps: number;           // Оптимальное количество
  redundantActions: number;       // Избыточные действия
  backtrackingCount: number;      // Возвраты назад
  efficiency: number;             // stepsToSolution / optimalSteps
}
```

**Формула:**
```
Efficiency = (Optimal Steps / Actual Steps) × 100%
```

**Пример:**
```
Оптимальный путь (3 шага):
1. Query database for transfers
2. Filter by preferences
3. Return results

Неэффективный путь (7 шагов):
1. Query all transfers
2. Query weather API (не нужно!)
3. Filter by route
4. Filter by time
5. Re-query database (дубликат!)
6. Filter by vehicle type
7. Return results

Efficiency = 3/7 = 43% ⚠️
```

**Целевая эффективность:** >80%

---

### 4. Agent Flow (Поток агента)

**Описание:**  
Измеряет корректность и согласованность траектории агента.

**Компоненты:**
- **Coherence** - Логическая связность шагов
- **Correctness** - Правильность выбора действий
- **Validation** - Соответствие user-specified правилам

**Natural Language Tests:**
```yaml
flow_tests:
  - name: "Transfer Booking Flow"
    steps:
      - "User provides route details"
      - "Agent searches available transfers"
      - "Agent presents options with prices"
      - "User selects transfer"
      - "Agent validates availability"
      - "Agent processes payment"
      - "Agent confirms booking"
    
    validation_rules:
      - "Payment must happen before confirmation"
      - "Availability must be checked before payment"
      - "User must select before processing"
```

**Оценка:**
```
Flow Score = (Valid Transitions / Total Transitions) × 100%
```

---

### 5. Conversation Quality (Качество беседы)

**Описание:**  
Бинарная метрика удовлетворенности пользователя взаимодействием.

**Критерии оценки:**

**🟢 Positive (Удовлетворен):**
- Проблема решена полностью
- Ответы релевантны и понятны
- Минимум повторений
- Вежливый и профессиональный тон
- Быстрое решение

**🔴 Negative (Фрустрирован):**
- Проблема не решена
- Множество повторений
- Непонимание контекста
- Grumpy/негативный тон
- Долгое решение

**Для Kamchatour Hub:**
```typescript
interface ConversationQuality {
  userSatisfaction: 'satisfied' | 'frustrated';
  problemResolved: boolean;
  responseRelevance: number;      // 0-1
  turnsToResolution: number;
  tone: 'positive' | 'neutral' | 'negative';
}
```

**Целевые метрики:**
- Satisfaction Rate: >90%
- Average Turns: <5
- Response Relevance: >0.85

---

### 6. Tool Error (Ошибки инструментов)

**Описание:**  
Детектирует ошибки или сбои при выполнении tools агентом.

**Типы ошибок:**

1. **Execution Errors**
   ```typescript
   - API timeout
   - Network failure
   - Invalid parameters
   - Authentication failure
   ```

2. **Logical Errors**
   ```typescript
   - Wrong tool selected
   - Invalid input format
   - Missing required parameters
   - Incorrect sequence
   ```

3. **Data Errors**
   ```typescript
   - No results found
   - Data validation failure
   - Inconsistent state
   ```

**Метрики:**
```typescript
interface ToolErrorMetrics {
  totalToolCalls: number;
  errorCount: number;
  errorRate: number;              // errorCount / totalToolCalls
  errorsByType: Record<string, number>;
  errorRecoveryRate: number;      // Successful retries
}
```

**Целевые значения:**
- Error Rate: <5%
- Recovery Rate: >80%

**Для Kamchatour Hub:**
```typescript
// Наши tools
const tools = [
  'searchTransfers',           // Поиск трансферов
  'checkAvailability',         // Проверка мест
  'createBooking',             // Создание бронирования
  'processPayment',            // Обработка платежа
  'getWeather',                // Погода
  'searchTours',               // Поиск туров
  'calculateLoyaltyPoints'     // Расчет баллов
];
```

---

### 7. Tool Selection Quality (Качество выбора инструментов)

**Описание:**  
Оценивает правильность выбора инструментов агентом для задачи.

**Критерии качества:**
- ✅ Необходимость - tool действительно нужен
- ✅ Достаточность - достаточно ли одного tool
- ✅ Оптимальность - лучший ли выбор tool
- ✅ Последовательность - правильный ли порядок

**Оценка:**
```typescript
interface ToolSelectionQuality {
  appropriateTools: number;       // Правильно выбранные
  unnecessaryTools: number;       // Лишние инструменты
  missedTools: number;            // Пропущенные нужные
  quality: number;                // appropriateTools / totalNeeded
}
```

**Примеры для Kamchatour Hub:**

**🟢 Хороший выбор:**
```
User: "Найди трансфер из аэропорта завтра"
Tools used:
✅ searchTransfers(from="Airport", date="tomorrow")
✅ checkAvailability(results)

Quality = 2/2 = 100%
```

**🔴 Плохой выбор:**
```
User: "Найди трансфер из аэропорта завтра"
Tools used:
❌ getWeather(location="Airport")        // Не нужно!
❌ searchTours(location="Kamchatka")     // Не нужно!
✅ searchTransfers(from="Airport")
❌ calculateLoyaltyPoints()              // Преждевременно!

Quality = 1/4 = 25% ⚠️
```

---

### 8. User Intent Change (Изменение намерений)

**Описание:**  
Измеряет значительные изменения основных целей пользователя в сессии.

**Типы изменений:**

1. **Topic Shift** - Смена темы
   ```
   "Трансфер из аэропорта" → "Забронировать тур на вулканы"
   ```

2. **Goal Evolution** - Развитие цели
   ```
   "Где остановиться?" → "Трансфер + Отель + Тур (package deal)"
   ```

3. **Scope Change** - Изменение масштаба
   ```
   "Трансфер на 1 человека" → "Групповой трансфер на 10 человек"
   ```

**Метрики:**
```typescript
interface IntentChangeMetrics {
  initialIntent: string;
  currentIntent: string;
  intentChangeCount: number;
  intentStability: number;        // 1 - (changes / totalTurns)
  multiPurposeSession: boolean;   // Более одной основной цели
}
```

**Анализ для Kamchatour Hub:**
```
Сценарий 1: Стабильное намерение ✅
User Turn 1: "Хочу трансфер из аэропорта"
User Turn 2: "С детским креслом"
User Turn 3: "Утром"
User Turn 4: "Забронируй"

Intent Stability = 1 - (0/4) = 100% ✅

Сценарий 2: Множественные намерения ⚠️
User Turn 1: "Хочу трансфер из аэропорта"
User Turn 2: "А какие есть туры?"
User Turn 3: "Погода завтра?"
User Turn 4: "Покажи отели"

Intent Changes = 3
Intent Stability = 1 - (3/4) = 25% ⚠️
```

**Для multi-purpose чатбота это нормально!**

---

## 🏗️ MASTERING MULTI-AGENT SYSTEMS

### Ключевые принципы из eBook Galileo

#### 1. Context Engineering

**Определение:**  
Искусство проектирования и оптимизации контекста для AI агентов.

**Best Practices:**
```typescript
interface ContextEngineering {
  // 1. Relevant Context
  relevantInfo: {
    userProfile: UserProfile;
    sessionHistory: Message[];
    businessRules: Rule[];
    domainKnowledge: Knowledge[];
  };
  
  // 2. Context Pruning
  pruning: {
    maxTokens: number;
    priorityScoring: (item: any) => number;
    timeDecay: boolean;
  };
  
  // 3. Context Injection
  injection: {
    systemPrompt: string;
    fewShotExamples: Example[];
    retrievedDocs: Document[];
  };
}
```

**Для Kamchatour Hub:**
```typescript
// Контекст для Transfer Agent
const transferContext = {
  user: {
    id: "user_123",
    loyaltyLevel: "Gold",
    preferences: ["child_seat", "comfort_class"],
    pastBookings: 15
  },
  session: {
    currentRoute: "Airport → Paratunka",
    searchCriteria: {
      date: "2025-11-10",
      passengers: 2,
      features: ["child_seat"]
    }
  },
  business: {
    peakSeasonRates: true,
    availableDiscounts: ["loyalty_10%"],
    operationalHours: "24/7"
  }
};
```

#### 2. Agent Architecture Choices

**Типы архитектур:**

**A. Single Agent**
```
User → Agent → Tools → Response
```
- ✅ Простота
- ✅ Низкая latency
- ❌ Ограниченная сложность

**B. Multi-Agent Sequential**
```
User → Agent1 → Agent2 → Agent3 → Response
```
- ✅ Специализация агентов
- ✅ Модульность
- ❌ Высокая latency

**C. Multi-Agent Parallel**
```
        → Agent1 →
User →  → Agent2 → Aggregator → Response
        → Agent3 →
```
- ✅ Параллелизация
- ✅ Быстрая работа
- ❌ Сложная координация

**D. Hierarchical**
```
User → Coordinator Agent
         ↓
    Specialist Agents
    (transfer, tours, weather)
         ↓
      Response
```
- ✅ Масштабируемость
- ✅ Четкие роли
- ❌ Overhead координации

**Рекомендация для Kamchatour Hub:** Hierarchical

#### 3. AI Observability

**Три столпа:**

**1. Logging**
```typescript
interface AgentLog {
  timestamp: Date;
  agentId: string;
  action: string;
  input: any;
  output: any;
  latency: number;
  success: boolean;
  metadata: {
    userId: string;
    sessionId: string;
    toolsUsed: string[];
  };
}
```

**2. Tracing**
```typescript
interface AgentTrace {
  traceId: string;
  spans: Span[];  // Каждый шаг агента
  totalLatency: number;
  criticalPath: Span[];
}
```

**3. Metrics**
```typescript
interface AgentMetrics {
  // Performance
  averageLatency: number;
  p95Latency: number;
  throughput: number;
  
  // Quality
  successRate: number;
  errorRate: number;
  userSatisfaction: number;
  
  // Business
  conversionsRate: number;
  revenuePerSession: number;
  costPerRequest: number;
}
```

---

## 🎯 ПРИМЕНЕНИЕ К KAMCHATOUR HUB

### Текущее состояние AI в проекте

**Существующие AI компоненты:**

1. **AI Chat Widget** (`components/AIChatWidget.tsx`)
   - GROQ API (Llama 3.1 70B)
   - DeepSeek API
   - OpenRouter API

2. **API Endpoints:**
   - `/api/ai` - Основной AI endpoint
   - `/api/ai/groq` - GROQ специфичный
   - `/api/chat` - Чат система

3. **Контексты:**
   - Нет явных агентов (пока)
   - Нет инструментария (tools)
   - Нет observability

### Рекомендуемая архитектура Multi-Agent

```typescript
// Иерархическая архитектура агентов

interface KamchatourAgentSystem {
  coordinator: CoordinatorAgent;
  specialists: {
    transfer: TransferAgent;
    tours: ToursAgent;
    loyalty: LoyaltyAgent;
    weather: WeatherAgent;
    booking: BookingAgent;
  };
  tools: Tool[];
  observability: ObservabilitySystem;
}
```

### Предлагаемая реализация

#### 1. Coordinator Agent

```typescript
// lib/ai/agents/coordinator.ts

export class CoordinatorAgent {
  async processUserInput(input: string, context: SessionContext) {
    // 1. Определение намерения
    const intent = await this.detectIntent(input);
    
    // 2. Выбор специалиста
    const specialist = this.selectSpecialist(intent);
    
    // 3. Делегирование
    const response = await specialist.handle(input, context);
    
    // 4. Aggregation
    return this.formatResponse(response);
  }
  
  private selectSpecialist(intent: Intent): SpecialistAgent {
    switch(intent.type) {
      case 'transfer': return this.specialists.transfer;
      case 'tour': return this.specialists.tours;
      case 'loyalty': return this.specialists.loyalty;
      case 'weather': return this.specialists.weather;
      default: return this.specialists.general;
    }
  }
}
```

#### 2. Transfer Specialist Agent

```typescript
// lib/ai/agents/transfer-agent.ts

export class TransferAgent implements SpecialistAgent {
  private tools = [
    new SearchTransfersTool(),
    new CheckAvailabilityTool(),
    new CreateBookingTool(),
    new ProcessPaymentTool()
  ];
  
  async handle(input: string, context: SessionContext) {
    // 1. Извлечение параметров
    const params = await this.extractParameters(input);
    
    // 2. Планирование действий
    const plan = await this.planActions(params);
    
    // 3. Выполнение плана
    const result = await this.executePlan(plan, context);
    
    // 4. Валидация
    const validated = await this.validate(result);
    
    return validated;
  }
  
  private async executePlan(plan: Action[], context: SessionContext) {
    const trace = this.observability.startTrace('transfer-agent');
    
    for (const action of plan) {
      const span = trace.startSpan(action.name);
      
      try {
        const tool = this.selectTool(action);
        const result = await tool.execute(action.params);
        
        span.setStatus('success');
        span.end();
        
        // Galileo Metrics
        this.metrics.recordToolUsage({
          tool: tool.name,
          success: true,
          latency: span.duration
        });
        
      } catch (error) {
        span.setStatus('error', error);
        span.end();
        
        // Tool Error Metric
        this.metrics.recordToolError({
          tool: tool.name,
          error: error.message
        });
      }
    }
    
    trace.end();
  }
}
```

#### 3. Tools Implementation

```typescript
// lib/ai/tools/search-transfers.ts

export class SearchTransfersTool implements Tool {
  name = 'searchTransfers';
  description = 'Search available transfers by route and date';
  
  parameters = {
    from: { type: 'string', required: true },
    to: { type: 'string', required: true },
    date: { type: 'string', required: true },
    passengers: { type: 'number', required: true }
  };
  
  async execute(params: SearchTransfersParams): Promise<Transfer[]> {
    const span = tracing.startSpan('search-transfers-tool');
    
    try {
      const results = await database.query(`
        SELECT * FROM transfer_schedules s
        JOIN transfer_routes r ON s.route_id = r.id
        WHERE r.from_location = $1 
          AND r.to_location = $2
          AND s.is_active = true
          AND s.available_seats >= $3
      `, [params.from, params.to, params.passengers]);
      
      span.setTag('results_count', results.rows.length);
      span.end();
      
      return results.rows;
      
    } catch (error) {
      span.setError(error);
      span.end();
      throw error;
    }
  }
}
```

#### 4. Observability System

```typescript
// lib/ai/observability/galileo-integration.ts

export class GalileoObservability {
  async trackAgentRun(run: AgentRun) {
    // 1. Action Sequence
    const actionSequence = this.evaluateActionSequence(run.actions);
    
    // 2. Action Completion
    const completion = this.evaluateCompletion(run.goals, run.results);
    
    // 3. Agent Efficiency
    const efficiency = this.evaluateEfficiency(
      run.actions.length,
      run.optimalActions
    );
    
    // 4. Tool Selection Quality
    const toolQuality = this.evaluateToolSelection(
      run.toolsUsed,
      run.requiredTools
    );
    
    // 5. Conversation Quality
    const conversation = this.evaluateConversation(run.messages);
    
    // Send to Galileo
    await this.galileoClient.log({
      actionSequence,
      completion,
      efficiency,
      toolQuality,
      conversation,
      metadata: run.metadata
    });
  }
  
  private evaluateActionSequence(actions: Action[]): MetricResult {
    const expectedSequence = this.getExpectedSequence(actions[0].type);
    const actualSequence = actions.map(a => a.name);
    
    const correctOrder = this.compareSequences(
      expectedSequence,
      actualSequence
    );
    
    return {
      metric: 'action_sequence',
      score: correctOrder / expectedSequence.length,
      details: {
        expected: expectedSequence,
        actual: actualSequence,
        correctSteps: correctOrder
      }
    };
  }
}
```

---

## 📊 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (2-3 недели)

**Week 1-2: Agent Architecture**
```typescript
✅ Создать Coordinator Agent
✅ Создать Transfer Specialist Agent
✅ Создать базовые Tools
✅ Интегрировать с существующими API
```

**Week 2-3: Observability**
```typescript
✅ Настроить logging
✅ Добавить tracing
✅ Интегрировать Galileo (или аналог)
✅ Dashboard для метрик
```

### Phase 2: Специализация (3-4 недели)

**Week 3-4: More Specialists**
```typescript
✅ Tours Agent
✅ Loyalty Agent
✅ Weather Agent
✅ Booking Agent
```

**Week 5-6: Advanced Tools**
```typescript
✅ Payment Tool
✅ Notification Tool
✅ Analytics Tool
✅ Recommendation Tool
```

### Phase 3: Optimization (2-3 недели)

**Week 7-8: Performance**
```typescript
✅ Кэширование
✅ Параллелизация
✅ Latency оптимизация
✅ Cost optimization
```

**Week 8-9: Quality**
```typescript
✅ A/B тестирование агентов
✅ Fine-tuning на реальных данных
✅ Context engineering
✅ Tool selection optimization
```

---

## 💰 СТОИМОСТЬ РЕАЛИЗАЦИИ

### Детальная оценка

| Компонент | Часы | Стоимость |
|-----------|------|-----------|
| **Phase 1: Foundation** |
| Coordinator Agent | 40 | ₽200,000 |
| Transfer Agent | 60 | ₽300,000 |
| Base Tools (4 шт) | 80 | ₽400,000 |
| Observability Setup | 40 | ₽200,000 |
| **Phase 2: Specialization** |
| Specialist Agents (4 шт) | 120 | ₽600,000 |
| Advanced Tools (4 шт) | 80 | ₽400,000 |
| **Phase 3: Optimization** |
| Performance туning | 40 | ₽200,000 |
| Quality improvements | 40 | ₽200,000 |
| **ИТОГО** | **500 ч** | **₽2,500,000** |

### Сравнение с текущей системой

| Аспект | Сейчас | После внедрения |
|--------|--------|----------------|
| **Функциональность** | Базовый чат | Multi-agent система |
| **Tools** | 0 | 8+ инструментов |
| **Observability** | Console.log | Полный tracing |
| **Metrics** | Нет | 8 Galileo метрик |
| **Качество ответов** | 70% | 90%+ |
| **User Satisfaction** | ? | Измеряемо |
| **Стоимость** | ₽100,000 | ₽2,500,000 |

### ROI расчет

```
Текущая конверсия чата: ~15% (assumption)
После внедрения: ~35% (с proper AI agent)

Дополнительные конверсии = 20%

При 1,000 сессий/месяц:
- Дополнительные конверсии: 200/месяц
- Средний чек: ₽2,000
- Дополнительный доход: ₽400,000/месяц
- Годовой доход: ₽4,800,000

ROI = (₽4,800,000 - ₽2,500,000) / ₽2,500,000 = 92%
Окупаемость: 6.25 месяцев
```

---

## 📋 РЕКОМЕНДАЦИИ

### Приоритет 1: Немедленно (этот месяц)

1. **Добавить базовый observability**
   ```typescript
   // Минимальный logging
   console.log → structured logging
   + Request ID
   + User ID
   + Timestamp
   + Action type
   ```

2. **Создать простой Coordinator**
   ```typescript
   // Routing между разными типами запросов
   if (isTransferQuery) → transfer logic
   if (isTourQuery) → tour logic
   ```

3. **Measure current metrics**
   ```typescript
   // Установить baseline
   - Average response time
   - Success rate
   - User satisfaction (proxy)
   ```

### Приоритет 2: Следующий квартал

1. **Implement full multi-agent system**
2. **Add all 8 Galileo metrics**
3. **Create comprehensive dashboard**
4. **A/B test против текущей системы**

### Приоритет 3: Долгосрочно

1. **Fine-tune agents на domain data**
2. **Expand to mobile app**
3. **Add predictive capabilities**
4. **Integrate with CRM**

---

## 🎓 ЗАКЛЮЧЕНИЕ

### Ключевые выводы

1. **Galileo Metrics - must have** для production AI agents
2. **Multi-agent architecture** - правильный выбор для Kamchatour Hub
3. **Observability** - не optional, а критичный компонент
4. **Context Engineering** - искусство, требующее итераций

### Следующие шаги

✅ **Изучить** полную документацию Galileo  
✅ **Протестировать** Galileo SDK  
✅ **Создать** proof of concept для Transfer Agent  
✅ **Измерить** baseline метрики  
✅ **Начать** Phase 1 implementation  

### Полезные ресурсы

- [Galileo AI Documentation](https://v2docs.galileo.ai/)
- [Multi-Agent Systems eBook](https://galileo.ai/mastering-multi-agent-systems)
- [LangChain Agents](https://python.langchain.com/docs/modules/agents/)
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview)

---

**Отчет подготовлен:** Cursor AI Agent  
**На основе:** Galileo AI Documentation  
**Для проекта:** Kamchatour Hub

**Дата:** 2025-11-05  
**Версия:** 1.0
