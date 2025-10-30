# 🔍 КАК НАЙТИ ПРАВИЛЬНЫЙ URL ПРИЛОЖЕНИЯ

> **Проблема:** DNS_PROBE_FINISHED_NXDOMAIN  
> **Причина:** Неправильный URL или DNS еще не активирован  
> **Решение:** Найти точный URL в Timeweb Dashboard

---

## 📋 ГДЕ ИСКАТЬ URL

### Вариант 1: В Overview приложения

1. Откройте: https://timeweb.cloud/my/apps/125051
2. Посмотрите на **верхнюю часть страницы**
3. Там должна быть кнопка или ссылка с URL типа:
   ```
   🌐 https://<ваше-приложение>.timeweb.io
   ```
4. Кликните на неё или скопируйте

---

### Вариант 2: В Domains

1. Откройте: https://timeweb.cloud/my/apps/125051
2. Перейдите в раздел: **Domains** или **Домены**
3. Найдите **Primary Domain** или **Основной домен**
4. Скопируйте URL

Примеры:
```
https://app-125051.timeweb.io
https://125051.timeweb.cloud
https://kamchatour.timeweb.io
```

---

### Вариант 3: В Settings → General

1. Откройте: https://timeweb.cloud/my/apps/125051
2. Settings → General
3. Найдите поле **Application URL** или **URL приложения**
4. Скопируйте оттуда

---

### Вариант 4: В Runtime → Logs

1. Runtime → Logs (или Application Logs)
2. Ищите строку типа:
   ```
   Server listening on http://0.0.0.0:3000
   Application available at: https://...
   ```
3. Там может быть указан URL

---

## 🎯 ВОЗМОЖНЫЕ ФОРМАТЫ URL

Timeweb Cloud Apps может использовать разные форматы:

```
✓ https://<app-id>.timeweb.io
✓ https://app-<id>.timeweb.cloud
✓ https://<project-name>.timeweb.io
✓ https://<custom-domain>
```

**Примеры:**
```
https://125051.timeweb.io
https://app-125051.timeweb.cloud
https://kamchatour.timeweb.io
https://my-app-125051.timeweb.cloud
```

---

## 🔍 МЕТОДЫ ПРОВЕРКИ

### 1. Попробуйте разные варианты:

```bash
# Без префикса
https://125051.timeweb.io

# С префиксом app-
https://app-125051.timeweb.cloud

# Без https (http)
http://kamchatour-125051.timeweb.cloud

# С www
https://www.kamchatour-125051.timeweb.cloud
```

### 2. Проверьте статус деплоя:

**Deployments → Latest Deploy:**

- Статус: Success ✅
- В конце логов должно быть:
  ```
  ✓ Build completed
  ✓ Starting server
  ✓ Server ready at: <URL>  ← ЗДЕСЬ МОЖЕТ БЫТЬ URL!
  ```

### 3. Проверьте Runtime:

**Runtime → Overview:**

- Status: Running ✅
- URL: <должен быть указан>
- Port: 3000

---

## 📸 СКРИНШОТ ПОМОЖЕТ

Сделайте скриншот страницы:
https://timeweb.cloud/my/apps/125051

Где видно:
- Название приложения
- URL или домен
- Статус (Running/Success)

И пришлите мне, я точно скажу какой URL использовать.

---

## ⏰ ЕСЛИ DNS ЕЩЕ НЕ АКТИВИРОВАН

Иногда после первого деплоя DNS может не сразу активироваться.

**Что делать:**

1. **Подождите 5-10 минут**
   DNS пропагация может занять время

2. **Проверьте статус приложения:**
   Runtime → должно быть "Running" ✅

3. **Попробуйте по IP:**
   В Settings может быть указан IP адрес
   Попробуйте: `http://<IP>:3000`

4. **Перезапустите приложение:**
   Settings → Restart Application

---

## 🆘 TROUBLESHOOTING

### DNS_PROBE_FINISHED_NXDOMAIN

**Значит:** Домен не существует в DNS

**Причины:**
- URL неправильный (не тот формат)
- Домен еще не создан в Timeweb
- DNS еще не пропагировался

**Решение:**
- Найдите точный URL в dashboard
- Подождите 5-10 минут
- Проверьте раздел Domains

### Connection refused / Timeout

**Значит:** Приложение не запущено

**Причины:**
- Start command неправильная
- Ошибка при старте (см. Logs)
- Порт неправильный

**Решение:**
- Проверьте Runtime → Logs
- Проверьте Start Command = `npm start`
- Проверьте PORT=3000

### 502 Bad Gateway

**Значит:** Приложение упало после старта

**Причины:**
- Ошибка в коде
- DATABASE_URL неправильный
- Отсутствуют env vars

**Решение:**
- Проверьте Runtime → Logs
- Проверьте все Environment Variables
- Restart Application

---

## ✅ ПОСЛЕ НАХОЖДЕНИЯ URL

Как только найдете правильный URL:

1. **Обновите NEXT_PUBLIC_APP_URL:**
   ```env
   NEXT_PUBLIC_APP_URL=<ваш_настоящий_URL>
   ```

2. **Restart Application**

3. **Откройте приложение**

4. **Сообщите мне:**
   "Работает! URL: <ваш_url>"

И мы начнем улучшать дизайн! 🎨

---

## 📞 ПОДДЕРЖКА TIMEWEB

Если не можете найти URL:

**Напишите в поддержку:**
- Email: support@timeweb.ru
- Telegram: @timeweb_support
- Прямо в dashboard: кнопка "Поддержка"

**Спросите:**
"Какой URL у моего приложения с ID 125051?"

Они ответят в течение 5-15 минут.

---

## 🎯 ИТОГ

```
✅ Deploy успешен
❓ URL неизвестен - нужно найти в dashboard
⏳ Ожидание: найдите URL и сообщите мне
```

**Найдите URL в Timeweb Dashboard и пришлите мне!** 🔍

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Статус:** Waiting for correct URL
