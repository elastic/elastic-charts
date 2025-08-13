#!/bin/bash

set -euo pipefail

cd '.buildkite'

echo '--- Build pipeline'

yarn build:pipeline

echo '--- Docker environment information'
docker --version
docker info | grep -E "Server Version:|Registry:"

echo '--- Pre-pulling Playwright Docker image for agent caching'

# Docker Playwright version must match package.json version of @playwright/test
PLAYWRIGHT_VERSION="1.47.2"

# This pre-pull will cache the image on each Buildkite agent,
# reducing the chance of network timeouts during the actual job execution.
# If pulling the image fails, we'll fail the CI run early at this stage.
if [ -n "$PLAYWRIGHT_VERSION" ]; then
  if ! docker pull "mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-focal"; then
    echo "Error: Failed to pre-pull Playwright image mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-focal"
    echo "This is likely a network connectivity issue with Microsoft Container Registry"
    exit 1
  fi
fi
