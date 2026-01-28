#!/bin/bash

# 🧳 ТЕСТ ПОЛНОГО ПУТИ ТУРИСТА
# Скрипт для тестирования всех функций туриста

set -e

API_URL="${API_URL:-http://localhost:3000}"
EMAIL="tourist-$(date +%s)@test.com"
PASSWORD="TestPassword123!"
NAME="Иван Петров"

echo "=================================================="
echo "🧳 ТЕСТИРОВАНИЕ ПОЛНОГО ПУТИ ТУРИСТА"
echo "=================================================="
echo "API URL: $API_URL"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

test_count=0
success_count=0
fail_count=0

# Функция для тестирования
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  test_count=$((test_count + 1))
  
  echo -n "${BLUE}[${test_count}]${NC} $description... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      "$API_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$API_URL$endpoint")
  fi
  
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | sed '$d')
  
  if [[ $http_code -lt 400 ]]; then
    echo -e "${GREEN}✓ ($http_code)${NC}"
    success_count=$((success_count + 1))
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  else
    echo -e "${RED}✗ ($http_code)${NC}"
    fail_count=$((fail_count + 1))
    echo "Error: $body"
  fi
  echo ""
}

# ================================================
# ЭТАП 1: РЕГИСТРАЦИЯ И ВХОД
# ================================================
echo -e "${YELLOW}ЭТАП 1: Регистрация и вход${NC}"
echo "=================================="

# Регистрация
echo "1.1 Регистрация новго пользователя..."
register_data=$(cat <<EOF
{
  "email": "$EMAIL",
  "password": "$PASSWORD",
  "fullName": "$NAME",
  "role": "tourist"
}
EOF
)

register_response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$register_data" \
  "$API_URL/api/auth/register")

echo "Ответ: $register_response" | jq '.' 2>/dev/null || echo "$register_response"

TOKEN=$(echo "$register_response" | jq -r '.token // .data.token // empty' 2>/dev/null)
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  # Пытаемся логиниться если регистрация не прошла
  echo "Попытка логина..."
  login_data=$(cat <<EOF
{
  "email": "$EMAIL",
  "password": "$PASSWORD"
}
EOF
  )
  
  login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$login_data" \
    "$API_URL/api/auth/login")
  
  echo "Ответ: $login_response" | jq '.' 2>/dev/null || echo "$login_response"
  TOKEN=$(echo "$login_response" | jq -r '.token // .data.token // empty' 2>/dev/null)
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}Не удалось получить токен!${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Получен токен: ${TOKEN:0:50}...${NC}"
echo ""

# ================================================
# ЭТАП 2: ПРОСМОТР ТУРОВ
# ================================================
echo -e "${YELLOW}ЭТАП 2: Просмотр туров${NC}"
echo "=================================="

test_endpoint "GET" "/api/tours" "" "Получение списка туров"
test_endpoint "GET" "/api/tours/search?difficulty=easy" "" "Поиск туров по сложности"
test_endpoint "GET" "/api/tours/recommendations" "" "Получение рекомендаций"

# ================================================
# ЭТАП 3: ПОГОДА
# ================================================
echo -e "${YELLOW}ЭТАП 3: Проверка погоды${NC}"
echo "=================================="

test_endpoint "GET" "/api/weather?latitude=53.0195&longitude=158.6505" "" "Получение текущей погоды"
test_endpoint "GET" "/api/weather/forecast?days=7" "" "Получение прогноза"

# ================================================
# ЭТАП 4: РАЗМЕЩЕНИЯ
# ================================================
echo -e "${YELLOW}ЭТАП 4: Размещения${NC}"
echo "=================================="

test_endpoint "GET" "/api/accommodations" "" "Список размещений"

# ================================================
# ЭТАП 5: ТРАНСФЕРЫ
# ================================================
echo -e "${YELLOW}ЭТАП 5: Трансферы${NC}"
echo "=================================="

test_endpoint "GET" "/api/transfers" "" "Список трансферов"

# ================================================
# ЭТАП 6: СНАРЯЖЕНИЕ
# ================================================
echo -e "${YELLOW}ЭТАП 6: Снаряжение${NC}"
echo "=================================="

test_endpoint "GET" "/api/gear" "" "Список снаряжения"

# ================================================
# ЭТАП 7: БРОНИРОВАНИЕ
# ================================================
echo -e "${YELLOW}ЭТАП 7: Бронирование${NC}"
echo "=================================="

test_endpoint "GET" "/api/bookings" "" "Мои бронирования"

# ================================================
# ЭТАП 8: ЛОЯЛЬНОСТЬ
# ================================================
echo -e "${YELLOW}ЭТАП 8: Лояльность и эко-баллы${NC}"
echo "=================================="

test_endpoint "GET" "/api/loyalty/profile" "" "Профиль лояльности"
test_endpoint "GET" "/api/loyalty/points" "" "Баллы лояльности"
test_endpoint "GET" "/api/eco-points" "" "Эко-баллы"

# ================================================
# ЭТАП 9: ОТЗЫВЫ
# ================================================
echo -e "${YELLOW}ЭТАП 9: Отзывы${NC}"
echo "=================================="

test_endpoint "GET" "/api/reviews" "" "Мои отзывы"

# ================================================
# ИТОГИ
# ================================================
echo ""
echo "=================================================="
echo "📊 ИТОГИ ТЕСТИРОВАНИЯ"
echo "=================================================="
echo "Всего тестов: $test_count"
echo -e "Успешно: ${GREEN}$success_count${NC}"
echo -e "Ошибок: ${RED}$fail_count${NC}"
echo "Успешность: $((success_count * 100 / test_count))%"
echo "=================================================="
