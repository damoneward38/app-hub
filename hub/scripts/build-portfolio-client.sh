#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"$ROOT/build-contexts/portfolio-api/node_modules/.bin/tsc" -p "$ROOT/build-contexts/portfolio-client/tsconfig.json"
echo "built public/portfolio-client.js"
