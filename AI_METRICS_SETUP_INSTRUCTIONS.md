# 🚀 ИНСТРУКЦИЯ ПО УСТАНОВКЕ AI МЕТРИК

## ✅ ЧТО БЫЛО СОЗДАНО

### 1. База данных
- `lib/database/ai_metrics_schema.sql` - SQL схема с 4 таблицами
- Таблицы: ai_metrics, ai_chat_sessions, ai_chat_messages, ai_feedback
- Views для агрегированной статистики
- Функции для управления данными

### 2. TypeScript код
- `lib/ai/metrics.ts` - Класс AIMetrics для отслеживания метрик
- Методы для всех 4 метрик (Completion, Quality, Tool Error, Efficiency)

### 3. UI компоненты
- `components/AIChatWidget.tsx` - Обновлен с кнопками обратной связи
- Автоматическое создание sessionId
- Отслеживание latency

### 4. API endpoints
- `app/api/ai-metrics/feedback/route.ts` - Сохранение обратной связи
- `app/api/ai-metrics/summary/route.ts` - Получение статистики

### 5. Dashboard
- `app/hub/operator/ai-metrics/page.tsx` - Страница с метриками
- Красивые графики и статистика
- Выбор периода (1/7/30/90 дней)

---

## 📦 УСТАНОВКА (5 шагов)

### Шаг 1: Запустите миграцию БД

```bash
# Создайте таблицы в PostgreSQL
psql -U kamuser -d kamchatour -f lib/database/ai_metrics_schema.sql

# Или через npm скрипт (если настроен)
npm run migrate -- lib/database/ai_metrics_schema.sql
```

### Шаг 2: Проверьте таблицы

```bash
psql -U kamuser -d kamchatour -c "\dt ai_*"
```

Вы должны увидеть:
```
ai_metrics
ai_chat_sessions
ai_chat_messages
ai_feedback
```

### Шаг 3: Обновите /api/chat endpoint

Откройте `app/api/chat/route.ts` и добавьте отслеживание метрик:

```typescript
import { aiMetrics } from '@/lib/ai/metrics';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sessionId, userId, message } = body;
  
  // 1. Создаем/обновляем сессию
  if (!sessionId) {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await aiMetrics.upsertSession({
      sessionId: newSessionId,
      userId,
      firstUserMessage: message,
    });
  }
  
  // 2. Сохраняем сообщение пользователя
  await aiMetrics.saveMessage({
    sessionId: sessionId || newSessionId,
    role: 'user',
    content: message,
  });
  
  const startTime = Date.now();
  
  // ... ваша логика AI ответа
  
  const aiResponse = "..."; // ответ от AI
  const latency = Date.now() - startTime;
  
  // 3. Сохраняем ответ AI
  await aiMetrics.saveMessage({
    sessionId,
    role: 'assistant',
    content: aiResponse,
    latency,
    modelUsed: 'groq-llama-3.1-70b',
  });
  
  // 4. Автоматически определяем completion
  const completed = aiMetrics.detectTaskCompletion(aiResponse);
  
  // 5. Отслеживаем эффективность
  await aiMetrics.trackAgentEfficiency({
    sessionId,
    userId,
    totalSteps: 3,  // Сколько шагов сделал AI
    optimalSteps: 2, // Сколько должен был
    totalLatency: latency,
    apiCalls: 1,
  });
  
  return NextResponse.json({ success: true, data: { ... } });
}
```

### Шаг 4: Тестирование

1. **Откройте чат:**
   ```
   http://localhost:3000
   ```

2. **Отправьте сообщение** в AI чат

3. **Нажмите кнопку "👍 Да" или "👎 Нет"**

4. **Проверьте БД:**
   ```sql
   SELECT * FROM ai_metrics ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM ai_chat_sessions ORDER BY started_at DESC LIMIT 5;
   ```

### Шаг 5: Откройте Dashboard

```
http://localhost:3000/hub/operator/ai-metrics
```

Вы должны увидеть:
- ✅ Выполнение задач (%)
- 😊 Удовлетворенность (%)
- 🔧 Успех инструментов (%)
- ⚡ Эффективность (%)
- 📈 Графики за период

---

## 🧪 ТЕСТОВЫЙ СЦЕНАРИЙ

### Создайте тестовые данные:

