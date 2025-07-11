#!/usr/bin/env bash

set -e

### starts up a playwright docker container to run a11y e2e tests

# Get correct playwright image - must match installed version of @playwright/test
regex="@playwright/test@(.+)"
result="$(yarn list --pattern "@playwright/test" --depth=0 | grep playwright/test)"

if [[ $result =~ $regex ]]; then
  pw_version=${BASH_REMATCH[1]}
  pw_image="mcr.microsoft.com/playwright:v${pw_version}-focal"
else
  echo "Unable to find '@playwright/test' version"
  exit 1
fi

# Run e2e playwright accessibility tests inside container
docker run \
  --ipc host `# recommended by playwright, see https://playwright.dev/docs/docker#end-to-end-tests` \
  --platform linux/arm64 `# explicitly set platform` \
  --rm `# removes named container on every run` \
  --init `# handles terminating signals like SIGTERM` \
  --name e2e-playwright-a11y-tests `# reusable name of container` \
  -e PORT=${PORT} `# port of local web server ` \
  -e ENV_URL=${ENV_URL} `# url of web server, overrides hostname and PORT ` \
  -e PLAYWRIGHT_HTML_REPORT=${PLAYWRIGHT_HTML_REPORT} `# where to save the playwright html report ` \
  -w /app/e2e `# working directory` \
  -v $(pwd)/:/app/e2e `# mount local e2e/ directory in app/e2e directory in container` \
  -v $(pwd)/../e2e_server/tmp/:/app/e2e_server/tmp `# mount required example.json file in container` \
  ${pw_image} `# playwright docker image derived above from @playwright/test version used ` \
  yarn test:playwright:a11y "$@" # runs test-a11y.sh forwarding any additional passed args