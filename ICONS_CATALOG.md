# 📦 КАТАЛОГ ИКОНОК - KAMHUB

> **Дата:** 30 октября 2025  
> **Стиль:** Heroicons/Lucide - линейный, stroke 2px  
> **Лицензия:** MIT  
> **Формат:** SVG, 24×24px

---

## ✅ СОЗДАННЫЕ ИКОНКИ

### 🌟 5 ИННОВАЦИОННЫХ ФИЧ

| Иконка | Файл | Описание | Где используется |
|--------|------|----------|------------------|
| <img src="/icons/ai-chip.svg" width="24"/> | `ai-chip.svg` | Процессор/чип с синапсами | AI-Powered Transfer Matching |
| <img src="/icons/gift.svg" width="24"/> | `gift.svg` | Подарочная коробка | Multi-Level Loyalty System |
| <img src="/icons/bell-ring.svg" width="24"/> | `bell-ring.svg` | Колокольчик с волнами | Multi-Channel Notifications |
| <img src="/icons/leaf.svg" width="24"/> | `leaf.svg` | Стилизованный лист | Eco-Gamification |
| <img src="/icons/cloud-sun.svg" width="24"/> | `cloud-sun.svg` | Облако с солнцем | Weather-Driven Safety |

---

### 👥 10 ТИПОВ ПАРТНЁРОВ

| Иконка | Файл | Описание | Роль |
|--------|------|----------|------|
| <img src="/icons/user.svg" width="24"/> | `user.svg` | Силуэт человека | 👤 Турист |
| <img src="/icons/building.svg" width="24"/> | `building.svg` | Здание офиса | 🏢 Туроператор |
| <img src="/icons/backpack.svg" width="24"/> | `backpack.svg` | Рюкзак туриста | 🎒 Гид |
| <img src="/icons/car.svg" width="24"/> | `car.svg` | Автомобиль | 🚗 Трансфер |
| <img src="/icons/briefcase.svg" width="24"/> | `briefcase.svg` | Портфель | 💼 Агент (B2B) |
| <img src="/icons/settings.svg" width="24"/> | `settings.svg` | Шестеренка | ⚙️ Админ |
| <img src="/icons/hotel.svg" width="24"/> | `hotel.svg` | Здание отеля | 🏨 Размещение |
| <img src="/icons/tent.svg" width="24"/> | `tent.svg` | Палатка | ⛺ Прокат снаряжения |
| <img src="/icons/key.svg" width="24"/> | `key.svg` | Ключ (аренда) | 🔑 Прокат авто |
| <img src="/icons/shopping-bag.svg" width="24"/> | `shopping-bag.svg` | Сумка для покупок | 🛍️ Сувениры |

---

### 🏅 3 УРОВНЯ ОПЕРАТОРОВ

| Иконка | Файл | Описание | Уровень |
|--------|------|----------|---------|
| <img src="/icons/badge-1.svg" width="24"/> | `badge-1.svg` | Значок с "1" | L1 - Базовый (Бесплатно) |
| <img src="/icons/badge-2.svg" width="24"/> | `badge-2.svg` | Значок с "2" | L2 - Партнёр (5,000₽/мес) |
| <img src="/icons/badge-3.svg" width="24"/> | `badge-3.svg` | Значок с "3" | L3 - Официальный (15,000₽/мес) |

---

### 🚨 БЕЗОПАСНОСТЬ

| Иконка | Файл | Описание | Где используется |
|--------|------|----------|------------------|
| <img src="/icons/alert-circle.svg" width="24"/> | `alert-circle.svg` | Круг с восклицательным знаком | SOS кнопка |
| <img src="/icons/map-pin.svg" width="24"/> | `map-pin.svg` | Маркер на карте | Геолокация |
| <img src="/icons/phone.svg" width="24"/> | `phone.svg` | Телефонная трубка | Экстренные номера |
| <img src="/icons/shield-check.svg" width="24"/> | `shield-check.svg` | Щит с галочкой | Безопасность 24/7 |

---

### 💰 БИЗНЕС-МОДЕЛЬ

| Иконка | Файл | Описание | Где используется |
|--------|------|----------|------------------|
| <img src="/icons/coins.svg" width="24"/> | `coins.svg` | Монеты | Комиссии, бизнес-модель |

---

### 🔴 СТАТУСЫ ПОГОДЫ

| Иконка | Файл | Описание | Статус |
|--------|------|----------|--------|
| <img src="/icons/circle-check.svg" width="24"/> | `circle-check.svg` | Зеленый круг с галочкой | 🟢 Отлично (Excellent) |
| <img src="/icons/circle-alert.svg" width="24"/> | `circle-alert.svg` | Красный круг с восклицанием | 🔴 Опасно (Dangerous) |

