# 🚨 ОТЧЕТ О БЕЗОПАСНОСТИ - КРИТИЧНЫЕ ПРОБЛЕМЫ

> **Дата сканирования:** 30 октября 2025  
> **Статус:** 🔴 **КРИТИЧНЫЕ ПРОБЛЕМЫ ОБНАРУЖЕНЫ**

---

## 🔴 КРИТИЧНЫЕ ПРОБЛЕМЫ

### 1. ❌ ФАЙЛ `.env` В GIT РЕПОЗИТОРИИ

**Проблема:**
```bash
.env  # ОТСЛЕЖИВАЕТСЯ GIT!
```

**Что внутри:**
```env
JWT_SECRET=dev-secret-key-change-in-production-12345678  # ← СЕКРЕТ В РЕПО!
DATABASE_URL=postgresql://localhost:5432/kamchatour
```

**Риск:** 🔴 **КРИТИЧНЫЙ**
- Любой с доступом к репозиторию видит секреты
- История git содержит все версии файла
- Если репозиторий публичный = КАТАСТРОФА

**Почему так получилось:**
- Файл был добавлен в git ДО добавления в .gitignore
- `.gitignore` игнорирует только НОВЫЕ файлы
- Уже закоммиченные файлы остаются в репо

---

### 2. ❌ ФАЙЛ `token.txt` В РЕПОЗИТОРИИ

**Проблема:**
```bash
token.txt  # 13KB HTML файла в репо
```

**Содержимое:**
- HTML страница Yandex CAPTCHA
- Не содержит реальных токенов (ложное срабатывание по имени)

**Риск:** 🟡 **НИЗКИЙ**
- Файл не содержит секретов
- Но имя вводит в заблуждение
- Не должен быть в репозитории

---

### 3. ⚠️ ЛИШНИЕ .env ФАЙЛЫ В РЕПО

**Проблема:**
```bash
.env.example              # ← OK (шаблон)
.env.local.example        # ← Не нужен в git
.env.production.example   # ← Не нужен в git
.env.timeweb-ai          # ← Не нужен в git
.env.timeweb-apps        # ← Не нужен в git
```

**Риск:** 🟢 **НИЗКИЙ**
- Содержат только placeholder значения
- Но засоряют репозиторий

---

## ✅ ЧТО РАБОТАЕТ ПРАВИЛЬНО

### Хорошие практики в коде:

```typescript
// ✅ Секреты через process.env
const apiKey = process.env.GROQ_API_KEY;
const jwtSecret = process.env.JWT_SECRET;

// ✅ Фильтрация чувствительных данных в Sentry
if (key.includes('password') || key.includes('token')) {
  data[key] = '[REDACTED]';
}

// ✅ Безопасная работа с паролями
const hashedPassword = await bcrypt.hash(password, 10);

// ✅ Валидация webhook подписей
validateCloudPaymentsSignature(body, signature, API_SECRET);
```

### .gitignore настроен правильно:

```gitignore
.env
.env.local
.env.*.local
*.pem
```

---

## 🔧 НЕМЕДЛЕННЫЕ ДЕЙСТВИЯ

### Шаг 1: Удалить секреты из git (СРОЧНО!)

```bash
# Удалить .env из git (но оставить локально)
git rm --cached .env

# Удалить token.txt
git rm token.txt

# Удалить лишние .env примеры
git rm .env.timeweb-ai .env.timeweb-apps
git rm .env.production.example .env.local.example

# Закоммитить
git commit -m "security: remove sensitive files from git"

# Push
git push origin main
```

⚠️ **ВНИМАНИЕ:** Это удаляет файлы из текущей версии, но **НЕ из истории git!**

---

### Шаг 2: Очистить историю git (ВАЖНО!)

**Если репозиторий приватный:**

```bash
# Установить git-filter-repo
pip install git-filter-repo

# Удалить файлы из ВСЕЙ истории
git filter-repo --invert-paths --path .env --path token.txt

# Force push (ОПАСНО - координируйте с командой!)
git push origin --force --all
```

**Если репозиторий публичный:**

🚨 **СЧИТАЙТЕ ВСЕ СЕКРЕТЫ СКОМПРОМЕТИРОВАННЫМИ!**

1. **Немедленно смените:**
   - JWT_SECRET (генерируйте новый)
   - Все API ключи
   - Пароли баз данных
   - Все токены

2. **Очистите историю** (как выше)

3. **Настройте GitHub Secret Scanning:**
   - Settings → Security → Secret scanning → Enable

---

### Шаг 3: Обновить .gitignore

```bash
# Добавить в .gitignore
cat >> .gitignore << 'EOF'

# Все .env файлы кроме .env.example
.env*
!.env.example

# Token файлы
token.txt
*.token
secrets.txt

# Backup файлы
backups/*.sql
backups/*.sql.gz

EOF

git add .gitignore
git commit -m "security: improve .gitignore"
git push
```

---

### Шаг 4: Создать правильный .env

```bash
# Создать из примера
cp .env.example .env

# Сгенерировать новый JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET" >> .env

# Добавить остальные секреты вручную
nano .env
```

---

## 🔒 НАСТРОЙКА TIMEWEB CLOUD

