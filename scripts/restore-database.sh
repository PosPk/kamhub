#!/bin/bash

# =============================================
# ВОССТАНОВЛЕНИЕ БАЗЫ ДАННЫХ ИЗ БЭКАПА
# Восстанавливает БД из указанного файла бэкапа
# =============================================

set -e

# Конфигурация
DB_NAME="${POSTGRES_DB:-kamchatour}"
DB_USER="${POSTGRES_USER:-kamuser}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Проверяем аргументы
if [ -z "$1" ]; then
    echo -e "${RED}❌ Ошибка: Укажите файл бэкапа${NC}"
    echo "Использование: $0 <backup_file>"
    echo ""
    echo -e "${YELLOW}Доступные бэкапы:${NC}"
    ls -lh "$BACKUP_DIR" | grep "backup_"
    exit 1
fi

BACKUP_FILE="$1"

# Проверяем существование файла
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Файл не найден: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  ВНИМАНИЕ: Все текущие данные будут удалены!${NC}"
echo -e "   База: ${RED}$DB_NAME${NC}"
echo -e "   Бэкап: ${YELLOW}$BACKUP_FILE${NC}"
echo ""
read -p "Продолжить? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${GREEN}Отменено${NC}"
    exit 0
fi

echo -e "${YELLOW}🔄 Восстанавливаем базу данных...${NC}"

# Распаковываем если .gz
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}📦 Распаковываем...${NC}"
    gunzip -k "$BACKUP_FILE"
    UNZIPPED_FILE="${BACKUP_FILE%.gz}"
else
    UNZIPPED_FILE="$BACKUP_FILE"
fi

# Останавливаем все подключения
echo -e "${YELLOW}🔌 Закрываем подключения...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"

# Удаляем и создаем базу заново
echo -e "${YELLOW}🗑️  Пересоздаем базу...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

# Восстанавливаем
echo -e "${YELLOW}📥 Восстанавливаем данные...${NC}"
if pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v "$UNZIPPED_FILE"; then
    echo -e "${GREEN}✅ База данных восстановлена успешно!${NC}"
    
    # Удаляем временный распакованный файл
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        rm "$UNZIPPED_FILE"
    fi
    
    # Отправляем уведомление
    if [ ! -z "$TELEGRAM_BOT_TOKEN" ] && [ ! -z "$TELEGRAM_CHAT_ID" ]; then
        MESSAGE="✅ База данных восстановлена\n📦 Из: $(basename $BACKUP_FILE)\n📅 Дата: $(date)"
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${MESSAGE}" \
            -d "parse_mode=HTML" > /dev/null
    fi
else
    echo -e "${RED}❌ Ошибка при восстановлении!${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Готово!${NC}"
