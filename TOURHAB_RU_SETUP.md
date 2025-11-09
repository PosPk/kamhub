# 🌐 НАСТРОЙКА ДОМЕНА tourhab.ru

## ✅ ГОТОВО К ПОДКЛЮЧЕНИЮ!

Ваш домен **tourhab.ru** готов к настройке на сервере **5.129.248.224**.

---

## 🚀 БЫСТРАЯ НАСТРОЙКА (АВТОМАТИЧЕСКИ)

### Одна команда:
```bash
bash scripts/setup-domain-tourhab.sh
```

**Скрипт автоматически:**
- ✅ Создаст конфигурацию Nginx
- ✅ Загрузит на сервер
- ✅ Настроит редиректы (www → основной домен)
- ✅ Установит SSL сертификат (Let's Encrypt)
- ✅ Настроит HTTPS и автообновление сертификата

**Время:** ~10 минут (включая ожидание DNS)

---

## 📋 ЧТО НУЖНО СДЕЛАТЬ ПЕРЕД ЗАПУСКОМ

### 1. DNS настройки в Timeweb

Откройте: https://timeweb.cloud/my/domains

#### Если домен уже в Timeweb:

1. Найдите `tourhab.ru` в списке
2. Нажмите "Управление DNS"
3. Добавьте/обновите A-записи:

```
Тип: A
Имя: @
Значение: 5.129.248.224
TTL: 3600

Тип: A
Имя: www
Значение: 5.129.248.224
TTL: 3600
```

#### Если домена НЕТ в Timeweb:

1. Нажмите "Добавить домен"
2. Введите: `tourhab.ru`
3. Добавьте A-записи как выше

⏰ **Важно:** DNS обновляется 5-30 минут

---

## 🔧 РУЧНАЯ НАСТРОЙКА (если нужна)

### Шаг 1: Подключитесь к серверу

```bash
ssh root@5.129.248.224
# Пароль: xQvB1pv?yZTjaR
```

### Шаг 2: Установите Nginx (если еще нет)

```bash
apt-get update
apt-get install -y nginx
```

### Шаг 3: Создайте конфиг для tourhab.ru

```bash
nano /etc/nginx/sites-available/tourhab.conf
```

Вставьте:

```nginx
# Редирект с www на без www
server {
    listen 80;
    listen [::]:80;
    server_name www.tourhab.ru;
    return 301 http://tourhab.ru$request_uri;
}

# Основной сервер
server {
    listen 80;
    listen [::]:80;
    server_name tourhab.ru;

    # Логи
    access_log /var/log/nginx/tourhab-access.log;
    error_log /var/log/nginx/tourhab-error.log;

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Прокси к Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статика Next.js
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### Шаг 4: Активируйте конфиг

```bash
ln -sf /etc/nginx/sites-available/tourhab.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### Шаг 5: Установите SSL (Let's Encrypt)

⏰ **Подождите 5-10 минут после настройки DNS!**

Проверьте DNS:
```bash
dig tourhab.ru +short
# Должен вернуть: 5.129.248.224
```

Установите certbot и получите сертификат:

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d tourhab.ru -d www.tourhab.ru
```

Certbot автоматически:
- Получит SSL сертификат
- Настроит HTTPS в Nginx
- Настроит редирект с HTTP на HTTPS
- Настроит автообновление (каждые 60 дней)

---

## 🎯 ПРОВЕРКА ПОСЛЕ НАСТРОЙКИ

### 1. Проверьте HTTP (должен редиректить на HTTPS):
```bash
curl -I http://tourhab.ru
```

Ожидается:
```
HTTP/1.1 301 Moved Permanently
Location: https://tourhab.ru/
```

### 2. Проверьте HTTPS:
```bash
curl -I https://tourhab.ru
```

Ожидается:
```
HTTP/2 200
```

### 3. Проверьте www редирект:
```bash
curl -I https://www.tourhab.ru
```

Ожидается:
```
HTTP/1.1 301 Moved Permanently
Location: https://tourhab.ru/
```

### 4. Откройте в браузере:

```
https://tourhab.ru
```

Вы должны увидеть вашу главную страницу в стиле Samsung Weather! 🎨

---

## 🔄 ОБНОВЛЕНИЕ ENV ДЛЯ ДОМЕНА

Обновите `.env.production` на сервере:

```bash
ssh root@5.129.248.224

cd /var/www/kamhub

nano .env.production
```

Обновите:
```env
NEXT_PUBLIC_APP_URL=https://tourhab.ru
CORS_ORIGIN=https://tourhab.ru,https://www.tourhab.ru
```

Перезапустите:
```bash
pm2 restart kamhub
```

---

## 📊 МОНИТОРИНГ И УПРАВЛЕНИЕ

### Статус Nginx:
```bash
systemctl status nginx
```

### Логи Nginx:
```bash
tail -f /var/log/nginx/tourhab-access.log
tail -f /var/log/nginx/tourhab-error.log
```

### Проверка SSL сертификата:
```bash
certbot certificates
```

### Тест автообновления SSL:
```bash
certbot renew --dry-run
```

### Принудительное обновление SSL:
```bash
certbot renew
systemctl reload nginx
```

### Статус приложения:
```bash
pm2 list
pm2 logs kamhub
```

---

## 🆘 TROUBLESHOOTING

### DNS не обновляется

**Проверка:**
```bash
dig tourhab.ru +short
nslookup tourhab.ru
```

**Решение:**
- Подождите 10-30 минут
- Проверьте настройки в Timeweb
- Очистите DNS кэш: `sudo systemd-resolve --flush-caches`

### Nginx не стартует

**Проверка:**
```bash
nginx -t
journalctl -xe -u nginx
```

**Решение:**
```bash
# Проверьте конфиг
nginx -t

# Посмотрите детальные ошибки
systemctl status nginx -l
```

### SSL сертификат не создается

**Проверка:**
```bash
certbot --version
dig tourhab.ru +short
curl -I http://tourhab.ru
```

**Решение:**
- Убедитесь что DNS обновился (показывает правильный IP)
- Убедитесь что порт 80 доступен: `telnet tourhab.ru 80`
- Попробуйте снова: `certbot --nginx -d tourhab.ru -d www.tourhab.ru`

### Сайт не открывается после настройки

**Проверка:**
```bash
pm2 list              # Приложение должно быть online
systemctl status nginx # Nginx должен быть active
curl http://localhost:3000  # Next.js должен отвечать
```

**Решение:**
```bash
# Перезапустите все сервисы
pm2 restart kamhub
systemctl restart nginx

# Проверьте логи
pm2 logs kamhub --lines 50
tail -50 /var/log/nginx/tourhab-error.log
```

---

## 📱 ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ

### Добавить поддомен (например, api.tourhab.ru)

1. В Timeweb DNS добавьте A-запись:
```
Тип: A
Имя: api
Значение: 5.129.248.224
TTL: 3600
```

2. На сервере создайте новый конфиг:
```bash
nano /etc/nginx/sites-available/api-tourhab.conf
```

3. Получите SSL для поддомена:
```bash
certbot --nginx -d api.tourhab.ru
```

### Настроить CDN (опционально)

Если хотите использовать CDN (например, Cloudflare):

1. Зарегистрируйтесь в Cloudflare
2. Добавьте домен tourhab.ru
3. Обновите NS-записи в Timeweb на NS от Cloudflare
4. В Cloudflare настройте прокси (оранжевое облачко)

**Преимущества:**
- Защита от DDoS
- Глобальный кэш
- Бесплатный SSL
- Сжатие и оптимизация

---

## ✅ ЧЕКЛИСТ ФИНАЛЬНОЙ НАСТРОЙКИ

```
DNS:
✅ A-запись для @ → 5.129.248.224
✅ A-запись для www → 5.129.248.224
✅ DNS обновился (проверено через dig)

NGINX:
✅ Конфиг создан (/etc/nginx/sites-available/tourhab.conf)
✅ Конфиг активирован (симлинк в sites-enabled)
✅ Тест конфига пройден (nginx -t)
✅ Nginx перезапущен

SSL:
✅ Certbot установлен
✅ Сертификат получен для tourhab.ru и www.tourhab.ru
✅ HTTPS работает
✅ Автообновление настроено

ПРИЛОЖЕНИЕ:
✅ Next.js запущен на порту 3000
✅ PM2 показывает статус "online"
✅ .env.production обновлен с новым доменом

ПРОВЕРКА:
✅ http://tourhab.ru → редиректит на https
✅ https://tourhab.ru → открывается сайт
✅ https://www.tourhab.ru → редиректит на https://tourhab.ru
✅ SSL сертификат валиден (без предупреждений)
```

---

## 🎉 ГОТОВО!

После выполнения всех шагов ваш сайт будет доступен по адресу:

### 🌐 https://tourhab.ru

Красивая главная страница в стиле Samsung Weather! ☀️🎨

---

## 📞 ПОДДЕРЖКА

Если возникли проблемы:

1. Проверьте логи: `pm2 logs kamhub`
2. Проверьте Nginx: `nginx -t && systemctl status nginx`
3. Проверьте DNS: `dig tourhab.ru +short`
4. Проверьте SSL: `certbot certificates`

**Удачи с деплоем!** 🚀
