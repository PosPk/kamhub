# 🏔️ Kamchatour Hub - Экосистема туризма Камчатки

[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.10-38B2AC)](https://tailwindcss.com/)

> **Современная туристическая платформа с полным функционалом CRM, AI-рекомендациями, умным поиском и системой бронирования для Камчатского края**

## 🎯 **О ПРОЕКТЕ**

Kamchatour Hub - это комплексная экосистема для туризма на Камчатке, объединяющая:

- 🎨 **Премиум дизайн** в черно-золотом стиле
- 🤖 **AI-гид** с консенсусом от множества провайдеров
- 🔍 **Умный поиск** маршрутов с учетом погоды и свободных мест
- 🏢 **Полная CRM система** для туроператоров
- 💳 **Платежная система** CloudPayments
- 🚌 **Система трансферов** с блокировками мест
- 📊 **Аналитика и отчеты**
- 🔐 **Система ролей и безопасности**

## 🚀 **БЫСТРЫЙ СТАРТ**

### **Деплой в Yandex Cloud (контейнер)**

```bash
# Сборка образа
docker build -t cr.yandex/<registry>/<repo>/kamhub:latest .

# Логин в YCR и push
yc iam create-token | docker login --username iam --password-stdin cr.yandex
docker push cr.yandex/<registry>/<repo>/kamhub:latest

# Запуск на ВМ
ssh user@vm "docker pull cr.yandex/<registry>/<repo>/kamhub:latest && \
  docker rm -f kamhub || true && \
  docker run -d --name kamhub -p 80:8080 --env-file /etc/kamhub.env cr.yandex/<registry>/<repo>/kamhub:latest"
```

### **Локальная разработка**

```bash
# Установите зависимости
npm install

# Запустите в режиме разработки
npm run dev

# Откройте http://localhost:3000
```

## 🏗️ **АРХИТЕКТУРА**

### **Frontend**
- **Next.js 14** с App Router
- **React 18** с TypeScript
- **TailwindCSS** для стилизации
- **Floating UI** для интерактивных элементов
- **Client Components** для интерактивности

### **Backend**
- **Next.js API Routes** (Edge Runtime для AI)
- **PostgreSQL** с расширениями PostGIS
- **Node.js** для серверной логики
- **pg** для работы с базой данных

### **AI & Интеграции**
- **GROQ API** (Llama 3.1 70B)
- **DeepSeek API** (DeepSeek Chat)
- **OpenRouter API** (множественные модели)
- **Yandex Maps API** для карт
- **Open-Meteo API** для погоды

## 📁 **СТРУКТУРА ПРОЕКТА**

```
kamhub/
├── app/                          # Next.js App Router
│   ├── api/                     # API маршруты
│   │   ├── ai/                  # AI-сервисы
│   │   ├── chat/                # Чат с AI
│   │   ├── tours/               # Управление турами
│   │   ├── partners/            # Партнеры
│   │   ├── weather/             # Погодные данные
│   │   └── eco-points/          # Эко-система
│   ├── operator/                # CRM туроператора
│   ├── hub/                     # Основные страницы
│   ├── layout.tsx               # Корневой layout
│   └── page.tsx                 # Главная страница
├── components/                   # React компоненты
│   ├── AIChatWidget.tsx         # AI-чат виджет
│   ├── TourCardEnhanced.tsx     # Карточка тура с Floating UI
│   ├── InteractiveMap.tsx       # Интерактивная карта
│   ├── SmartFilters.tsx         # Умные фильтры
│   └── Protected.tsx            # Защита ролей
├── contexts/                     # React контексты
│   ├── RoleContext.tsx          # Управление ролями
│   ├── AuthContext.tsx          # Аутентификация
│   └── OrdersContext.tsx        # Управление заказами
├── lib/                         # Утилиты и конфигурация
│   ├── config.ts                # Конфигурация приложения
│   ├── database.ts              # Работа с БД
│   └── hooks/                   # Кастомные хуки
├── types/                       # TypeScript типы
└── styles/                      # Стили
    └── floating-ui.css          # Стили для Floating UI
```

## 🔧 **НАСТРОЙКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ**

Создайте файл `.env.local`:

```env
# База данных
DATABASE_URL=postgresql://user:password@host:port/database

# AI API ключи
GROQ_API_KEY=your_groq_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# Карты и погода
YANDEX_MAPS_API_KEY=your_yandex_maps_key
YANDEX_WEATHER_API_KEY=your_yandex_weather_key

# Безопасность
JWT_SECRET=your_jwt_secret_key

# Платежи
CLOUDPAYMENTS_PUBLIC_ID=your_cloudpayments_id
CLOUDPAYMENTS_API_SECRET=your_cloudpayments_secret

# Мониторинг
SENTRY_DSN=your_sentry_dsn
```

## 🎨 **ДИЗАЙН СИСТЕМА**

### **Цветовая палитра**
- **Основной**: Премиум черный (#000000)
- **Акцент**: Золотой (#FFD700)
- **Градиенты**: Черно-золотые переходы
- **Текст**: Белый на черном фоне

### **Компоненты**
- **Floating UI** для popover, tooltips, dropdowns
- **Адаптивный дизайн** для мобильных устройств
- **Анимации** и переходы
- **Иконки** SVG

## 🤖 **AI-СИСТЕМА**

### **Провайдеры AI**
1. **GROQ** - Llama 3.1 70B (основной)
2. **DeepSeek** - DeepSeek Chat (резервный)
3. **OpenRouter** - множественные модели

### **Функции AI**
- Консенсус от множественных провайдеров
- Контекстные рекомендации
- Обработка естественного языка
- Интеграция с погодными данными

## 🏢 **CRM СИСТЕМА**

### **Роли пользователей**
- **traveler** - Турист
- **operator** - Туроператор
- **guide** - Гид
- **transfer** - Трансфер
- **agent** - Агент
- **admin** - Администратор

### **Функции CRM**
- Дашборд с аналитикой
- Управление турами
- Управление бронированиями
- Система уровней (L1, L2, L3)
- Отчеты и метрики

## 🔍 **УМНЫЙ ПОИСК**

### **Алгоритм поиска**
1. **Геолокация** - поиск в радиусе 50км
2. **Погодные условия** - учет безопасности
3. **Доступность мест** - проверка свободных мест
4. **Рейтинг операторов** - качество сервиса
5. **Ценовая политика** - оптимальные цены

### **Фильтры**
- По сложности маршрута
- По сезонности
- По цене
- По типу активности
- По рейтингу

## 💳 **ПЛАТЕЖНАЯ СИСТЕМА**

### **CloudPayments**
- Прием платежей
- Возвраты
- Подписки
- Инвойсы

### **Безопасность**
- Криптографические подписи
- Валидация токенов
- Защита от мошенничества

## 🚌 **СИСТЕМА ТРАНСФЕРОВ**

### **Функции**
- Блокировка мест на время
- Валидация билетов
- QR-коды для проверки
- Управление расписанием

### **API**
- `/api/transfer/hold` - блокировка мест
- `/api/transfer/validate` - валидация билетов
- `/api/transfer/ticket` - генерация билетов

## 📊 **АНАЛИТИКА**

### **Метрики**
- Количество туров
- Активные бронирования
- Доходы по месяцам
- Рейтинги операторов
- Конверсия

### **Отчеты**
- Финансовые отчеты
- Статистика бронирований
- Анализ клиентов
- Производительность

## 🛠️ **РАЗРАБОТКА**

### **Команды**
```bash
# Разработка
npm run dev

# Сборка
npm run build

# Запуск продакшена
npm run start

# Миграции БД
npm run migrate

# Линтинг
npm run lint

# Форматирование
npm run format
```

### **Миграции базы данных**
```bash
# Применить миграции
npm run migrate:up

# Откатить миграции
npm run migrate:down

# Статус миграций
npm run migrate:status
```

## 🗄️ **БАЗА ДАННЫХ**

### **Основные таблицы**
- `users` - Пользователи
- `partners` - Партнеры/операторы
- `tours` - Туры
- `bookings` - Бронирования
- `reviews` - Отзывы
- `chat_sessions` - Сессии чата
- `chat_messages` - Сообщения

### **Расширения PostgreSQL**
- `uuid-ossp` - UUID генерация
- `postgis` - Геопространственные данные

## 🚀 **ДЕПЛОЙ**

### **CI/CD (GitHub Actions → YCR → VM/Serverless)**
См. workflows: сборка Docker-образа, push в YCR, деплой на ВМ через SSH.

### **Docker (локально)**
```bash
docker build -t kamhub .
docker run -p 8080:8080 --env-file .env.local kamhub
open http://localhost:8080
```

## 📱 **МОБИЛЬНАЯ ВЕРСИЯ**

- Адаптивный дизайн
- Touch-friendly интерфейс
- PWA поддержка
- Офлайн функциональность

## 🔒 **БЕЗОПАСНОСТЬ**

- JWT токены для аутентификации
- Роли и права доступа
- Валидация входных данных
- Защита от SQL инъекций
- Rate limiting
- CORS настройки

## 📈 **ПРОИЗВОДИТЕЛЬНОСТЬ**

- Статическая генерация страниц
- Edge Runtime для AI
- Кэширование запросов
- Оптимизация изображений
- Lazy loading компонентов

## 🧪 **ТЕСТИРОВАНИЕ**

```bash
# Запуск тестов
npm test

# Тесты с покрытием
npm run test:coverage

# E2E тесты
npm run test:e2e
```

## 🤝 **КОНТРИБЬЮТИНГ**

1. Форкните репозиторий
2. Создайте feature ветку
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 **ЛИЦЕНЗИЯ**

MIT License - см. файл [LICENSE](LICENSE)

## 👥 **КОМАНДА**

- **Разработка**: PosPk Team
- **Дизайн**: Black & Gold Theme
- **AI**: Multi-provider consensus
- **Backend**: Next.js + PostgreSQL

## 📞 **ПОДДЕРЖКА**

- **Email**: support@kamchatour.ru
- **Telegram**: @kamchatour_support
- **Документация**: [docs.kamchatour.ru](https://docs.kamchatour.ru)

## 🎯 **ДОРОЖНАЯ КАРТА**

### **v1.1** (Q1 2024)
- [ ] Мобильное приложение
- [ ] Push уведомления
- [ ] Интеграция с социальными сетями

### **v1.2** (Q2 2024)
- [ ] Виртуальные туры
- [ ] AR/VR поддержка
- [ ] Многоязычность

### **v2.0** (Q3 2024)
- [ ] Блокчейн интеграция
- [ ] NFT сертификаты
- [ ] Децентрализованная система

---

**Сделано с ❤️ для Камчатки** 🏔️


