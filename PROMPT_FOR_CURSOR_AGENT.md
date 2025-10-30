# 🚀 ПРОМПТ ДЛЯ CURSOR AGENT: ФИНАЛЬНЫЙ ДЕПЛОЙ KAMHUB

**Дата:** 30 октября 2025  
**Цель:** Подготовить проект к production деплою и развернуть на Timeweb VDS

---

## 📋 КОНТЕКСТ

Проект KamHub - экосистема туризма Камчатки с премиум дизайном (Black & Gold).

**Текущее состояние:**
- ✅ Next.js 14 приложение собирается успешно
- ✅ Дизайн главной страницы полностью реализован
- ✅ API endpoints созданы
- ✅ База данных спроектирована
- ⚠️ Есть 10 ESLint warnings (не критично)
- ❌ Отсутствует файл `/public/graphics/kamchatka-button.svg`
- ❌ Не настроены environment variables

**VDS информация:**
- IP: `5.129.248.224`
- Доступ: SSH root (пароль предоставлен)
- Скрипт установки: `https://s3.timeweb.cloud/d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50/install.sh`

---

## 🎯 ЗАДАЧИ (ВЫПОЛНИТЬ ПОСЛЕДОВАТЕЛЬНО)

---

## **ЗАДАЧА 1: Создать недостающие графические ресурсы**

### **1.1. Создать SVG карту Камчатки**

**Путь:** `/workspace/public/graphics/kamchatka-button.svg`

**Требования:**
- Стилизованный контур полуострова Камчатка
- Золотой цвет (`#E6C149`)
- Минималистичный дизайн
- Размер ~200x400px (вертикальный)

**SVG код:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" fill="none">
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E6C149;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D4AF37;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Контур Камчатки (упрощённый) -->
  <path 
    d="M 100 20 
       L 110 30 L 115 45 L 120 60 L 125 80 L 130 100 
       L 135 120 L 140 145 L 145 170 L 150 200 
       L 155 230 L 160 260 L 165 290 L 170 320 
       L 165 350 L 155 370 L 145 385 L 135 395 
       L 120 390 L 105 380 L 90 365 L 80 345 
       L 75 320 L 70 290 L 65 260 L 60 230 
       L 55 200 L 50 170 L 45 145 L 40 120 
       L 35 100 L 30 80 L 25 60 L 30 45 
       L 40 35 L 55 28 L 75 23 L 90 20 Z"
    fill="url(#goldGradient)"
    stroke="#E6C149"
    stroke-width="2"
    opacity="0.9"
  />
  
  <!-- Вулканы (точки) -->
  <circle cx="100" cy="100" r="4" fill="#FFD700" />
  <circle cx="120" cy="150" r="4" fill="#FFD700" />
  <circle cx="90" cy="200" r="4" fill="#FFD700" />
  <circle cx="110" cy="250" r="4" fill="#FFD700" />
  
  <!-- Свечение -->
  <ellipse 
    cx="100" 
    cy="200" 
    rx="80" 
    ry="150" 
    fill="url(#goldGradient)" 
    opacity="0.1"
  />
</svg>
```

**Команда:**
```bash
mkdir -p /workspace/public/graphics
cat > /workspace/public/graphics/kamchatka-button.svg << 'EOF'
[вставить SVG код выше]
EOF
```

---

### **1.2. Создать Favicon (опционально)**

**Путь:** `/workspace/public/favicon.ico`

**Вариант 1:** Конвертировать SVG в ICO онлайн (https://convertio.co/svg-ico/)

**Вариант 2:** Использовать emoji:
```bash
# Создать простой favicon из текста
echo "🏔️" > /workspace/public/favicon.txt
```

---

## **ЗАДАЧА 2: Исправить ESLint warnings (опционально)**

**Warnings:**
1. `Using <img>` → Заменить на `<Image />` from `next/image`
2. `Missing dependencies` → Добавить зависимости в `useEffect`

### **2.1. Исправить `<img>` в app/page.tsx**

**Файл:** `/workspace/app/page.tsx`

**Строка 252:**
```tsx
// Старое
<img src="/graphics/kamchatka-button.svg" alt="Камчатка" className="kamchatka-button w-full h-auto" />

