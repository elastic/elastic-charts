#!/usr/bin/env bash

set -e

### Runs prechecks on env url before running playwright e2e tests

attempt_counter=0
retries=5
interval=2

# Parse command line options
A11Y_MODE=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --a11y)
      A11Y_MODE=true
      shift
      ;;
    *)
      break
      ;;
  esac
done

export PORT="${PORT:-9002}"

if [ -f /.dockerenv ]; then
  hostname=host.docker.internal
else
  hostname=localhost
  if [ "$A11Y_MODE" = true ]; then
    echo "
  !!! Warning: you are running e2e tests outside of docker !!!

  Please run 'yarn test:e2e:a11y' from the root package.json

  "
  else
    echo "
  !!! Warning: you are running e2e tests outside of docker !!!

  Please run 'yarn test' from e2e/package.json

  "
  fi
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

# This setting is used to "seed" randomized data of the charts,
# so while it says VRT, we enabled it for A11y tests as well.
export VRT=true

# Set up environment and run tests based on mode
if [ "$A11Y_MODE" = true ]; then
  # Run playwright accessibility tests with passed args
  playwright test --config=playwright.a11y.config.ts "$@"
else
  # Run playwright tests with passed args
  playwright test "$@"
fi
