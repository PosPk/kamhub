#!/bin/bash

#########################################
# АВТОМАТИЧЕСКИЙ BACKUP БД
# Kamchatour Hub Database Backup Script
#########################################
#
# Функции:
# - Full backup PostgreSQL
# - Компрессия gzip
# - Загрузка в S3 / Cloud Storage
# - Удаление старых backup
# - Мониторинг и alerting
#
# Запуск: ./backup-db.sh
# Cron: 0 */6 * * * /path/to/backup-db.sh
#
#########################################

set -euo pipefail

# =============================================
# КОНФИГУРАЦИЯ
# =============================================

# Переменные окружения (или из .env файла)
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_NAME:-kamchatour}"
DB_USER="${DATABASE_USER:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD:-}"

# Директории
BACKUP_DIR="${BACKUP_DIR:-/var/backups/kamchatour}"
TEMP_DIR="/tmp/kamchatour-backup"
LOG_FILE="/var/log/kamchatour-backup.log"

# Retention (сколько хранить)
LOCAL_RETENTION_DAYS=7
S3_RETENTION_DAYS=30

# S3 / Cloud Storage (опционально)
S3_BUCKET="${S3_BUCKET:-kamchatour-backups}"
S3_PATH="db/"
ENABLE_S3="${ENABLE_S3:-false}"

# Telegram alerting (опционально)
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
ENABLE_TELEGRAM="${ENABLE_TELEGRAM:-false}"

# =============================================
# ФУНКЦИИ
# =============================================

# Логирование
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Отправка в Telegram
send_telegram() {
    if [ "$ENABLE_TELEGRAM" = "true" ] && [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
        local message="$1"
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d chat_id="${TELEGRAM_CHAT_ID}" \
            -d text="${message}" \
            -d parse_mode="HTML" > /dev/null 2>&1 || true
    fi
}

# Проверка зависимостей
check_dependencies() {
    log "Проверка зависимостей..."
    
    local deps=("pg_dump" "gzip")
    
    if [ "$ENABLE_S3" = "true" ]; then
        deps+=("aws")
    fi
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log "ERROR: Зависимость '$dep' не найдена!"
            send_telegram "🔴 <b>Backup failed</b>: $dep not found"
            exit 1
        fi
    done
    
    log "✅ Все зависимости установлены"
}

# Создание директорий
setup_directories() {
    log "Создание директорий..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$TEMP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    log "✅ Директории готовы"
}

# Экспорт переменных для pg_dump
export_db_vars() {
    if [ -n "$DB_PASSWORD" ]; then
        export PGPASSWORD="$DB_PASSWORD"
    fi
}

# Создание backup
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="kamchatour_${timestamp}.sql"
    local backup_path="${TEMP_DIR}/${backup_file}"
    local compressed_file="${backup_file}.gz"
    local compressed_path="${TEMP_DIR}/${compressed_file}"
    
    log "Начало backup: $backup_file"
    
    # pg_dump с опциями
    if pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=plain \
        --no-owner \
        --no-acl \
        --verbose \
        --file="$backup_path" 2>&1 | tee -a "$LOG_FILE"; then
        
        log "✅ pg_dump завершен успешно"
    else
        log "ERROR: pg_dump failed!"
        send_telegram "🔴 <b>Backup failed</b>: pg_dump error"
        exit 1
    fi
    
    # Проверка размера файла
    local file_size=$(stat -f%z "$backup_path" 2>/dev/null || stat -c%s "$backup_path" 2>/dev/null || echo 0)
    local file_size_mb=$((file_size / 1024 / 1024))
    
    log "Размер backup: ${file_size_mb} MB"
    
    if [ "$file_size" -lt 1024 ]; then
        log "ERROR: Backup file too small (${file_size} bytes)"
        send_telegram "🔴 <b>Backup failed</b>: File too small"
        exit 1
    fi
    
    # Компрессия
    log "Компрессия backup..."
    if gzip -9 "$backup_path"; then
        log "✅ Компрессия завершена"
    else
        log "ERROR: gzip failed!"
        send_telegram "🔴 <b>Backup failed</b>: Compression error"
        exit 1
    fi
    
    local compressed_size=$(stat -f%z "$compressed_path" 2>/dev/null || stat -c%s "$compressed_path" 2>/dev/null || echo 0)
    local compressed_size_mb=$((compressed_size / 1024 / 1024))
    local compression_ratio=$((100 - (compressed_size * 100 / file_size)))
    
    log "Сжатый размер: ${compressed_size_mb} MB (сжатие: ${compression_ratio}%)"
    
    # Копирование в backup директорию
    cp "$compressed_path" "${BACKUP_DIR}/${compressed_file}"
    log "✅ Backup сохранен локально: ${BACKUP_DIR}/${compressed_file}"
    
    # Загрузка в S3 (опционально)
    if [ "$ENABLE_S3" = "true" ]; then
        upload_to_s3 "$compressed_path" "$compressed_file"
    fi
    
    # Очистка temp
    rm -f "$compressed_path"
    
    # Отправка уведомления
    send_telegram "✅ <b>Backup успешен</b>
📊 Размер: ${compressed_size_mb} MB
💾 Сжатие: ${compression_ratio}%
📁 Файл: ${compressed_file}"
    
    log "✅ Backup завершен успешно: $compressed_file"
}

