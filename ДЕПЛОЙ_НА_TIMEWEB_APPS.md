# ⚡ БЫСТРЫЙ ДЕПЛОЙ НА TIMEWEB CLOUD APPS

**Это как Vercel, но от Timeweb! Намного проще чем VDS!**

---

## 🎯 ЗА 5 МИНУТ

### 1️⃣ ОТКРОЙТЕ
```
https://timeweb.cloud/my/apps/create
```

### 2️⃣ ПОДКЛЮЧИТЕ GITHUB
- Выберите репозиторий: `PosPk/kamhub`
- Выберите ветку: `cursor/study-timeweb-cloud-documentation-thoroughly-72f9`

### 3️⃣ НАСТРОЙТЕ BUILD

| Параметр | Значение |
|----------|----------|
| Framework | Next.js (определится автоматически) |
| Node.js | 20.x |
| Build Command | `npm run build` |
| Start Command | `npm start` |

### 4️⃣ ДОБАВЬТЕ ПЕРЕМЕННЫЕ

**Минимум (чтобы запустилось):**
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=any_random_32_characters_here
NEXTAUTH_SECRET=any_random_32_characters_here
GROQ_API_KEY=your_groq_key
YANDEX_MAPS_API_KEY=your_yandex_maps_key
```

**DATABASE_URL добавите после создания PostgreSQL!**

### 5️⃣ ДОБАВЬТЕ POSTGRESQL
- Services → Add PostgreSQL
- Версия: 16
- Preset: P1 (1GB)
- Регион: ru-2

**Скопируйте DATABASE_URL из email → добавьте в Environment Variables**

### 6️⃣ ВЫБЕРИТЕ РЕСУРСЫ
- **Basic:** 1 vCPU, 1GB RAM (~300₽/мес)

### 7️⃣ НАЖМИТЕ "CREATE & DEPLOY" 🚀

---

## ✅ ЧЕРЕЗ 5-10 МИНУТ

**Ваше приложение доступно:**
```
https://kamchatour-hub.timeweb.app
```

---

## 🎉 ГОТОВО!

**Теперь каждый `git push` автоматически деплоится!**

- ✅ Автоматический SSL
- ✅ Автоматический деплой
- ✅ Managed PostgreSQL
- ✅ Мониторинг и логи
- ✅ Rollback за 1 клик

**Подробная инструкция:** [TIMEWEB_CLOUD_APPS_SETUP.md](./TIMEWEB_CLOUD_APPS_SETUP.md)

---

## 💰 СТОИМОСТЬ
- App: ~300₽/мес
- PostgreSQL: ~230₽/мес
- S3: ~50₽/мес
- **ИТОГО: ~580₽/мес (~$6)**

**Дешевле Vercel Pro ($20) в 3+ раза!** 💰

---

## 📊 ПОЧЕМУ TIMEWEB APPS, А НЕ VDS?

| Аспект | Timeweb Apps | VDS |
|--------|-------------|-----|
| Деплой | ✅ Автоматический | ❌ Вручную |
| SSL | ✅ Автоматический | ❌ Настраивать |
| Nginx | ✅ Не нужен | ❌ Настраивать |
| PM2 | ✅ Не нужен | ❌ Настраивать |
| Rollback | ✅ 1 клик | ❌ git revert |
| Масштабирование | ✅ Авто | ❌ Вручную |
| Сложность | 🟢 **ЛЕГКО** | 🔴 Сложно |
| Цена | ~580₽ | ~580₽ |

**ВЕРДИКТ:** Используйте **Timeweb Apps**! ⭐

---

**ОТКРОЙТЕ И ДЕПЛОЙТЕ:** https://timeweb.cloud/my/apps/create 🚀
