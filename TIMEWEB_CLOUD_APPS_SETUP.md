# 🚀 ДЕПЛОЙ НА TIMEWEB CLOUD APPS (PaaS)

**Дата:** 30.10.2025  
**Платформа:** Timeweb Cloud Apps (аналог Vercel!)  
**Репозиторий:** https://github.com/PosPk/kamhub  

---

## ✨ ЧТО ТАКОЕ TIMEWEB CLOUD APPS?

**Timeweb Cloud Apps = Vercel от Timeweb!**

### Преимущества над VDS:
- ✅ **Автоматический деплой** - git push → деплой
- ✅ **Автоматический SSL** - не нужен Certbot
- ✅ **Не нужен Nginx** - всё уже настроено
- ✅ **Не нужен PM2** - платформа сама управляет
- ✅ **Managed PostgreSQL** - автоматические бэкапы
- ✅ **Автоматическое масштабирование** - при росте нагрузки

### Отличия от Vercel:
- 💰 **Цена**: Дешевле (российские рубли)
- 🇷🇺 **Локация**: Серверы в России (быстрее)
- 💳 **Оплата**: Российские карты
- 📞 **Поддержка**: На русском языке

---

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ ДЕПЛОЯ

### ШАГ 1: Откройте страницу создания приложения

```
https://timeweb.cloud/my/apps/create
```

---

### ШАГ 2: Подключите GitHub репозиторий

**2.1. Выберите "GitHub"**

**2.2. Авторизуйте Timeweb Cloud в GitHub:**
- Нажмите "Connect GitHub"
- Войдите в GitHub
- Разрешите доступ Timeweb Cloud

**2.3. Выберите репозиторий:**
```
PosPk/kamhub
```

**2.4. Выберите ветку:**
```
cursor/study-timeweb-cloud-documentation-thoroughly-72f9
```
*(или `main` если хотите стабильную версию)*

---

### ШАГ 3: Настройте приложение

**3.1. Название:**
```
kamchatour-hub
```

**3.2. Framework Detection:**
- Timeweb автоматически определит **Next.js 14**
- ✅ Оставьте как есть

**3.3. Build Settings:**

| Параметр | Значение |
|----------|----------|
| **Framework** | Next.js |
| **Node.js Version** | 20.x (latest) |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Output Directory** | `.next` |
| **Install Command** | `npm ci` |

**3.4. Root Directory:**
```
/
```
*(проект в корне репозитория)*

---

### ШАГ 4: Настройте Environment Variables

**4.1. Нажмите "Environment Variables"**

**4.2. Добавьте ОБЯЗАТЕЛЬНЫЕ переменные:**

#### 🔐 NODE & APP:
```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://kamchatour-hub.timeweb.app
```

#### 🗄️ DATABASE (из email Timeweb):
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```
*(Скопируйте из email после создания БД)*

#### 🤖 AI PROVIDERS (обязательно хотя бы один):
```bash
GROQ_API_KEY=your_groq_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

#### 🗺️ YANDEX SERVICES:
```bash
YANDEX_MAPS_API_KEY=your_yandex_maps_key
YANDEX_WEATHER_API_KEY=your_yandex_weather_key
```

#### 🔐 SECURITY:
```bash
JWT_SECRET=generate_random_32_chars_here
NEXTAUTH_SECRET=generate_random_32_chars_here
```

**Сгенерировать секреты:**
```bash
# На вашем компьютере:
openssl rand -base64 32
```

---

### ШАГ 5: Настройте PostgreSQL

**5.1. В разделе "Services" нажмите "Add PostgreSQL"**

**5.2. Выберите конфигурацию:**
- **Версия:** PostgreSQL 16
- **Preset:** P1 (1 vCPU, 1GB RAM) - ~230₽/мес
- **Регион:** ru-2 (Москва)

**5.3. После создания БД:**
- Скопируйте `DATABASE_URL` из email
- Добавьте в Environment Variables

---

### ШАГ 6: Настройте S3 Storage (опционально)