---

### 🤝 ПАРТНЁРСТВА

| Иконка | Файл | Описание | Где используется |
|--------|------|----------|------------------|
| <img src="/icons/handshake.svg" width="24"/> | `handshake.svg` | Рукопожатие | Межоператорские партнёрства |

---

## 📂 УЖЕ СУЩЕСТВУЮЩИЕ ИКОНКИ

Эти иконки уже были в проекте:

| Файл | Описание | Формат |
|------|----------|--------|
| `volcano.svg` | Вулкан | SVG |
| `fishing.svg` | Рыбалка | SVG |
| `hiking.svg` | Пеший туризм | SVG |
| `bear.svg` | Медведь | SVG |
| `geyser.svg` | Гейзер | SVG |
| `hot-spring.svg` | Горячие источники | SVG |
| `partners.svg` | Партнёры | SVG |
| `tourists.svg` | Туристы | SVG |
| `tours.svg` | Туры | SVG |
| `star.svg` | Звезда (рейтинг) | SVG |

---

## 🎨 КАК ИСПОЛЬЗОВАТЬ

### В React компонентах:

```tsx
// Прямой импорт
<img src="/icons/ai-chip.svg" alt="AI" width={24} height={24} />

// С Next.js Image (рекомендуется)
import Image from 'next/image';

<Image 
  src="/icons/gift.svg" 
  alt="Loyalty" 
  width={24} 
  height={24}
/>

// Inline SVG для кастомизации цвета
<svg className="icon-custom">
  <use href="/icons/leaf.svg#icon" />
</svg>
```

### В CSS:

```css
.icon {
  width: 24px;
  height: 24px;
  color: currentColor; /* Наследует цвет текста */
}

.icon-large {
  width: 48px;
  height: 48px;
}
```

---

## 🎯 КАРТА ИСПОЛЬЗОВАНИЯ

### ГЛАВНАЯ СТРАНИЦА:

```
Hero Section:
├─ volcano.svg (badge "Экосистема туризма")

5 Инновационных фич:
├─ ai-chip.svg (AI Matching)
├─ gift.svg (Loyalty)
├─ bell-ring.svg (Notifications)
├─ leaf.svg (Eco)
└─ cloud-sun.svg (Weather)

10 Типов партнёров:
├─ user.svg (Турист)
├─ building.svg (Оператор)
├─ backpack.svg (Гид)
├─ car.svg (Трансфер)
├─ briefcase.svg (Агент)
├─ settings.svg (Админ)
├─ hotel.svg (Размещение)
├─ tent.svg (Снаряжение)
├─ key.svg (Авто)
└─ shopping-bag.svg (Сувениры)

Уровни операторов:
├─ badge-1.svg (L1)
├─ badge-2.svg (L2)
└─ badge-3.svg (L3)

Безопасность:
├─ shield-check.svg (секция безопасности)
├─ alert-circle.svg (SOS)
├─ map-pin.svg (геолокация)
└─ phone.svg (экстренные номера)

Партнёрства:
└─ handshake.svg (межоператорские)

Бизнес-модель:
└─ coins.svg (комиссии)
```

---

## ✅ ПОЛНЫЙ СПИСОК ФАЙЛОВ (27 иконок)

**Новые (26):**
1. `ai-chip.svg`
2. `alert-circle.svg`
3. `backpack.svg`
4. `badge-1.svg`
5. `badge-2.svg`
6. `badge-3.svg`
7. `bell-ring.svg`
8. `briefcase.svg`
9. `building.svg`
10. `car.svg`
11. `circle-alert.svg`
12. `circle-check.svg`
13. `cloud-sun.svg`
14. `coins.svg`
15. `gift.svg`
16. `handshake.svg`
17. `hotel.svg`
18. `key.svg`
19. `leaf.svg`
20. `map-pin.svg`
21. `phone.svg`
22. `settings.svg`
23. `shield-check.svg`
24. `shopping-bag.svg`
25. `tent.svg`
26. `user.svg`

**Существующие (10):**
1. `volcano.svg`
2. `fishing.svg`
3. `hiking.svg`
4. `bear.svg`
5. `geyser.svg`
6. `hot-spring.svg`
7. `partners.svg`
8. `tourists.svg`
9. `tours.svg`
10. `star.svg`

---

## 🚀 ГОТОВО К ИСПОЛЬЗОВАНИЮ!

Все иконки созданы в едином стиле (Heroicons/Lucide), готовы к интеграции в финальную версию главной страницы.

**Следующий шаг:** Интегрировать иконки в `/workspace/app/page.tsx`
