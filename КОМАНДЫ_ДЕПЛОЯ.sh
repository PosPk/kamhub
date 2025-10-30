#!/bin/bash
# КОМАНДЫ ДЛЯ ДЕПЛОЯ НА TIMEWEB CLOUD

echo "🚀 ДЕПЛОЙ НА TIMEWEB CLOUD"
echo "=========================="
echo ""
echo "Выполните команды по порядку:"
echo ""

echo "📝 1. COMMIT И PUSH (если еще не сделали)"
echo "----------------------------------------"
cat << 'CMD1'
git add .
git commit -m "feat: production ready deployment for Timeweb Cloud"
git push origin main
CMD1

echo ""
echo "✅ После push Timeweb автоматически задеплоит приложение"
echo ""

echo "🔐 2. НАСТРОИТЬ СЕКРЕТЫ В TIMEWEB"
echo "---------------------------------"
echo "Перейти: https://timeweb.cloud/my/projects/1883095"
echo "Settings → Environment Variables → Add:"
echo ""
cat << 'CMD2'
DATABASE_URL=postgresql://user:pass@host:5432/kamchatour
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://kamchatour-1883095.timeweb.app
CMD2

echo ""
echo "🗄️ 3. ПРИМЕНИТЬ МИГРАЦИИ"
echo "------------------------"
echo "В Timeweb Terminal выполнить:"
echo ""
cat << 'CMD3'
npm run migrate:up
psql $DATABASE_URL -f lib/database/seat_holds_schema.sql
CMD3

echo ""
echo "✅ 4. ПРОВЕРИТЬ ПРИЛОЖЕНИЕ"
echo "-------------------------"
echo "Открыть: https://kamchatour-1883095.timeweb.app"
echo ""
cat << 'CMD4'
curl https://kamchatour-1883095.timeweb.app/api/health
curl https://kamchatour-1883095.timeweb.app/api/health/db
CMD4

echo ""
echo "🎉 ГОТОВО!"
echo ""
echo "📚 Полная инструкция: ДЕПЛОЙ_СЕЙЧАС.md"
