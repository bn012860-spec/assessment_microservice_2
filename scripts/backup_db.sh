#!/bin/bash
# scripts/backup_db.sh
# This script creates a compressed backup of the MongoDB database.

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="assessment_db_$TIMESTAMP.gz"

mkdir -p $BACKUP_DIR

echo "Starting backup of assessment_db..."

# If running on host and mongo is in docker
docker exec codespace_mongo mongodump --db assessment_db --archive --gzip > $BACKUP_DIR/$FILENAME

if [ $? -eq 0 ]; then
  echo "✅ Backup created successfully: $BACKUP_DIR/$FILENAME"
  # Keep only last 7 days of backups
  find $BACKUP_DIR -name "assessment_db_*.gz" -mtime +7 -delete
  echo "Cleaned up old backups."
else
  echo "❌ Backup failed!"
  exit 1
fi
