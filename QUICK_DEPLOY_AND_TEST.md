# 🚀 БЫСТРЫЙ ДЕПЛОЙ И ТЕСТИРОВАНИЕ

## ✅ ЧТО УЖЕ СДЕЛАНО:

1. ✅ Код запушен в ветку `cursor/analyze-repository-and-timeweb-project-79c9`
2. ✅ Переменные окружения установлены в Timeweb Apps
3. ✅ Ветка деплоя изменена на `cursor/analyze-repository-and-timeweb-project-79c9`
4. ✅ Standalone mode включен
5. ✅ Новая система планирования поездок добавлена

---

## 🎯 ШАГИ ДЛЯ ДЕПЛОЯ:

### **Вариант 1: Автоматический деплой (Timeweb Apps auto-deploy)**

Timeweb Apps должен автоматически подхватить изменения из ветки.

**Проверьте:**
1. Откройте: https://timeweb.cloud/my/apps/125051/deploy
2. Найдите последний deployment с коммитом `a3f91f8`
3. Дождитесь статуса "active"

---

### **Вариант 2: Ручной редеплой через GitHub Action**

```bash
# Запустите workflow, который автоматически передеплоит
```

Или вручную через Timeweb:
1. Откройте https://timeweb.cloud/my/apps/125051
2. Нажмите "Redeploy" 
3. Дождитесь завершения (2-3 минуты)

---

### **Вариант 3: Локальный деплой через API**

```bash
curl -X POST "https://api.timeweb.cloud/api/v1/apps/125051/deployments" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN1}" \
  -H "Content-Type: application/json"
```

---

## 🗄️ НАСТРОЙКА БАЗЫ ДАННЫХ

### **Шаг 1: Подключитесь к PostgreSQL**

Если используете Timeweb Managed PostgreSQL:

```bash
# Узнайте данные подключения:
# Host, Port, Database, User, Password
```

Или локально для теста:

```bash
docker-compose up -d postgres
```

### **Шаг 2: Примените миграции**

```bash
# На сервере через SSH или локально:
npm run migrate:accommodation:seed
```

Или вручную через psql:

```bash
psql -h <host> -U <user> -d <database> -f lib/database/accommodation_schema.sql
```

### **Шаг 3: Проверьте таблицы**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'accommodation%';

-- Должно вернуть:
-- accommodations
-- accommodation_rooms
-- accommodation_bookings
-- accommodation_reviews
```

---

## 🧪 ТЕСТИРОВАНИЕ API

### **1. Проверка health check**

```bash
curl https://pospk-kamhub-70c4.twc1.net/api/health
```

**Ожидаемый ответ:**
```json
{
  "status": "ok",
  "service": "kamchatour-hub",
  "timestamp": "2025-10-30T23:30:00.000Z",
  "uptime": 1234.56,
  "version": "0.1.0"
}
```

---

### **2. Тест планировщика поездок**

#### **Простой запрос (без AI, fallback):**

```bash
curl -X POST https://pospk-kamhub-70c4.twc1.net/api/trip/plan \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Поездка на 3 дня",
    "days": 3
  }'
```

#### **Детальный запрос:**

```bash
curl -X POST https://pospk-kamhub-70c4.twc1.net/api/trip/plan \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Я планирую поездку на КАМЧАТКУ на 5 дней. Хочу увидеть вулканы, медведей и термальные источники. Подбери туры и место проживания. Укажи логистику между точками.",
    "days": 5,
    "budget": 60000,
    "interests": ["hiking", "wildlife", "nature"],
    "groupSize": 2
  }'
```

**Ожидаемый ответ (займет 5-15 секунд):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_days": 5,
      "total_cost": 55000,
      "highlights": [
        "Восхождение на Авачинский вулкан",
        "Наблюдение за медведями",
        "Термальные источники Паратунки"
      ],
      "difficulty_level": "medium"
    },
    "days": [
      {
        "day": 1,
        "activities": [
          {
            "time": "09:00",
            "type": "transfer",
            "title": "Трансфер из аэропорта",
            "logistics": {
              "transport": "car",
              "duration_minutes": 60,
              "distance_km": 30,
              "notes": "Встреча с водителем"
            }
          }
        ],
        "accommodation": {
          "id": "uuid",
          "name": "Гостиница Петропавловск",
          "price_per_night": 3500
        },
        "total_cost": 8500
      }
    ],
    "tours": [...],
    "accommodations": [...],
    "transfers": [...],
    "recommendations": [...],
    "important_notes": [...]
  }
}
```

