# ⚡ БЫСТРЫЙ СТАРТ НА TIMEWEB CLOUD

> **От заказа VDS до работающего приложения за 15 минут**

---

## 🎯 ПЛАН ДЕЙСТВИЙ

1. Заказать VDS на Timeweb Cloud (5 минут)
2. Подключиться по SSH (1 минута)
3. Запустить автоматический деплой (5-10 минут)
4. Настроить домен и SSL (опционально, 5 минут)

**Итого: 15-20 минут = готовое приложение!**

---

## 📦 ШАГ 1: ЗАКАЗАТЬ VDS

### Перейти на Timeweb Cloud:

https://timeweb.cloud/vds

### Выбрать тариф:

**Рекомендуется:**
```
VDS-4
- 4 vCPU
- 4 GB RAM
- 40 GB SSD
- ~600₽/мес
```

**Минимум:**
```
VDS-2
- 2 vCPU  
- 2 GB RAM
- 20 GB SSD
- ~300₽/мес
```

### Настройки при заказе:

- **ОС:** Ubuntu 22.04 LTS (рекомендуется)
- **SSH ключ:** Добавить ваш публичный ключ (или использовать пароль)
- **Локация:** Любая (Москва, Санкт-Петербург)

**→ Оформить заказ**

### После создания:

Вы получите:
- **IP адрес** сервера
- **Пароль root** (или используйте SSH ключ)
- **Доступ по SSH**

---

## 🔌 ШАГ 2: ПОДКЛЮЧИТЬСЯ ПО SSH

### Windows (PowerShell/CMD):

```powershell
ssh root@ваш-ip-адрес
```

### Linux/macOS:

```bash
ssh root@ваш-ip-адрес
```

При первом подключении введите пароль (или используйте SSH ключ).

---

## 🚀 ШАГ 3: АВТОМАТИЧЕСКИЙ ДЕПЛОЙ

### Один раз выполнить:

```bash
# 1. Клонировать репозиторий
git clone https://github.com/ваш-username/kamchatour-hub.git
cd kamchatour-hub

# 2. Запустить автодеплой
chmod +x deploy-timeweb.sh
./deploy-timeweb.sh
```

**Скрипт автоматически:**
- ✅ Обновит Ubuntu
- ✅ Установит Node.js 20
- ✅ Установит PostgreSQL
- ✅ Создаст базу данных
- ✅ Установит Nginx
- ✅ Установит PM2
- ✅ Соберет приложение
- ✅ Применит миграции
- ✅ Настроит автозапуск
- ✅ Настроит firewall
- ✅ Настроит backup каждые 6 часов

### Что нужно сделать вручную:

**НИЧЕГО!** Скрипт всё сделает сам.

### После завершения:

```
============================================
✅ ДЕПЛОЙ ЗАВЕРШЕН!
============================================

📊 Информация о сервере:
  IP адрес:     123.45.67.89
  База данных:  kamchatour
  DB User:      kamuser
  DB Password:  aBc123XyZ456  ← СОХРАНИТЕ!

🌐 Приложение доступно:
  http://123.45.67.89

📝 Полезные команды:
  pm2 status              - статус
  pm2 logs kamchatour-hub - логи
  pm2 restart kamchatour-hub - перезапуск
```

**→ Приложение работает! Открыть в браузере:** `http://ваш-ip`

---

## 🌐 ШАГ 4: НАСТРОИТЬ ДОМЕН (Опционально)

### В панели Timeweb Cloud:

1. **Домены → Добавить домен**
   - Купить новый или привязать существующий
   
2. **DNS настройки:**
   ```
   Тип: A
   Имя: @
   Значение: ваш-ip-адрес
   TTL: 3600
   
   Тип: A
   Имя: www
   Значение: ваш-ip-адрес
   TTL: 3600
   ```

3. **Подождать 5-30 минут** (пока DNS обновятся)

### На сервере:

```bash
# Обновить Nginx конфигурацию
sudo nano /etc/nginx/sites-available/kamchatour

# Изменить строку:
server_name ваш-домен.ru www.ваш-домен.ru;

# Проверить и перезапустить
sudo nginx -t
sudo systemctl reload nginx
```

### Обновить .env:

```bash
cd /var/www/kamchatour
nano .env

# Изменить:
NEXT_PUBLIC_APP_URL=http://ваш-домен.ru

# Перезапустить приложение
pm2 restart kamchatour-hub
```

**→ Приложение доступно по домену!**

---

## 🔒 ШАГ 5: УСТАНОВИТЬ SSL (Опционально, но рекомендуется)

### Автоматически через Certbot:

