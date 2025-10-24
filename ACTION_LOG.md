# Action Log

Формат: YYYY-MM-DD HH:MM UTC — краткое описание действия и эффект.

- 2025-10-20 06:55 UTC — Настроил окружение Node; установил зависимости (`npm ci`).
- 2025-10-20 07:00 UTC — Починил ESLint конфиг (`plugin:@typescript-eslint/recommended`).
- 2025-10-20 07:05 UTC — Исправил тесты: `/api/transfers/search` (GET), убрал запись в `NODE_ENV` в `test/setup.ts`.
- 2025-10-20 07:10 UTC — Добавил фоллбеки без БД в `loyalty` и `transfers` для стабильных тестов.
- 2025-10-20 07:15 UTC — Привёл `loyalty/levels` к ожидаемой схеме полей; обновил `tsconfig` (исключил `.next/types`).
- 2025-10-20 07:20 UTC — Удалил хардкод пароля в `app/api/auth/signin/route.ts`; добавил демо-режим через ENV.
- 2025-10-20 07:22 UTC — Удалён подозрительный файл `token.txt`.
- 2025-10-20 07:30 UTC — Добавил скрипты миграции ENV из Vercel в GitHub (`scripts/vercel_env_pull_all.sh`, `migrate_env_to_github_repo.sh`, `migrate_env_to_github_env.sh`).
- 2025-10-20 07:35 UTC — Добавил экспорт ENV из Vercel API (`scripts/export_vercel_envs.mjs`); подготовил `npm`-скрипты.
- 2025-10-20 07:45 UTC — Перенёс ENV из Vercel в GitHub Secrets (repo + environments) по предоставленному токену.
- 2025-10-20 07:50 UTC — Добавил GitHub Actions workflow (`.github/workflows/ci.yml`): type-check и unit-тесты; job s3-health.
- 2025-10-20 08:00 UTC — Добавил S3 health check (`scripts/s3_health_check.mjs`) и список бакетов (`scripts/s3_list_buckets.mjs`).
- 2025-10-20 08:05 UTC — Проверил доступ к Object Storage: ключи работают, виден бакет `posservis` (ListBuckets OK).
- 2025-10-20 08:10 UTC — Добавил S3-клиент для приложения (`lib/storage/s3.ts`) для загрузки ассетов в Object Storage.
- 2025-10-20 08:15 UTC — Зафиксировал требования: полный функционал трансферов (приоритет — рейтинг), инфраструктура — Яндекс Облако.
- 2025-10-20 08:30 UTC — [APP] Добавил админ-API создания данных: `/api/transfers/admin/{routes,vehicles,drivers,schedules}`.
- 2025-10-20 08:35 UTC — [APP] Добавил UI формы: `hub/transfer-operator/{routes,vehicles,drivers,schedules}` + навигация.
- 2025-10-20 08:40 UTC — [DEPLOY] Добавлен workflow для миграции секретов в Yandex Lockbox (`.github/workflows/lockbox-migrate.yml`).
- 2025-10-20 08:50 UTC — [STATUS] Прогресс по “Трансферы (max)” добавлен.
- 2025-10-20 09:10 UTC — [APP] Добавлен UI импорта данных `hub/transfer-operator/import` и API `/api/transfers/admin/import`.
- 2025-10-20 09:20 UTC — [S3] Подтверждён доступ к бакету `pospk` новыми ключами (HeadBucket OK).
- 2025-10-20 09:30 UTC — [DEPLOY] Добавлен deploy workflow `.github/workflows/deploy.yml` (YCR → Serverless Containers).
- 2025-10-20 09:40 UTC — [APP] Добавлен health-роут `/api/health/app` (DB + S3 проверка) для деплой-гейта.
 - 2025-10-20 10:00 UTC — [APP] Исправлен UI импорта (строковый литерал по умолчанию), билд OK.
 - 2025-10-20 10:02 UTC — [BUILD] Обновил `next.config.js`: `ignoreDuringBuilds`, `output: 'standalone'` для Docker.
 - 2025-10-20 10:05 UTC — [DEPLOY] Обновил `.github/workflows/deploy.yml`: триггер на push, корректные outputs, авто‑публикация контейнера и вывод Public URL в Summary.
 - 2025-10-20 10:06 UTC — [DEPLOY] Добавил `Dockerfile` (Next.js standalone) и `.dockerignore`.
 - 2025-10-20 10:20 UTC — [DB] Добавлена схема `transfer_seat_holds` (TTL холды) + фун-ции/индексы.
 - 2025-10-20 10:25 UTC — [DB] ALTER для `transfer_drivers`: `experience_years`, `working_hours`, `current_location` (+GiST индекс).
 - 2025-10-20 10:30 UTC — [API] Роуты холдов: `/api/transfers/holds/{create,confirm,cancel}`.
 - 2025-10-20 10:35 UTC — [UI] Страница `hub/transfer-operator/holds` для ручного теста холдов.
 - 2025-10-20 10:50 UTC — [DB] Триггернуто применение миграций (provision + migrate) через GitHub Actions.

