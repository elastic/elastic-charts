#!/usr/bin/env bash

set -e

### Runs accessibility tests for screen reader summaries

attempt_counter=0
retries=5
interval=2

export PORT="${PORT:-9002}"

if [ -f /.dockerenv ]; then
  hostname=host.docker.internal
else
  hostname=localhost
  echo "
  !!! Warning: you are running e2e tests outside of docker !!!

  Please run 'yarn test:e2e:a11y' from the root package.json

  "
fi

export ENV_URL="${ENV_URL:-"http://${hostname}:${PORT}"}"

echo "Connected to e2e server at ${ENV_URL}"

# Install dependencies only e2e modules for testing
yarn install --frozen-lockfile

# Run playwright accessibility tests with passed args
playwright test --config=playwright.a11y.config.ts "$@"