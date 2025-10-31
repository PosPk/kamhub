# 🚨 КРИТИЧЕСКАЯ ИНСТРУКЦИЯ: РУЧНОЕ ИСПРАВЛЕНИЕ TIMEWEB APPS

## ❗ ПРОБЛЕМА

Timeweb Apps API не позволяет изменить параметр `index_dir: "/out"` программно.
Это приводит к ошибке 404, так как Next.js standalone сборка создает файлы в `.next/standalone/`, а не в `/out`.

## ✅ РЕШЕНИЕ (ТРЕБУЕТ ВАШЕГО УЧАСТИЯ)

### Шаг 1: Откройте настройки приложения

Зайдите на:
```
https://timeweb.cloud/my/apps/125051/settings
```

### Шаг 2: Найдите параметр "Index Directory" или "Output Directory"

Текущее значение: `/out`

### Шаг 3: Измените на один из вариантов:

**Вариант А (рекомендуемый):**
```
.next/standalone
```

**Вариант Б (альтернативный):**
Полностью удалите значение (оставьте пустым), система использует корень проекта.

**Вариант В (если есть опция):**
```
/
```

### Шаг 4: Сохраните изменения

### Шаг 5: Запустите Redeploy

В интерфейсе Timeweb Apps нажмите кнопку "Redeploy" или "Restart".

## 📊 ТЕКУЩАЯ КОНФИГУРАЦИЯ (УЖЕ НАСТРОЕНА)

✅ **next.config.js:**
```javascript
output: 'standalone'
```

✅ **package.json:**
```json
"start": "node .next/standalone/server.js"
```

✅ **Environment Variables:**
- `NODE_ENV=production`
- `PORT=8080`
- `JWT_SECRET=kamchatour-super-secret-key-2025-production`
- `NEXTAUTH_URL=https://pospk-kamhub-70c4.twc1.net`
- `NEXT_PUBLIC_API_URL=https://pospk-kamhub-70c4.twc1.net/api`
- `SKIP_SENTRY=true`

## 🔍 ПОСЛЕ ИЗМЕНЕНИЙ

1. **Проверьте логи в Timeweb UI:**
   - https://timeweb.cloud/my/apps/125051/logs
   - Должны появиться Build logs и Runtime logs

2. **Проверьте сайт:**
   ```bash
   curl -I https://pospk-kamhub-70c4.twc1.net
   ```
   Должно вернуть `HTTP/2 200` вместо `HTTP/2 404`

3. **Проверьте health endpoint:**
   ```bash
   curl https://pospk-kamhub-70c4.twc1.net/api/health
   ```
   Должно вернуть JSON с `status: "ok"`

## 🆘 ЕСЛИ НЕ ПОМОГЛО

### Альтернативное решение 1: Проверьте "Start Command"

Убедитесь что в Timeweb UI установлена команда:
```
npm start
```

### Альтернативное решение 2: Проверьте Node.js версию

В настройках приложения должна быть:
```
Node.js 20
```

### Альтернативное решение 3: Полное пересоздание

Если ничего не помогает:
1. Удалите текущее приложение (ID: 125051)
2. Создайте новое приложение в Timeweb Apps
3. При создании укажите:
   - Repository: `PosPk/kamhub`
   - Branch: `cursor/analyze-repository-and-timeweb-project-79c9`
   - Framework: `Next.js`
   - Build command: `npm run build`
   - Start command: `npm start`
   - **НЕ УКАЗЫВАЙТЕ Index Directory** (оставьте пустым!)
   - Environment Variables: (см. выше)

## 📞 ОБРАТНАЯ СВЯЗЬ

После выполнения инструкции, отправьте мне:
1. Скриншот страницы настроек (где index_dir)
2. Последние 20 строк Build logs из Timeweb UI
3. Последние 20 строк Runtime logs из Timeweb UI
4. Результат команды: `curl -I https://pospk-kamhub-70c4.twc1.net`

---

**Последний коммит:** `990bd00`  
**Дата:** 2025-10-31 00:27  
**Статус:** Ожидание ручного исправления index_dir