```sql
-- Вставить тестовую сессию
INSERT INTO ai_chat_sessions (session_id, user_id, first_user_message, user_goal, task_completed, user_satisfied)
VALUES ('test_session_1', NULL, 'Найди трансфер из аэропорта', 'Найти трансфер', true, true);

-- Вставить тестовые метрики
INSERT INTO ai_metrics (session_id, metric_type, metric_value, created_at)
VALUES 
  ('test_session_1', 'action_completion', 1.0, NOW()),
  ('test_session_1', 'conversation_quality', 1.0, NOW()),
  ('test_session_1', 'agent_efficiency', 0.85, NOW());

-- Вставить тестовые ошибки инструментов
INSERT INTO ai_metrics (session_id, metric_type, tool_name, success, latency, created_at)
VALUES 
  ('test_session_1', 'tool_execution', 'transfer_search', true, 450, NOW()),
  ('test_session_2', 'tool_execution', 'transfer_search', false, 2100, NOW());
```

### Проверьте Dashboard:

```
http://localhost:3000/hub/operator/ai-metrics
```

Должны увидеть тестовые данные!

---

## 📊 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ

### В вашем коде:

```typescript
import { aiMetrics } from '@/lib/ai/metrics';

// 1. Отследить выполнение задачи
await aiMetrics.trackActionCompletion({
  sessionId: 'session_123',
  userId: 'user_456',
  userMessage: 'Найди трансфер',
  aiResponse: 'Вот 5 вариантов трансфера',
  completed: true,
});

// 2. Отследить качество беседы
await aiMetrics.trackConversationQuality({
  sessionId: 'session_123',
  userId: 'user_456',
  satisfied: true,
  turnsToResolution: 3,
});

// 3. Отследить ошибку инструмента
await aiMetrics.trackToolExecution({
  sessionId: 'session_123',
  toolName: 'transfer_search',
  success: false,
  latency: 2500,
  errorMessage: 'Database connection timeout',
});

// 4. Отследить эффективность
await aiMetrics.trackAgentEfficiency({
  sessionId: 'session_123',
  totalSteps: 5,
  optimalSteps: 3,
  totalLatency: 1200,
  apiCalls: 2,
});
```

---

## 🎯 ЦЕЛЕВЫЕ ПОКАЗАТЕЛИ

После недели работы, стремитесь к:

| Метрика | Хорошо | Отлично |
|---------|--------|---------|
| **Action Completion** | >70% | >85% |
| **Satisfaction Rate** | >80% | >90% |
| **Tool Success Rate** | >95% | >98% |
| **Avg Latency** | <3000ms | <2000ms |
| **Efficiency** | >70% | >85% |

---

## 🐛 TROUBLESHOOTING

### Проблема: Таблицы не создаются

```bash
# Проверьте подключение к БД
npm run db:test

# Проверьте права доступа
psql -U kamuser -d kamchatour -c "SELECT current_user;"
```

### Проблема: Dashboard пустой

```sql
-- Проверьте наличие данных
SELECT COUNT(*) FROM ai_metrics;
SELECT COUNT(*) FROM ai_chat_sessions;

-- Если 0, создайте тестовые данные (см. выше)
```

### Проблема: Ошибка при отправке feedback

```typescript
// Проверьте что sessionId существует
console.log('SessionId:', sessionId);

// Проверьте network в DevTools
// Должен быть POST /api/ai-metrics/feedback
```

---

## 🔄 ОБНОВЛЕНИЕ

Если в будущем нужно добавить новые метрики:

1. **Добавьте в таблицу ai_metrics:**
   ```sql
   -- Новая метрика уже поддерживается через JSONB details
   ```

2. **Добавьте метод в AIMetrics класс:**
   ```typescript
   async trackNewMetric(data) {
     await query(...);
   }
   ```

3. **Обновите Dashboard для отображения**

---

## ✅ CHECKLIST

- [ ] SQL схема создана
- [ ] Таблицы существуют в БД
- [ ] /api/chat обновлен с метриками
- [ ] AIChatWidget показывает кнопки feedback
- [ ] Feedback сохраняется в БД
- [ ] Dashboard открывается
- [ ] Dashboard показывает данные
- [ ] Тестовый сценарий прошел

---

## 🎉 ГОТОВО!

Теперь у вас есть полноценная система отслеживания AI метрик!

**Следующие шаги:**
1. Подождите неделю накопления данных
2. Анализируйте метрики в Dashboard
3. Оптимизируйте AI на основе данных
4. Profit! 💰

---

**Вопросы?** Проверьте логи:
```bash
# Server logs
npm run dev

# Database logs
tail -f /var/log/postgresql/postgresql.log
```
