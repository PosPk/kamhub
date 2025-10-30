#!/bin/bash

#########################################
# SETUP BACKUP CRON JOB
# Настройка автоматического запуска backup
#########################################

set -euo pipefail

echo "========================================="
echo "  НАСТРОЙКА CRON JOB ДЛЯ BACKUP"
echo "========================================="

# Путь к скрипту backup
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/backup-db.sh"

if [ ! -f "$SCRIPT_PATH" ]; then
    echo "ERROR: backup-db.sh не найден: $SCRIPT_PATH"
    exit 1
fi

# Делаем скрипт исполняемым
chmod +x "$SCRIPT_PATH"

echo "📝 Скрипт backup: $SCRIPT_PATH"

# Проверяем существующие cron jobs
echo ""
echo "Существующие cron jobs для kamchatour:"
crontab -l 2>/dev/null | grep -i kamchatour || echo "Нет"

# Создаем временный файл с новым cron job
TEMP_CRON=$(mktemp)

# Копируем существующие cron jobs (если есть)
crontab -l 2>/dev/null | grep -v "kamchatour.*backup-db.sh" > "$TEMP_CRON" || true

# Добавляем новый cron job (каждые 6 часов)
echo "# Kamchatour DB Backup - каждые 6 часов" >> "$TEMP_CRON"
echo "0 */6 * * * $SCRIPT_PATH >> /var/log/kamchatour-backup.log 2>&1" >> "$TEMP_CRON"

# Устанавливаем новый crontab
crontab "$TEMP_CRON"
rm "$TEMP_CRON"

echo ""
echo "✅ Cron job добавлен!"
echo ""
echo "Расписание: каждые 6 часов (00:00, 06:00, 12:00, 18:00)"
echo "Лог: /var/log/kamchatour-backup.log"
echo ""
echo "Проверка установленного cron job:"
crontab -l | grep -i kamchatour

echo ""
echo "========================================="
echo "  НАСТРОЙКА ЗАВЕРШЕНА"
echo "========================================="
echo ""
echo "Для ручного запуска: $SCRIPT_PATH"
echo "Для просмотра логов: tail -f /var/log/kamchatour-backup.log"
echo ""
