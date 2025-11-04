# 🚀 ДЕПЛОЙ ЧЕРЕЗ GITHUB ACTIONS

**Я создал GitHub Action для автоматического деплоя!**

---

## ⚡ БЫСТРЫЙ ДЕПЛОЙ (2 клика)

### Шаг 1: Настроить SSH ключ в GitHub Secrets

1. **Создать SSH ключ для сервера:**
   ```bash
   # На вашем компьютере
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/timeweb_kamhub -N ""
   
   # Скопировать публичный ключ
   cat ~/.ssh/timeweb_kamhub.pub
   ```

2. **Добавить публичный ключ на сервер:**
   ```bash
   ssh root@5.129.248.224
   # Пароль: xQvB1pv?yZTjaR
   
   mkdir -p ~/.ssh
   echo "ВАШ_ПУБЛИЧНЫЙ_КЛЮЧ" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   exit
   ```

3. **Добавить приватный ключ в GitHub Secrets:**
   - Открыть: https://github.com/PosPk/kamhub/settings/secrets/actions
   - Нажать "New repository secret"
   - Name: `TIMEWEB_SSH_KEY`
   - Value: (содержимое `~/.ssh/timeweb_kamhub` - ПРИВАТНЫЙ ключ!)
   - Сохранить

### Шаг 2: Запустить GitHub Action

1. Открыть: https://github.com/PosPk/kamhub/actions
2. Выбрать workflow: "Deploy to Timeweb VPS"
3. Нажать "Run workflow"
4. Выбрать ветку: `cursor/deep-repository-scan-05bf` (или `main`)
5. Нажать "Run workflow"

**Готово!** GitHub автоматически задеплоит всё на сервер!

---

## 📊 ЧТО СДЕЛАЕТ ACTION

1. ✅ Подключится к серверу по SSH
2. ✅ Установит Node.js 20
3. ✅ Установит PostgreSQL 15
4. ✅ Создаст базу данных
5. ✅ Склонирует репозиторий
6. ✅ Установит зависимости
7. ✅ Соберет приложение
8. ✅ Применит схему БД
9. ✅ Запустит с PM2
10. ✅ Настроит Nginx

**Время:** 10-15 минут

**Результат:** Сайт на http://5.129.248.224

---

## 🔄 АЛЬТЕРНАТИВА: Деплой БЕЗ SSH ключа

Если не хотите настраивать SSH ключ, используйте простой способ:

### На вашем компьютере (одна команда):

```bash
ssh root@5.129.248.224 'bash -s' < /workspace/scripts/deploy-on-server.sh
# Введите пароль: xQvB1pv?yZTjaR
```

Или скопируйте команды из `QUICK_DEPLOY_COMMANDS.sh` и вставьте в SSH терминал.

---

## ✅ САМЫЙ ПРОСТОЙ СПОСОБ

### 1. Подключитесь к серверу:
```bash
ssh root@5.129.248.224
# Пароль: xQvB1pv?yZTjaR
```

### 2. Скопируйте и вставьте в терминал:

```bash
curl -sSL https://raw.githubusercontent.com/PosPk/kamhub/main/deploy-to-timeweb-production.sh | bash
```

Или вручную:

```bash
# Всё в одной команде
bash << 'EOF'
set -e
cd /root

# Node.js
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# PostgreSQL  
if ! command -v psql &> /dev/null; then
    apt-get install -y postgresql postgresql-contrib
    systemctl enable postgresql && systemctl start postgresql
fi

# БД
sudo -u postgres psql << 'DBEOF'
DROP DATABASE IF EXISTS kamhub_production;
DROP USER IF EXISTS kamhub;
CREATE USER kamhub WITH PASSWORD 'kamhub2024secure';
CREATE DATABASE kamhub_production OWNER kamhub;
GRANT ALL PRIVILEGES ON DATABASE kamhub_production TO kamhub;
DBEOF

# Код
apt-get install -y git
mkdir -p /var/www && cd /var/www
if [ -d "kamhub" ]; then
    cd kamhub && git pull
else
    git clone https://github.com/PosPk/kamhub.git kamhub && cd kamhub
fi

# .env
cat > .env.production << 'ENVEOF'
DATABASE_URL=postgresql://kamhub:kamhub2024secure@localhost:5432/kamhub_production
DATABASE_SSL=false
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=http://5.129.248.224
S3_ENDPOINT=https://s3.twcstorage.ru
S3_BUCKET=d9542536-676ee691-7f59-46bb-bf0e-ab64230eec50
S3_ACCESS_KEY=F2CP4X3X17GVQ1YH5I5D
S3_SECRET_KEY=72iAsYR4QQCIdaDI9e9AzXnzVvvP8bvPELmrBVzX
ENVEOF

# Сборка
npm install && npm run build

# БД схема
export PGPASSWORD='kamhub2024secure'
psql -h localhost -U kamhub -d kamhub_production -f lib/database/schema.sql
psql -h localhost -U kamhub -d kamhub_production -f lib/database/tour_system_schema.sql
psql -h localhost -U kamhub -d kamhub_production -f lib/database/user_roles_migration.sql

# PM2
npm install -g pm2
pm2 delete kamhub 2>/dev/null || true
PORT=3000 pm2 start npm --name kamhub -- start
pm2 save
pm2 startup systemd -u root --hp /root

# Nginx
apt-get install -y nginx
cat > /etc/nginx/sites-available/kamhub << 'NGINXEOF'
server {
    listen 80 default_server;
    server_name 5.129.248.224;
    client_max_body_size 50M;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF
ln -sf /etc/nginx/sites-available/kamhub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "✅ ДЕПЛОЙ ЗАВЕРШЕН!"
echo "🌐 http://5.129.248.224"
pm2 status
EOF
```

**Готово!** Вставьте это в SSH и всё задеплоится автоматически!

---

**Файл создан:** `.github/workflows/deploy-timeweb.yml`