---

### **3. Проверка существующих API**

```bash
# Туры
curl https://pospk-kamhub-70c4.twc1.net/api/tours

# Партнеры
curl https://pospk-kamhub-70c4.twc1.net/api/partners

# AI чат
curl -X POST https://pospk-kamhub-70c4.twc1.net/api/ai \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Что посмотреть на Камчатке?"}'
```

---

## 🐛 ДИАГНОСТИКА ПРОБЛЕМ

### **Проблема 1: 404 Not Found**

**Причина:** Приложение не запустилось

**Решение:**
1. Проверьте логи: https://timeweb.cloud/my/apps/125051
2. Вкладка "Логи" → Runtime logs
3. Ищите ошибки запуска

```bash
# Или через API:
curl -s "https://api.timeweb.cloud/api/v1/apps/125051/logs?type=runtime&limit=50" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN1}"
```

---

### **Проблема 2: 500 Internal Server Error**

**Причина:** Ошибка в коде или отсутствие переменных окружения

**Проверьте переменные:**
```bash
curl -s "https://api.timeweb.cloud/api/v1/apps/125051" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN1}" \
  | jq '.app.envs'
```

**Должны быть:**
- `NODE_ENV=production`
- `PORT=8080`
- `JWT_SECRET=kamchatour-super-secret-key-2025-production`
- `GROQ_API_KEY` или `DEEPSEEK_API_KEY` (для AI)
- `DATABASE_URL` (для БД)

---

### **Проблема 3: API trip/plan возвращает ошибку**

**Возможные причины:**
1. Не применены миграции БД
2. Нет AI ключей (GROQ/DeepSeek)
3. Нет данных в таблицах

**Проверка:**

```bash
# 1. Проверьте БД
npm run db:test

# 2. Проверьте AI (должен работать хотя бы fallback)
curl -X POST https://pospk-kamhub-70c4.twc1.net/api/ai \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'

# 3. Проверьте таблицы
npm run db:info
```

---

### **Проблема 4: AI не генерирует план (возвращает fallback)**

**Причина:** Нет API ключей для GROQ или DeepSeek

**Решение:**

1. Получите бесплатный ключ GROQ: https://console.groq.com/
2. Или DeepSeek: https://platform.deepseek.com/

3. Добавьте в Timeweb Apps:
```bash
curl -X PATCH "https://api.timeweb.cloud/api/v1/apps/125051" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN1}" \
  -H "Content-Type: application/json" \
  -d '{
    "envs": {
      "NODE_ENV": "production",
      "PORT": "8080",
      "JWT_SECRET": "kamchatour-super-secret-key-2025-production",
      "GROQ_API_KEY": "ваш-ключ-groq",
      "DATABASE_URL": "postgresql://..."
    }
  }'
```

4. Редеплойте приложение

---

## 📊 МОНИТОРИНГ

### **Проверка статуса приложения:**

```bash
curl -s "https://api.timeweb.cloud/api/v1/apps/125051" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN1}" \
  | jq '{status: .app.status, branch: .app.branch, commit: .app.commit_sha}'
```

### **Проверка логов в реальном времени:**

```bash
# Runtime logs
curl -s "https://api.timeweb.cloud/api/v1/apps/125051/logs?type=runtime&limit=100" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN1}" \
  | jq '.app_logs[] | .message'

# Build logs
curl -s "https://api.timeweb.cloud/api/v1/apps/125051/logs?type=build&limit=100" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN1}" \
  | jq '.app_logs[] | .message'
```

---

## 🎨 FRONTEND ДЛЯ ТЕСТИРОВАНИЯ

