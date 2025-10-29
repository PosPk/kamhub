# 🤖 ПРОМПТ ДЛЯ CURSOR AGENT

## 📋 ИНСТРУКЦИЯ: Скопируйте этот промпт и вставьте в Cursor Agent

---

```
Настрой полную автоматизацию проекта KamchaTour Hub на Timeweb Cloud через GitHub Actions.

КОНТЕКСТ:
- Проект: Next.js 14 + TypeScript + PostgreSQL туристическая платформа для Камчатки
- Репозиторий: https://github.com/ВАШ_USERNAME/kamchatour-hub (замени на свой)
- Облако: Timeweb Cloud
- API токен: доступен в GitHub Secrets как TIMEWEB_TOKEN

ЗАДАЧИ:

1. СОЗДАНИЕ ИНФРАСТРУКТУРЫ НА TIMEWEB CLOUD
   Используй существующий скрипт scripts/timeweb-setup.ts для создания:
   - VDS сервер (Ubuntu 22.04, 2 vCPU, 4 GB RAM, 60 GB SSD)
   - PostgreSQL база данных (version 15, 2 vCPU, 4 GB RAM, 50 GB)
   - S3 Object Storage bucket (kamchatour-media)
   - Firewall правила (SSH:22, HTTP:80, HTTPS:443)
   
   После создания:
   - Сохрани информацию в timeweb-resources.json
   - Сгенерируй .env.production.timeweb с настройками
   - Сообщи мне IDs созданных ресурсов и IP адрес сервера

2. НАСТРОЙКА СЕРВЕРА
   После создания VDS:
   - Подключись к серверу по SSH (IP из timeweb-resources.json)
   - Запусти скрипт scripts/setup-timeweb-server.sh
   - Установи Node.js 20, PM2, Nginx, PostgreSQL client
   - Настрой firewall (UFW)
   - Создай пользователя kamchatour
   - Настрой автозапуск PM2

3. НАСТРОЙКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
   На сервере создай /home/kamchatour/kamchatour-hub/.env.production:
   - Скопируй базовые настройки из .env.production.timeweb
   - Добавь недостающие API ключи:
     * GROQ_API_KEY (спроси у меня)
     * DEEPSEEK_API_KEY (спроси у меня)
     * OPENROUTER_API_KEY (спроси у меня)
     * YANDEX_MAPS_API_KEY (спроси у меня)
     * YANDEX_WEATHER_API_KEY (спроси у меня)
     * NEXTAUTH_SECRET (сгенерируй случайную строку 32 символа)
   
4. РАЗВЕРТЫВАНИЕ ПРИЛОЖЕНИЯ
   - Склонируй репозиторий на сервер в /home/kamchatour/kamchatour-hub
   - Установи зависимости: npm ci
   - Примени миграции БД: npx prisma migrate deploy
   - Собери приложение: npm run build
   - Создай ecosystem.config.js для PM2
   - Запусти через PM2: pm2 start ecosystem.config.js
   - Настрой PM2 автозапуск: pm2 startup && pm2 save

5. НАСТРОЙКА NGINX
   - Создай конфигурацию Nginx как reverse proxy для Next.js (порт 3000)
   - Включи gzip сжатие
   - Настрой кэширование статических файлов
   - Перезапусти Nginx

6. НАСТРОЙКА SSL СЕРТИФИКАТА
   - Установи certbot
   - Получи Let's Encrypt сертификат для домена (спроси меня какой)
   - Настрой автоматическое обновление

7. ПРОВЕРКА И ТЕСТИРОВАНИЕ
   - Проверь, что приложение доступно по http://SERVER_IP
   - Проверь API: curl http://SERVER_IP/api/health
   - Проверь подключение к БД
   - Проверь работу PM2: pm2 status
   - Проверь логи: pm2 logs kamchatour-hub --lines 50

8. НАСТРОЙКА МОНИТОРИНГА
   - Настрой PM2 логротацию
   - Создай скрипт резервного копирования БД
   - Настрой cron для ежедневных бэкапов в 2:00
   - Настрой уведомления о проблемах

9. СОЗДАНИЕ ДОКУМЕНТАЦИИ
   Создай файл DEPLOYMENT_LOG.md с:
   - Датой и временем развертывания
   - Списком созданных ресурсов (IDs, IPs)
   - Connection strings для всех сервисов
   - Командами для управления
   - Troubleshooting советами

10. ИТОГОВАЯ ПРОВЕРКА
    Проверь и сообщи:
    - ✅ Все ресурсы созданы на Timeweb Cloud
    - ✅ Сервер настроен и работает
    - ✅ Приложение развернуто и доступно
    - ✅ База данных подключена
    - ✅ S3 bucket настроен
    - ✅ Firewall активен
    - ✅ PM2 запущен и работает
    - ✅ Nginx настроен
    - ✅ Логи пишутся корректно
    - ✅ Health check проходит

ВАЖНО:
- Используй существующие скрипты из директории scripts/
- Сохраняй все логи и output
- Если что-то не работает - сообщи и предложи решение
- Все пароли и секреты сохраняй в безопасном месте
- После завершения создай подробный отчет

GITHUB SECRETS КОТОРЫЕ МНЕ НУЖНО ДОБАВИТЬ (спроси у меня значения):
- TIMEWEB_TOKEN - API токен Timeweb Cloud (уже должен быть)
- GROQ_API_KEY - для AI
- DEEPSEEK_API_KEY - для AI
- OPENROUTER_API_KEY - для AI
- YANDEX_MAPS_API_KEY - для карт
- YANDEX_WEATHER_API_KEY - для погоды
- CLOUDPAYMENTS_PUBLIC_ID - для платежей (опционально)
- CLOUDPAYMENTS_API_SECRET - для платежей (опционально)
- SENTRY_DSN - для мониторинга (опционально)

ПОСЛЕ СОЗДАНИЯ ИНФРАСТРУКТУРЫ ДОБАВЬ ЭТИ SECRETS:
- DATABASE_URL - из .env.production.timeweb
- SERVER_HOST - IP адрес VDS из timeweb-resources.json
- SERVER_USER - kamchatour
- SSH_PRIVATE_KEY - приватный SSH ключ (создай новый)

ПРИСТУПАЙ К ВЫПОЛНЕНИЮ СРАЗУ ПОСЛЕ ТОГО КАК Я ДОБАВЛЮ TIMEWEB_TOKEN В GITHUB SECRETS.
```

