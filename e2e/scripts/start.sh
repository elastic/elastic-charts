#!/usr/bin/env bash

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
docker run -it --rm --name e2e-playwright-tests -w /usr/src/app/e2e -v $(pwd)/../:/usr/src/app/ ${pw_image} yarn test:playwright "$@"
