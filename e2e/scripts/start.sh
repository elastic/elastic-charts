#!/usr/bin/env bash

set -e

### starts up a playwright docker container to run e2e tests

# Get correct playwright image - must match installed version of @playwright/test
regex="@playwright/test@(.+)"
result="$(yarn list --pattern "@playwright/test" --depth=0 | grep playwright/test)"
if [[ $result =~ $regex ]]
then
  pw_version=${BASH_REMATCH[1]}
  pw_image="mcr.microsoft.com/playwright:v${pw_version}-focal"
else
  echo "Unable to find '@playwright/test' version"
  exit 1
fi

# Run e2e playwright tests inside container
docker run --rm --init --cpus=5 --name e2e-playwright-tests -e PORT=${PORT} -e ENV_URL=${ENV_URL} -e PLAYWRIGHT_HTML_REPORT=${PLAYWRIGHT_HTML_REPORT} -w /app/e2e -v $(pwd)/../:/app/ ${pw_image} yarn test:playwright "$@"
