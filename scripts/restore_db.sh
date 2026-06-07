#!/bin/bash
# scripts/restore_db.sh
# This script restores a MongoDB database from a compressed archive.

BACKUP_DIR="./backups"

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_filename>"
  echo "Available backups:"
  ls -1 $BACKUP_DIR
  exit 1
fi

FILENAME=$1

if [ ! -f "$BACKUP_DIR/$FILENAME" ]; then
  echo "❌ Error: Backup file $BACKUP_DIR/$FILENAME not found!"
  exit 1
fi

echo "⚠️  WARNING: This will overwrite the 'assessment_db' database!"
read -p "Are you sure you want to proceed? (y/N) " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
  echo "Starting restore from $BACKUP_DIR/$FILENAME..."
  
  # Restore to codespace_mongo
  cat $BACKUP_DIR/$FILENAME | docker exec -i codespace_mongo mongorestore --archive --gzip --drop
  
  if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
  else
    echo "❌ Restore failed!"
    exit 1
  fi
else
  echo "Restore cancelled."
fi
