#!/bin/sh
set -eu
cd /Users/davidyoung/app-containers-hub
# Rebuild only the small shared portal/gateway. Existing per-app previews stay up until gateway checks pass.
docker compose -f compose.yaml up -d --build customer-portal
./scripts/verify-shared-gateway.sh
# The shared gateway has passed every static route. Stop legacy per-preview containers (do not delete them).
# The shared gateway is verified; stop only legacy per-app static preview containers. Keep all production/backend app containers running.
legacy_names=$(docker ps --filter name=app-preview- --format '{{.Names}}')
if [ -n "$legacy_names" ]; then
  count=0
  while IFS= read -r name; do
    [ -n "$name" ] || continue
    docker stop "$name" >/dev/null
    count=$((count + 1))
  done <<EOF
$legacy_names
EOF
  echo "Stopped $count legacy static preview containers; retained them for rollback."
fi
# Keep apps with distinct production build/runtime needs isolated.
docker compose -f compose.runnable.yaml --profile runnable up -d anosera zehav tahnizhoo interactive-renders glowing-tardigrade todo-flow
docker compose -f compose.backend.yaml --profile backend up -d skyguard buildmaster magen-raki
./scripts/verify-all.sh
