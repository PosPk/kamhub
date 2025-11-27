#!/bin/bash

###############################################################################
# KAMHUB - КОМАНДЫ ДЕПЛОЯ НА 147.45.158.166
# Краткая шпаргалка для быстрого деплоя
###############################################################################

echo "🚀 KAMHUB - Деплой на 147.45.158.166"
echo "======================================"
echo ""

# ===================================
# ДАННЫЕ ДОСТУПА
# ===================================
SERVER_IP="147.45.158.166"
SERVER_USER="root"
SERVER_PASS="eiGo@VK4.,,VH7"

echo "IP:       $SERVER_IP"
echo "User:     $SERVER_USER"
echo "Password: $SERVER_PASS"
echo ""

# ===================================
# ВАРИАНТ 1: АВТОМАТИЧЕСКИЙ ДЕПЛОЙ
# ===================================

echo "📦 ВАРИАНТ 1: АВТОМАТИЧЕСКИЙ ДЕПЛОЙ (РЕКОМЕНДУЕТСЯ)"
echo ""
echo "ШАГ 1: Подключиться к серверу"
echo "  ssh root@147.45.158.166"
echo ""
echo "ШАГ 2: Запустить скрипт автодеплоя"
echo "  curl -o deploy.sh https://raw.githubusercontent.com/PosPk/kamhub/main/deploy-timeweb.sh"
echo "  chmod +x deploy.sh"
echo "  bash deploy.sh"
echo ""
echo "ШАГ 3: Заполнить .env"
echo "  cd /var/www/kamchatour"
echo "  nano .env"
echo "  # Добавить API ключи (см. ниже)"
echo ""
echo "ШАГ 4: Перезапустить"
echo "  pm2 restart kamchatour-hub"
echo ""
echo "ШАГ 5: Проверить"
echo "  pm2 status"
echo "  pm2 logs"
echo "  # Открыть: http://147.45.158.166"
echo ""

# ===================================
# API КЛЮЧИ (что нужно получить)
# ===================================

echo "======================================"
echo "🔑 API КЛЮЧИ (получить перед деплоем)"
echo "======================================"
echo ""
echo "1. Yandex Maps API:"
echo "   https://developer.tech.yandex.ru/"
echo "   → API ключи → JavaScript API"
echo "   Лимит: 25,000 запросов/день (бесплатно)"
echo ""
echo "2. GROQ API:"
echo "   https://console.groq.com/"
echo "   → API Keys → Create API Key"
echo "   Лимит: 14,400 запросов/день (бесплатно)"
echo ""
echo "3. DeepSeek API:"
echo "   https://platform.deepseek.com/"
echo "   → API Keys"
echo "   Бонус: \$5 бесплатных кредитов"
echo ""
echo "4. JWT_SECRET:"
echo "   openssl rand -base64 32"
echo ""

# ===================================
# МИНИМАЛЬНЫЙ .env
# ===================================

echo "======================================"
echo "📝 МИНИМАЛЬНЫЙ .env ФАЙЛ"
echo "======================================"
echo ""
cat << 'EOF'
# DATABASE (будет создана автоматически скриптом)
DATABASE_URL=postgresql://kamuser:ПАРОЛЬ_ИЗ_СКРИПТА@localhost:5432/kamchatour

# NEXT.JS
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://147.45.158.166:3002

# YANDEX (КРИТИЧНО!)
YANDEX_MAPS_API_KEY=ваш_ключ
YANDEX_WEATHER_API_KEY=8f6b0a53-135f-4217-8de1-de98c1316cc0

# AI (хотя бы один!)
GROQ_API_KEY=ваш_ключ
DEEPSEEK_API_KEY=ваш_ключ

# SECURITY (ОБЯЗАТЕЛЬНО!)
JWT_SECRET=ваш_сгенерированный_секрет
SESSION_SECRET=ваш_сгенерированный_секрет

# CLOUDPAYMENTS (опционально)
CLOUDPAYMENTS_PUBLIC_ID=
CLOUDPAYMENTS_API_SECRET=
EOF
echo ""

# ===================================
# ПОЛЕЗНЫЕ КОМАНДЫ
# ===================================

echo "======================================"
echo "🔧 ПОЛЕЗНЫЕ КОМАНДЫ"
echo "======================================"
echo ""
echo "PM2:"
echo "  pm2 status                    - статус приложения"
echo "  pm2 logs kamchatour-hub       - логи в реальном времени"
echo "  pm2 restart kamchatour-hub    - перезапуск"
echo "  pm2 monit                     - мониторинг ресурсов"
echo ""
echo "Nginx:"
echo "  systemctl status nginx        - статус Nginx"
echo "  systemctl reload nginx        - перезагрузить конфиг"
echo "  tail -f /var/log/nginx/kamchatour_access.log"
echo "  tail -f /var/log/nginx/kamchatour_error.log"
echo ""
echo "База данных:"
echo "  sudo -u postgres psql -d kamchatour"
echo "  psql -U kamuser -d kamchatour -h localhost"
echo ""
echo "Система:"
echo "  df -h                         - использование диска"
echo "  free -h                       - использование памяти"
echo "  htop                          - процессы"
echo ""

# ===================================
# РЕШЕНИЕ ПРОБЛЕМ
# ===================================

echo "======================================"
echo "⚠️  РЕШЕНИЕ ПРОБЛЕМ"
echo "======================================"
echo ""
echo "PM2 показывает 'errored':"
echo "  pm2 logs kamchatour-hub --lines 100"
echo "  # Проверить DATABASE_URL в .env"
echo "  # Проверить API ключи"
echo ""
echo "Nginx показывает 502:"
echo "  pm2 restart kamchatour-hub"
echo "  pm2 logs"
echo ""
echo "База данных не подключается:"
echo "  systemctl status postgresql"
echo "  systemctl start postgresql"
echo ""

# ===================================
# ONE-LINER КОМАНДА
# ===================================

echo "======================================"
echo "⚡ ONE-LINER (всё в одной команде)"
echo "======================================"
echo ""
echo 'ssh root@147.45.158.166 "curl -o deploy.sh https://raw.githubusercontent.com/PosPk/kamhub/main/deploy-timeweb.sh && chmod +x deploy.sh && bash deploy.sh"'
echo ""
echo "После выполнения:"
echo "  1. ssh root@147.45.158.166"
echo "  2. cd /var/www/kamchatour"
echo "  3. nano .env  # Заполнить API ключи"
echo "  4. pm2 restart kamchatour-hub"
echo ""

# ===================================
# ЧЕКЛИСТ
# ===================================

echo "======================================"
echo "✅ ЧЕКЛИСТ ДЕПЛОЯ"
echo "======================================"
echo ""
echo "☐ 1. Получить Yandex Maps API key"
echo "☐ 2. Получить GROQ API key"
echo "☐ 3. Получить DeepSeek API key"
echo "☐ 4. Сгенерировать JWT_SECRET"
echo "☐ 5. Подключиться к серверу SSH"
echo "☐ 6. Запустить deploy-timeweb.sh"
echo "☐ 7. Заполнить .env файл"
echo "☐ 8. Перезапустить PM2"
echo "☐ 9. Проверить работу"
echo "☐ 10. Настроить домен (опционально)"
echo "☐ 11. Установить SSL (опционально)"
echo ""

echo "======================================"
echo "✅ ГОТОВО К ДЕПЛОЮ!"
echo "======================================"
echo ""
echo "Полная документация: ДЕПЛОЙ_НА_147.45.158.166.md"
echo ""
echo "🏔️ Удачи! 🚀"
