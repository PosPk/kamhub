# 🎯 ПЛАН УЛУЧШЕНИЯ СИСТЕМЫ ТУРОВ ДО УРОВНЯ ТРАНСФЕРОВ

> **Дата:** 2025-11-03  
> **Статус:** План разработки  
> **Приоритет:** 🔴 ВЫСОКИЙ

---

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ vs ЦЕЛЕВОЕ

### ❌ ЧТО ЕСТЬ СЕЙЧАС (Система туров)

```typescript
✅ Базовая таблица tours
✅ API GET/POST /api/tours
✅ Компонент TourCard
✅ Связь с операторами
✅ Фильтрация и поиск
✅ Mock данные
```

**Проблемы:**
- ❌ НЕТ защиты от race conditions
- ❌ НЕТ системы расписания
- ❌ НЕТ бронирования с блокировками
- ❌ НЕТ календаря доступности
- ❌ НЕТ групповых туров
- ❌ НЕТ интеграции с погодой
- ❌ НЕТ динамического ценообразования
- ❌ НЕТ системы чекинов
- ❌ НЕТ дашборда оператора

### ✅ ЧТО ЕСТЬ В СИСТЕМЕ ТРАНСФЕРОВ (Эталон)

```typescript
✅ Защита от race conditions (SELECT FOR UPDATE NOWAIT)
✅ Временные блокировки мест (seat_holds)
✅ Система расписания (schedules)
✅ Интеллектуальное сопоставление (matching)
✅ Полная система бронирования
✅ Платежи с webhook валидацией
✅ Уведомления (SMS/Email/Telegram)
✅ QR-коды для валидации
✅ Дашборд оператора с аналитикой
✅ Система отзывов
```

---

## 🎯 ЦЕЛЕВАЯ АРХИТЕКТУРА

### Новые таблицы БД (8 шт):

```sql
1. tour_schedules        - Расписание туров (как transfer_schedules)
2. tour_bookings_v2      - Бронирования с блокировками
3. tour_seat_holds       - Временные блокировки мест
4. tour_participants     - Участники туров
5. tour_checkins         - Чекины участников
6. tour_cancellations    - История отмен
7. tour_weather_alerts   - Погодные предупреждения
8. tour_waitlist         - Листы ожидания
```

### Новые API endpoints (12 шт):

```typescript
// Расписание
GET  /api/tours/[id]/schedule        - Календарь доступности
POST /api/tours/[id]/schedule        - Создать слот

// Бронирование
POST /api/tours/book                 - Забронировать с блокировкой
POST /api/tours/hold                 - Временная блокировка
POST /api/tours/release              - Отменить блокировку
GET  /api/tours/availability         - Проверка доступности

// Управление
POST /api/tours/checkin              - Чекин участника
POST /api/tours/cancel               - Отменить тур
GET  /api/tours/operator/dashboard   - Дашборд оператора
GET  /api/tours/operator/bookings    - Активные бронирования

// Интеграции
POST /api/tours/weather-check        - Проверка погоды
GET  /api/tours/recommendations      - AI рекомендации
```

### Новые компоненты (8 шт):

```typescript
1. TourCalendar.tsx          - Календарь доступности
2. TourBookingWidget.tsx     - Виджет бронирования
3. TourOperatorDashboard.tsx - Дашборд оператора
4. TourParticipantsList.tsx  - Список участников
5. TourWeatherAlert.tsx      - Погодные предупреждения
6. TourCheckinQR.tsx         - QR чекин
7. TourWaitlistWidget.tsx    - Лист ожидания
8. TourPricingEngine.tsx     - Динамические цены
```

---

## 🏗️ АРХИТЕКТУРА УЛУЧШЕНИЙ

### Фаза 1: Расписание и бронирование (2 недели)

