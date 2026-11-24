#!/usr/bin/env bash

set -euo pipefail

echo "--- Setup pnpm"

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
PNPM_VERSION="$(node -p "require('./package.json').engines.pnpm.replace(/^[^\d]*/, '')")"
corepack enable
corepack prepare "pnpm@${PNPM_VERSION}" --activate
echo " -- pnpm: version=$(pnpm --version)"
