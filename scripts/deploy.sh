#!/bin/bash
# deploy.sh — pull latest code and redeploy all services
set -e

cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
git pull origin main

echo "==> Building images"
docker compose build --no-cache api celery agent frontend

echo "==> Running DB migrations"
docker compose run --rm api alembic upgrade head

echo "==> Restarting services"
docker compose up -d

echo "==> Cleaning up old images"
docker image prune -f

echo "==> Done. Status:"
docker compose ps
