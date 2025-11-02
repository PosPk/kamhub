# 🔄 Обновление через Timeweb API

## Быстрый способ обновить приложение через API

### Использование скрипта:

```bash
export TIMEWEB_TOKEN1=ваш_токен
./scripts/timeweb-api-deploy.sh
```

или

```bash
export TIMEWEB_TOKEN=ваш_токен  
./scripts/timeweb-trigger-rebuild.sh
```

### Прямой вызов API:

```bash
curl -X PATCH "https://api.timeweb.cloud/api/v1/apps/125051" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN1}" \
  -H "Content-Type: application/json" \
  -d '{"restart": true}'
```

### Что делает:

1. **PATCH запрос** - обновляет конфигурацию приложения
2. **restart: true** - перезапускает приложение
3. **rebuild: true** - инициирует пересборку (если поддерживается)

### Полезные API endpoints:

- **GET** `/api/v1/apps/125051` - информация о приложении
- **PATCH** `/api/v1/apps/125051` - обновление конфигурации
- **POST** `/api/v1/apps/125051/deploy` - запуск деплоя (если доступно)

### Пример ответа:

```json
{
  "id": 125051,
  "status": "deploying",
  "url": "kamchatour-125051.timeweb.cloud"
}
```

---

## ⚠️ Важно:

- Токен можно получить на https://timeweb.cloud/my/api
- Токен должен иметь права на управление приложениями
- После PATCH может потребоваться время на пересборку

---

## 📝 Интеграция в GitHub Actions:

```yaml
- name: Trigger Timeweb Rebuild
  run: |
    curl -X PATCH "https://api.timeweb.cloud/api/v1/apps/125051" \
      -H "Authorization: Bearer ${{ secrets.TIMEWEB_TOKEN1 }}" \
      -H "Content-Type: application/json" \
      -d '{"restart": true}'
```
