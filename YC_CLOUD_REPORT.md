## Yandex Cloud — используемые ресурсы и почему

- **Compute Cloud (ВМ `kamhub-api-vm`)**: быстрый старт, полный контроль окружения, внешний IP для домена, простая отладка сети (80/443). Используем как оперативный рантайм до включения Serverless.
- **Container Registry (YCR)**: хранение образов, быстрая доставка внутри YC, безопасная аутентификация через IAM‑токен (без паролей).
- **Object Storage (S3, бакет `pospk`)**: хранение файлов/медиа. AWS‑совместимый SDK, дешёво, можно подключить CDN.
- **VPC (сеть, подсети, Security Groups)**: изоляция и правила доступа. Создана/используется SG `kamhub-web` с inbound TCP 80/443, outbound any.
- **IAM (сервисный аккаунт `kamhub-deployer`)**: минимально необходимые роли для CI/CD и запуска контейнеров.

План на ближайшее время (включим после согласования):
- **Serverless Containers**: авто‑масштабирование, оплата по факту, минимум DevOps для Next.js API/SSR.
- **Managed PostgreSQL (+ PostGIS)**: управляемая БД, кластеры с бэкапами, гео‑функции (ST_DWithin/GiST) для матчера.
- **Lockbox**: централизованное хранение секретов.
- **Monitoring/Logging + ALB + Certificate Manager**: метрики/алерты, балансировка, бесплатные TLS‑сертификаты.

---

## Домен `tourhab.ru`

- **DNS**: добавлены A‑записи
  - `@` → `51.250.0.136`
  - `www` → `51.250.0.136`
- **HTTPS (рекомендуется после проверки HTTP)**:
  - Вариант 1 (быстро): поднять `caddy` как reverse‑proxy (80/443) и проксировать на приложение (8080). Caddy сам выпустит/продлит сертификаты (Let’s Encrypt).
  - Вариант 2 (на прод): вынести трафик на **ALB** + **Certificate Manager** и привязать домен к ALB через CNAME — масштабируемо и прозрачно.

---

## CI/CD и миграции БД

- **Workflows** (GitHub Actions):
  - `.github/workflows/deploy.yml` — сборка Docker, публикация в YCR и деплой (Compute сейчас; Serverless — по включению).
  - `.github/workflows/db-provision.yml` — создать/инвентаризировать Managed PostgreSQL кластер `kamhub-pg` и записать отчёт в `DB_INVENTORY.md`.
  - `.github/workflows/db-migrate.yml` — применить схемы: `transfer_schema.sql`, `transfer_holds_schema.sql`, `transfer_alter_add_driver_geo.sql`, `transfer_payments_schema.sql`.

- **Secrets (обязательно проверить в Settings → Secrets and variables → Actions)**:
  - **YC / Deploy**: `YC_SERVICE_ACCOUNT_KEY`, `YC_CLOUD_ID`, `YC_FOLDER_ID`, `YC_REGISTRY_ID`, `YC_SA_ID`.
  - **S3**: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
  - **App**: `JWT_SECRET`, при необходимости `DATABASE_URL` (если не формируем из Managed PG).
  - **Managed PG**: `PG_APP_PASSWORD` (обязательно), опционально `PG_APP_USER` (по умолчанию `kamhub_user`), `PG_APP_DB` (по умолчанию `kamhub`).

- **Как запустить**:
  - DB Provision: Actions → “DB - Provision Managed PostgreSQL and Inventory” → Run workflow. Результат в `DB_INVENTORY.md` (имя хоста/БД/пользователи/таблицы).
  - DB Migrate: Actions → “DB - Apply Transfer Schema Migrations” → Run workflow. Применит схемы трансферов и платежей.

---

## Текущее состояние (оперативное)

- **Compute / сеть**:
  - Внешний IP ВМ: `51.250.0.136`.
  - SG `kamhub-web`: inbound TCP 80/443 из `0.0.0.0/0`, outbound any — прикреплена к сетевому интерфейсу ВМ.
  - Проверка порта 80: можно временно поднять `nginx:alpine` (`docker run -d -p 80:80 nginx:alpine`) — страница должна открыться по IP/домену.

- **Деплой приложения на ВМ (минимум шагов)**:
  1) Установить Docker и `yc` (на ВМ):
     - `sudo apt update && sudo apt install -y docker.io ca-certificates curl jq && sudo systemctl enable --now docker`
     - `curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash -s -- -i $HOME/yc -n && export PATH=$HOME/yc/bin:$PATH`
  2) Войти в YCR и запустить образ:
     - `TOKEN=$(yc iam create-token); echo "$TOKEN" | sudo docker login --username iam --password-stdin cr.yandex`
     - `REPO=$(yc container registry repository list --format json | jq -r '([.[].name] | map(select(test("/kamhub$"))) + ([.[0].name] // []))[0]')`
     - `IMAGE=$(yc container registry image list --repository-name "$REPO" --limit 1 --format json | jq -r '.[0].name')`
     - `sudo docker run -d --name kamhub -p 80:8080 -e NODE_ENV=production -e NEXT_TELEMETRY_DISABLED=1 "$IMAGE"`

- **Health‑чек**: после старта контейнера
  - `http://51.250.0.136/api/health/app`
  - `http://tourhab.ru/api/health/app`

---

## Трансферы — реализовано в коде (MVP)

- **API**: поиск (`GET /api/transfers/search`), бронирование с фоллбеком (`POST /api/transfers/book`), админ‑эндпоинты (`/api/transfers/admin/*`), массовый импорт, холды мест (TTL) `/api/transfers/holds/{create,confirm,cancel}`.
- **UI**: раздел оператора `app/hub/transfer-operator/*` — формы маршрутов/транспорта/водителей/расписаний/импорта; страница холдов.
- **Инфра**: `Dockerfile` (Next.js standalone), health‑роут `/api/health/app`, S3‑клиент.

## Трансферы — в работе/плане

- Матчер v2 (веса/штрафы/рейтинг, ETA/гео‑кэш),
- Бронирование с гарантиями (holds→confirm транзакционно; SLA/идемпотентность),
- Платежи (create/confirm/cancel/refund + вебхуки),
- Уведомления (SMS/Email/Telegram с ретраями),
- Гео (обновления локаций, GiST/ST_DWithin индексы),
- RBAC/аудит, наблюдаемость (метрики/алерты).

---

## Контрольный чек‑лист (что проверить прямо сейчас)

- [ ] В GitHub Secrets есть `PG_APP_PASSWORD` (и при желании `PG_APP_USER`, `PG_APP_DB`).
- [ ] Запущен workflow “DB - Provision Managed PostgreSQL and Inventory” (файл `DB_INVENTORY.md` появился/обновился).
- [ ] Запущен workflow “DB - Apply Transfer Schema Migrations”.
- [ ] На ВМ слушается 80 (временно `nginx:alpine` для проверки; затем — контейнер приложения).
- [ ] `http://tourhab.ru/` открывается; затем включить HTTPS через Caddy или ALB.
