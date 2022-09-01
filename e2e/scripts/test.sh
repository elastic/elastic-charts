#!/usr/bin/env bash

set -e

### Runs prechecks on env url before running playwright e2e tests

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

  Please run 'yarn test' from e2e/package.json

  "
fi

export ENV_URL="${ENV_URL:-"http://${hostname}:${PORT}"}"

# until $(curl --output /dev/null --silent --head --fail ${ENV_URL}); do
#     if [ ${attempt_counter} -eq ${retries} ];then
#       echo "Failed to connect to e2e server at ${ENV_URL}"
#       exit 1
#     fi

#     echo "Connecting to e2e server..."

#     attempt_counter=$(($attempt_counter+1))
#     sleep ${interval}
# done

echo "Connected to e2e server at ${ENV_URL}"

# Install dependencies only e2e modules for testing
yarn install --frozen-lockfile

export VRT=true
# Run playwright tests with passed args
playwright test "$@"
