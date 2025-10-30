# 🚀 KamchaTour Hub → Timeweb Cloud

**Запуск за 3 команды! Время: 15 минут**

---

## ⚡ БЫСТРЫЙ СТАРТ

### 1️⃣ Получите API токен (2 минуты)

```bash
# Откройте в браузере:
https://timeweb.cloud/my/api

# Создайте токен с правами:
# ✅ Управление серверами
# ✅ Управление БД
# ✅ Управление S3
# ✅ Управление Firewall

# Скопируйте токен и экспортируйте:
export TIMEWEB_TOKEN=ваш_токен_здесь
```

---

### 2️⃣ Проверьте готовность (1 минута)

```bash
npm run timeweb:check
```

**Что проверится:**
- ✅ Токен валидный
- ✅ Достаточно денег (~3000₽)
- ✅ Регионы доступны
- ✅ Имена не заняты

---

### 3️⃣ Создайте инфраструктуру (5-10 минут)

```bash
npm run timeweb:setup
```

**Что создастся автоматически:**
- ✅ VDS сервер (Ubuntu 22.04, 2 vCPU, 4 GB)
- ✅ PostgreSQL БД (v15, 2 vCPU, 4 GB)
- ✅ S3 Storage (bucket: kamchatour-media)
- ✅ Firewall (SSH, HTTP, HTTPS)

**Результат:**
- `timeweb-resources.json` - информация о ресурсах
- `.env.production.timeweb` - настройки подключения

---

## ✅ ГОТОВО!

**Что дальше:**

```bash
# 1. Подключитесь к серверу
ssh root@IP_ИЗ_timeweb-resources.json

# 2. Настройте сервер
bash scripts/setup-timeweb-server.sh

# 3. Разверните приложение
bash scripts/deploy-to-timeweb.sh
```

---

## 💰 СТОИМОСТЬ

**~2450₽/месяц (~$25)**
- VDS: 1200₽
- PostgreSQL: 1200₽
- S3: 50₽

---

## 🛠️ ДОПОЛНИТЕЛЬНЫЕ КОМАНДЫ

```bash
# Проверить статус всех ресурсов
npm run timeweb:status

# Управление ресурсами
npm run timeweb:manage list
npm run timeweb:manage status servers <ID>
npm run timeweb:manage restart <server_id>
npm run timeweb:manage backup db <database_id>
```

---

## ❓ ПРОБЛЕМЫ

### Проблема: Check не проходит

**Решение:**
1. Проверьте токен: https://timeweb.cloud/my/api
2. Пополните баланс: https://timeweb.cloud/my/finance
3. Проверьте существующие ресурсы: https://timeweb.cloud/my/servers

### Проблема: Setup падает с ошибкой

**Решение:**
1. Удалите существующие ресурсы с именами kamchatour-*
2. Проверьте баланс (нужно минимум 3000₽)
3. Запустите снова: `npm run timeweb:setup`

### Проблема: Недостаточно денег

**Минимальный баланс:** 3000₽  
**Пополнить:** https://timeweb.cloud/my/finance

---

## 📚 БОЛЬШЕ ИНФОРМАЦИИ

**Полная документация:**
- [ПОШАГОВАЯ_ИНСТРУКЦИЯ.md](./ПОШАГОВАЯ_ИНСТРУКЦИЯ.md) - 60 минут до production
- [CURSOR_AGENT_PROMPT.md](./CURSOR_AGENT_PROMPT.md) - промпты для Cursor Agent
- [README_GITHUB_TIMEWEB.md](./README_GITHUB_TIMEWEB.md) - главная документация

**GitHub Actions (автоматический деплой):**
- [.github/workflows/timeweb-deploy.yml](./.github/workflows/timeweb-deploy.yml)

---

## 🎯 ТРИ КОМАНДЫ - ЭТО ВСЁ!

```bash
export TIMEWEB_TOKEN=ваш_токен    # 1. Токен
npm run timeweb:check              # 2. Проверка
npm run timeweb:setup              # 3. Создание
```

**Время:** 15 минут  
**Результат:** Готовая инфраструктура на Timeweb Cloud ✅

---

**Дата:** 2025-10-29  
**Репозиторий:** https://github.com/PosPk/kamhub  
**Версия:** 2.0 (исправленная)