#### 1.1. Создать таблицы БД
```sql
-- tour_schedules: расписание туров
CREATE TABLE tour_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id),
  start_date DATE NOT NULL,
  end_date DATE,
  departure_time TIME NOT NULL,
  return_time TIME,
  available_slots INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  min_participants INTEGER NOT NULL,
  price_per_person DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  weather_dependent BOOLEAN DEFAULT true,
  cancellation_deadline INTERVAL DEFAULT '24 hours',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- tour_seat_holds: временные блокировки
CREATE TABLE tour_seat_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES tour_schedules(id),
  user_id UUID NOT NULL REFERENCES users(id),
  slots_count INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tour_bookings_v2: улучшенные бронирования
CREATE TABLE tour_bookings_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  operator_id UUID NOT NULL,
  tour_id UUID NOT NULL REFERENCES tours(id),
  schedule_id UUID NOT NULL REFERENCES tour_schedules(id),
  booking_date DATE NOT NULL,
  participants_count INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_status VARCHAR(20) DEFAULT 'pending',
  confirmation_code VARCHAR(20) UNIQUE NOT NULL,
  special_requests TEXT,
  contact_phone VARCHAR(50) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 1.2. Создать booking модуль
```typescript
// /lib/tours/booking.ts (500+ строк)
export async function createTourBookingWithLock(
  request: BookingRequest
): Promise<BookingResult> {
  return await transaction(async (client: PoolClient) => {
    // 1. Блокировка расписания
    const lockQuery = `
      SELECT available_slots, max_participants, min_participants
      FROM tour_schedules
      WHERE id = $1 AND status = 'scheduled'
      FOR UPDATE NOWAIT
    `;
    
    // 2. Проверка доступности
    // 3. Атомарное уменьшение slots
    // 4. Создание бронирования
    // 5. Уведомления
  });
}

export async function holdTourSeats(
  scheduleId: string,
  slotsCount: number,
  userId: string,
  timeoutMinutes: number = 15
): Promise<HoldResult> {
  // Временная блокировка на 15 минут
}

