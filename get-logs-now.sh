#!/bin/bash

# ЗАМЕНИТЕ на ваш токен из GitHub Secrets
TOKEN="ВАШ_ТОКЕН_ЗДЕСЬ"

echo "🔍 Получаю логи Timeweb Apps..."
echo ""

echo "=== RUNTIME LOGS ==="
curl -s "https://api.timeweb.cloud/api/v1/apps/125051/logs?type=runtime&limit=50" \
  -H "Authorization: Bearer $TOKEN" \
  | grep -o '"message":"[^"]*"' | sed 's/"message":"//g' | sed 's/"//g'

echo ""
echo ""
echo "=== APP STATUS ==="
curl -s "https://api.timeweb.cloud/api/v1/apps/125051" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "✅ Готово!"
