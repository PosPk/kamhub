# 🗺️ API Планировщика Путешествий на Камчатку

## Обзор

Интеллектуальная система планирования поездок на Камчатку с использованием AI для автоматического подбора туров, размещения и трансферов.

## Возможности

✅ **Анализ запросов на естественном языке**
- "Я планирую поездку на Камчатку на 5 дней. Хочу увидеть вулканы и медведей"
- Автоматическое извлечение намерений, интересов, бюджета

✅ **Подбор карточек из БД**
- Туры с учетом сложности, рейтинга, цены
- Размещение по типу, стоимости, удобствам
- Трансферы между локациями

✅ **Генерация детального маршрута**
- Поминутный план на каждый день
- Логистика между точками (транспорт, время, расстояние)
- Учет времени на отдых и переезды

✅ **Расчет стоимости**
- Общая стоимость поездки
- Разбивка по дням
- Учет всех расходов (туры, жилье, транспорт)

## API Endpoint

### `POST /api/trip/plan`

Генерация плана поездки

#### Request Body

```json
{
  "query": "Я планирую поездку на КАМЧАТКУ на 7 дней. Составь для меня детальный маршрут. Подбери место проживания. Укажи не только туры и достопримечательности, также логистику между точками (пешком/транспорт)",
  "days": 7,
  "budget": 100000,
  "interests": ["hiking", "wildlife", "photography", "nature"],
  "groupSize": 2,
  "startDate": "2025-07-15"
}
```

#### Parameters

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `query` | string | ✅ | Запрос пользователя на естественном языке |
| `days` | number | ✅ | Количество дней (1-30) |
| `budget` | number | ❌ | Бюджет в рублях |
| `interests` | string[] | ❌ | Интересы: hiking, wildlife, culture, adventure, relaxation, photography |
| `groupSize` | number | ❌ | Размер группы (по умолчанию 2) |
| `startDate` | string | ❌ | Дата начала в формате YYYY-MM-DD |

#### Response

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_days": 7,
      "total_cost": 85000,
      "highlights": [
        "Восхождение на Авачинский вулкан",
        "Визит в Долину гейзеров",
        "Наблюдение за медведями"
      ],
      "difficulty_level": "medium"
    },
    "days": [
      {
        "day": 1,
        "date": "2025-07-15",
        "activities": [
          {
            "time": "09:00",
            "type": "transfer",
            "card_id": "transfer-uuid",
            "title": "Трансфер из аэропорта",
            "description": "Встреча в аэропорту Елизово, трансфер до отеля",
            "duration": 60,
            "price": 1500,
            "logistics": {
              "transport": "car",
              "duration_minutes": 60,
              "distance_km": 30,
              "notes": "Встреча с табличкой у выхода"
            }
          },
          {
            "time": "14:00",
            "type": "tour",
            "card_id": "tour-uuid",
            "title": "Обзорная экскурсия по Петропавловску",
            "description": "Знакомство с городом, посещение смотровых площадок",
            "duration": 180,
            "price": 3500,
            "logistics": {
              "transport": "walk",
              "duration_minutes": 15,
              "distance_km": 1.2,
              "notes": "Встреча у отеля"
            }
          },
          {
            "time": "18:00",
            "type": "free_time",
            "title": "Свободное время",
            "description": "Ужин, отдых после перелета"
          }
        ],
        "accommodation": {
          "id": "acc-uuid",
          "name": "Гостиница 'Петропавловск'",
          "type": "hotel",
          "address": "ул. Ленинская, 61",
          "price_per_night": 3500,
          "rating": 4.2,
          "amenities": ["wifi", "breakfast", "parking"],
          "coordinates": { "lat": 53.0186, "lng": 158.6507 }
        },
        "total_cost": 8500
      }
      // ... остальные дни
    ],
    "tours": [
      {
        "id": "tour-uuid",
        "name": "Восхождение на Авачинский вулкан",
        "description": "Однодневное восхождение...",
        "duration": 480,
        "price": 8500,
        "difficulty": "medium",
        "rating": 4.8,
        "coordinates": []
      }
    ],
    "accommodations": [
      {
        "id": "acc-uuid",
        "name": "Гостиница 'Петропавловск'",
        "type": "hotel",
        "price_per_night": 3500,
        "rating": 4.2
      }
    ],
    "transfers": [
      {
        "id": "transfer-uuid",
        "route_name": "Аэропорт - Город",
        "from_location": "Аэропорт Елизово",
        "to_location": "Центр Петропавловска",
        "distance_km": 30,
        "duration_minutes": 60,
        "price_per_person": 1500
      }
    ],
    "recommendations": [
      "Возьмите теплую одежду даже летом - погода изменчива",
      "Носите удобную треккинговую обувь",
      "Обязательно возьмите фотоаппарат или хороший смартфон",
      "Оформите страховку для активного отдыха"
    ],
    "important_notes": [
      "Соблюдайте правила безопасности в медвежьих зонах",
      "Не отходите от группы на маршрутах",
      "Предупредите гида о проблемах со здоровьем",
      "Погода может измениться - будьте готовы к корректировке плана"
    ]
  }
}
```

## Примеры запросов

### 1. Активный отдых на 5 дней

```bash
curl -X POST https://kamhub.com/api/trip/plan \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Хочу активный отдых на 5 дней. Восхождения на вулканы, рыбалка, термальные источники.",
    "days": 5,
    "budget": 60000,
    "interests": ["hiking", "fishing", "nature"]
  }'
