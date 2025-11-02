#!/bin/bash
# Скрипт для триггера пересборки приложения через Timeweb API

APP_ID="125051"
API_URL="https://api.timeweb.cloud/api/v1/apps/${APP_ID}"
TIMEWEB_TOKEN="${TIMEWEB_TOKEN1:-${TIMEWEB_TOKEN:-}}"

if [ -z "$TIMEWEB_TOKEN" ]; then
  echo "❌ TIMEWEB_TOKEN не найден"
  exit 1
fi

echo "🔄 Триггер пересборки приложения ${APP_ID}..."

# PATCH для обновления приложения (может триггерить деплой)
RESPONSE=$(curl -s -X PATCH "${API_URL}" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "restart": true,
    "rebuild": true
  }' 2>&1)

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Альтернатива: GET для получения информации и POST для деплоя
echo ""
echo "📋 Информация о приложении:"
curl -s -X GET "${API_URL}" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN}" | jq '{id, name, status, url}' 2>/dev/null || echo "Ошибка получения информации"
