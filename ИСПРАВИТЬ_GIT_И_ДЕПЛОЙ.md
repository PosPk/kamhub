# 🔧 ИСПРАВЛЕНИЕ GIT И ДЕПЛОЙ

> **Проблема:** Файл `core` (4.3GB) блокирует push в GitHub  
> **Решение:** Очистить историю или деплой напрямую на Timeweb VDS

---

## ⚡ ВАРИАНТ 1: ДЕПЛОЙ НАПРЯМУЮ НА TIMEWEB VDS (БЕЗ GITHUB)

### Самый быстрый способ - минуя GitHub:

```bash
# 1. Заказать VDS на Timeweb Cloud
# https://timeweb.cloud/vds
# Тариф: VDS-4 (4CPU, 4GB RAM) ~600₽/мес

# 2. Подключиться по SSH
ssh root@ваш-timeweb-ip

# 3. Клонировать репозиторий ЛОКАЛЬНО
cd /root
# Скопируйте весь проект на VDS через SCP/SFTP
# Или используйте git clone если уже есть в другом месте

# 4. Запустить автоматический деплой
cd /путь/к/проекту
./deploy-timeweb.sh

# ГОТОВО! Приложение запущено без GitHub
```

---

## 🔧 ВАРИАНТ 2: ИСПРАВИТЬ GIT ЛОКАЛЬНО

### На вашем компьютере выполните:

```bash
# 1. Клонировать репозиторий ЗАНОВО
cd ~
git clone https://github.com/PosPk/kamhub kamhub-clean
cd kamhub-clean

# 2. Установить BFG Repo-Cleaner
# macOS:
brew install bfg

# Linux:
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
alias bfg='java -jar bfg-1.14.0.jar'

# 3. Удалить core файл из истории
bfg --delete-files core .git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Force push
git push origin --force --all

# 5. Вернуться к работе
cd /workspace
git pull --all
```

---

## 📦 ВАРИАНТ 3: НОВЫЙ РЕПОЗИТОРИЙ (САМЫЙ ПРОСТОЙ)

```bash
# 1. Создать новый репозиторий на GitHub
# https://github.com/new
# Название: kamhub-production

# 2. Скопировать только нужные файлы
cd /workspace
rm -rf .git core
git init
git add .
git commit -m "Initial commit - production ready"

# 3. Подключить новый remote
git remote add origin https://github.com/ваш-username/kamhub-production.git
git branch -M main
git push -u origin main

# 4. В Timeweb Cloud изменить репозиторий
# https://timeweb.cloud/my/projects/1883095
# Settings → Repository → Change to new repo
```

---

## 🚀 ВАРИАНТ 4: ZIP ФАЙЛ И РУЧНОЙ ДЕПЛОЙ

### Если нужно срочно запустить:

```bash
# 1. Создать архив проекта
cd /workspace
tar -czf kamhub-deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=core \
  --exclude=.next \
  .

# 2. Загрузить на Timeweb VDS через SCP
scp kamhub-deploy.tar.gz root@ваш-timeweb-ip:/root/

# 3. На VDS распаковать и запустить
ssh root@ваш-timeweb-ip
cd /root
tar -xzf kamhub-deploy.tar.gz
cd kamhub
./deploy-timeweb.sh
```

---

## 🎯 РЕКОМЕНДАЦИЯ

**Для срочного деплоя:**
→ **ВАРИАНТ 1** (VDS напрямую) - 15 минут

**Для правильной настройки:**
→ **ВАРИАНТ 2** (BFG Cleaner) - 30 минут

**Для нового старта:**
→ **ВАРИАНТ 3** (новый репо) - 10 минут

---

## 📋 ЧТО ДЕЛАТЬ ПРЯМО СЕЙЧАС

### Я рекомендую ВАРИАНТ 1 - самый быстрый:

```bash
# 1. Заказать Timeweb VDS
https://timeweb.cloud/vds
Выбрать: VDS-4 (4 CPU, 4GB RAM, 40GB SSD)
OS: Ubuntu 22.04

# 2. Получить IP адрес и пароль root (придет на email)

# 3. Подключиться
ssh root@ваш-ip

# 4. Скопировать проект на VDS
# Вариант A: через git (если есть другой remote)
git clone https://другой-git-сервис/kamhub.git
cd kamhub

# Вариант B: через SCP с вашего компьютера
# На вашем компьютере:
cd /workspace
tar czf deploy.tar.gz --exclude=node_modules --exclude=.git --exclude=core .
scp deploy.tar.gz root@ваш-ip:/root/
# На VDS:
cd /root && tar xzf deploy.tar.gz

# 5. Запустить деплой
./deploy-timeweb.sh

# ГОТОВО за 15 минут!
```

---

## 💡 ПОЧЕМУ ВОЗНИКЛА ПРОБЛЕМА

### Файл `core`:

- **Что это:** Core dump файл (дамп памяти при сбое процесса)
- **Размер:** 4.3 GB
- **Почему в git:** Случайно добавлен в один из коммитов
- **Почему блокирует:** GitHub ограничение 100 MB на файл

### Как предотвратить:

```bash
# Добавить в .gitignore (уже добавлено):
core
*.core
*.dump

# Проверять большие файлы перед commit:
find . -type f -size +10M ! -path "*/node_modules/*"
```

---

## 🆘 НУЖНА ПОМОЩЬ?

### Если ничего не работает:

1. **Создайте issue:** https://github.com/PosPk/kamhub/issues
2. **Telegram Timeweb:** @timeweb_bot
3. **Email:** support@timeweb.ru

### Или используйте готовую альтернативу:

**Docker Compose на Timeweb VDS:**

```bash
# На VDS:
docker-compose up -d

# Всё настроено в docker-compose.yml
# PostgreSQL + App + Redis = готово!
```

---

## ✅ ПОСЛЕ ДЕПЛОЯ

Когда приложение запустится на Timeweb:

```bash
# Проверить
curl http://ваш-ip/api/health

# Открыть в браузере
http://ваш-ip

# Настроить домен (опционально)
https://timeweb.cloud/my/domains
```

---

**Выберите удобный вариант и запускайте! 🚀**

**Рекомендую:** ВАРИАНТ 1 (VDS напрямую) - проще и быстрее всего.