```

### 2. Семейная поездка

```bash
curl -X POST https://kamhub.com/api/trip/plan \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Планируем семейную поездку с детьми 7 и 10 лет на неделю. Нужны несложные маршруты и комфортное жилье.",
    "days": 7,
    "groupSize": 4,
    "interests": ["family", "nature", "easy_hiking"]
  }'
```

### 3. Фото-тур

```bash
curl -X POST https://kamhub.com/api/trip/plan \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Я фотограф. Хочу снять вулканы, медведей, природу Камчатки за 10 дней.",
    "days": 10,
    "budget": 150000,
    "interests": ["photography", "wildlife", "nature", "volcanoes"]
  }'
```

## Логика подбора

### Туры

Подбираются по критериям:
- ✅ Сложность соответствует уровню подготовки
- ✅ Рейтинг ≥ 3.5
- ✅ Цена в рамках бюджета
- ✅ Доступны в указанный период
- ✅ Соответствуют интересам пользователя

### Размещение

Подбирается по критериям:
- ✅ Стоимость на ночь в рамках бюджета
- ✅ Рейтинг ≥ 3.5
- ✅ Достаточно мест для группы
- ✅ Удобства соответствуют предпочтениям

### Трансферы

Рассчитываются автоматически:
- ✅ Определяется расстояние между точками (формула Haversine)
- ✅ Подбирается оптимальный транспорт:
  - Пешком: до 2 км в городе, до 5 км в природе
  - Такси: от 1 км (200₽ + 50₽/км)
  - Трансфер: от 10 км (100₽/км)
  - Автобус: только в городе
- ✅ Рассчитывается время в пути
- ✅ Учитывается тип местности (город/горы)

## Расчет логистики

### Формула расстояний

Используется формула Haversine для точного расчета расстояний по сфере:

```typescript
distance = 2R × arcsin(√(sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)))
```

Где:
- R = 6371 км (радиус Земли)
- Δlat, Δlon - разница координат

### Типы транспорта

| Транспорт | Условия | Скорость | Стоимость | Комфорт |
|-----------|---------|----------|-----------|---------|
| Пешком | ≤ 2 км (город) | 4 км/ч | 0₽ | ⭐⭐⭐ |
| Автобус | Город, > 2 км | ~20 км/ч | 30₽ | ⭐⭐ |
| Такси | ≥ 1 км | ~25 км/ч | 200₽ + 50₽/км | ⭐⭐⭐⭐ |
| Трансфер | ≥ 10 км | ~30 км/ч | 100₽/км | ⭐⭐⭐⭐⭐ |
| Личный авто | ≥ 5 км | ~30 км/ч | 15₽/км | ⭐⭐⭐⭐ |
| Вертолет | ≥ 50 км (горы) | ~120 км/ч | 1000₽/км | ⭐⭐⭐⭐⭐ |

## AI Промпты

### Анализ запроса

AI извлекает из запроса:
- Основные интересы (вулканы, медведи, рыбалка, термальные источники)
- Уровень физической подготовки
- Тип путешественника (одиночка/пара/семья/группа)
- Приоритеты (приключения/комфорт/бюджет/экология)

### Генерация маршрута

AI создает детальный план с:
- Поминутным расписанием на каждый день
- Выбором конкретных туров из БД (по ID)
- Размещением каждую ночь
- Логистикой между всеми точками
- Временем на отдых, питание, переезды

## База данных

### Новые таблицы

```sql
-- Размещение
CREATE TABLE accommodations (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(50), -- hotel, hostel, apartment, etc.
  price_per_night_from DECIMAL(10,2),
  rating DECIMAL(3,2),
  amenities JSONB,
  coordinates JSONB,
  ...
);

