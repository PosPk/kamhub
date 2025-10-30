# 🚀 ЗАПУСК ДЕПЛОЯ ЧЕРЕЗ GITHUB ACTIONS

## ✅ У НАС УЖЕ ЕСТЬ GITHUB ACTIONS WORKFLOW!

Файл: `.github/workflows/timeweb-deploy.yml`

---

## 🎯 КАК ЗАПУСТИТЬ (С ТЕЛЕФОНА ИЛИ КОМПЬЮТЕРА)

### Способ 1: Через веб-интерфейс GitHub (проще всего)

1. **Откройте на телефоне/компьютере:**
   ```
   https://github.com/PosPk/kamhub/actions
   ```

2. **Выберите workflow:**
   - Найдите "Deploy to Timeweb Cloud"
   - Нажмите на него

3. **Запустите:**
   - Нажмите кнопку **"Run workflow"** (справа сверху)
   - Выберите ветку: `cursor/study-timeweb-cloud-documentation-thoroughly-72f9`
   - Выберите действие: `deploy`
   - Нажмите **"Run workflow"**

4. **Дождитесь:**
   - Процесс займёт ~5-10 минут
   - Можно следить за прогрессом в реальном времени

---

## ⚠️ ПРОБЛЕМА: Нужны GitHub Secrets!

Для работы GitHub Actions нужны эти секреты:

| Secret | Статус | Откуда взять |
|--------|--------|--------------|
| `TIMEWEB_TOKEN` | ❓ | https://timeweb.cloud/my/api (новый!) |
| `DATABASE_URL` | ❓ | Из email Timeweb |
| `SERVER_HOST` | ✅ | 45.8.96.120 |
| `SERVER_USER` | ✅ | root |
| `SSH_PRIVATE_KEY` | ❌ | Нужно создать |

---

## 🔧 ДОБАВЛЕНИЕ СЕКРЕТОВ (5 минут)

### 1. Откройте настройки секретов:
```
https://github.com/PosPk/kamhub/settings/secrets/actions
```

### 2. Добавьте секреты:

#### SERVER_HOST
- Name: `SERVER_HOST`
- Value: `45.8.96.120`

#### SERVER_USER
- Name: `SERVER_USER`  
- Value: `root`

#### DATABASE_URL
- Name: `DATABASE_URL`
- Value: `postgresql://user:password@host:5432/database`
- (Замените на реальные данные из email Timeweb)

#### SSH_PRIVATE_KEY
Это сложнее - нужен SSH ключ для подключения к серверу.

**Создать можно:**
1. На локальном компьютере: `ssh-keygen -t ed25519`
2. Скопировать публичный ключ на сервер
3. Добавить приватный ключ в GitHub Secrets

**ИЛИ** пропустить пока, если нет доступа.

---

## 💡 АЛЬТЕРНАТИВА: Прямой деплой на сервере

Если GitHub Actions не работает без SSH ключа, используйте:

### Веб-консоль Timeweb (с телефона!):

1. Откройте: https://timeweb.cloud/my/servers/5898003
2. Нажмите "Консоль" или "VNC"
3. Выполните:

```bash
curl -O https://raw.githubusercontent.com/PosPk/kamhub/cursor/study-timeweb-cloud-documentation-thoroughly-72f9/auto-deploy-kamchatour.sh
bash auto-deploy-kamchatour.sh
```

---

## 🎯 САМЫЙ ПРОСТОЙ СПОСОБ

**Веб-консоль Timeweb** - работает БЕЗ SSH ключей!

1. https://timeweb.cloud/my/servers/5898003
2. Кнопка "Консоль"
3. Команда выше
4. Enter
5. Готово!

---

**Это можно сделать прямо с телефона за 15 минут!** 📱
