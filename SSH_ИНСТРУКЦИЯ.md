# 🔐 SSH ДОСТУП К TIMEWEB - ПОЛНАЯ ИНСТРУКЦИЯ

> **Статус:** У вас есть SSH пароль!  
> **Что дальше:** Подключиться и настроить PostgreSQL

---

## ✅ У ВАС ЕСТЬ

```
✓ TIMEWEB_SSH_PASSWORD - пароль для SSH доступа
✓ Скрипты настройки PostgreSQL
✓ Автоматические команды подключения
```

---

## 🎯 ДВА ТИПА SSH ДОСТУПА

### 1️⃣ Timeweb Cloud Apps (контейнер приложения)

**Когда используется:**
- У вас Apps на https://timeweb.cloud/my/apps/125051
- Нужно запустить миграции
- Нужно проверить логи
- Нужно отладить приложение

**Ограничения:**
- Доступ только к приложению
- Нельзя устанавливать системные пакеты
- PostgreSQL создается отдельно

### 2️⃣ Timeweb VDS (виртуальный сервер)

**Когда используется:**
- У вас VDS/VPS сервер
- Нужна полная установка с нуля
- Нужен полный контроль

**Возможности:**
- Root доступ
- Установка любых пакетов
- Свой PostgreSQL на том же сервере

---

## 🔌 КАК ПОДКЛЮЧИТЬСЯ

### Вариант 1: Автоматический скрипт

```bash
./scripts/ssh-connect.sh

# Выберите тип (Apps или VDS)
# Введите данные
# Подключится автоматически
```

### Вариант 2: Вручную для Apps

```bash
ssh app@kamchatour-125051.timeweb.cloud

# Введите ваш TIMEWEB_SSH_PASSWORD когда попросит
```

### Вариант 3: Вручную для VDS

```bash
ssh root@<IP_адрес_вашего_VDS>

# Введите ваш TIMEWEB_SSH_PASSWORD
```

### Вариант 4: С sshpass (автоматический пароль)

```bash
# Установите sshpass (если нужно)
# Mac: brew install hudochenkov/sshpass/sshpass
# Linux: sudo apt install sshpass

sshpass -p 'ваш_пароль' ssh app@kamchatour-125051.timeweb.cloud
```

---

## 📋 ИНФОРМАЦИЯ ДЛЯ ПОДКЛЮЧЕНИЯ

### Для Timeweb Cloud Apps:

```
Host:     kamchatour-125051.timeweb.cloud
User:     app
Port:     22
Password: <ваш TIMEWEB_SSH_PASSWORD>
```

### Для Timeweb VDS:

```
Host:     <IP из dashboard>
User:     root
Port:     22
Password: <ваш TIMEWEB_SSH_PASSWORD>
```

**Где найти IP адрес VDS:**
- https://timeweb.cloud/servers
- Найдите ваш сервер
- Скопируйте IP адрес

---

## ✅ ЧТО ДЕЛАТЬ ПОСЛЕ ПОДКЛЮЧЕНИЯ

### 1. Проверить окружение

```bash
# Где мы находимся
pwd

# Что есть в директории
ls -la

# Проверить приложение
cat package.json

# Проверить Node.js
node --version

# Проверить npm
npm --version
```

### 2. Проверить переменные окружения

```bash
# Все переменные
printenv

# Только DATABASE_URL
echo $DATABASE_URL

# Если пусто - установите:
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Сохраните постоянно:
echo 'export DATABASE_URL="..."' >> ~/.bashrc
source ~/.bashrc
```

### 3. Настроить PostgreSQL

```bash
# Если скрипты уже на сервере:
./scripts/setup-postgresql.sh

# Если скриптов нет - загрузите (см. ниже)
```

### 4. Применить миграции

```bash
# Если приложение установлено:
npm run migrate:up

# Или напрямую через psql:
psql "$DATABASE_URL" -f lib/database/schema.sql
```

### 5. Проверить логи

```bash
# PM2 логи (если используется PM2)
pm2 logs

# Системные логи
tail -f /var/log/app.log

# Next.js логи
tail -f .next/server/logs.log
```

### 6. Перезапустить приложение

```bash
# PM2
pm2 restart kamhub

# Или systemd
sudo systemctl restart kamhub

# Или npm
npm restart
```

---

## 🚀 АВТОМАТИЧЕСКАЯ НАСТРОЙКА С ЛОКАЛЬНОГО ПК

Не хотите вручную подключаться? Запустите с вашего компьютера:

```bash
./scripts/remote-setup.sh

# Скрипт автоматически:
# 1. Подключится к серверу по SSH
# 2. Загрузит все скрипты
# 3. Настроит PostgreSQL
# 4. Применит миграции
# 5. Проверит результат
```

---

## 📤 ЗАГРУЗКА СКРИПТОВ НА СЕРВЕР

Если скриптов нет на сервере, загрузите их:

### Способ 1: SCP (рекомендуется)

```bash
# Создайте директорию на сервере
ssh app@kamchatour-125051.timeweb.cloud "mkdir -p ~/scripts"

# Загрузите скрипты
scp scripts/init-postgresql.sql app@kamchatour-125051.timeweb.cloud:~/scripts/
scp scripts/setup-postgresql.sh app@kamchatour-125051.timeweb.cloud:~/scripts/

# Сделайте исполняемым
ssh app@kamchatour-125051.timeweb.cloud "chmod +x ~/scripts/setup-postgresql.sh"
```

### Способ 2: Git (если репозиторий доступен)

```bash
# На сервере:
git clone https://github.com/PosPk/kamhub.git
cd kamhub
./scripts/setup-postgresql.sh
```