-- Номера
CREATE TABLE accommodation_rooms (
  id UUID PRIMARY KEY,
  accommodation_id UUID,
  room_type VARCHAR(50), -- single, double, suite, etc.
  max_guests INTEGER,
  price_per_night DECIMAL(10,2),
  ...
);

-- Бронирования размещения
CREATE TABLE accommodation_bookings (
  id UUID PRIMARY KEY,
  user_id UUID,
  accommodation_id UUID,
  check_in_date DATE,
  check_out_date DATE,
  status VARCHAR(20),
  ...
);
```

## Интеграция

### Frontend пример (React)

```typescript
import { useState } from 'react';

function TripPlannerForm() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch('/api/trip/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: e.target.query.value,
        days: parseInt(e.target.days.value),
        budget: parseInt(e.target.budget.value) || undefined,
      }),
    });

    const result = await response.json();
    if (result.success) {
      setPlan(result.data);
    }
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea name="query" placeholder="Опишите вашу поездку..." />
        <input name="days" type="number" min="1" max="30" placeholder="Дней" />
        <input name="budget" type="number" placeholder="Бюджет (₽)" />
        <button type="submit" disabled={loading}>
          {loading ? 'Планируем...' : 'Создать план'}
        </button>
      </form>

      {plan && (
        <div>
          <h2>План поездки на {plan.summary.total_days} дней</h2>
          <p>Общая стоимость: {plan.summary.total_cost}₽</p>
          
          {plan.days.map((day) => (
            <div key={day.day}>
              <h3>День {day.day}</h3>
              {day.activities.map((activity, idx) => (
                <div key={idx}>
                  <strong>{activity.time}</strong> - {activity.title}
                  {activity.logistics && (
                    <p>
                      🚗 {activity.logistics.transport} 
                      ({activity.logistics.duration_minutes} мин, 
                      {activity.logistics.distance_km} км)
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Производительность

- ⚡ **Время отклика**: 5-15 секунд для плана на 7 дней
- 🧠 **AI провайдеры**: GROQ (основной), DeepSeek (fallback)
- 💾 **Кэширование**: Туры, размещение кэшируются на 1 час
- 🔄 **Retry логика**: Автоматический переключение между AI провайдерами

## Ограничения

- Максимум 30 дней планирования
- AI может генерировать планы с небольшими вариациями
- Цены и наличие требуют подтверждения
- Погодные условия могут повлиять на маршрут

## Дальнейшее развитие

🚀 **Планируется добавить**:
- Персонализация на основе предыдущих поездок
- Интеграция с календарями
- Уведомления за N дней до поездки
- Автоматическое бронирование туров
- Экспорт маршрута в PDF/GPX
- Мобильное приложение с офлайн-картами

---

**Разработано для Kamchatour Hub** 🌋
