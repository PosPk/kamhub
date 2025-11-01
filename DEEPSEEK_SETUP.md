# 🤖 Настройка DeepSeek AI для ai.kam

## Что такое DeepSeek?

DeepSeek - это мощная AI модель от китайской компании DeepSeek AI, конкурент GPT-4.

**Преимущества:**
- ⚡ Быстрые ответы
- 💰 Низкая стоимость ($0.14 за 1M токенов)
- 🎯 Точные ответы
- 🌐 Поддержка русского языка
- 📚 Контекст до 64K токенов

## 📋 Шаги настройки

### 1. Получить API ключ

1. Зарегистрируйтесь на [DeepSeek Platform](https://platform.deepseek.com/)
2. Войдите в аккаунт
3. Перейдите в раздел [API Keys](https://platform.deepseek.com/api_keys)
4. Нажмите "Create API Key"
5. Скопируйте ключ (он покажется только один раз!)

### 2. Добавить ключ в проект

Откройте файл `.env.local` (или создайте, если нет):

```bash
# DeepSeek AI
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Перезапустить сервер

```bash
npm run dev
# или на production
pm2 restart kamchatour-hub
```

## 🧪 Проверка

### Проверить статус API:
```bash
curl http://localhost:3000/api/ai/deepseek/status
```

Ответ:
```json
{
  "success": true,
  "data": {
    "configured": true,
    "model": "deepseek-chat",
    "endpoint": "https://api.deepseek.com/v1/chat/completions"
  }
}
```

### Тестовый запрос:
```bash
curl -X POST http://localhost:3000/api/ai/deepseek \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Расскажи о вулкане Толбачик"
  }'
```

## 📱 Использование в UI

AI.Kam доступен через плавающую кнопку внизу экрана:
- Нажмите на иконку "AI.Kam" с красным badge
- Откроется модальное окно с помощником
- Задайте вопрос или выберите готовый вариант
- Получите ответ от DeepSeek AI

## 🎨 Кастомизация

### Изменить промпт AI:

Откройте `app/api/ai/deepseek/route.ts` и отредактируйте `systemPrompt`:

```typescript
const systemPrompt = `Ты AI.Kam - умный помощник по Камчатке.
// Добавьте свои инструкции...
`;
```

### Изменить параметры модели:

```typescript
{
  model: 'deepseek-chat',
  temperature: 0.7,  // 0.0-2.0 (креативность)
  max_tokens: 500,   // Максимум токенов в ответе
  stream: false,     // Потоковая передача
}
```

## 💰 Тарифы DeepSeek

| Модель | Цена за 1M input | Цена за 1M output |
|--------|------------------|-------------------|
| deepseek-chat | $0.14 | $0.28 |
| deepseek-coder | $0.14 | $0.28 |

**Пример стоимости:**
- 1000 запросов × 200 токенов = 200K токенов
- Стоимость: ~$0.03 💸

## 🔒 Безопасность

⚠️ **Важно:**
- Никогда не коммитьте `.env.local` в git
- Держите API ключ в секрете
- Используйте rate limiting для защиты от злоупотреблений

## 📚 Документация

- [DeepSeek API Docs](https://platform.deepseek.com/api-docs/)
- [DeepSeek Platform](https://platform.deepseek.com/)
- [DeepSeek Chat Model](https://platform.deepseek.com/docs/chat)

## 🆘 Troubleshooting

### Ошибка: "DeepSeek API key not configured"
**Решение:** Добавьте `DEEPSEEK_API_KEY` в `.env.local`

### Ошибка: "Failed to get response from AI"
**Решение:** Проверьте:
1. Валидность API ключа
2. Наличие средств на балансе
3. Доступность API (проверьте [status page](https://status.deepseek.com/))

### Медленные ответы
**Решение:** 
- Уменьшите `max_tokens`
- Включите `stream: true` для потоковой передачи
- Оптимизируйте промпт

## 🚀 Альтернативы

Если DeepSeek не подходит, можно использовать:
- **OpenAI GPT-4** (дороже, но мощнее)
- **Anthropic Claude** (хорошее качество)
- **YandexGPT** (российский аналог)
- **Llama 3** (open-source, можно разместить на своём сервере)

Замените endpoint в `route.ts` на нужный API.