Создайте простую HTML страницу для тестирования:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Тест Планировщика Камчатки</title>
  <style>
    body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
    textarea { width: 100%; height: 100px; margin: 10px 0; }
    button { padding: 10px 20px; background: #0070f3; color: white; border: none; cursor: pointer; }
    button:hover { background: #0051cc; }
    .result { margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 8px; }
    .loading { color: #0070f3; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>🗺️ Планировщик Поездок на Камчатку</h1>
  
  <form id="planForm">
    <label>Опишите вашу поездку:</label>
    <textarea id="query" placeholder="Например: Я планирую поездку на 5 дней. Хочу увидеть вулканы и медведей. Подбери туры и жилье."></textarea>
    
    <label>Количество дней:</label>
    <input type="number" id="days" min="1" max="30" value="5">
    
    <label>Бюджет (₽, необязательно):</label>
    <input type="number" id="budget" placeholder="60000">
    
    <button type="submit">🚀 Спланировать поездку</button>
  </form>
  
  <div id="result" class="result" style="display: none;"></div>
  
  <script>
    const form = document.getElementById('planForm');
    const result = document.getElementById('result');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const query = document.getElementById('query').value;
      const days = parseInt(document.getElementById('days').value);
      const budget = document.getElementById('budget').value;
      
      if (!query || !days) {
        alert('Заполните запрос и количество дней');
        return;
      }
      
      result.style.display = 'block';
      result.innerHTML = '<p class="loading">⏳ Генерируем план поездки... (5-15 секунд)</p>';
      
      try {
        const response = await fetch('https://pospk-kamhub-70c4.twc1.net/api/trip/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            days,
            budget: budget ? parseInt(budget) : undefined,
            interests: ['hiking', 'wildlife', 'nature']
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          const plan = data.data;
          let html = `
            <h2>✅ План готов!</h2>
            <p><strong>Дней:</strong> ${plan.summary.total_days}</p>
            <p><strong>Стоимость:</strong> ${plan.summary.total_cost}₽</p>
            <p><strong>Сложность:</strong> ${plan.summary.difficulty_level}</p>
            
            <h3>🎯 Highlights:</h3>
            <ul>${plan.summary.highlights.map(h => '<li>' + h + '</li>').join('')}</ul>
            
            <h3>📅 Маршрут по дням:</h3>
          `;
          
          plan.days.forEach(day => {
            html += `<div style="margin: 20px 0; padding: 15px; background: white; border-radius: 5px;">`;
            html += `<h4>День ${day.day} (${day.total_cost}₽)</h4>`;
            
            day.activities.forEach(act => {
              html += `<p><strong>${act.time}</strong> - ${act.title}</p>`;
              if (act.logistics) {
                html += `<p style="color: #666; margin-left: 20px;">
                  🚗 ${act.logistics.transport} 
                  (${act.logistics.duration_minutes} мин, ${act.logistics.distance_km} км)
                </p>`;
              }
            });
            
            if (day.accommodation) {
              html += `<p><strong>🏨 Ночлег:</strong> ${day.accommodation.name} (${day.accommodation.price_per_night}₽/ночь)</p>`;
            }
            
            html += `</div>`;
          });
          
          html += `<h3>💡 Рекомендации:</h3>`;
          html += `<ul>${plan.recommendations.map(r => '<li>' + r + '</li>').join('')}</ul>`;
          
          result.innerHTML = html;
        } else {
          result.innerHTML = `<p class="error">❌ Ошибка: ${data.error}</p>`;
        }
        
      } catch (error) {
        result.innerHTML = `<p class="error">❌ Ошибка: ${error.message}</p>`;
      }
    });
  </script>
</body>
</html>
```

Сохраните как `trip-planner-test.html` и откройте в браузере!

---

## ✅ ЧЕКЛИСТ ПЕРЕД ТЕСТИРОВАНИЕМ:

- [ ] Код запушен на GitHub
- [ ] Timeweb Apps подхватил новый коммит
- [ ] Статус деплоя "active" (зеленый)
- [ ] Применены миграции БД (accommodation tables)
- [ ] Добавлены тестовые данные (хотя бы 1 отель)
- [ ] Есть туры в таблице `tours`
- [ ] Переменные окружения установлены
- [ ] (Опционально) Добавлен GROQ_API_KEY или DEEPSEEK_API_KEY

---

## 🚀 ГОТОВО К ТЕСТИРОВАНИЮ!

**Основной endpoint:**
```
POST https://pospk-kamhub-70c4.twc1.net/api/trip/plan
```

**Пример запроса:**
```bash
curl -X POST https://pospk-kamhub-70c4.twc1.net/api/trip/plan \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Я планирую поездку на 5 дней. Хочу вулканы и медведей.",
    "days": 5
  }'
```

**Ожидайте ответ через 5-15 секунд с детальным планом!**

---

## 📞 ЕСЛИ НЕ РАБОТАЕТ:

1. Проверьте логи в Timeweb UI
2. Проверьте переменные окружения
3. Убедитесь что БД доступна
4. Проверьте что миграции применены
5. Попробуйте сначала простой health check

**Все ещё проблемы?** Отправьте мне:
- Логи из Timeweb
- Ответ от `/api/health`
- Результат curl к `/api/trip/plan`

---

**Дата:** 30.10.2025  
**Версия:** 1.0.0  
**Для:** Kamchatour Hub 🌋