**Для загрузки файлов (фото туров, аватары):**

**6.1. В разделе "Services" нажмите "Add S3 Storage"**

**6.2. Параметры:**
```
Bucket Name: kamchatour-media
Region: ru-2
```

**6.3. После создания добавьте в Environment Variables:**
```bash
S3_ENDPOINT=https://your_endpoint.timeweb.cloud
S3_BUCKET=kamchatour-media
S3_ACCESS_KEY=from_email
S3_SECRET_KEY=from_email
S3_REGION=ru-2
```

---

### ШАГ 7: Настройте Resources (ресурсы)

**7.1. Выберите план:**

| План | CPU | RAM | Цена | Для чего |
|------|-----|-----|------|----------|
| **Starter** | 0.5 vCPU | 512MB | ~150₽/мес | Тестирование |
| **Basic** | 1 vCPU | 1GB | ~300₽/мес | Запуск MVP |
| **Standard** | 2 vCPU | 2GB | ~600₽/мес | Продакшн |

**Рекомендую:** **Basic** (1 vCPU, 1GB) для начала

**7.2. Auto-scaling (опционально):**
- Min instances: 1
- Max instances: 3
- Scale on: CPU > 80% или RAM > 80%

---

### ШАГ 8: Настройте Domain (домен)

**8.1. Автоматический поддомен:**
```
kamchatour-hub.timeweb.app
```
✅ Создаётся автоматически

**8.2. Свой домен (опционально):**

Если у вас есть `kamchatour.ru`:

1. В Timeweb Apps нажмите "Add Custom Domain"
2. Введите: `kamchatour.ru`
3. Добавьте DNS записи у регистратора:
```
A    @    45.xxx.xxx.xxx (из Timeweb)
```
4. SSL сертификат создастся автоматически! ✅

---

### ШАГ 9: Запустите деплой! 🚀

**9.1. Проверьте все настройки:**
- ✅ GitHub репозиторий подключен
- ✅ Ветка выбрана
- ✅ Build команды правильные
- ✅ Environment Variables добавлены
- ✅ PostgreSQL подключен
- ✅ Ресурсы выбраны

**9.2. Нажмите "Create & Deploy"**

**9.3. Ждите деплой (~5-10 минут):**

Прогресс можно смотреть в логах:
```
Installing dependencies...     [████████] 100%
Building Next.js application...    [████████] 100%
Running database migrations... [████████] 100%
Starting application...        [████████] 100%
✅ Deployment successful!
```

---

## 🎯 ПОСЛЕ ДЕПЛОЯ

### Проверьте статус:

**1. Откройте приложение:**
```
https://kamchatour-hub.timeweb.app
```

**2. Проверьте основные страницы:**
- 🏠 Главная: `/`
- 🔐 Авторизация: `/auth/login`
- 🎫 Туры: `/hub/tours`
- 🚗 Трансферы: `/hub/transfers`
- 🤖 AI Чат: тестируйте виджет

**3. Проверьте логи:**
```
Timeweb Cloud Panel → Apps → kamchatour-hub → Logs
```

**4. Проверьте метрики:**
```
Timeweb Cloud Panel → Apps → kamchatour-hub → Metrics
```
- CPU usage
- Memory usage
- Request count
- Response time

---

## 🔧 НАСТРОЙКА AUTO-DEPLOY

**Теперь каждый git push автоматически деплоится!**

### Как это работает:

**1. Делаете изменения локально:**
```bash
git add .
git commit -m "Added new feature"
git push origin main
```

**2. Timeweb автоматически:**
- Получает webhook от GitHub
- Клонирует код
- Запускает `npm ci`
- Запускает `npm run build`
- Применяет миграции БД
- Запускает `npm start`
- Переключает трафик на новую версию

**3. Деплой занимает ~5 минут**

**4. Если что-то сломалось:**
```
Timeweb Panel → Apps → Deployments → Rollback
```
*(откатывается к предыдущей версии за 1 клик)*

---

## 💰 СТОИМОСТЬ (примерная)

