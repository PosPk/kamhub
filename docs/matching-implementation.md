# Matching (Сопоставление водителей) — внедрение

## Цели
- Давать релевантных водителей по заявке с учётом рейтинга, цены, расстояния, доступности и опыта
- Поддержать топ-K рассылку предложений с TTL и холдом мест

## Изменения в репозитории
- Конфиг: `lib/config.ts`
  - `transfers.matching.weights` — веса факторов (rating, price, distance, availability, experience)
  - `transfers.matching.topK` — сколько водителей в рассылке (по умолчанию 5)
  - `transfers.matching.offerTTLMinutes` — TTL предложения (по умолчанию 20 минут)
  - `transfers.matching.maxDistanceMetersDefault` — базовый радиус поиска
- Схема БД: `lib/database/transfer_schema.sql`
  - Добавлена таблица `transfer_offers` с индексами и триггером updated_at
- Алгоритм: `lib/transfers/matching.ts`
  - Подключение весов/топ-K/радиуса из `config`
  - Нормализации для `distance` и `maxDistance`

## Дальнейшие шаги (следующий PR)
1. Табличные процедуры/транзакции
   - Функция/процедура hold-снижения мест при создании офферов
   - cron/фоновая задача для истечения `transfer_offers.expires_at` с возвратом мест
2. API-слой
   - POST `/api/transfers/offers/create` — создать офферы top-K
   - POST `/api/transfers/offers/accept` — принять оффер (атомарно обновить booking/schedule)
   - POST `/api/transfers/offers/decline` — отклонить оффер
3. Метрики/аналитика
   - Витрина метрик водителей (accept_rate, cancel_rate, avg_response_ms)
   - Логи решений скоринга для explainability

## Миграции
- Запустите применимые миграции и/или выполните `transfer_schema.sql` в вашей БД
- Убедитесь, что в PostgreSQL включён PostGIS и uuid-ossp

## ENV
- Тюнинг весов и параметров доступен через переменные окружения:
```
MATCHING_WEIGHT_RATING=0.30
MATCHING_WEIGHT_PRICE=0.25
MATCHING_WEIGHT_DISTANCE=0.20
MATCHING_WEIGHT_AVAILABILITY=0.15
MATCHING_WEIGHT_EXPERIENCE=0.10
MATCHING_TOP_K=5
MATCHING_OFFER_TTL_MINUTES=20
MATCHING_MAX_DISTANCE_METERS=10000
```

## Тест‑план
- Юнит‑тесты скоринга: контроль крайних значений (0..1), влияние весов
- Интеграционные: поиск кандидатов с PostGIS, фильтры vehicleType/бюджет/языки/фичи
- E2E: цепочка создание брони → создание офферов → accept/decline → истечение TTL
