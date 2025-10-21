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
  - Доступ проверен (ListBuckets OK), виден бакет: `posservis`
  - Endpoint: `https://storage.yandexcloud.net`, Регион: `ru-central1`
  - Сервисный аккаунт: `kamhab-deployer` (статические S3‑ключи)
  - HeadBucket ранее давал 403 (недостаточно прав на бакет) — требуется убедиться, что у SA есть `storage.viewer`/`storage.admin` на бакет/папку
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
- Секреты: единый источник — GitHub Secrets; доступы на прод — через GitHub Environments

## Шаблон записи (для последующих апдейтов)
- YYYY-MM-DD HH:MM UTC — [YC] действие в консоли/CLI: что сделано, где (Cloud/Folder/Service)
- YYYY-MM-DD HH:MM UTC — [SECRETS] обновление ключей: какие ключи/где хранятся
- YYYY-MM-DD HH:MM UTC — [DEPLOY] изменение CI/CD/докер/контейнер
- YYYY-MM-DD HH:MM UTC — [APP] изменение логики/схем/эндпоинтов