### Для Timeweb Cloud Apps:

**Секреты через UI (не в репозиторий!):**

1. Перейти: https://timeweb.cloud/my/projects/1883095
2. Settings → Environment Variables
3. Добавить:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=<генерировать новый>
   GROQ_API_KEY=...
   CLOUDPAYMENTS_API_SECRET=...
   ```

### Для Timeweb VDS:

**Секреты через .env на сервере:**

```bash
# На сервере создать .env
ssh root@your-server
cd /var/www/kamchatour
nano .env

# Добавить секреты
# НЕ коммитить в git!
```

---

## 📋 ЧЕКЛИСТ БЕЗОПАСНОСТИ

### Немедленно (сегодня):

- [ ] Удалить .env из git: `git rm --cached .env`
- [ ] Удалить token.txt: `git rm token.txt`
- [ ] Закоммитить и push
- [ ] Очистить историю git (если публичный репо)
- [ ] Сгенерировать новый JWT_SECRET
- [ ] Обновить .gitignore

### В течение недели:

- [ ] Настроить GitHub Secret Scanning
- [ ] Настроить pre-commit hooks (detect-secrets)
- [ ] Ротировать все API ключи
- [ ] Audit команды кто имел доступ к репо
- [ ] Проверить логи Timeweb на подозрительную активность

### Best practices:

- [ ] Никогда не коммитить .env файлы
- [ ] Использовать .env.example как шаблон
- [ ] Секреты только через environment variables
- [ ] Ротация ключей каждые 90 дней
- [ ] 2FA для GitHub account
- [ ] Code review перед merge

---

## 🛡️ ПРЕДОТВРАЩЕНИЕ В БУДУЩЕМ

### 1. Pre-commit hook

Создать `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Проверка на секреты перед commit

if git diff --cached --name-only | grep -qE '^\.env$|token\.txt|secret'; then
    echo "❌ ОШИБКА: Попытка закоммитить секретный файл!"
    echo "Файлы:"
    git diff --cached --name-only | grep -E '^\.env$|token\.txt|secret'
    exit 1
fi

# Поиск хардкоженных секретов
if git diff --cached | grep -qE 'api[_-]?key.*=.*[a-zA-Z0-9]{20,}'; then
    echo "⚠️  ВНИМАНИЕ: Возможно хардкоженный API ключ!"
    exit 1
fi
```

### 2. GitHub Actions workflow

`.github/workflows/security.yml`:

```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          
      - name: Check .env files
        run: |
          if git ls-files | grep -E '^\.env$'; then
            echo "ERROR: .env file in repository!"
            exit 1
          fi
```

### 3. Detect-secrets

```bash
# Установить
pip install detect-secrets

# Сканировать репозиторий
detect-secrets scan > .secrets.baseline

# Audit результаты
detect-secrets audit .secrets.baseline
```

---

## 📞 КУДА ОБРАТИТЬСЯ

### Если секреты утекли:

1. **Timeweb Cloud Support:**
   - Email: support@timeweb.ru
   - Telegram: @timeweb_bot
   - Сообщите о возможной компрометации

2. **Поменять ключи:**
   - Timeweb: https://timeweb.cloud/my/api-keys
   - Groq: https://console.groq.com/keys
   - CloudPayments: панель управления

3. **GitHub:**
   - Settings → Security → Secret scanning alerts

---

## ✅ ПОСЛЕ ИСПРАВЛЕНИЯ

Когда всё исправлено, проверить:

```bash
# 1. .env не в git
git ls-files | grep "^\.env$"
# Должно быть пусто

# 2. token.txt удален
git ls-files | grep "token.txt"
# Должно быть пусто

# 3. .gitignore правильный
cat .gitignore | grep ".env"
# Должно быть: .env

# 4. История очищена (если был публичный репо)
git log --all --full-history -- .env
# Не должно быть результатов
```

---

## 📊 ИТОГОВЫЙ РИСК-АНАЛИЗ

### Текущий статус: 🔴 КРИТИЧНЫЙ

```
Критичных проблем:  2
Средних проблем:    0  
Низких проблем:     1

Общий риск:  ВЫСОКИЙ
Действия:    НЕМЕДЛЕННЫЕ
```

### После исправления: 🟢 БЕЗОПАСНО

```
Критичных проблем:  0
Средних проблем:    0
Низких проблем:     0

Общий риск:  МИНИМАЛЬНЫЙ
Действия:    МОНИТОРИНГ
```

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **СЕЙЧАС (5 минут):**
   ```bash
   git rm --cached .env token.txt
   git commit -m "security: remove secrets"
   git push
   ```

2. **СЕГОДНЯ (30 минут):**
   - Очистить историю git
   - Сгенерировать новые секреты
   - Настроить Timeweb environment variables

3. **НА ЭТОЙ НЕДЕЛЕ:**
   - Настроить pre-commit hooks
   - GitHub Secret Scanning
   - Code review процесс

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Статус:** 🚨 ТРЕБУЕТСЯ НЕМЕДЛЕННОЕ ДЕЙСТВИЕ

**ВАЖНО: Начните с удаления .env из git прямо сейчас!**
