# 🚀 ДЕПЛОЙ НА TIMEWEB VDS (5.129.248.224)

**IP:** `5.129.248.224`  
**SSH:** `root@5.129.248.224`  
**Пароль:** `xQvB1pv?yZTjaR` (хранится в GitHub Secrets)

---

## 📋 БЫСТРЫЙ СТАРТ

### Вариант 1: Автоматический деплой через GitHub Actions

1. **Настройте GitHub Secrets:**
   ```
   https://github.com/ВАШ_USERNAME/kamhub/settings/secrets/actions
   ```
   
   Добавьте:
   - `TIMEWEB_SSH_HOST` = `5.129.248.224`
   - `TIMEWEB_SSH_USER` = `root`
   - `TIMEWEB_SSH_PASSWORD` = `xQvB1pv?yZTjaR`
   - `TIMEWEB_SSH_PORT` = `22` (опционально)

2. **Сделайте push в main:**
   ```bash
   git push origin main
   ```
   
   GitHub Actions автоматически задеплоит! ✅

---

### Вариант 2: Ручной деплой через SSH

```bash
# 1. Подключитесь к серверу
ssh root@5.129.248.224

# 2. Установите необходимые инструменты (если нужно)
apt-get update
apt-get install -y nodejs npm git postgresql-client
npm install -g pm2

# 3. Клонируйте/обновите репозиторий
cd /var/www
git clone https://github.com/ВАШ_USERNAME/kamhub.git
cd kamhub

# 4. Установите зависимости
npm install

# 5. Настройте переменные окружения
nano .env
# Добавьте:
# DATABASE_URL=postgresql://...
# JWT_SECRET=...
# И т.д.

# 6. Соберите приложение
npm run build

# 7. Примените миграции
npm run migrate:up

# 8. Запустите через PM2
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔐 НАСТРОЙКА GITHUB SECRETS

### Шаг 1: Откройте настройки репозитория:
```
https://github.com/ВАШ_USERNAME/kamhub/settings/secrets/actions
```

### Шаг 2: Добавьте секреты:

| Имя секрета | Значение | Описание |
|-------------|----------|----------|
| `TIMEWEB_SSH_HOST` | `5.129.248.224` | IP адрес сервера |
| `TIMEWEB_SSH_USER` | `root` | SSH пользователь |
| `TIMEWEB_SSH_PASSWORD` | `xQvB1pv?yZTjaR` | SSH пароль |
| `TIMEWEB_SSH_PORT` | `22` | SSH порт (опционально) |

### Шаг 3: Проверьте workflow файл

Убедитесь, что `.github/workflows/timeweb-ssh-deploy.yml` существует и правильно настроен.

---

## 📦 ЛОКАЛЬНЫЙ ДЕПЛОЙ СКРИПТ

Используйте готовый скрипт:

```bash
# Установите переменные окружения
export TIMEWEB_SSH_HOST=5.129.248.224
export TIMEWEB_SSH_USER=root
export TIMEWEB_SSH_PASSWORD=xQvB1pv?yZTjaR

# Запустите скрипт
chmod +x scripts/deploy-timeweb-vds.sh
./scripts/deploy-timeweb-vds.sh
```

---

## ⚙️ НАСТРОЙКА СЕРВЕРА

### 1. Установка Node.js и npm

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

### 2. Установка PM2

```bash
npm install -g pm2
pm2 startup  # Создаст systemd сервис
```

### 3. Настройка Nginx (если нужен reverse proxy)

```nginx
server {
    listen 80;
    server_name kamchatour.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Настройка PostgreSQL

Если БД на том же сервере:
```bash
apt-get install -y postgresql postgresql-contrib
sudo -u postgres createdb kamchatour
sudo -u postgres createuser kamhub_user
```

---

## 🔒 БЕЗОПАСНОСТЬ

### Рекомендации:

1. **Измените SSH пароль:**
   ```bash
   passwd
   ```

2. **Настройте SSH ключи (вместо пароля):**
   ```bash
   # На вашем компьютере
   ssh-copy-id root@5.129.248.224
   
   # Затем в /etc/ssh/sshd_config:
   PasswordAuthentication no
   ```

3. **Настройте firewall:**
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

4. **Обновите систему:**
   ```bash
   apt-get update && apt-get upgrade -y
   ```

---

## 🗄️ НАСТРОЙКА БАЗЫ ДАННЫХ

### Вариант 1: Локальный PostgreSQL

```bash
# Установка
apt-get install -y postgresql postgresql-contrib

# Создание БД
sudo -u postgres psql << EOF
CREATE DATABASE kamchatour;
CREATE USER kamhub_user WITH PASSWORD 'ваш_пароль';
GRANT ALL PRIVILEGES ON DATABASE kamchatour TO kamhub_user;
\q
EOF

# Применение расширений
sudo -u postgres psql -d kamchatour << EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
\q
EOF

# DATABASE_URL для .env:
# postgresql://kamhub_user:ваш_пароль@localhost:5432/kamchatour
```

### Вариант 2: Удаленный PostgreSQL (Timeweb Managed)

Используйте `DATABASE_URL` из панели Timeweb Cloud.

---

## 🚀 ПРОЦЕСС ДЕПЛОЯ

### Автоматический (через GitHub Actions):

1. ✅ Push в репозиторий
2. GitHub Actions запускается
3. Код клонируется/обновляется
4. Устанавливаются зависимости
5. Приложение собирается
6. Применяются миграции
7. PM2 перезапускает приложение

### Вручную:

```bash
# На сервере
cd /var/www/kamhub
git pull origin main
npm install
npm run build
npm run migrate:up
pm2 restart kamhub
```

---

## 📊 МОНИТОРИНГ

### PM2 команды:

```bash
pm2 list           # Список процессов
pm2 logs kamhub    # Логи приложения
pm2 restart kamhub # Перезапуск
pm2 stop kamhub    # Остановка
pm2 delete kamhub  # Удаление из PM2
```

### Проверка работы:

```bash
# Проверка порта
netstat -tlnp | grep 3000

# Проверка логов
tail -f /var/log/kamhub.log
# или
pm2 logs kamhub

# Проверка статуса
curl http://localhost:3000/api/health
```

---

## 🐛 РЕШЕНИЕ ПРОБЛЕМ

### Приложение не запускается:

1. Проверьте логи:
   ```bash
   pm2 logs kamhub
   ```

2. Проверьте переменные окружения:
   ```bash
   cat .env
   ```

3. Проверьте порт:
   ```bash
   lsof -i :3000
   ```

### База данных не подключается:

1. Проверьте DATABASE_URL
2. Проверьте доступность PostgreSQL:
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

### GitHub Actions не работает:

1. Проверьте секреты в GitHub
2. Проверьте логи Actions:
   ```
   https://github.com/ВАШ_USERNAME/kamhub/actions
   ```

---

## ✅ ЧЕКЛИСТ ДЕПЛОЯ

- [ ] GitHub Secrets настроены
- [ ] Workflow файл создан
- [ ] Сервер настроен (Node.js, PM2)
- [ ] База данных создана и доступна
- [ ] Переменные окружения настроены
- [ ] Приложение собрано
- [ ] Миграции применены
- [ ] Приложение запущено через PM2
- [ ] Порты открыты (80, 443, 3000)
- [ ] Проверен доступ к приложению

---

## 🎉 ГОТОВО!

После выполнения всех шагов приложение будет доступно по адресу:
```
http://5.129.248.224
```
или через домен (если настроен):
```
https://kamchatour.ru
```

**Автоматический деплой:** Просто делайте `git push` и GitHub Actions задеплоит автоматически! 🚀
