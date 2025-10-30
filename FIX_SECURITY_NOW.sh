#!/bin/bash
# БЫСТРОЕ ИСПРАВЛЕНИЕ БЕЗОПАСНОСТИ - 30 СЕКУНД

echo "🔒 БЫСТРОЕ ИСПРАВЛЕНИЕ БЕЗОПАСНОСТИ"
echo "==================================="
echo ""

# Удаляем token.txt из git
if git ls-files | grep -q "^token\.txt$"; then
    echo "📝 Удаление token.txt из git..."
    git rm token.txt
    echo "✓ token.txt удален"
else
    echo "✓ token.txt уже не отслеживается"
fi

# Удаляем лишние .env файлы
echo ""
echo "📝 Удаление лишних .env файлов..."
git rm --cached .env.timeweb-ai .env.timeweb-apps .env.production.example .env.local.example 2>/dev/null || echo "✓ Уже удалены"

# Коммитим изменения .gitignore
echo ""
echo "📝 Обновление .gitignore..."
git add .gitignore
git add SECURITY_SCAN_REPORT.md

echo ""
echo "📝 Создание commit..."
git commit -m "security: remove sensitive files and improve .gitignore

- Remove token.txt from repository
- Remove unnecessary .env template files
- Update .gitignore to prevent future leaks
- Add security scan report

See SECURITY_SCAN_REPORT.md for details"

echo ""
echo "✅ ГОТОВО!"
echo ""
echo "Следующие шаги:"
echo "1. Push изменения: git push"
echo "2. Настройте секреты в Timeweb Cloud UI"
echo "3. См. SECURITY_SCAN_REPORT.md для подробностей"
echo ""
