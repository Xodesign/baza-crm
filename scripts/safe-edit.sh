#!/bin/bash
# Скрипт безопасного редактирования
FILE="$1"
BACKUP_DIR="/home/user/baza/backups"

# Создать бэкап
mkdir -p "$BACKUP_DIR"
cp "$FILE" "$BACKUP_DIR/$(basename $FILE)_$(date +%Y%m%d_%H%M%S).bak"

# Запустить редактор
nano "$FILE"
