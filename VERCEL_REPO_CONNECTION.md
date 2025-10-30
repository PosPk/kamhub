# 🔗 ПОДКЛЮЧЕНИЕ РЕПОЗИТОРИЯ К VERCEL

## 📊 **ИНФОРМАЦИЯ О РЕПОЗИТОРИИ:**

### **GitHub Repository:**
```
https://github.com/PosPk/kamhub
```

### **Ветка для деплоя:**
```
main
```

### **Последний коммит:**
```
0d40d46 - Добавлен демо-режим и исправлены ошибки
```

## 🚀 **ИНСТРУКЦИИ ДЛЯ ПОДКЛЮЧЕНИЯ:**

### 1. **ПЕРЕЙТИ НА VERCEL:**
- Открыть: https://vercel.com/pospks-projects/kamhub
- Нажать "Import Project" или "Connect Repository"

### 2. **ВЫБРАТЬ РЕПОЗИТОРИЙ:**
- Выбрать "GitHub"
- Найти репозиторий: `PosPk/kamhub`
- Нажать "Import"

### 3. **НАСТРОИТЬ ПРОЕКТ:**
- **Project Name:** `kamhub`
- **Framework Preset:** `Next.js`
- **Root Directory:** `./` (по умолчанию)
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (по умолчанию)

### 4. **НАСТРОИТЬ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ:**
```bash
# AI API Keys (для демо-режима можно оставить пустыми)
GROQ_API_KEY=
DEEPSEEK_API_KEY=

# Yandex API Keys (для демо-режима можно оставить пустыми)
YANDEX_MAPS_API_KEY=
YANDEX_WEATHER_API_KEY=

# Database (для демо-режима можно оставить пустыми)
DATABASE_URL=

# SMS Service (для демо-режима можно оставить пустыми)
SMS_RU_API_KEY=

# Email Service (для демо-режима можно оставить пустыми)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Telegram Bot (для демо-режима можно оставить пустыми)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Payment System (для демо-режима можно оставить пустыми)
CLOUDPAYMENTS_PUBLIC_ID=
CLOUDPAYMENTS_API_SECRET=
```

### 5. **ДЕПЛОЙ:**
- Нажать "Deploy"
- Дождаться завершения сборки
- Получить ссылку на проект

## 🎯 **ОСОБЕННОСТИ ДЕМО-РЕЖИМА:**

### ✅ **ЧТО РАБОТАЕТ БЕЗ API КЛЮЧЕЙ:**
- Все дашборды (турист, оператор, гид, трансфер)
- Демо-данные для всех функций
- UI/UX всех компонентов
- Навигация между ролями
- Система лояльности (демо)
- Платежная система (демо)

### 🚧 **ЧТО НУЖДАЕТСЯ В API КЛЮЧАХ:**
- Реальные AI-ответы
- Реальные карты Yandex
- Реальные уведомления
- Реальная база данных
- Реальные платежи

## 📱 **ССЫЛКИ ПОСЛЕ ДЕПЛОЯ:**

### **Основной домен:**
```
https://kamhub.vercel.app
```

### **Демо-режим:**
```
https://kamhub.vercel.app/demo
```

### **Дашборды:**
- Турист: `https://kamhub.vercel.app/hub/tourist`
- Оператор: `https://kamhub.vercel.app/hub/operator`
- Оператор трансферов: `https://kamhub.vercel.app/hub/transfer-operator`
- Гид: `https://kamhub.vercel.app/hub/guide`

## 🔧 **ТЕХНИЧЕСКИЕ ДЕТАЛИ:**

### **Build Settings:**
- **Node.js Version:** 18.x
- **Package Manager:** npm
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### **Environment Variables:**
- Все переменные можно оставить пустыми для демо-режима
- При необходимости реальных API - добавить ключи

---

*Последнее обновление: $(date)*
*Статус: ГОТОВ К ПОДКЛЮЧЕНИЮ*
*Приоритет: КРИТИЧЕСКИЙ*