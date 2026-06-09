#!/bin/bash
set -euo pipefail

# Remove all containers created by the judge service
containers=$(docker ps -aq --filter "label=managed-by=judge-service")
if [ -n "$containers" ]; then
  echo "Removing judge-managed containers..."
  docker rm -f $containers || true
else
  echo "No judge-managed containers found."
fi

# Prune unused volumes and containers (targeted)
echo "Pruning unused volumes and stopped containers..."
docker volume prune -f || true
docker container prune -f || true

# NOTE: Avoid `docker system prune -f` here; run manually if needed.

echo "Cleanup complete."
