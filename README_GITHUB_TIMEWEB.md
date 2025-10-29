# 🚀 KamchaTour Hub: Автоматизация деплоя на Timeweb Cloud

> **Автоматическое развертывание туристической платформы на Timeweb Cloud через GitHub Actions и Cursor Agent**

---

## 📋 СОДЕРЖАНИЕ

1. [Быстрый старт](#-быстрый-старт) - 10 минут
2. [Что это дает](#-что-это-дает)
3. [Документация](#-документация)
4. [Архитектура](#-архитектура)
5. [Стоимость](#-стоимость)
6. [FAQ](#-faq)

---

## ⚡ БЫСТРЫЙ СТАРТ

### Вариант 1: Через Cursor Agent (рекомендуется)

**1. Создайте репозиторий на GitHub:**
```bash
gh repo create kamchatour-hub --private
git push -u origin main
```

**2. Добавьте TIMEWEB_TOKEN в GitHub Secrets:**
- Получите токен: https://timeweb.cloud/my/api
- Добавьте в: `github.com/ВАШ_USERNAME/kamchatour-hub/settings/secrets/actions`

**3. Запустите Cursor Agent:**
```
Настрой KamchaTour Hub на Timeweb Cloud через API.
Используй токен из TIMEWEB_TOKEN.
Запусти: tsx scripts/timeweb-setup.ts
Создай: VDS, PostgreSQL, S3, Firewall.
Сообщи результат.
```

**🎉 Готово за 10 минут!**

Подробная инструкция: **[БЫСТРЫЙ_СТАРТ.md](./БЫСТРЫЙ_СТАРТ.md)**

---

## 🎯 ЧТО ЭТО ДАЕТ

### ✅ Автоматизация

- **Создание инфраструктуры** одной командой через API
- **Автоматический деплой** при push в GitHub
- **Управление ресурсами** через CLI или GitHub Actions
- **Мониторинг и статус** в реальном времени

### 🛠️ Создаваемая инфраструктура

| Компонент | Конфигурация | Стоимость/мес |
|-----------|--------------|---------------|
| **VDS** | Ubuntu 22.04, 2 vCPU, 4 GB, 60 GB SSD | 1200₽ |
| **PostgreSQL** | v15, 2 vCPU, 4 GB, 50 GB | 1200₽ |
| **S3 Storage** | 50 GB для медиа | 50₽ |
| **Firewall** | SSH, HTTP, HTTPS | бесплатно |
| **ИТОГО** | | **~2450₽** |

### 🤖 Возможности Cursor Agent

- Создание всей инфраструктуры
- Настройка сервера (Node.js, PM2, Nginx)
- Развертывание приложения
- Настройка SSL сертификатов
- Диагностика и решение проблем
- Создание бэкапов

---

## 📚 ДОКУМЕНТАЦИЯ

### 🎓 Начинающим

| Документ | Описание | Время |
|----------|----------|-------|
| **[БЫСТРЫЙ_СТАРТ.md](./БЫСТРЫЙ_СТАРТ.md)** | ⚡ Запуск за 10 минут | 10 мин |
| **[ПОШАГОВАЯ_ИНСТРУКЦИЯ.md](./ПОШАГОВАЯ_ИНСТРУКЦИЯ.md)** | 📘 Полная инструкция от А до Я | 60 мин |
| **[GITHUB_SETUP_STEP_BY_STEP.md](./GITHUB_SETUP_STEP_BY_STEP.md)** | 🔧 Настройка GitHub репозитория | 15 мин |

### 🤖 Для работы с Cursor Agent

| Документ | Описание |
|----------|----------|
| **[CURSOR_AGENT_PROMPT.md](./CURSOR_AGENT_PROMPT.md)** | 🤖 Все промпты для автоматизации |
| `.github/workflows/timeweb-deploy.yml` | ⚙️ GitHub Actions workflow |

### ⚙️ Для продвинутых

| Документ | Описание |
|----------|----------|
| **[TIMEWEB_API_SETUP_GUIDE.md](./TIMEWEB_API_SETUP_GUIDE.md)** | 📖 Полный гайд по Timeweb API |
| **[TIMEWEB_API_QUICKSTART.md](./TIMEWEB_API_QUICKSTART.md)** | ⚡ Быстрый старт с API |
| **[TIMEWEB_INTEGRATION_GUIDE.md](./TIMEWEB_INTEGRATION_GUIDE.md)** | 🔗 Интеграция с проектом |

### 📊 Аналитика и анализ

| Документ | Описание |
|----------|----------|
| **[TIMEWEB_CLOUD_ANALYSIS.md](./TIMEWEB_CLOUD_ANALYSIS.md)** | 📊 Полный анализ Timeweb Cloud |
| **[TIMEWEB_PRICING_COMPARISON.md](./TIMEWEB_PRICING_COMPARISON.md)** | 💰 Сравнение цен с конкурентами |
| **[KAMHUB_REPOSITORY_ANALYSIS.md](./KAMHUB_REPOSITORY_ANALYSIS.md)** | 🔍 Анализ архитектуры проекта |

---

## 🏗️ АРХИТЕКТУРА

### Схема развертывания

```
┌─────────────────┐
│  GitHub Repo    │
│  (ваш код)      │
└────────┬────────┘
         │ git push
         ▼
┌─────────────────┐
│ GitHub Actions  │
│  CI/CD          │
└────────┬────────┘
         │ deploy
         ▼
┌─────────────────────────────────────┐
│      Timeweb Cloud                  │
│                                     │
│  ┌──────────┐  ┌──────────────┐   │
│  │   VDS    │  │  PostgreSQL  │   │
│  │ Next.js  │──│  Database    │   │
│  │  PM2     │  └──────────────┘   │
│  │  Nginx   │                      │
│  └──────────┘  ┌──────────────┐   │
│                 │  S3 Storage  │   │
│                 │    Media     │   │
│                 └──────────────┘   │
└─────────────────────────────────────┘
```

### Компоненты проекта

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript 5.4.5
- TailwindCSS 3.4.10

**Backend:**
- Next.js API Routes (Edge Runtime для AI)
- PostgreSQL + PostGIS
- Node.js 20

**AI:**
- Multi-provider consensus (GROQ, DeepSeek, OpenRouter)

**Интеграции:**
- Yandex Maps API
- Yandex Weather API
- CloudPayments / Yandex Payment

**DevOps:**
- GitHub Actions (CI/CD)
- PM2 (Process Manager)
- Nginx (Reverse Proxy)
- Certbot (SSL)

---

## 🛠️ ИНСТРУМЕНТЫ

### Скрипты автоматизации

| Скрипт | Назначение | Использование |
|--------|------------|---------------|
| `scripts/timeweb-setup.ts` | Создание инфраструктуры | `tsx scripts/timeweb-setup.ts` |
| `scripts/timeweb-manage.ts` | Управление ресурсами | `tsx scripts/timeweb-manage.ts [command]` |
| `scripts/setup-timeweb-server.sh` | Настройка VDS сервера | `bash scripts/setup-timeweb-server.sh` |
| `scripts/deploy-to-timeweb.sh` | Деплой приложения | `bash scripts/deploy-to-timeweb.sh` |

### Команды timeweb-manage.ts

```bash
# Список всех ресурсов
tsx scripts/timeweb-manage.ts list

# Статус конкретного ресурса
tsx scripts/timeweb-manage.ts status servers <ID>
tsx scripts/timeweb-manage.ts status databases <ID>

# Управление
tsx scripts/timeweb-manage.ts restart <server_id>
tsx scripts/timeweb-manage.ts backup db <database_id>

# Статус проекта
tsx scripts/timeweb-manage.ts project

# Удаление ресурса
tsx scripts/timeweb-manage.ts delete servers <ID> --confirm
```

---

## 💰 СТОИМОСТЬ

### Ежемесячные расходы

**Timeweb Cloud:**
- VDS (2 vCPU, 4 GB): 1200₽
- PostgreSQL (2 vCPU, 4 GB): 1200₽
- S3 (50 GB): 50₽
- **Subtotal: 2450₽/мес (~$25)**

**AI API (опционально):**
- GROQ: бесплатно (с лимитами)
- DeepSeek: $30-70/мес
- OpenRouter: $20-60/мес
- **Subtotal: $50-130/мес**

**Внешние сервисы (опционально):**
- Yandex Maps API: бесплатно (до 25,000 запросов/день)
- Yandex Weather API: от 0₽ (тестовый) до 5000₽/мес
- CloudPayments: 2.5% от оборота
- Sentry: бесплатно (до 5K событий/мес)

**ИТОГО: ~2450₽ + $50-130 = ~$75-155/мес**

### Сравнение с конкурентами

| Провайдер | VDS + DB + S3 | Преимущества |
|-----------|---------------|--------------|
| **Timeweb Cloud** | ~2450₽/мес | 🇷🇺 Российский, API, низкие цены |
| Yandex Cloud | ~3500₽/мес | Экосистема Yandex |
| VK Cloud | ~3200₽/мес | Российский |
| Digital Ocean | ~$35/мес | Международный |

**Timeweb Cloud - самый выгодный вариант!** 💰

---

## 📊 МОНИТОРИНГ И ЛОГИ

### Проверка статуса

**Через Cursor Agent:**
```
Проверь статус KamchaTour Hub на Timeweb Cloud.
Используй: tsx scripts/timeweb-manage.ts project
```

**Вручную:**
```bash
# Статус приложения
curl http://ВАШ_IP/api/health

# PM2 статус
ssh kamchatour@ВАШ_IP "pm2 status"

# Логи
ssh kamchatour@ВАШ_IP "pm2 logs kamchatour-hub --lines 50"
```

### GitHub Actions

Проверьте деплой:
```
https://github.com/ВАШ_USERNAME/kamchatour-hub/actions
```

Запустите вручную:
1. Actions → Deploy to Timeweb Cloud
2. Run workflow → Выберите действие:
   - `setup` - Создать инфраструктуру
   - `deploy` - Развернуть приложение
   - `status` - Проверить статус

---

## 🔒 БЕЗОПАСНОСТЬ

### GitHub Secrets (обязательные)

| Secret | Описание | Где получить |
|--------|----------|--------------|
| `TIMEWEB_TOKEN` | API токен Timeweb | https://timeweb.cloud/my/api |
| `DATABASE_URL` | Connection string БД | Из .env.production.timeweb |
| `SERVER_HOST` | IP адрес VDS | Из timeweb-resources.json |
| `SERVER_USER` | Пользователь SSH | `kamchatour` |
| `SSH_PRIVATE_KEY` | Приватный SSH ключ | Создать вручную |

### GitHub Secrets (дополнительные)

| Secret | Описание |
|--------|----------|
| `GROQ_API_KEY` | AI провайдер GROQ |
| `DEEPSEEK_API_KEY` | AI провайдер DeepSeek |
| `OPENROUTER_API_KEY` | AI провайдер OpenRouter |
| `YANDEX_MAPS_API_KEY` | Yandex Maps |
| `YANDEX_WEATHER_API_KEY` | Yandex Weather |
| `NEXTAUTH_SECRET` | NextAuth секрет |
| `CLOUDPAYMENTS_*` | Платежная система |
| `SENTRY_DSN` | Мониторинг ошибок |

---

## 📝 WORKFLOW

### Ежедневная работа

```bash
# 1. Внесите изменения
git add .
git commit -m "feat: New feature"

# 2. Отправьте на GitHub
git push origin main

# 3. GitHub Actions автоматически задеплоит!
# Проверьте: https://github.com/ВАШ_USERNAME/kamchatour-hub/actions
```

### Обновление инфраструктуры

```bash
# Через Cursor Agent
```
Обнови инфраструктуру KamchaTour Hub на Timeweb Cloud.
Выполни нужные изменения через API.
```
```

### Создание бэкапа

```bash
# Через Cursor Agent
```
Создай backup БД KamchaTour Hub.
Используй: tsx scripts/timeweb-manage.ts backup db <ID>
```
```

---

## ❓ FAQ

### Q: Сколько времени занимает первоначальная настройка?

**A:** ~60 минут с нуля до полностью рабочего приложения.

### Q: Нужны ли знания DevOps?

**A:** Нет! Cursor Agent делает всё автоматически. Просто следуйте инструкциям.

### Q: Можно ли использовать для production?

**A:** Да! Конфигурация оптимизирована для production использования.

### Q: Как масштабировать?

**A:** Через Timeweb Cloud панель или API можно увеличить ресурсы VDS и БД.

### Q: Есть ли резервное копирование?

**A:** Да, через Timeweb Cloud API можно настроить автоматические бэкапы.

### Q: Что делать если что-то сломалось?

**A:** Используйте промпты из CURSOR_AGENT_PROMPT.md для диагностики и решения проблем.

---

## 🆘 ПОДДЕРЖКА

### Документация

- 📘 [Пошаговая инструкция](./ПОШАГОВАЯ_ИНСТРУКЦИЯ.md)
- 🤖 [Промпты для Cursor Agent](./CURSOR_AGENT_PROMPT.md)
- ⚡ [Быстрый старт](./БЫСТРЫЙ_СТАРТ.md)

### Внешние ресурсы

**Timeweb Cloud:**
- 🌐 Панель: https://timeweb.cloud/my
- 📖 API Docs: https://timeweb.cloud/api-docs
- 💬 Поддержка: support@timeweb.cloud
- 📱 Telegram: @timeweb_support

**GitHub:**
- 📖 Actions Docs: https://docs.github.com/en/actions
- 💬 Community: https://github.community

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

### Для новичков:

1. **Прочитайте:** [БЫСТРЫЙ_СТАРТ.md](./БЫСТРЫЙ_СТАРТ.md)
2. **Следуйте:** [ПОШАГОВАЯ_ИНСТРУКЦИЯ.md](./ПОШАГОВАЯ_ИНСТРУКЦИЯ.md)
3. **Используйте:** [CURSOR_AGENT_PROMPT.md](./CURSOR_AGENT_PROMPT.md)

### Для опытных:

1. **Изучите:** [TIMEWEB_API_SETUP_GUIDE.md](./TIMEWEB_API_SETUP_GUIDE.md)
2. **Настройте:** `.github/workflows/timeweb-deploy.yml`
3. **Кастомизируйте:** `scripts/timeweb-setup.ts`

---

## 📄 СТРУКТУРА ФАЙЛОВ

```
/workspace/
├── БЫСТРЫЙ_СТАРТ.md                    ⚡ Начните здесь!
├── ПОШАГОВАЯ_ИНСТРУКЦИЯ.md             📘 Полная инструкция
├── CURSOR_AGENT_PROMPT.md              🤖 Промпты для Agent
├── GITHUB_SETUP_STEP_BY_STEP.md        🔧 Настройка GitHub
├── TIMEWEB_API_SETUP_GUIDE.md          📖 Гайд по API
├── TIMEWEB_API_QUICKSTART.md           ⚡ Быстрый старт API
├── TIMEWEB_INTEGRATION_GUIDE.md        🔗 Интеграция
├── TIMEWEB_CLOUD_ANALYSIS.md           📊 Анализ платформы
├── TIMEWEB_PRICING_COMPARISON.md       💰 Сравнение цен
│
├── .github/workflows/
│   └── timeweb-deploy.yml              ⚙️ GitHub Actions
│
├── scripts/
│   ├── timeweb-setup.ts                🏗️ Создание инфраструктуры
│   ├── timeweb-manage.ts               🎮 Управление ресурсами
│   ├── setup-timeweb-server.sh         🔧 Настройка сервера
│   └── deploy-to-timeweb.sh            🚀 Деплой приложения
│
└── [остальные файлы проекта...]
```

---

## 🏆 ПРЕИМУЩЕСТВА ЭТОГО ПОДХОДА

✅ **Автоматизация:** Всё через API и Cursor Agent  
✅ **Скорость:** От нуля до production за 1 час  
✅ **Надежность:** Production-ready конфигурация  
✅ **Простота:** Не нужны знания DevOps  
✅ **Стоимость:** ~2450₽/мес (~$25)  
✅ **Масштабируемость:** Легко увеличить ресурсы  
✅ **Мониторинг:** Встроенные инструменты  
✅ **Резервное копирование:** Автоматические бэкапы  
✅ **Безопасность:** Firewall, SSL, SSH ключи  
✅ **CI/CD:** Автоматический деплой из GitHub  

---

## 🎓 ОБУЧАЮЩИЕ МАТЕРИАЛЫ

### Видеоуроки (запланированы)

- 🎥 "Деплой Next.js на Timeweb Cloud за 10 минут"
- 🎥 "Настройка CI/CD с GitHub Actions"
- 🎥 "Работа с Timeweb Cloud API"
- 🎥 "Автоматизация с Cursor Agent"

### Статьи (запланированы)

- 📝 "Сравнение облачных провайдеров для Next.js"
- 📝 "Оптимизация стоимости хостинга"
- 📝 "Масштабирование Next.js приложений"

---

## 🌟 ROADMAP

### v1.0 (текущая версия) ✅
- [x] Автоматическое создание инфраструктуры
- [x] GitHub Actions CI/CD
- [x] Интеграция с Cursor Agent
- [x] Полная документация

### v1.1 (в разработке)
- [ ] Автоматическое масштабирование
- [ ] Интеграция с Terraform
- [ ] Dashboard для мониторинга
- [ ] Автоматические тесты производительности

### v2.0 (планируется)
- [ ] Multi-cloud поддержка
- [ ] Blue-Green deployment
- [ ] Canary releases
- [ ] Advanced monitoring (Grafana, Prometheus)

---

## 📜 ЛИЦЕНЗИЯ

MIT License - используйте свободно для коммерческих и некоммерческих проектов.

---

## 👥 БЛАГОДАРНОСТИ

- **Timeweb Cloud** за отличное API и низкие цены
- **GitHub** за Actions и инфраструктуру CI/CD
- **Cursor** за AI-powered разработку
- **Next.js** за amazing framework

---

## 📞 КОНТАКТЫ

**Проект:** KamchaTour Hub  
**Репозиторий:** https://github.com/ВАШ_USERNAME/kamchatour-hub  
**Документация:** [ПОШАГОВАЯ_ИНСТРУКЦИЯ.md](./ПОШАГОВАЯ_ИНСТРУКЦИЯ.md)  

---

**Последнее обновление:** 2025-10-29  
**Версия документации:** 1.0  
**Статус:** ✅ Production Ready

---

## 🚀 НАЧАТЬ ПРЯМО СЕЙЧАС

```bash
# 1. Клонируйте репозиторий (если еще не сделали)
git clone https://github.com/ВАШ_USERNAME/kamchatour-hub.git
cd kamchatour-hub

# 2. Прочитайте быстрый старт
cat БЫСТРЫЙ_СТАРТ.md

# 3. Получите токен Timeweb
open https://timeweb.cloud/my/api

# 4. Добавьте в GitHub Secrets
open https://github.com/ВАШ_USERNAME/kamchatour-hub/settings/secrets/actions

# 5. Запустите Cursor Agent с промптом из CURSOR_AGENT_PROMPT.md
```

---

**🎉 Успехов в запуске KamchaTour Hub на Timeweb Cloud!**

---

*Документация создана с помощью AI Assistant для максимальной автоматизации deployment процесса.*