### Способ 3: Копирование вручную

```bash
# На сервере создайте файл:
nano ~/scripts/init-postgresql.sql

# Вставьте содержимое из вашего локального файла
# Сохраните: Ctrl+O, Enter, Ctrl+X
```

---

## 🔒 НАСТРОЙКА SSH КЛЮЧЕЙ (ОПЦИОНАЛЬНО)

Для удобства можно настроить вход без пароля:

### 1. Сгенерируйте SSH ключ (на вашем ПК)

```bash
ssh-keygen -t ed25519 -C "kamhub@timeweb"

# Сохраните в: ~/.ssh/id_kamhub
# Пароль: Enter (можно без пароля)
```

### 2. Скопируйте ключ на сервер

```bash
ssh-copy-id -i ~/.ssh/id_kamhub.pub app@kamchatour-125051.timeweb.cloud

# Введите ваш TIMEWEB_SSH_PASSWORD в последний раз
```

### 3. Настройте SSH config

```bash
nano ~/.ssh/config

# Добавьте:
Host kamhub
    HostName kamchatour-125051.timeweb.cloud
    User app
    IdentityFile ~/.ssh/id_kamhub
    Port 22
```

### 4. Подключайтесь просто

```bash
ssh kamhub

# Без пароля! ✅
```

---

## 🆘 TROUBLESHOOTING

### Ошибка: "Permission denied"

**Причина:** Неправильный пароль или пользователь

**Решение:**
1. Проверьте пароль (скопируйте из dashboard)
2. Проверьте username (app или root)
3. Проверьте host (IP или домен)

### Ошибка: "Connection refused"

**Причина:** SSH порт закрыт или firewall

**Решение:**
1. Проверьте что сервер запущен в dashboard
2. Проверьте firewall settings
3. Попробуйте другой порт (если изменен)

### Ошибка: "Host key verification failed"

**Причина:** Ключ хоста изменился

**Решение:**
```bash
ssh-keygen -R kamchatour-125051.timeweb.cloud
# Попробуйте снова
```

### Команды не найдены (npm, node, etc)

**Причина:** Переменные окружения не загружены

**Решение:**
```bash
source ~/.bashrc
# или
source ~/.profile
```

---

## 📝 ПОЛЕЗНЫЕ КОМАНДЫ НА СЕРВЕРЕ

### Проверка системы

```bash
# Версия ОС
cat /etc/os-release

# Использование диска
df -h

# Использование памяти
free -h

# Процессы
ps aux | grep node

# Сетевые порты
netstat -tulpn | grep :3000
```

### Работа с приложением

```bash
# Статус PM2
pm2 status

# Перезапуск
pm2 restart all

# Логи реального времени
pm2 logs --lines 100

# Мониторинг
pm2 monit
```

### Работа с PostgreSQL

```bash
# Подключение к БД
psql "$DATABASE_URL"

# Список таблиц
psql "$DATABASE_URL" -c "\dt"

# Выполнить SQL
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"

# Бэкап
pg_dump "$DATABASE_URL" > backup.sql

# Восстановление
psql "$DATABASE_URL" < backup.sql
```

---

## 🎯 БЫСТРЫЕ СЦЕНАРИИ

### Сценарий 1: Первая настройка

```bash
# 1. Подключитесь
ssh app@kamchatour-125051.timeweb.cloud

# 2. Проверьте DATABASE_URL
echo $DATABASE_URL

# 3. Если нет - установите
export DATABASE_URL="postgresql://..."

# 4. Загрузите скрипты (с локального ПК)
scp scripts/* app@kamchatour-125051.timeweb.cloud:~/

# 5. На сервере запустите
chmod +x setup-postgresql.sh
./setup-postgresql.sh

# 6. Проверьте
psql "$DATABASE_URL" -c "\dt"
```

### Сценарий 2: Быстрая проверка

```bash
ssh app@kamchatour-125051.timeweb.cloud \
  "psql \$DATABASE_URL -c 'SELECT COUNT(*) FROM users;'"
```

### Сценарий 3: Применить миграции

```bash
ssh app@kamchatour-125051.timeweb.cloud \
  "cd /app && npm run migrate:up"
```

### Сценарий 4: Посмотреть логи

```bash
ssh app@kamchatour-125051.timeweb.cloud \
  "pm2 logs --lines 50 --nostream"
```

---

## ✅ CHECKLIST ПОСЛЕ SSH НАСТРОЙКИ

```
[ ] Подключились по SSH успешно
[ ] Проверили DATABASE_URL
[ ] Загрузили скрипты на сервер
[ ] Запустили setup-postgresql.sh
[ ] Проверили что таблицы созданы
[ ] Применили миграции
[ ] Перезапустили приложение
[ ] Проверили /api/health/db
[ ] Настроили SSH ключи (опционально)
```

---

## 📞 ПОДДЕРЖКА

**Timeweb Support:**
- Dashboard: https://timeweb.cloud/
- Email: support@timeweb.ru
- Telegram: @timeweb_support

**SSH Issues:**
- Проверьте Dashboard → ваше_приложение → SSH
- Там должны быть актуальные данные подключения

---

## 🎉 ГОТОВО!

После настройки через SSH:

```
✅ PostgreSQL полностью настроен
✅ Все таблицы созданы
✅ Миграции применены
✅ Приложение готово к работе
```

**Проверьте:**
```bash
curl https://kamchatour-125051.timeweb.cloud/api/health/db
```

---

**Автор:** Cursor AI Agent  
**Дата:** 30 октября 2025  
**Статус:** SSH setup ready ✅