export async function checkTourAvailability(
  scheduleId: string,
  participantsCount: number
): Promise<AvailabilityResult> {
  // Проверка без блокировки (для UI)
}
```

#### 1.3. Создать API endpoints
```typescript
// /app/api/tours/book/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Валидация с Zod
  const validated = TourBookingSchema.parse(body);
  
  // Бронирование с блокировкой
  const result = await createTourBookingWithLock(validated);
  
  if (result.success) {
    // Начислить бонусы
    // Отправить уведомления
    // Создать платеж
  }
  
  return NextResponse.json(result);
}
```

#### 1.4. Создать компоненты
```typescript
// /components/TourBookingWidget.tsx
export function TourBookingWidget({ tourId, scheduleId }) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [participants, setParticipants] = useState(1);
  const [availability, setAvailability] = useState<Availability>();
  
  // Проверка доступности в реальном времени
  useEffect(() => {
    checkAvailability(scheduleId, participants)
      .then(setAvailability);
  }, [scheduleId, participants]);
  
  const handleBook = async () => {
    // 1. Hold seats (блокировка на 15 мин)
    const hold = await holdSeats(scheduleId, participants);
    
    // 2. Перенаправить на оплату
    router.push(`/checkout/${hold.id}`);
  };
  
  return (
    <div>
      <DatePicker onChange={setSelectedDate} />
      <ParticipantSelector value={participants} onChange={setParticipants} />
      <AvailabilityIndicator available={availability} />
      <BookButton onClick={handleBook} />
    </div>
  );
}
```

### Фаза 2: Календарь и расписание (1 неделя)

#### 2.1. Календарь доступности
```typescript
// /components/TourCalendar.tsx (300 строк)
export function TourCalendar({ tourId }) {
  const [schedules, setSchedules] = useState<TourSchedule[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  // Загрузка расписания на месяц
  useEffect(() => {
    fetch(`/api/tours/${tourId}/schedule?month=${selectedMonth}`)
      .then(res => res.json())
      .then(data => setSchedules(data));
  }, [tourId, selectedMonth]);
  
  return (
    <div className="tour-calendar">
      <MonthNavigation />
      <CalendarGrid>
        {schedules.map(schedule => (
          <CalendarDay
            key={schedule.id}
            date={schedule.start_date}
            availability={schedule.available_slots}
            price={schedule.price_per_person}
            status={schedule.status}
            onClick={() => handleDateClick(schedule)}
          />
        ))}
      </CalendarGrid>
    </div>
  );
}
```

#### 2.2. API для календаря
```typescript
// /app/api/tours/[id]/schedule/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  
  const schedules = await query(`
    SELECT 
      s.*,
      COUNT(b.id) as bookings_count,
      s.max_participants - s.available_slots as booked_slots
    FROM tour_schedules s
    LEFT JOIN tour_bookings_v2 b ON s.id = b.schedule_id AND b.status != 'cancelled'
    WHERE s.tour_id = $1
      AND s.start_date >= $2
      AND s.start_date < $3
    GROUP BY s.id
    ORDER BY s.start_date, s.departure_time
  `, [params.id, startOfMonth, endOfMonth]);
  
  return NextResponse.json({ schedules: schedules.rows });
}
```

### Фаза 3: Интеграции (1 неделя)

#### 3.1. Интеграция с погодой
```typescript
// /lib/tours/weather-integration.ts
export async function checkTourWeatherSafety(
  tourId: string,
  scheduleId: string,
  date: Date
): Promise<WeatherSafetyResult> {
  // Получить координаты тура
  const tour = await getTourById(tourId);
  
  // Получить погоду на дату
  const weather = await getWeatherForecast(
    tour.coordinates,
    date
  );
  
  // Проверить требования безопасности
  const isSafe = checkSafetyRequirements(
    weather,
    tour.weatherRequirements
  );
  
  if (!isSafe) {
    // Создать предупреждение
    await createWeatherAlert(scheduleId, weather);
    
    // Уведомить участников
    await notifyParticipants(scheduleId, 'weather_alert');
  }
  
  return {
    isSafe,
    weather,
    recommendation: generateRecommendation(weather, tour)
  };
}

// Автоматическая проверка каждые 6 часов (cron)
export async function autoCheckWeather() {
  const upcomingTours = await getUpcomingTours(7); // на 7 дней
  
  for (const schedule of upcomingTours) {
    await checkTourWeatherSafety(
      schedule.tour_id,
      schedule.id,
      schedule.start_date
    );
  }
}
```

#### 3.2. Динамическое ценообразование
```typescript
// /lib/tours/pricing-engine.ts
export class TourPricingEngine {
  calculatePrice(
    basePrice: number,
    schedule: TourSchedule,
    participantsCount: number
  ): number {
    let price = basePrice;
    
    // 1. Seasonal pricing (сезон)
    price *= this.getSeasonalMultiplier(schedule.start_date);
    
    // 2. Demand pricing (спрос)
    const occupancy = this.getOccupancyRate(schedule);
    if (occupancy > 0.8) {
      price *= 1.2; // +20% если почти заполнено
    }
    
    // 3. Early bird discount (ранее бронирование)
    const daysUntilTour = this.getDaysUntil(schedule.start_date);
    if (daysUntilTour > 30) {
      price *= 0.9; // -10% за месяц до
    }
    
    // 4. Group discount (групповая скидка)
    if (participantsCount >= 5) {
      price *= 0.85; // -15% для групп 5+
    }
    
    // 5. Last minute (last minute скидка)
    if (daysUntilTour <= 3 && occupancy < 0.5) {
      price *= 0.75; // -25% если осталось мало и мест много
    }
    
    return Math.round(price);
  }
  