# Загрузка в S3
upload_to_s3() {
    local file_path="$1"
    local file_name="$2"
    local s3_url="s3://${S3_BUCKET}/${S3_PATH}${file_name}"
    
    log "Загрузка в S3: $s3_url"
    
    if aws s3 cp "$file_path" "$s3_url" --storage-class STANDARD_IA 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Backup загружен в S3"
    else
        log "WARNING: S3 upload failed (продолжаем без паники)"
        send_telegram "⚠️ <b>S3 upload warning</b>: Upload failed but local backup exists"
    fi
}

# Удаление старых локальных backup
cleanup_old_local_backups() {
    log "Очистка старых локальных backup (старше ${LOCAL_RETENTION_DAYS} дней)..."
    
    local deleted=0
    while IFS= read -r -d '' file; do
        log "Удаление: $file"
        rm -f "$file"
        ((deleted++))
    done < <(find "$BACKUP_DIR" -name "kamchatour_*.sql.gz" -type f -mtime "+${LOCAL_RETENTION_DAYS}" -print0 2>/dev/null || true)
    
    log "✅ Удалено старых backup: $deleted"
}

# Удаление старых S3 backup
cleanup_old_s3_backups() {
    if [ "$ENABLE_S3" = "true" ]; then
        log "Очистка старых S3 backup (старше ${S3_RETENTION_DAYS} дней)..."
        
        local cutoff_date=$(date -u -d "${S3_RETENTION_DAYS} days ago" +%Y-%m-%d 2>/dev/null || \
                           date -u -v-${S3_RETENTION_DAYS}d +%Y-%m-%d 2>/dev/null || \
                           echo "2000-01-01")
        
        aws s3 ls "s3://${S3_BUCKET}/${S3_PATH}" | while read -r line; do
            local file_date=$(echo "$line" | awk '{print $1}')
            local file_name=$(echo "$line" | awk '{print $4}')
            
            if [[ "$file_date" < "$cutoff_date" ]]; then
                log "Удаление из S3: $file_name"
                aws s3 rm "s3://${S3_BUCKET}/${S3_PATH}${file_name}" 2>&1 | tee -a "$LOG_FILE" || true
            fi
        done
        
        log "✅ Очистка S3 завершена"
    fi
}

# Проверка работоспособности последнего backup
verify_latest_backup() {
    log "Проверка последнего backup..."
    
    local latest=$(find "$BACKUP_DIR" -name "kamchatour_*.sql.gz" -type f -print0 | xargs -0 ls -t | head -n 1)
    
    if [ -z "$latest" ]; then
        log "WARNING: Нет backup файлов!"
        send_telegram "⚠️ <b>Warning</b>: No backup files found"
        return 1
    fi
    
    local age_hours=$(( ($(date +%s) - $(stat -f%m "$latest" 2>/dev/null || stat -c%Y "$latest" 2>/dev/null || echo 0)) / 3600 ))
    
    log "Последний backup: $latest (возраст: ${age_hours}ч)"
    
    # Проверка целостности gzip
    if gzip -t "$latest" 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Backup целостный"
        return 0
    else
        log "ERROR: Backup поврежден!"
        send_telegram "🔴 <b>Critical</b>: Latest backup is corrupted!"
        return 1
    fi
}

# Статистика backup
show_statistics() {
    log "==================== СТАТИСТИКА ===================="
    
    local total_backups=$(find "$BACKUP_DIR" -name "kamchatour_*.sql.gz" -type f | wc -l | tr -d ' ')
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}')
    
    log "Всего backup: $total_backups"
    log "Общий размер: $total_size"
    log "Retention локально: ${LOCAL_RETENTION_DAYS} дней"
    log "Retention S3: ${S3_RETENTION_DAYS} дней"
    log "===================================================="
}

# =============================================
# MAIN
# =============================================

main() {
    log "========================================="
    log "  KAMCHATOUR HUB DATABASE BACKUP"
    log "========================================="
    
    # Проверки
    check_dependencies
    setup_directories
    export_db_vars
    
    # Создание backup
    create_backup
    
    # Очистка старых backup
    cleanup_old_local_backups
    cleanup_old_s3_backups
    
    # Проверка
    verify_latest_backup
    
    # Статистика
    show_statistics
    
    log "========================================="
    log "  BACKUP ЗАВЕРШЕН УСПЕШНО"
    log "========================================="
}

# Запуск
main "$@"