| Сервис | Конфигурация | Цена/мес |
|--------|--------------|----------|
| **App Instance** | 1 vCPU, 1GB RAM | ~300₽ |
| **PostgreSQL** | P1 (1 vCPU, 1GB) | ~230₽ |
| **S3 Storage** | 10GB хранилище | ~50₽ |
| **Traffic** | 100GB исходящий | включено |
| **SSL** | Let's Encrypt | бесплатно |
| **Backups** | Автоматические | включено |
| **ИТОГО:** | | **~580₽/мес** |

**≈ $6/месяц** (дешевле чем Vercel Pro - $20!)

---

## 📊 СРАВНЕНИЕ: Timeweb Apps vs VDS

| Аспект | Timeweb Cloud Apps | VDS (ручная настройка) |
|--------|-------------------|------------------------|
| **Деплой** | ✅ Автоматический | ⚠️ Вручную (rsync/git) |
| **SSL** | ✅ Автоматический | ⚠️ Certbot вручную |
| **Nginx** | ✅ Не нужен | ⚠️ Настраивать вручную |
| **PM2** | ✅ Не нужен | ⚠️ Настраивать вручную |
| **Масштабирование** | ✅ Автоматическое | ⚠️ Вручную (увеличить VDS) |
| **Rollback** | ✅ 1 клик | ⚠️ git revert + redeploy |
| **Мониторинг** | ✅ Встроенный | ⚠️ Настраивать (PM2/Sentry) |
| **Backups БД** | ✅ Автоматические | ⚠️ Настраивать cron |
| **Сложность** | 🟢 Легко | 🔴 Сложно |
| **Цена** | ~580₽/мес | ~580₽/мес |

**Рекомендация:** Используйте **Timeweb Cloud Apps** - проще и надёжнее!

---

## 🐛 TROUBLESHOOTING

### Проблема 1: Build Failed

**Проверьте:**
```bash
# В логах смотрите на какой команде упал:
npm ci           # Проблема с зависимостями
npm run build    # Проблема с кодом
```

**Решение:**
- Проверьте `package.json` - все зависимости на месте?
- Проверьте TypeScript ошибки: `npm run type-check`
- Проверьте ESLint: `npm run lint`

### Проблема 2: App Crashes

**Проверьте Environment Variables:**
- `DATABASE_URL` правильный?
- `JWT_SECRET` установлен?
- AI ключи (хотя бы один) установлены?

**Смотрите логи:**
```
Timeweb Panel → Apps → Logs → Runtime Logs
```

### Проблема 3: Database Connection Error

**Проверьте:**
1. PostgreSQL создан в том же регионе (ru-2)?
2. `DATABASE_URL` скопирован полностью?
3. БД в статусе "Active" (не "Starting")?

**Тестируйте подключение:**
```
Timeweb Panel → Apps → Console
→ npm run db:test
```

### Проблема 4: Slow Response

**Увеличьте ресурсы:**
```
Timeweb Panel → Apps → Settings → Resources
→ Upgrade to Standard (2 vCPU, 2GB)
```

**Или включите auto-scaling:**
```
Settings → Auto-scaling → Enable
Min: 1, Max: 3 instances
```

---

## 🎉 ГОТОВО!

После выполнения всех шагов у вас будет:

- ✅ **Автоматический деплой** - git push → live
- ✅ **HTTPS** - автоматический SSL
- ✅ **PostgreSQL** - managed база данных
- ✅ **S3 Storage** - для файлов
- ✅ **Мониторинг** - метрики и логи
- ✅ **Backups** - автоматические
- ✅ **Rollback** - откат за 1 клик

**URL:** `https://kamchatour-hub.timeweb.app`

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ

- **Dashboard:** https://timeweb.cloud/my/apps
- **Документация:** https://timeweb.cloud/help/apps
- **API Docs:** https://timeweb.cloud/api-docs
- **Поддержка:** https://timeweb.cloud/support

---

**Готовы к деплою? Открывайте https://timeweb.cloud/my/apps/create!** 🚀
