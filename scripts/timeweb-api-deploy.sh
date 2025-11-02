#!/bin/bash
# Timeweb Cloud Apps API Deploy Script
# Использует PATCH для обновления приложения через API

set -e

APP_ID="125051"
API_URL="https://api.timeweb.cloud/api/v1/apps/${APP_ID}"
TIMEWEB_TOKEN="${TIMEWEB_TOKEN1:-${TIMEWEB_TOKEN:-}}"

if [ -z "$TIMEWEB_TOKEN" ]; then
  echo "❌ Ошибка: TIMEWEB_TOKEN не установлен"
  echo ""
  echo "Установите токен:"
  echo "  export TIMEWEB_TOKEN1=ваш_токен"
  echo "  или"
  echo "  export TIMEWEB_TOKEN=ваш_токен"
  exit 1
fi

echo "🚀 Обновление приложения через Timeweb API..."
echo "   App ID: ${APP_ID}"
echo "   API: ${API_URL}"
echo ""

# Вариант 1: Триггер деплоя через обновление конфигурации
echo "📡 Отправка PATCH запроса..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "${API_URL}" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "restart": true
  }' 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 202 ]; then
  echo "✅ Успешно! HTTP ${HTTP_CODE}"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
  echo "❌ Ошибка! HTTP ${HTTP_CODE}"
  echo "$BODY"
  exit 1
fi

echo ""
echo "⏳ Ожидание деплоя..."
sleep 5

# Проверка статуса
echo "📊 Проверка статуса приложения..."

STATUS=$(curl -s "${API_URL}" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN}" | jq -r '.status // .state // "unknown"' 2>/dev/null || echo "unknown")

echo "   Статус: ${STATUS}"

# Проверка URL приложения
APP_URL=$(curl -s "${API_URL}" \
  -H "Authorization: Bearer ${TIMEWEB_TOKEN}" | jq -r '.url // .domains[0] // "unknown"' 2>/dev/null || echo "unknown")

if [ "$APP_URL" != "unknown" ] && [ -n "$APP_URL" ]; then
  echo "   URL: https://${APP_URL}"
  echo ""
  echo "🔍 Проверка health endpoint..."
  sleep 3
  curl -s "https://${APP_URL}/api/health" | jq '.' 2>/dev/null || echo "Health check pending..."
fi

echo ""
echo "✅ Готово!"
