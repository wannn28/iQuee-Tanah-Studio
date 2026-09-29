#!/bin/sh
set -e
# Apply pending migrations (idempotent), then seed catalog data (upserts; never touches orders).
./node_modules/.bin/prisma migrate deploy
if [ "${RUN_SEED:-true}" = "true" ]; then node dist/seed.js; fi
exec "$@"
