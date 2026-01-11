#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

BRANCH="${BRANCH:-staging}"
ENV_FILE="${ENV_FILE:-.env.staging}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.staging.yml}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Env file not found: $ENV_FILE" >&2
  echo "Create it from .env.staging.example (see STAGING_DEPLOY.md)." >&2
  exit 1
fi

echo "==> Updating code (branch: $BRANCH)"
git fetch origin

git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Rebuilding and restarting containers"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build

echo "==> Running migrations"
# If this fails due to backend not ready yet, rerun the same line.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T backend yarn migration:run

echo "==> Done"