  private getSeasonalMultiplier(date: Date): number {
    const month = date.getMonth();
    // Июль-Август = пик сезона
    if (month >= 6 && month <= 7) return 1.3;
    // Май, Июнь, Сентябрь = средний сезон
    if (month >= 4 && month <= 8) return 1.1;
    // Остальное = низкий сезон
    return 0.9;
  }
}
```

### Фаза 4: Дашборд оператора (1 неделя)

#### 4.1. API для дашборда
```typescript
// /app/api/tours/operator/dashboard/route.ts
export async function GET(request: NextRequest) {
  const operatorId = getOperatorIdFromToken(request);
  
  const stats = await query(`
    WITH operator_tours AS (
      SELECT id FROM tours WHERE operator_id = $1
    ),
    bookings_stats AS (
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        SUM(total_price) as total_revenue,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' 
            THEN total_price ELSE 0 END) as monthly_revenue
      FROM tour_bookings_v2
      WHERE tour_id IN (SELECT id FROM operator_tours)
    ),
    upcoming_tours AS (
      SELECT 
        s.id,
        s.start_date,
        t.title,
        s.max_participants - s.available_slots as booked,
        s.max_participants as total
      FROM tour_schedules s
      JOIN operator_tours t ON s.tour_id = t.id
      WHERE s.start_date >= NOW()
        AND s.status = 'scheduled'
      ORDER BY s.start_date
      LIMIT 10
    )
    SELECT * FROM bookings_stats, upcoming_tours
  `, [operatorId]);
  
  return NextResponse.json({ stats: stats.rows });
}
```

#### 4.2. Компонент дашборда
```typescript
// /components/TourOperatorDashboard.tsx
export function TourOperatorDashboard() {
  const { stats, loading } = useTourOperatorStats();
  
  return (
    <div className="dashboard">
      <StatsGrid>
        <StatCard
          title="Всего бронирований"
          value={stats.total_bookings}
          change="+12%"
        />
        <StatCard
          title="Месячная выручка"
          value={formatCurrency(stats.monthly_revenue)}
          change="+25%"
        />
        <StatCard
          title="Ожидают подтверждения"
          value={stats.pending}
          highlight
        />
      </StatsGrid>
      
      <UpcomingTours tours={stats.upcoming_tours} />
      <RecentBookings />
      <WeatherAlerts />
      <ReviewsToRespond />
    </div>
  );
}
```

### Фаза 5: Дополнительные функции (1 неделя)

#### 5.1. Система чекинов
```typescript
// /lib/tours/checkin.ts
export async function checkinParticipant(
  bookingId: string,
  participantId: string,
  qrCode: string
): Promise<CheckinResult> {
  // 1. Валидировать QR код
  const isValid = validateQRCode(qrCode, bookingId);
  
  if (!isValid) {
    return { success: false, error: 'Invalid QR code' };
  }
  
  // 2. Проверить время чекина
  const booking = await getBooking(bookingId);
  const now = new Date();
  const tourStart = booking.schedule.departure_time;
  const minutesUntilStart = (tourStart - now) / 1000 / 60;
  
  if (minutesUntilStart > 60) {
    return { success: false, error: 'Too early for checkin' };
  }
  
  // 3. Создать чекин
  await query(`
    INSERT INTO tour_checkins (
      booking_id, participant_id, checked_in_at, qr_code
    ) VALUES ($1, $2, NOW(), $3)
  `, [bookingId, participantId, qrCode]);
  
  // 4. Уведомить оператора
  await notifyOperator(booking.operator_id, 'participant_checked_in', {
    bookingId,
    participantId
  });
  
  return { success: true };
}
```

#### 5.2. Лист ожидания
```typescript
// /lib/tours/waitlist.ts
export async function addToWaitlist(
  userId: string,
  scheduleId: string,
  participantsCount: number
): Promise<WaitlistResult> {
  await query(`
    INSERT INTO tour_waitlist (
      user_id, schedule_id, participants_count, created_at
    ) VALUES ($1, $2, $3, NOW())
  `, [userId, scheduleId, participantsCount]);
  
  return {
    success: true,
    position: await getWaitlistPosition(userId, scheduleId),
    message: 'Добавлены в лист ожидания'
  };
}