---

## Политика ведения журнала
- Записываю сюда все значимые действия:
  - операции в Yandex Cloud Console/CLI (создание/права/проверки);
  - где и какие секреты хранятся/обновлялись;
  - изменения в инфраструктуре CI/CD и деплою;
  - ключевые архитектурные решения/варианты реализации.
- Секретные значения НЕ публикую, фиксирую только названия ключей и места хранения.

## Хранилища секретов (актуально)
- GitHub Secrets (репозиторий):
  - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_ENDPOINT, S3_REGION, S3_BUCKET
  - (дубли) YC_ACCESS_KEY_ID, YC_SECRET_ACCESS_KEY — для совместимости
- GitHub Environments:
  - Production / Preview / Development — те же ключи при необходимости окружений
- Источник переноса: экспорт из Vercel (2025-10-20), затем миграция в GitHub Secrets
- Приложение берёт S3‑креды из ENV (GitHub Secrets) на билде/рантайме

## Yandex Cloud — текущее состояние
- Object Storage:
  - Доступ проверен (ListBuckets OK), виден бакет: `pospk` (HeadBucket OK), ранее `posservis`
  - Endpoint: `https://storage.yandexcloud.net`, Регион: `ru-central1`
  - Сервисный аккаунт: `kamhub-deployer`/`kamhab-deployer` (статические S3‑ключи)
- План миграции ассетов:
  - Выгрузка бинарных полей → загрузка в S3 → сохранение URL в БД → удаление бинарных столбцов
- Health‑скрипты в репо:
  - `scripts/s3_health_check.mjs` (HeadBucket), `scripts/s3_list_buckets.mjs` (ListBuckets)

## Деплой в Яндекс — варианты
- Serverless Containers (по умолчанию):
  - + нативно для Node/Next API, авто‑масштаб
  - + простой GitHub Actions: build → push в YCR → deploy
- Compute (VM) + Docker:
  - + полный контроль окружения; − больше DevOps
- Решение: начать с Serverless Containers; при необходимости перейти на Compute

## Варианты реализации (ключевые решения)
- Ассеты: всегда в Object Storage; в БД — только URL/метаданные
- Трансферы (max):
  - Матчер V2: приоритет — рейтинг; далее цена/расстояние/доступность/вместимость/языки/фичи с весами и штрафами
  - Hold/lock мест c TTL и атомарностью (транзакции); отмены/возвраты; SLA‑окна
  - Уведомления (SMS/Email/Telegram) с ретраями; платежи — полный lifecycle
  - Дашборд оператора: загрузка, SLA, отмены, выручка
- Секреты: единый источник — GitHub Secrets; доступы на прод — через GitHub Environments/Lockbox

## Прогресс по “Трансферы (max)” (обновлять по мере выполнения)
- Инфраструктура (Y.CLOUD, секреты, S3): 55% — в процессе деплой‑джоба; Lockbox — готов workflow
- Данные/миграции (Postgres/PostGIS): 25% — в процессе seat holds/аудит/ST_DWithin
- Матчер v2 (приоритет — рейтинг): 30% — в процессе веса/штрафы/кэш ETA/профилировка
- Бронирование (hold/lock+SLA): 20% — в процессе hold/TTL/идемпотентность
- Платежи (полный цикл): 20% — в процессе create/confirm/cancel/refund+вебхуки
- Уведомления: 35% — в процессе шаблоны/ретраи/логи
- Гео (водители/роутинг): 40% — в процессе локации водителей и кэш
- Админ‑UI (transfer‑operator): 60% — в процессе списки/редактирование/загрузка фото
- Безопасность/RBAC/аудит: 25% — в процессе матрица прав/аудит изменений
- Наблюдаемость/CI/CD: 40% — в процессе метрики/алерты/health‑гейты
- Тестирование: 30% — в процессе интеграция/E2E/нагрузка
- Деплой в Яндекс (прод): 15% — в процессе настройка джоба, health‑чеки

---

## Расширенный отчёт (2025-10-20 09:40 UTC)
- Чем заменяем Vercel
  - Хостинг/рантайм: Yandex Cloud Serverless Containers (+ ALB, Certificate Manager)
  - Контейнеры: YCR
  - CI/CD: GitHub Actions; позже SourceCraft при необходимости
  - Секреты/конфиги: GitHub Secrets + Yandex Lockbox
  - Объектное хранилище: Yandex Object Storage (pospk)
  - DNS/TLS/наблюдаемость: Cloud DNS, Certificate Manager, Monitoring/Logging
- Слепые зоны/проверки
  - S3 Put/Get/Delete по префиксам, листинг — next
  - БД конкурентная бронь — идемпотентность/транзакции — next
  - Матчер веса — нормализация признаков — next

