#!/usr/bin/env bash

set -euo pipefail

echo "--- Setup pnpm"

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# corepack < 0.35 (bundled with node 22) cannot run pnpm 11+, it looks for a bin/pnpm.cjs they no longer ship
MIN_COREPACK_VERSION=0.35.0
CURRENT_COREPACK_VERSION="$(corepack --version 2>/dev/null || echo 0.0.0)"
if [[ "$(printf '%s\n' "$MIN_COREPACK_VERSION" "$CURRENT_COREPACK_VERSION" | sort -V | head -n1)" != "$MIN_COREPACK_VERSION" ]]; then
  echo " -- upgrading corepack $CURRENT_COREPACK_VERSION to $MIN_COREPACK_VERSION"
  npm install -g --silent "corepack@$MIN_COREPACK_VERSION"
fi

PNPM_VERSION="$(node -p "require('./package.json').engines.pnpm.replace(/^[^\d]*/, '')")"
corepack enable
corepack prepare "pnpm@${PNPM_VERSION}" --activate
echo " -- pnpm: version=$(pnpm --version)"