// Автоматическое уведомление при освобождении мест
export async function notifyWaitlist(scheduleId: string) {
  const waitlist = await getWaitlist(scheduleId);
  
  for (const entry of waitlist) {
    const available = await checkAvailability(
      scheduleId, 
      entry.participants_count
    );
    
    if (available.hasSeats) {
      await notifyUser(entry.user_id, 'seats_available', {
        scheduleId,
        expiresIn: '2 hours'
      });
      break; // уведомляем только первого в очереди
    }
  }
}
```

---

## 📦 ДЕТАЛЬНЫЙ ПЛАН РЕАЛИЗАЦИИ

### Неделя 1-2: Основа (Фаза 1)
**Приоритет:** 🔴 P0

**Задачи:**
1. ✅ Создать SQL схему (tour_schedules, tour_seat_holds, tour_bookings_v2)
2. ✅ Реализовать `/lib/tours/booking.ts` с race condition protection
3. ✅ Создать API `/api/tours/book` с валидацией
4. ✅ Создать API `/api/tours/hold` для временных блокировок
5. ✅ Создать компонент `TourBookingWidget`
6. ✅ Написать тесты для race conditions
7. ✅ Интегрировать с платежами

**Результат:** Безопасное бронирование работает

### Неделя 3: Календарь (Фаза 2)
**Приоритет:** 🟠 P1

**Задачи:**
1. ✅ Создать API `/api/tours/[id]/schedule`
2. ✅ Реализовать компонент `TourCalendar`
3. ✅ Добавить фильтры по датам и ценам
4. ✅ Реализовать bulk создание расписания
5. ✅ Добавить экспорт в календарь (.ics файлы)

**Результат:** Удобный календарь для выбора дат

### Неделя 4: Интеграции (Фаза 3)
**Приоритет:** 🟠 P1

**Задачи:**
1. ✅ Интеграция с Open-Meteo для погоды
2. ✅ Автоматические погодные предупреждения
3. ✅ Реализовать динамическое ценообразование
4. ✅ Добавить AI рекомендации для туров
5. ✅ Интеграция с Google Calendar

**Результат:** Умная система с прогнозами

### Неделя 5: Дашборд (Фаза 4)
**Приоритет:** 🟡 P2

**Задачи:**
1. ✅ API для статистики оператора
2. ✅ Компонент `TourOperatorDashboard`
3. ✅ Графики и аналитика
4. ✅ Управление расписанием
5. ✅ Экспорт отчетов

**Результат:** Полноценная CRM для операторов

### Неделя 6: Дополнительно (Фаза 5)
**Приоритет:** 🟢 P3

**Задачи:**
1. ✅ Система чекинов с QR
2. ✅ Лист ожидания
3. ✅ Групповые скидки
4. ✅ Реферальная программа для туров
5. ✅ Мобильная версия для гидов

**Результат:** Полный функционал

---

## 🎯 ВАРИАНТЫ РЕАЛИЗАЦИИ

### Вариант 1: Полная миграция (6 недель)
**Рекомендуется**

**Плюсы:**
- ✅ Полная feature parity с трансферами
- ✅ Production-ready код
- ✅ Все тесты покрыты
- ✅ Документация

**Минусы:**
- ⏱️ Требует 6 недель
- 💰 Больше усилий

**Подходит для:** Production запуск

### Вариант 2: MVP (3 недели)
**Быстрый старт**

**Включает:**
- ✅ Фаза 1 (Бронирование)
- ✅ Фаза 2 (Календарь)
- ⚠️ Упрощенная Фаза 3 (только погода)

**Плюсы:**
- ⚡ Быстро в production
- 💰 Меньше ресурсов

**Минусы:**
- ❌ Нет дашборда оператора
- ❌ Нет динамических цен
- ❌ Нет листа ожидания

**Подходит для:** Beta тестирование

### Вариант 3: Поэтапный (12 недель)
**Осторожный подход**

**План:**
- Неделя 1-3: Фаза 1 + тестирование
- Неделя 4-6: Фаза 2 + beta
- Неделя 7-9: Фаза 3 + feedback
- Неделя 10-12: Фазы 4-5

**Плюсы:**
- ✅ Учет feedback пользователей
- ✅ Постепенное масштабирование
- ✅ Меньше рисков

**Минусы:**
- ⏱️ Самый долгий
- 💰 Растянутые ресурсы

**Подходит для:** Крупные изменения с минимизацией рисков

---

## 💰 ОЦЕНКА РЕСУРСОВ

### Разработка:
```
Вариант 1 (Полный):   ~240 часов (6 недель × 40 ч)
Вариант 2 (MVP):      ~120 часов (3 недели × 40 ч)
Вариант 3 (Поэтапный): ~320 часов (8 недель × 40 ч)
```

### Код:
```
SQL:        ~1,000 строк (схемы + миграции)
TypeScript: ~3,000 строк (lib + API)
React:      ~2,000 строк (компоненты)
Tests:      ~1,000 строк
ИТОГО:      ~7,000 строк нового кода
```

### Таблицы БД:
```
Новые таблицы:     8
Новые индексы:     15
Новые триггеры:    4
Новые функции:     6
```

---

## 🚀 РЕКОМЕНДАЦИИ

### Я рекомендую: **Вариант 1 (Полная миграция)**

**Почему:**
1. ✅ Система трансферов показала отличные результаты
2. ✅ Архитектура проверена и работает
3. ✅ Все edge cases учтены
4. ✅ 6 недель - разумный срок для production-ready решения
5. ✅ Сразу получаем конкурентное преимущество

**План действий:**
1. **Неделя 1-2:** Фокус на бронировании (критично)
2. **Неделя 3:** Календарь (важно для UX)
3. **Неделя 4:** Интеграции (умная система)
4. **Неделя 5:** Дашборд (для операторов)
5. **Неделя 6:** Полировка + доп функции

---

## 📊 МЕТРИКИ УСПЕХА

### После внедрения ожидаем:

**Технические:**
- ✅ 0 race conditions (как в трансферах)
- ✅ <200ms API response time
- ✅ 99.9% uptime
- ✅ 70%+ test coverage

**Бизнес:**
- 📈 +50% конверсия бронирований (благодаря календарю)
- 📈 +30% средний чек (динамические цены)
- 📈 +40% повторных бронирований (лояльность)
- 📈 -60% отмен (погодные предупреждения)
- 📈 +25% операторов (улучшенная CRM)

**UX:**
- ⭐ 4.5+ рейтинг приложения
- ⚡ <3 клика до бронирования
- 📱 100% mobile-friendly
- 🌐 Multi-language ready

---

## ❓ FAQ

### Q: Почему не использовать готовое решение?
**A:** Наша система уникальна - учитывает погоду, интегрирована с AI, имеет свою систему лояльности. Готовые решения не дадут такой гибкости.

### Q: Можно ли использовать ту же БД что у трансферов?
**A:** Да! Мы создадим отдельные таблицы, но используем ту же PostgreSQL БД. Это позволит делать комбинированные пакеты "Тур + Трансфер".

### Q: Что с обратной совместимостью?
**A:** Старая таблица `tours` остается. Новые бронирования идут в `tour_bookings_v2`. Миграция данных плавная.

### Q: Как тестировать race conditions?
**A:** Используем те же тесты что для трансферов. Vitest + параллельные запросы + проверка на ovverbooking.

---

## 🎉 ЗАКЛЮЧЕНИЕ

**Система туров может и должна быть на уровне трансферов!**

Предлагаю начать с **Варианта 1 (Полная миграция за 6 недель)**.

**Первый шаг:** Создать базовую схему БД и booking модуль (2 недели).

**Готов начать прямо сейчас?** 🚀

---

**Автор:** Cursor AI Agent  
**Дата:** 2025-11-03  
**Статус:** Готов к реализации
