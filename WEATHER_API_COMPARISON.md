# 🌤️ СРАВНЕНИЕ API ПОГОДЫ

## 🎯 ЗАДАЧА

- **Главная страница:** Бесплатный API (визуальные эффекты, настроение)
- **Умный подбор туров:** Платный API (точные данные, прогнозы)

---

## 🆓 БЕСПЛАТНЫЕ API ДЛЯ ГЛАВНОЙ СТРАНИЦЫ

### 1️⃣ **OPEN-METEO** ⭐⭐⭐ (РЕКОМЕНДУЮ!)

**Почему лучший:**
- ✅ **Полностью бесплатный** (без ключа API!)
- ✅ **Неограниченные запросы**
- ✅ **Без регистрации**
- ✅ **Быстрый** (CDN)
- ✅ **GDPR compliant**
- ✅ **Open source**

**Лимиты:**
- ✅ Без лимитов для некоммерческого использования
- ✅ До 10,000 запросов/день для коммерческого

**API endpoint:**
```
https://api.open-meteo.com/v1/forecast
```

**Пример запроса:**
```javascript
const url = `https://api.open-meteo.com/v1/forecast?latitude=53.0195&longitude=158.6505&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m&timezone=auto`;

const response = await fetch(url);
const data = await response.json();

// data.current.temperature_2m - температура
// data.current.weathercode - код погоды
```

**Weather Codes:**
```
0 - Clear sky ☀️
1,2,3 - Partly cloudy ⛅
45,48 - Fog 🌫️
51,53,55 - Drizzle 🌦️
61,63,65 - Rain 🌧️
71,73,75 - Snow ❄️
95,96,99 - Thunderstorm ⛈️
```

**Интеграция:**
```typescript
// lib/weather/open-meteo.ts
export async function getWeatherOpenMeteo(lat: number, lng: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&timezone=auto`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    temperature: Math.round(data.current.temperature_2m),
    condition: mapWeatherCode(data.current.weathercode),
    windSpeed: data.current.windspeed_10m,
    humidity: data.current.relativehumidity_2m
  };
}

function mapWeatherCode(code: number): string {
  if (code === 0) return 'clear';
  if (code <= 3) return 'partly_cloudy';
  if (code <= 48) return 'fog';
  if (code <= 55) return 'drizzle';
  if (code <= 65) return 'rain';
  if (code <= 75) return 'snow';
  return 'thunderstorm';
}
```

**Ссылка:** https://open-meteo.com

---

### 2️⃣ **WEATHERAPI.COM** ⭐⭐

**Лимиты:**
- ✅ 1,000,000 запросов/месяц бесплатно
- ✅ Текущая погода + 3 дня прогноза
- ⚠️ Нужна регистрация и API ключ

**API endpoint:**
```
http://api.weatherapi.com/v1/current.json
```

**Пример запроса:**
```javascript
const apiKey = 'your_api_key';
const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=53.0195,158.6505&aqi=no`;

const response = await fetch(url);
const data = await response.json();

// data.current.temp_c - температура
// data.current.condition.text - описание
```

**Интеграция:**
```typescript
// lib/weather/weatherapi.ts
export async function getWeatherAPI(lat: number, lng: number) {
  const apiKey = process.env.WEATHERAPI_KEY!;
  const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lng}&aqi=no`;
  
  const response = await fetch(url, { next: { revalidate: 1800 } }); // Cache 30 min
  const data = await response.json();
  
  return {
    temperature: Math.round(data.current.temp_c),
    condition: data.current.condition.text.toLowerCase(),
    windSpeed: data.current.wind_kph,
    humidity: data.current.humidity
  };
}
```

**Ссылка:** https://www.weatherapi.com

---

### 3️⃣ **OPENWEATHERMAP** ⭐

**Лимиты:**
- ✅ 1,000 запросов/день бесплатно (60 запросов/минуту)
- ⚠️ Нужна регистрация и API ключ
- ⚠️ Ограничен для production

**API endpoint:**
```
https://api.openweathermap.org/data/2.5/weather
```

**Пример запроса:**
```javascript
const apiKey = 'your_api_key';
const url = `https://api.openweathermap.org/data/2.5/weather?lat=53.0195&lon=158.6505&appid=${apiKey}&units=metric`;

const response = await fetch(url);
const data = await response.json();

// data.main.temp - температура
// data.weather[0].main - описание
```

**Ссылка:** https://openweathermap.org

---

### 4️⃣ **METEOSOURCE** ⭐

**Лимиты:**
- ✅ 400 запросов/день бесплатно
- ✅ Хорошая документация
- ⚠️ Нужна регистрация

**Ссылка:** https://www.meteosource.com

---

### 5️⃣ **7TIMER** (Китай) ⭐

**Лимиты:**
- ✅ Полностью бесплатный
- ⚠️ Медленный для России
- ⚠️ Нестабильный

**Ссылка:** http://www.7timer.info

---

## 💰 ПЛАТНЫЕ API ДЛЯ УМНОГО ПОДБОРА ТУРОВ

### 1️⃣ **TOMORROW.IO** (бывший ClimaCell) ⭐⭐⭐

**Почему лучший для туров:**
- ✅ Точные прогнозы до 15 дней
- ✅ Почасовые данные
- ✅ Специализированные данные для туризма
- ✅ UV индекс, видимость, осадки
- ✅ API для экстремальных погодных условий

**Цена:**
- Free: 500 запросов/день
- Essential: $99/месяц - 100,000 запросов/месяц
- Growth: $299/месяц - 1,000,000 запросов/месяц

**Пример запроса:**
```javascript
const apiKey = 'your_api_key';
const url = `https://api.tomorrow.io/v4/timelines?location=53.0195,158.6505&fields=temperature,weatherCode,windSpeed&timesteps=1h&apikey=${apiKey}`;
```

**Ссылка:** https://www.tomorrow.io

---

### 2️⃣ **WEATHERAPI.COM Premium** ⭐⭐

**Что даёт:**
- ✅ Прогноз до 14 дней
- ✅ История погоды
- ✅ Морские данные (приливы)
- ✅ Астрономические данные

**Цена:**
- Pro: $35/месяц - 5,000,000 запросов/месяц
- Ultra: $100/месяц - 20,000,000 запросов/месяц

**Ссылка:** https://www.weatherapi.com/pricing.aspx

---

### 3️⃣ **ACCUWEATHER** ⭐⭐

**Что даёт:**
- ✅ Высокая точность
- ✅ Минутные прогнозы
- ✅ Специальные индексы (для активного отдыха)

**Цена:**
- По запросу (обычно от $200/месяц)

**Ссылка:** https://developer.accuweather.com

---

### 4️⃣ **VISUAL CROSSING** ⭐

**Что даёт:**
- ✅ История погоды (любая дата)
- ✅ Прогнозы до 15 дней
- ✅ Статистика по сезонам

**Цена:**
- Standard: $50/месяц - 1,000 запросов/день
- Professional: $150/месяц - 10,000 запросов/день

**Ссылка:** https://www.visualcrossing.com

---

## 🎯 МОЯ РЕКОМЕНДАЦИЯ

### ДЛЯ ГЛАВНОЙ СТРАНИЦЫ (визуальные эффекты):

**OPEN-METEO** ⭐⭐⭐
```
✅ Полностью бесплатный
✅ Без ключа API
✅ Неограниченные запросы
✅ Быстрый
✅ Надежный
```

**Интеграция за 5 минут!**

---

### ДЛЯ УМНОГО ПОДБОРА ТУРОВ:

**TOMORROW.IO** ⭐⭐⭐
```
✅ Точные прогнозы до 15 дней
✅ Почасовые данные
✅ UV индекс, осадки, ветер
✅ Специальные индексы для туризма
✅ Экстремальные условия
💰 $99/месяц - достаточно для старта
```

---

## 📊 ТАБЛИЦА СРАВНЕНИЯ

| API | Бесплатно | Лимит | Регистрация | Точность | Для туров |
|-----|-----------|-------|-------------|----------|-----------|
| **Open-Meteo** | ✅ Да | ♾️ Без лимитов | ❌ Не нужна | ⭐⭐⭐ | ❌ |
| **WeatherAPI** | ✅ Да | 1M/месяц | ✅ Нужна | ⭐⭐⭐ | ⚠️ |
| **OpenWeather** | ✅ Да | 1K/день | ✅ Нужна | ⭐⭐ | ❌ |
| **Tomorrow.io** | ⚠️ 500/день | 500/день | ✅ Нужна | ⭐⭐⭐ | ✅ |
| **Tomorrow.io Pro** | ❌ Нет | 100K/месяц | ✅ Нужна | ⭐⭐⭐⭐⭐ | ✅✅✅ |
| **AccuWeather** | ❌ Нет | По плану | ✅ Нужна | ⭐⭐⭐⭐⭐ | ✅✅✅ |

---

## 🔧 ПЛАН ИНТЕГРАЦИИ

### Этап 1: Главная страница (СЕЙЧАС)
```javascript
// Используем Open-Meteo (бесплатно)
import { getWeatherOpenMeteo } from '@/lib/weather/open-meteo';

const weather = await getWeatherOpenMeteo(lat, lng);
// Используем для визуальных эффектов
```

### Этап 2: Умный подбор туров (ПОЗЖЕ)
```javascript
// Используем Tomorrow.io (платно)
import { getTomorrowIO } from '@/lib/weather/tomorrow-io';

const forecast = await getTomorrowIO(lat, lng, 14); // 14 дней
// Используем для рекомендаций туров
```

---

## 💡 СТРАТЕГИЯ

1. **Сейчас:** Open-Meteo для главной (бесплатно)
2. **При росте трафика:** Добавить Tomorrow.io для точных прогнозов
3. **При большом трафике:** Upgrade до Tomorrow.io Growth ($299/мес)

---

## 📝 ИТОГО

### РЕКОМЕНДУЮ:

**Главная страница:**
- **Open-Meteo** (бесплатно, без лимитов)

**Умный подбор туров:**
- **Tomorrow.io Essential** ($99/месяц)

**Бюджет:** $0 сейчас → $99/месяц при запуске подбора туров

---

**Документ создан: 2025-10-30**
