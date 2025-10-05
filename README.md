# Kamhub — Экосистема туризма Камчатки (веб)

Чёрно‑золотая тема, Next.js (App Router) + TailwindCSS, AI.Kam (GROQ), интеграция с Yandex Postgres.

## Блоки главной страницы
- Header: логотип (градиентное золото), «Войти/Зарегистрироваться»
- Hero: заголовок/подзаголовок, сложное золото (градиенты/тени)
- CTA: «Туристы» и «Наши партнёры»
- Роли (страница партнёров): Туроператор, Гид, Трансфер, Размещение, Сувениры, Прокат снаряжения, Прокат авто, Рестораны
- AI.Kam: поле ввода + кнопка, POST /app/api/ai
- Safety/SOS: карточка с контуром Камчатки (SVG), кнопка SOS
- Экология: «Eco‑points: 0», подпояснение
- Быстрые ссылки: сетка переходов
- Footer

## Технологии
- Next.js 14 (App Router), React 18
- TailwindCSS (градиенты и тени под «сложное золото»)
- API: `/app/api/ai` (GROQ → DeepSeek fallback)
- База: Yandex Postgres (sslmode=require)

## Переменные окружения (Vercel → Project → Settings → Environment Variables)
- `GROQ_API_KEY` — обязателен для AI.Kam
- `DEEPSEEK_API_KEY` — опциональный fallback
- `DATABASE_URL` — Yandex Postgres, формат `postgres://...` + `sslmode=require`
- (опц.) `OPENROUTER_API_KEY`, `AI_MAX_TOKENS`, `AI_DAILY_BUDGET_USD`

## Схема БД (миграция)
```sql
-- activities
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  icon_bytes bytea,
  icon_mime text,
  icon_sha256 text,
  icon_url text,
  created_at timestamptz default now()
);

-- partners
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('operator','guide','transfer','stay','souvenir','gear','cars','restaurant')),
  logo_bytes bytea,
  logo_mime text,
  logo_sha256 text,
  logo_url text,
  created_at timestamptz default now()
);
```

## Импорт логотипов и иконок из Яндекс.Диска
- Папка логотипов партнёров: `https://disk.yandex.ru/d/whDH2uzsAgmrzQ`
- Папка иконок активностей: `https://disk.yandex.ru/d/Smbc5JY65SN__g`
- Импортёр (Node):
  - Скачивает файлы по публичным ссылкам (или через API с токеном)
  - Считает sha256, определяет mime
  - Сохраняет в БД: `partners.logo_bytes` / `activities.icon_bytes` + `*_url`
- Начальные данные:
  - 3 партнёра (туроператоры)
  - 1 размещение
  - 1 трансфер

## API
- `POST /app/api/ai` — { prompt } → { ok, answer } (GROQ → DeepSeek)
- `GET /api/partners` — список партнёров (todo)
- `GET /api/activities` — список активностей (todo)

## Деплой (Vercel)
1. Подключить репо `PosPk/kamhub` к новому проекту Vercel
2. Задать ENV (см. выше)
3. Сборка: `next build`
4. Проверка превью: `/` и `/app/api/ai`
5. Promote to Production → привязать домен `tourhab.ru`

## Порядок работ
- [x] Scaffold Next + Tailwind, чёрно‑золотая тема, AI‑route
- [ ] Главная (2 CTA) + страница «Наши партнёры»
- [ ] Импорт логотипов/иконок в БД, API partners/activities
- [ ] Витрина туров `/hub/tours` (json → Yandex PG)
- [ ] Подключение домена и финализация прод

## Контакты/заметки
- TWA (`/tg`) остаётся отдельным приложением (не главная)
- Сложное золото реализовано градиентами и soft‑тенями (`gold-gradient`, `gold-aurora`, `shadow-gold`)