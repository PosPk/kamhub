# 📘 Пошаговая настройка GitHub репозитория для Timeweb Cloud

## 🎯 Цель

Настроить GitHub репозиторий с автоматической интеграцией Timeweb Cloud через GitHub Actions.

---

## 📋 ЧТО НУЖНО ПОДГОТОВИТЬ

- [ ] Аккаунт на GitHub
- [ ] API токен Timeweb Cloud
- [ ] SSH ключ для доступа к серверу (создастся автоматически)

---

## 🚀 ШАГ 1: Создание репозитория на GitHub

### Вариант A: Через веб-интерфейс

1. **Откройте GitHub:**
   ```
   https://github.com/new
   ```

2. **Заполните данные:**
   - Repository name: `kamchatour-hub`
   - Description: `Туристическая платформа для Камчатки`
   - Visibility: `Private` (рекомендуется) или `Public`
   - ✅ Initialize with README
   - ✅ Add .gitignore: Node
   - License: MIT (опционально)

3. **Нажмите:** `Create repository`

### Вариант B: Через GitHub CLI

```bash
# Установите GitHub CLI (если еще нет)
# macOS: brew install gh
# Linux: https://github.com/cli/cli#installation

# Авторизуйтесь
gh auth login

# Создайте репозиторий
gh repo create kamchatour-hub \
  --private \
  --description "Туристическая платформа для Камчатки" \
  --clone
```

---

## 🔗 ШАГ 2: Подключение локального проекта к GitHub

### Если репозиторий только что создан:

```bash
cd /workspace

# Проверьте текущий remote
git remote -v

# Если remote уже есть, обновите URL
git remote set-url origin https://github.com/ВАШ_USERNAME/kamchatour-hub.git

# Если remote нет, добавьте
git remote add origin https://github.com/ВАШ_USERNAME/kamchatour-hub.git

# Отправьте код
git branch -M main
git push -u origin main
```

### Если клонировали через gh cli:

```bash
# Скопируйте файлы в склонированную директорию
cp -r /workspace/* ~/kamchatour-hub/
cd ~/kamchatour-hub

# Закоммитьте и отправьте
git add .
git commit -m "Initial commit: KamchaTour Hub"
git push origin main
```

---

## 🔑 ШАГ 3: Добавление API токена Timeweb в GitHub Secrets

### 3.1 Получите API токен Timeweb Cloud:

1. **Откройте панель Timeweb:**
   ```
   https://timeweb.cloud/my/api
   ```

2. **Создайте новый токен:**
   - Нажмите "Создать токен"
   - Имя: `GitHub Actions KamchaTour`
   - Права доступа:
     - ✅ Управление серверами
     - ✅ Управление базами данных
     - ✅ Управление S3
     - ✅ Управление Firewall
     - ✅ Чтение информации об аккаунте
   - Нажмите "Создать"

3. **Скопируйте токен** (показывается только один раз!)

### 3.2 Добавьте токен в GitHub Secrets:

1. **Откройте настройки репозитория:**
   ```
   https://github.com/ВАШ_USERNAME/kamchatour-hub/settings/secrets/actions
   ```

2. **Нажмите:** `New repository secret`

3. **Добавьте секрет:**
   - Name: `TIMEWEB_TOKEN`
   - Value: `ваш_скопированный_токен`
   - Нажмите: `Add secret`

4. **Проверьте:** Секрет должен появиться в списке

---

## 🔧 ШАГ 4: Добавление других секретов (создадутся позже)

После создания инфраструктуры через Timeweb API, добавьте эти секреты:

### Обязательные секреты:

| Имя секрета | Описание | Где взять |
|-------------|----------|-----------|
| `TIMEWEB_TOKEN` | ✅ УЖЕ ДОБАВЛЕН | Timeweb Cloud API |
| `DATABASE_URL` | Connection string БД | Создастся автоматически |
| `SERVER_HOST` | IP адрес VDS | Создастся автоматически |
| `SERVER_USER` | Пользователь на сервере | `kamchatour` |
| `SSH_PRIVATE_KEY` | Приватный SSH ключ | Создастся позже |

### Дополнительные секреты (добавить вручную):

| Имя секрета | Описание |
|-------------|----------|
| `GROQ_API_KEY` | AI провайдер GROQ |
| `DEEPSEEK_API_KEY` | AI провайдер DeepSeek |
| `OPENROUTER_API_KEY` | AI провайдер OpenRouter |
| `YANDEX_MAPS_API_KEY` | Yandex Maps |
| `YANDEX_WEATHER_API_KEY` | Yandex Weather |
| `NEXTAUTH_SECRET` | NextAuth секрет |
| `CLOUDPAYMENTS_PUBLIC_ID` | CloudPayments |
| `CLOUDPAYMENTS_API_SECRET` | CloudPayments |
| `SENTRY_DSN` | Sentry мониторинг |

---

## 🤖 ШАГ 5: Создание GitHub Actions Workflow

Создайте файл `.github/workflows/deploy.yml`:

```bash
# В корне проекта
mkdir -p .github/workflows
```

Создам workflow файл отдельно в следующем шаге.

---

## 📝 ШАГ 6: Настройка GitHub Actions

### Автоматический workflow создан в файле:
`.github/workflows/timeweb-deploy.yml`

Этот workflow умеет:

1. **Setup Infrastructure** (`setup`)
   - Создает VDS, PostgreSQL, S3, Firewall
   - Генерирует .env файл
   - Сохраняет информацию о ресурсах

