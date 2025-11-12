#!/bin/bash

# =============================================
# АВТОМАТИЧЕСКИЙ БЭКАП POSTGRESQL
# Создает ежедневные бэкапы с ротацией старых копий
# =============================================

set -e

# Конфигурация
DB_NAME="${POSTGRES_DB:-kamchatour}"
DB_USER="${POSTGRES_USER:-kamuser}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Создаем директорию для бэкапов
mkdir -p "$BACKUP_DIR"

# Имя файла бэкапа с датой
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

echo -e "${GREEN}🔄 Начинаем бэкап базы данных...${NC}"
echo -e "   База: ${YELLOW}$DB_NAME${NC}"
echo -e "   Хост: ${YELLOW}$DB_HOST:$DB_PORT${NC}"
echo -e "   Файл: ${YELLOW}$BACKUP_FILE${NC}"

# Создаем бэкап
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -F c -b -v -f "${BACKUP_FILE%.gz}" "$DB_NAME"; then
    # Сжимаем
    gzip "${BACKUP_FILE%.gz}"
    
    # Получаем размер
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo -e "${GREEN}✅ Бэкап создан успешно!${NC}"
    echo -e "   Размер: ${YELLOW}$SIZE${NC}"
    
    # Отправляем уведомление (если настроен Telegram)
    if [ ! -z "$TELEGRAM_BOT_TOKEN" ] && [ ! -z "$TELEGRAM_CHAT_ID" ]; then
        MESSAGE="✅ Бэкап БД создан успешно\n📦 Размер: $SIZE\n📅 Дата: $(date)"
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${MESSAGE}" \
            -d "parse_mode=HTML" > /dev/null
    fi
else
    echo -e "${RED}❌ Ошибка при создании бэкапа!${NC}"
    
    # Отправляем уведомление об ошибке
    if [ ! -z "$TELEGRAM_BOT_TOKEN" ] && [ ! -z "$TELEGRAM_CHAT_ID" ]; then
        MESSAGE="❌ Ошибка при создании бэкапа БД\n📅 Дата: $(date)"
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${MESSAGE}" \
            -d "parse_mode=HTML" > /dev/null
    fi
    
    exit 1
fi

# Удаляем старые бэкапы (старше RETENTION_DAYS дней)
echo -e "${YELLOW}🗑️  Удаляем старые бэкапы (старше ${RETENTION_DAYS} дней)...${NC}"
find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Показываем список бэкапов
echo -e "${GREEN}📦 Доступные бэкапы:${NC}"
ls -lh "$BACKUP_DIR" | grep "${DB_NAME}_backup_"

# Загружаем в S3 (если настроен)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo -e "${YELLOW}☁️  Загружаем в S3...${NC}"
    if aws s3 cp "$BACKUP_FILE" "s3://${AWS_S3_BUCKET}/backups/" --storage-class STANDARD_IA; then
        echo -e "${GREEN}✅ Загружено в S3${NC}"
    else
        echo -e "${RED}⚠️  Не удалось загрузить в S3${NC}"
    fi
fi

echo -e "${GREEN}🎉 Готово!${NC}"
