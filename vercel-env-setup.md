# 🔧 НАСТРОЙКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ НА VERCEL

## 📋 СПИСОК НЕОБХОДИМЫХ ПЕРЕМЕННЫХ

### 🤖 AI API КЛЮЧИ
```
GROQ_API_KEY=your_groq_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 🌤️ ПОГОДНЫЕ API
```
OPENWEATHER_API_KEY=your_openweather_api_key_here
YANDEX_WEATHER_API_KEY=your_yandex_weather_api_key_here
GISMETEO_API_KEY=your_gismeteo_api_key_here
```

### 🗺️ КАРТЫ И ГЕОЛОКАЦИЯ
```
YANDEX_MAPS_API_KEY=your_yandex_maps_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 💳 ПЛАТЕЖНЫЕ СИСТЕМЫ
```
CLOUDPAYMENTS_PUBLIC_ID=your_cloudpayments_public_id
CLOUDPAYMENTS_API_SECRET=your_cloudpayments_api_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 🔔 УВЕДОМЛЕНИЯ
```
SMS_RU_API_KEY=your_sms_ru_api_key
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 🗄️ БАЗА ДАННЫХ
```
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_URL=postgresql://username:password@host:port/database
POSTGRES_PRISMA_URL=postgresql://username:password@host:port/database
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:port/database
```

### 🔐 БЕЗОПАСНОСТЬ
```
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### 🌐 ВНЕШНИЕ СЕРВИСЫ
```
REDIS_URL=your_redis_url
SENTRY_DSN=your_sentry_dsn
ANALYTICS_ID=your_analytics_id
```

## 📝 ИНСТРУКЦИЯ ПО НАСТРОЙКЕ

### 1. ВХОД В VERCEL DASHBOARD
1. Откройте https://vercel.com/dashboard
2. Найдите проект "kamhub"
3. Перейдите в Settings → Environment Variables

### 2. ДОБАВЛЕНИЕ ПЕРЕМЕННЫХ
1. Нажмите "Add New"
2. Введите название переменной
3. Введите значение
4. Выберите окружения (Production, Preview, Development)
5. Нажмите "Save"

### 3. ПРОВЕРКА НАСТРОЙКИ
1. Перейдите в Deployments
2. Создайте новый деплой
3. Проверьте логи на наличие ошибок
4. Протестируйте функциональность

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

### 🔒 БЕЗОПАСНОСТЬ
- Никогда не коммитьте API ключи в код
- Используйте разные ключи для разных окружений
- Регулярно ротируйте ключи
- Мониторьте использование ключей

### 🧪 ТЕСТИРОВАНИЕ
- Сначала настройте на Preview окружении
- Протестируйте все функции
- Только потом деплойте в Production
- Ведите лог изменений

### 📊 МОНИТОРИНГ
- Настройте алерты на ошибки
- Мониторьте использование API
- Отслеживайте производительность
- Ведите статистику ошибок

## 🚀 СЛЕДУЮЩИЕ ШАГИ

После настройки переменных:
1. Перезапустить деплой
2. Протестировать AI чат
3. Протестировать погодную систему
4. Протестировать систему трансферов
5. Настроить мониторинг