2. **Check Status** (`status`)
   - Проверяет статус всех ресурсов
   - Показывает uptime и метрики

3. **Deploy Application** (`deploy`)
   - Автоматический deploy при push в main
   - Или вручную через GitHub Actions UI

---

## 🎮 ШАГ 7: Запуск автоматической настройки

### Через GitHub Actions UI:

1. **Откройте Actions:**
   ```
   https://github.com/ВАШ_USERNAME/kamchatour-hub/actions
   ```

2. **Выберите workflow:** `Deploy to Timeweb Cloud`

3. **Нажмите:** `Run workflow`

4. **Выберите действие:**
   - `setup` - Первый запуск (создание инфраструктуры)
   - `status` - Проверка статуса
   - `deploy` - Развертывание приложения

5. **Нажмите:** `Run workflow`

6. **Следите за прогрессом** в реальном времени

### Через локальную машину (альтернатива):

```bash
# Экспортируйте токен
export TIMEWEB_TOKEN=ваш_токен

# Запустите setup
tsx scripts/timeweb-setup.ts

# После завершения, добавьте созданные ресурсы в GitHub Secrets
```

---

## 🔐 ШАГ 8: Настройка SSH доступа

После создания VDS сервера:

### 8.1 Создайте SSH ключ:

```bash
# На локальной машине
ssh-keygen -t ed25519 -C "github-actions@kamchatour" -f ~/.ssh/kamchatour_github

# Скопируйте публичный ключ на сервер
ssh-copy-id -i ~/.ssh/kamchatour_github.pub root@SERVER_IP

# Проверьте подключение
ssh -i ~/.ssh/kamchatour_github root@SERVER_IP
```

### 8.2 Добавьте приватный ключ в GitHub Secrets:

```bash
# Скопируйте приватный ключ
cat ~/.ssh/kamchatour_github

# Добавьте в GitHub Secrets как SSH_PRIVATE_KEY
```

---

## 📊 ШАГ 9: Добавление badge статуса в README

Добавьте в ваш `README.md`:

```markdown
# KamchaTour Hub

![Deploy Status](https://github.com/ВАШ_USERNAME/kamchatour-hub/actions/workflows/timeweb-deploy.yml/badge.svg)

Туристическая платформа для Камчатки с AI-рекомендациями.

## Статус

- Сервер: https://your-server-ip
- Статус: ✅ Online
```

---

## ✅ ЧЕКЛИСТ: Что должно быть готово

### GitHub репозиторий:
- [ ] Репозиторий создан на GitHub
- [ ] Локальный код подключен к GitHub
- [ ] Код залит в репозиторий (git push)

### GitHub Secrets:
- [ ] `TIMEWEB_TOKEN` добавлен
- [ ] `DATABASE_URL` добавлен (после setup)
- [ ] `SERVER_HOST` добавлен (после setup)
- [ ] `SERVER_USER` добавлен (kamchatour)
- [ ] `SSH_PRIVATE_KEY` добавлен (после создания)
- [ ] AI API ключи добавлены (GROQ, DeepSeek, etc.)
- [ ] Yandex API ключи добавлены

### GitHub Actions:
- [ ] Workflow файл создан (`.github/workflows/timeweb-deploy.yml`)
- [ ] Первый запуск `setup` выполнен успешно
- [ ] Инфраструктура создана на Timeweb Cloud
- [ ] Deploy работает автоматически

### Timeweb Cloud:
- [ ] VDS сервер создан
- [ ] PostgreSQL база создана
- [ ] S3 bucket создан
- [ ] Firewall настроен
- [ ] Сервер настроен (setup-timeweb-server.sh)

---

## 🎯 ИТОГОВАЯ ПРОВЕРКА

Выполните эти команды для проверки:

```bash
# 1. Проверьте, что код в GitHub
git remote -v
git log --oneline -5

# 2. Проверьте локально (если есть токен)
export TIMEWEB_TOKEN=ваш_токен
tsx scripts/timeweb-manage.ts project

# 3. Проверьте через GitHub Actions
# Откройте: https://github.com/ВАШ_USERNAME/kamchatour-hub/actions
# Запустите: Run workflow → status

# 4. Проверьте доступность сервера
curl http://SERVER_IP/api/health
```

---

## 🆘 Частые проблемы

### Проблема 1: Push отклонен

```bash
# Ошибка: ! [rejected] main -> main (fetch first)
git pull origin main --rebase
git push origin main
```

### Проблема 2: Секрет не работает в Actions

1. Проверьте название (должно быть точно `TIMEWEB_TOKEN`)
2. Проверьте, что секрет добавлен в правильном репозитории
3. Пересоздайте токен на Timeweb Cloud
4. Обновите секрет в GitHub

### Проблема 3: Workflow не запускается

1. Проверьте путь: `.github/workflows/timeweb-deploy.yml`
2. Проверьте синтаксис YAML (нет табов, только пробелы)
3. Проверьте права Actions в настройках репозитория

---

## 📞 Поддержка

**GitHub:**
- Документация: https://docs.github.com/en/actions
- Community: https://github.community

**Timeweb Cloud:**
- Панель: https://timeweb.cloud/my
- Поддержка: support@timeweb.cloud
- Telegram: @timeweb_support

---

**Последнее обновление:** 2025-10-29  
**Версия:** 1.0
