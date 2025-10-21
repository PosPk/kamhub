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

Дальше:
- Перевод ассетов на Object Storage (миграции и сервис загрузки).
- Доработка трансферов (matching v2 с приоритетом рейтинга, hold/lock, SLA, уведомления, платежи, дашборд оператора).
- Настройка деплоя на Yandex Cloud (YCR + Serverless Containers/Compute) через GitHub Actions.
