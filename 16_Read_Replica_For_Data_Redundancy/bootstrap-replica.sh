#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="$(basename "$SCRIPT_DIR" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9._-]/-/g')"
NETWORK="${NETWORK:-${PROJECT_NAME}_postgres-net}"
PRIMARY_CONTAINER="${PRIMARY_CONTAINER:-postgres-primary}"
REPLICA_CONTAINER="${REPLICA_CONTAINER:-postgres-replica}"
REPLICA_VOLUME="${REPLICA_VOLUME:-${PROJECT_NAME}_replica-data}"

if ! docker compose -f "$COMPOSE_FILE" ps -q primary >/dev/null 2>&1; then
  echo "Starting primary container..."
  docker compose -f "$COMPOSE_FILE" up -d primary
fi

echo "Waiting for primary to accept connections..."
for i in {1..60}; do
  if docker exec "$PRIMARY_CONTAINER" psql -U postgres -d appdb -c 'SELECT 1' >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "Creating replication user if needed..."
docker exec "$PRIMARY_CONTAINER" psql -U postgres -d appdb -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'replicator') THEN CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'replica123'; END IF; END \$\$;" >/dev/null 2>&1 || true

echo "Removing any existing replica data from the named volume..."
docker volume rm "$REPLICA_VOLUME" >/dev/null 2>&1 || true

docker volume create "$REPLICA_VOLUME" >/dev/null 2>&1

echo "Bootstrapping replica with pg_basebackup..."
docker run --rm \
  --network "$NETWORK" \
  -e PGPASSWORD=replica123 \
  -v "$REPLICA_VOLUME":/var/lib/postgresql/data \
  postgres:16 \
  bash -c 'rm -rf /var/lib/postgresql/data/* /var/lib/postgresql/data/.[!.]* /var/lib/postgresql/data/..?* 2>/dev/null || true; pg_basebackup -h primary -U replicator -D /var/lib/postgresql/data -Fp -Xs -P -R'

echo "Replica data bootstrapped successfully."
echo "Starting replica container..."
docker compose -f "$COMPOSE_FILE" up -d replica