// Новое
import Image from 'next/image'
// ...
<Image 
  src="/graphics/kamchatka-button.svg" 
  alt="Камчатка" 
  width={200} 
  height={400}
  className="kamchatka-button w-full h-auto"
  priority
/>
```

### **2.2. Исправить useEffect warnings**

**Для всех компонентов с warnings:**

**Опция A (быстрая):** Добавить `eslint-disable-next-line` перед useEffect:
```tsx
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  fetchData();
}, []);
```

**Опция B (правильная):** Обернуть функции в `useCallback`:
```tsx
const fetchData = useCallback(async () => {
  // ...
}, [deps]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

**Решение:** Используй **Опцию A** (быстро) или оставь warnings (они не критичны для production).

---

## **ЗАДАЧА 3: Настроить Environment Variables**

### **3.1. Создать .env.production**

**Путь:** `/workspace/.env.production`

**Содержимое:**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kamhub
POSTGRES_USER=kamhub_user
POSTGRES_PASSWORD=СГЕНЕРИРОВАТЬ_СИЛЬНЫЙ_ПАРОЛЬ
POSTGRES_DB=kamhub

# Next.js
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://5.129.248.224:3002

# External APIs
YANDEX_MAPS_API_KEY=ваш_ключ_яндекс_карт
WEATHER_API_KEY=ваш_ключ_погоды

# Notifications (опционально)
SMS_RU_API_KEY=ваш_ключ_sms_ru
TELEGRAM_BOT_TOKEN=ваш_токен_telegram_бота
AWS_SES_ACCESS_KEY_ID=ваш_aws_key
AWS_SES_SECRET_ACCESS_KEY=ваш_aws_secret

# AI (опционально)
GROQ_API_KEY=ваш_groq_api_ключ
DEEPSEEK_API_KEY=ваш_deepseek_api_ключ

# Payments (будущее)
CLOUDPAYMENTS_PUBLIC_ID=ваш_cloudpayments_id
CLOUDPAYMENTS_API_SECRET=ваш_cloudpayments_secret
```

### **3.2. Обновить .gitignore**

**Проверить, что .env.production в .gitignore:**
```bash
echo ".env.production" >> /workspace/.gitignore
```

---

## **ЗАДАЧА 4: Подготовить проект к деплою**

### **4.1. Проверить сборку**

```bash
cd /workspace
npm run build
```

**Ожидаемый результат:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (20/20)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.23 kB       92.1 kB
└ ○ /demo                                1.45 kB       88.3 kB
...
```

### **4.2. Закоммитить изменения**

```bash
cd /workspace
git add .
git commit -m "🚀 Production ready: Добавлены графические ресурсы и env конфиг"
git push origin main
```

---

## **ЗАДАЧА 5: Деплой на Timeweb VDS**

### **Метод 1: Использовать готовый скрипт (РЕКОМЕНДУЕТСЯ)**

**Скрипт уже загружен на S3:** `https://s3.timeweb.cloud/d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50/install.sh`

#### **Шаги:**

1. **Подключиться к VDS через веб-консоль Timeweb:**
   - Перейти: https://timeweb.cloud/my/servers
   - Найти сервер `5.129.248.224`
   - Нажать "Консоль" (веб-терминал)

2. **Выполнить команду установки:**
```bash
curl -fsSL https://s3.timeweb.cloud/d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50/install.sh | bash
```

**Что делает скрипт:**
- Устанавливает Node.js 20
- Устанавливает PostgreSQL 15
- Клонирует репозиторий `PosPk/kamhub`
- Устанавливает зависимости (`npm ci`)
- Собирает проект (`npm run build`)
- Настраивает PM2 (автозапуск)
- Настраивает Nginx (reverse proxy)
- Настраивает UFW (firewall)

**Время выполнения:** ~10-15 минут

---

### **Метод 2: Ручная установка (альтернатива)**

#### **5.1. Подключиться к VDS**

**Через SSH клиент:**
```bash
ssh root@5.129.248.224
# Пароль: xQvB1pv?yZTjaR
```

**Через веб-консоль Timeweb:** (проще, если SSH не работает)

---

#### **5.2. Установить Node.js 20**

```bash
# Добавить NodeSource репозиторий
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Установить Node.js
apt-get install -y nodejs

# Проверить версию
node -v  # должно быть v20.x.x
npm -v   # должно быть v10.x.x
```

---

#### **5.3. Установить PostgreSQL 15**

```bash
# Установить PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Запустить сервис
systemctl start postgresql
systemctl enable postgresql

# Создать базу данных и пользователя
sudo -u postgres psql << EOF
CREATE DATABASE kamhub;
CREATE USER kamhub_user WITH ENCRYPTED PASSWORD 'ВАШ_ПАРОЛЬ';
GRANT ALL PRIVILEGES ON DATABASE kamhub TO kamhub_user;
\c kamhub
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
EOF
```

---

#### **5.4. Клонировать репозиторий**

```bash
# Перейти в home
cd /root

# Клонировать репозиторий
git clone https://github.com/PosPk/kamhub.git
cd kamhub

# Переключиться на main ветку
git checkout main
```

---

#### **5.5. Настроить Environment Variables**

```bash
# Создать .env.production
cat > .env.production << EOF
DATABASE_URL=postgresql://kamhub_user:ВАШ_ПАРОЛЬ@localhost:5432/kamhub
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://5.129.248.224:3002
EOF

# Установить права
chmod 600 .env.production
```

---

#### **5.6. Установить зависимости и собрать**

```bash
# Установить зависимости
npm ci

# Собрать проект
npm run build

# Проверить сборку
ls -la .next/
```

---

#### **5.7. Запустить миграции БД**

```bash
# Запустить миграции (если есть скрипт)
npm run migrate:up

# Или выполнить SQL вручную
psql -U kamhub_user -d kamhub -f lib/database/schema.sql
psql -U kamhub_user -d kamhub -f lib/database/transfer_schema.sql
psql -U kamhub_user -d kamhub -f lib/database/loyalty_schema.sql
psql -U kamhub_user -d kamhub -f lib/database/transfer_payments_schema.sql
psql -U kamhub_user -d kamhub -f lib/database/operators_schema.sql
```

---

#### **5.8. Установить PM2 (Process Manager)**

```bash
# Установить PM2 глобально
npm install -g pm2

# Запустить приложение
pm2 start npm --name "kamhub" -- start

# Настроить автозапуск
pm2 startup
pm2 save

# Проверить статус
pm2 status
pm2 logs kamhub
```

---

#### **5.9. Установить Nginx (Reverse Proxy)**

```bash
# Установить Nginx
apt-get install -y nginx

# Создать конфигурацию
cat > /etc/nginx/sites-available/kamhub << 'EOF'
server {
    listen 80;
    server_name 5.129.248.224;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Активировать конфигурацию
ln -s /etc/nginx/sites-available/kamhub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверить конфигурацию
nginx -t

# Перезапустить Nginx
systemctl restart nginx
systemctl enable nginx
```

---

#### **5.10. Настроить Firewall (UFW)**

```bash
# Установить UFW (если нет)
apt-get install -y ufw

# Разрешить SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Включить firewall
ufw --force enable

# Проверить статус
ufw status
```

---

#### **5.11. Проверить работу**

```bash
# Проверить, что приложение запущено
pm2 status

# Проверить логи
pm2 logs kamhub --lines 50

# Проверить через curl
curl http://localhost:3002
curl http://5.129.248.224
```

**Ожидаемый результат:**
- PM2 показывает статус `online`
- `curl http://localhost:3002` возвращает HTML главной страницы
- `curl http://5.129.248.224` возвращает HTML главной страницы

---

## **ЗАДАЧА 6: Настроить домен (опционально)**

Если у вас есть домен (например, `kamhub.ru`):

### **6.1. Добавить DNS запись**

**В панели регистратора домена:**
- Тип: `A`
- Имя: `@` (или `www`)
- Значение: `5.129.248.224`
- TTL: `3600`

### **6.2. Обновить Nginx конфигурацию**

```bash
# Отредактировать конфигурацию
nano /etc/nginx/sites-available/kamhub

# Изменить server_name
server_name kamhub.ru www.kamhub.ru;

# Перезапустить Nginx
systemctl restart nginx
```

### **6.3. Установить SSL сертификат (Let's Encrypt)**

```bash
# Установить Certbot
apt-get install -y certbot python3-certbot-nginx

# Получить сертификат
certbot --nginx -d kamhub.ru -d www.kamhub.ru

# Проверить автообновление
certbot renew --dry-run
```

---

## **ЗАДАЧА 7: Мониторинг и обслуживание**

### **7.1. Проверка статуса**

```bash
# Статус приложения
pm2 status

# Логи приложения
pm2 logs kamhub

# Статус PostgreSQL
systemctl status postgresql

# Статус Nginx
systemctl status nginx

# Использование ресурсов
pm2 monit
```

### **7.2. Обновление приложения**

```bash
# Подключиться к VDS
ssh root@5.129.248.224

# Перейти в папку проекта
cd /root/kamhub

# Остановить приложение
pm2 stop kamhub

# Получить обновления
git pull origin main

# Установить новые зависимости
npm ci

# Пересобрать
npm run build

# Запустить миграции (если есть)
npm run migrate:up

# Запустить приложение
pm2 start kamhub

# Проверить логи
pm2 logs kamhub
```

### **7.3. Резервное копирование БД**

```bash
# Создать backup
pg_dump -U kamhub_user kamhub > /root/backups/kamhub_$(date +%Y%m%d).sql

# Настроить cron для автоматических backups
crontab -e
# Добавить строку:
# 0 2 * * * pg_dump -U kamhub_user kamhub > /root/backups/kamhub_$(date +\%Y\%m\%d).sql
```

---

## **ЗАДАЧА 8: Тестирование после деплоя**

### **8.1. Функциональное тестирование**

**Проверить в браузере:**

1. **Главная страница:** `http://5.129.248.224`
   - ✅ Hero видео загружается
   - ✅ Aurora анимация работает
   - ✅ Карта Камчатки отображается
   - ✅ Карточки туров загружаются
   - ✅ Виджеты (погода, eco-points) работают

2. **Навигация:**
   - ✅ Переход в `/hub/tourist`
   - ✅ Переход в `/hub/operator`
   - ✅ Переход в `/demo`
   - ✅ Переход в `/auth/login`

3. **API Endpoints:**
   - ✅ `/api/tours` возвращает данные
   - ✅ `/api/weather` возвращает погоду
   - ✅ `/api/eco-points` возвращает точки

**Команды для тестирования API:**
```bash
# Туры
curl http://5.129.248.224/api/tours

# Погода
curl "http://5.129.248.224/api/weather?lat=53.0195&lng=158.6505"

# Eco-points
curl "http://5.129.248.224/api/eco-points?limit=10"
```

### **8.2. Performance тестирование**

**Использовать Google Lighthouse:**
1. Открыть `http://5.129.248.224` в Chrome
2. F12 → Lighthouse → Analyze page load
3. Проверить метрики:
   - Performance: >80
   - Accessibility: >90
   - Best Practices: >90
   - SEO: >90

### **8.3. Мобильное тестирование**

**Проверить на разных устройствах:**
- iPhone (Safari)
- Android (Chrome)
- Планшет (iPad)

**Responsive breakpoints:**
- 375px (iPhone SE)
- 640px (SM)
- 768px (MD)
- 1024px (LG)

---

## 📊 ЧЕКЛИСТ ГОТОВНОСТИ К PRODUCTION

### **Перед деплоем:**
- [ ] SVG карта Камчатки создана (`/public/graphics/kamchatka-button.svg`)
- [ ] `.env.production` настроен
- [ ] `npm run build` успешно выполнен
- [ ] Все изменения закоммичены в Git
- [ ] Репозиторий на GitHub обновлён

### **После деплоя:**
- [ ] VDS доступен по SSH
- [ ] Node.js 20 установлен
- [ ] PostgreSQL 15 установлен и настроен
- [ ] База данных создана и мигрирована
- [ ] Репозиторий склонирован
- [ ] Зависимости установлены (`npm ci`)
- [ ] Проект собран (`npm run build`)
- [ ] PM2 запущен и работает
- [ ] Nginx настроен и работает
- [ ] Firewall (UFW) настроен
- [ ] Приложение доступно по `http://5.129.248.224`

### **Функциональность:**
- [ ] Главная страница загружается
- [ ] Hero видео работает
- [ ] Aurora анимация работает
- [ ] Карта Камчатки отображается
- [ ] Туры загружаются из API
- [ ] Виджеты (погода, eco-points) работают
- [ ] Навигация между страницами работает

### **Production готовность:**
- [ ] SSL сертификат установлен (если есть домен)
- [ ] Backup БД настроен
- [ ] Мониторинг работает (PM2)
- [ ] Логи доступны

---

## 🎯 ИТОГОВАЯ КОМАНДА ДЛЯ CURSOR AGENT

```
Привет, Cursor Agent! 

Выполни следующие задачи для деплоя KamHub на production:

1. СОЗДАЙ файл /workspace/public/graphics/kamchatka-button.svg с SVG кодом стилизованного контура Камчатки (золотой градиент #E6C149)

2. СОЗДАЙ файл /workspace/.env.production с настройками для production (DATABASE_URL, NODE_ENV=production, NEXT_PUBLIC_API_URL=http://5.129.248.224:3002)

3. ПРОВЕРЬ сборку проекта командой: npm run build

4. ЗАКОММИТЬ изменения: git add . && git commit -m "🚀 Production ready" && git push origin main

5. ВЫПОЛНИ деплой на VDS используя ОДИН из методов:

   МЕТОД 1 (быстрый):
   - Зайди в веб-консоль Timeweb: https://timeweb.cloud/my/servers
   - Выполни: curl -fsSL https://s3.timeweb.cloud/d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50/install.sh | bash

   МЕТОД 2 (ручной):
   - SSH: ssh root@5.129.248.224 (пароль: xQvB1pv?yZTjaR)
   - Установи Node.js 20, PostgreSQL 15
   - Клонируй репозиторий, собери проект
   - Настрой PM2 и Nginx
   - Проверь работу: http://5.129.248.224

6. ПРОТЕСТИРУЙ:
   - Главная страница загружается
   - API endpoints работают (/api/tours, /api/weather)
   - Hero видео и Aurora анимация работают

ВАЖНО: Если встретишь проблемы, проверь логи: pm2 logs kamhub

Начинай с задачи 1!
```

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ

**Документация:**
- Next.js Deployment: https://nextjs.org/docs/deployment
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- Nginx Configuration: https://nginx.org/en/docs/
- PostgreSQL Setup: https://www.postgresql.org/docs/

**Timeweb:**
- Панель управления: https://timeweb.cloud/my/servers
- Документация VDS: https://timeweb.com/ru/help/vds

**Мониторинг:**
- PM2 Web Dashboard: `pm2 web` (запустить на VDS)
- Google Lighthouse: https://pagespeed.web.dev/

---

**ДОКУМЕНТ ГОТОВ К ИСПОЛЬЗОВАНИЮ!** 🚀  
**Следуй задачам последовательно для успешного деплоя!** ✅
