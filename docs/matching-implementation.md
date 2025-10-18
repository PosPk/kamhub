# Matching (Сопоставление водителей) — внедрение

## Цели
- Давать релевантных водителей по заявке с учётом рейтинга, цены, расстояния, доступности и опыта
- Поддержать топ-K рассылку предложений с TTL и холдом мест

## Изменения в репозитории (сделано)
- Конфиг: `lib/config.ts`
  - Добавлена секция `transfers.matching` — веса факторов, `topK`, `offerTTLMinutes`, `maxDistanceMetersDefault`.
- Схема БД: `lib/database/transfer_schema.sql`
  - Добавлена таблица `transfer_offers` + индексы и триггер `updated_at`.
- Алгоритм: `lib/transfers/matching.ts`
  - Подключены веса/топ-K/радиус из `config`; нормализация `distance` при отсутствии `criteria.maxDistance`.

## Что осталось
- Добавить поля водителей и расписаний (гео/дата) и миграцию.
- API офферов (create/accept/decline) с транзакционным hold мест и TTL.
- Метрики водителей (accept_rate/avg_response) и фоновые задачи.

## ENV
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