```bash
# Установить Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получить сертификат (автоматически настроит Nginx)
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

**Ответьте на вопросы:**
- Email: ваш@email.com
- Agree to Terms: Yes
- Share email: No/Yes (по желанию)
- Redirect HTTP to HTTPS: Yes (рекомендуется)

### Проверка:

```bash
# Тест автопродления
sudo certbot renew --dry-run
```

**→ Приложение доступно по HTTPS!**

`https://ваш-домен.ru`

---

## ✅ ГОТОВО!

### Что у вас теперь есть:

```
✅ VDS/VPS на Timeweb Cloud
✅ Ubuntu 22.04 LTS
✅ Node.js 20
✅ PostgreSQL с базой данных
✅ Next.js приложение (собрано и запущено)
✅ Nginx reverse proxy
✅ PM2 процесс-менеджер (автозапуск)
✅ Firewall (UFW)
✅ Автоматические backup каждые 6 часов
✅ Домен (если настроили)
✅ SSL сертификат (если настроили)
```

### Приложение доступно:

- **HTTP:** `http://ваш-ip` или `http://ваш-домен.ru`
- **HTTPS:** `https://ваш-домен.ru` (если SSL настроен)

---

## 📝 ПОЛЕЗНЫЕ КОМАНДЫ

### Статус приложения:

```bash
pm2 status
```

### Логи:

```bash
# Логи приложения
pm2 logs kamchatour-hub

# Логи Nginx
sudo tail -f /var/log/nginx/kamchatour_access.log
sudo tail -f /var/log/nginx/kamchatour_error.log
```

### Перезапуск:

```bash
# Перезапустить приложение
pm2 restart kamchatour-hub

# Перезапустить Nginx
sudo systemctl restart nginx

# Перезапустить PostgreSQL
sudo systemctl restart postgresql
```

### Обновление приложения:

```bash
cd /var/www/kamchatour
git pull
npm install
npm run build
npm run migrate:up
pm2 restart kamchatour-hub
```

### Мониторинг:

```bash
# Ресурсы системы
htop

# Мониторинг PM2
pm2 monit

# Использование диска
df -h
```

---

## 🆘 ПРОБЛЕМЫ?

### Приложение не открывается:

```bash
# Проверить статус
pm2 status

# Проверить логи
pm2 logs kamchatour-hub

# Перезапустить
pm2 restart kamchatour-hub
```

### Nginx 502 Bad Gateway:

```bash
# Проверить что приложение запущено
pm2 status

# Проверить порт
curl http://localhost:3002

# Перезапустить Nginx
sudo systemctl restart nginx
```

### База данных не подключается:

```bash
# Проверить PostgreSQL
sudo systemctl status postgresql

# Проверить подключение
psql -h localhost -U kamuser -d kamchatour

# Проверить .env
cat /var/www/kamchatour/.env | grep DATABASE_URL
```

### См. полную документацию:

📚 **TIMEWEB_ДЕПЛОЙ.md** - полное руководство с решением всех проблем

---

## 💰 СТОИМОСТЬ

### Минимальная конфигурация:

```
VDS-2 (2 CPU, 2GB RAM):     ~300₽/мес
Домен .ru:                  ~200₽/год
SSL (Let's Encrypt):        БЕСПЛАТНО
-------------------------------------------
ИТОГО:                      ~320₽/мес
```

### Рекомендуемая конфигурация:

```
VDS-4 (4 CPU, 4GB RAM):     ~600₽/мес
Домен .ru:                  ~200₽/год
SSL (Let's Encrypt):        БЕСПЛАТНО
-------------------------------------------
ИТОГО:                      ~620₽/мес
```

**Промокоды Timeweb:** часто бывают скидки 10-20%

---

## 🎉 ВСЁ ГОТОВО!

**Теперь у вас есть полностью рабочее production приложение на Timeweb Cloud!**

### Следующие шаги:

1. ✅ Добавить API ключи в `.env` (Groq, CloudPayments и т.д.)
2. ✅ Создать тестовые данные
3. ✅ Настроить мониторинг (Sentry)
4. ✅ Протестировать все функции
5. ✅ Запустить для пользователей!

---

## 📞 ПОДДЕРЖКА

**Timeweb Cloud:**
- Сайт: https://timeweb.cloud/
- Email: support@timeweb.ru
- Telegram: @timeweb_bot

**Документация проекта:**
- `TIMEWEB_ДЕПЛОЙ.md` - полное руководство
- `ГОТОВО_ДЕПЛОЙ.md` - общие инструкции
- `START_HERE.md` - обзор проекта

---

**Удачи с запуском! 🚀**

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025