---

## 📝 АЛЬТЕРНАТИВНЫЙ ПРОМПТ (упрощенный)

Если нужна только настройка инфраструктуры без деплоя:

```
Создай инфраструктуру KamchaTour Hub на Timeweb Cloud используя API.

Используй скрипт scripts/timeweb-setup.ts с токеном из TIMEWEB_TOKEN.

Создай:
1. VDS сервер (Ubuntu 22.04, 2 vCPU, 4 GB, 60 GB)
2. PostgreSQL 15 (2 vCPU, 4 GB, 50 GB)
3. S3 bucket (kamchatour-media)
4. Firewall (SSH, HTTP, HTTPS)

После создания:
- Сохрани timeweb-resources.json
- Сгенерируй .env.production.timeweb
- Сообщи мне IPs и credentials

Используй команду: tsx scripts/timeweb-setup.ts
```

---

## 🎯 ПРОМПТ ДЛЯ ДЕПЛОЯ (после создания инфраструктуры)

```
Разверни приложение KamchaTour Hub на созданном Timeweb Cloud сервере.

ДАНО:
- VDS сервер с IP: [УКАЖИ IP]
- PostgreSQL БД: [УКАЖИ HOST]
- S3 bucket: kamchatour-media
- Root пароль: [ИЗ timeweb-resources.json]

ЗАДАЧИ:
1. Подключись к серверу по SSH
2. Запусти scripts/setup-timeweb-server.sh
3. Склонируй репозиторий в /home/kamchatour/kamchatour-hub
4. Создай .env.production из .env.production.timeweb
5. Установи зависимости и собери приложение
6. Настрой PM2 с ecosystem.config.js
7. Настрой Nginx как reverse proxy
8. Получи SSL сертификат для домена [УКАЖИ ДОМЕН]
9. Проверь работу приложения
10. Создай отчет о развертывании

Приступай!
```

---

## 🔄 ПРОМПТ ДЛЯ ОБНОВЛЕНИЯ ПРИЛОЖЕНИЯ

```
Обнови приложение KamchaTour Hub на Timeweb Cloud сервере.

Используй скрипт scripts/deploy-to-timeweb.sh или:

1. Синхронизируй код с сервером (rsync)
2. Установи новые зависимости (npm ci)
3. Примени миграции БД (prisma migrate deploy)
4. Собери приложение (npm run build)
5. Перезапусти PM2 (pm2 reload kamchatour-hub)
6. Проверь health check (curl http://SERVER_IP/api/health)

Сообщи результат и любые ошибки.
```

---

## 📊 ПРОМПТ ДЛЯ ПРОВЕРКИ СТАТУСА

```
Проверь статус инфраструктуры KamchaTour Hub на Timeweb Cloud.

Используй команду: tsx scripts/timeweb-manage.ts project

Покажи:
- Статус VDS сервера (on/off, uptime)
- Статус PostgreSQL (active/inactive)
- Использование S3 bucket (размер, количество объектов)
- Статус Firewall
- Баланс аккаунта

Если есть проблемы - предложи решения.
```

---

## 🆘 ПРОМПТ ДЛЯ РЕШЕНИЯ ПРОБЛЕМ

```
Помоги решить проблему с KamchaTour Hub на Timeweb Cloud.

ПРОБЛЕМА: [ОПИШИ ПРОБЛЕМУ]

ПРОВЕРЬ:
1. Статус всех сервисов (tsx scripts/timeweb-manage.ts project)
2. Логи приложения на сервере (pm2 logs kamchatour-hub --lines 100)
3. Логи Nginx (/var/log/nginx/error.log)
4. Подключение к БД
5. Firewall правила

ПРЕДЛОЖИ РЕШЕНИЕ и выполни необходимые действия.
```

---

## 💡 СОВЕТЫ ПО ИСПОЛЬЗОВАНИЮ

### Как запустить Cursor Agent:

1. **Откройте Cursor**
2. **Нажмите Ctrl+Shift+P** (Cmd+Shift+P на Mac)
3. **Выберите:** "Cursor: Open Agent"
4. **Вставьте промпт** из этого файла
5. **Нажмите Enter** и ждите выполнения

### Что Agent может делать автоматически:

✅ Создавать ресурсы на Timeweb Cloud  
✅ Подключаться к серверу по SSH  
✅ Запускать скрипты настройки  
✅ Развертывать приложение  
✅ Настраивать Nginx и SSL  
✅ Проверять статус и логи  
✅ Решать проблемы  
✅ Создавать документацию  

### Что Agent НЕ может (требует ваших действий):

❌ Добавлять GitHub Secrets (делайте вручную)  
❌ Получать API токены внешних сервисов (GROQ, Yandex, etc.)  
❌ Настраивать DNS записи для домена  
❌ Оплачивать услуги Timeweb Cloud  

---

**Последнее обновление:** 2025-10-29  
**Версия:** 1.0  

🚀 **Успехов в автоматизации!**
