#!/usr/bin/env bash

set -e

### starts up a playwright docker container to run e2e tests

# Parse command line options:
#  --a11y                     runs the accessibility tests instead of the VRT
#  --renderer=<canvas|svg>    chart renderer under test (also `--renderer <name>`), default: $VRT_RENDERER or canvas
# Both are consumed here, not forwarded to playwright (it rejects unknown options).
A11Y_MODE=false
VRT_RENDERER="${VRT_RENDERER:-canvas}"
SCRIPT_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    --a11y)
      A11Y_MODE=true
      shift
      ;;
    --renderer=*)
      VRT_RENDERER="${1#--renderer=}"
      shift
      ;;
    --renderer)
      if [[ $# -lt 2 ]]; then
        echo "--renderer requires a value: canvas or svg"
        exit 1
      fi
      VRT_RENDERER="$2"
      shift 2
      ;;
    *)
      SCRIPT_ARGS+=("$1")
      shift
      ;;
  esac
done

if [[ "$VRT_RENDERER" != "canvas" && "$VRT_RENDERER" != "svg" ]]; then
  echo "Invalid renderer '${VRT_RENDERER}', expected canvas or svg"
  exit 1
fi
export VRT_RENDERER

# Get correct playwright image - must match installed version of @playwright/test
regex="@playwright/test@(.+)"
result="$(yarn list --pattern "@playwright/test" --depth=0 | grep playwright/test)"

if [[ $result =~ $regex ]]; then
  pw_version=${BASH_REMATCH[1]}
  pw_image="mcr.microsoft.com/playwright:v${pw_version}-noble"
else
  echo "Unable to find '@playwright/test' version"
  exit 1
fi

# Set container name and command based on mode
if [ "$A11Y_MODE" = true ]; then
  CONTAINER_NAME="e2e-playwright-a11y-tests"
  TEST_COMMAND="yarn test:playwright:a11y"
else
  CONTAINER_NAME="e2e-playwright-tests"
  TEST_COMMAND="yarn test:playwright"
fi

# Run e2e playwright tests inside container
docker run \
  --ipc host `# recommended by playwright, see https://playwright.dev/docs/docker#end-to-end-tests` \
  --platform linux/arm64 `# explicitly set platform` \
  --rm `# removes named container on every run` \
  --init `# handles terminating signals like SIGTERM` \
  --name ${CONTAINER_NAME} `# reusable name of container` \
  -e PORT=${PORT} `# port of local web server ` \
  -e ENV_URL=${ENV_URL} `# url of web server, overrides hostname and PORT ` \
  -e PLAYWRIGHT_HTML_REPORT=${PLAYWRIGHT_HTML_REPORT} `# where to save the playwright html report ` \
  -e VRT_FAST=${VRT_FAST} `# trades diagnostics for speed on local runs ` \
  -e VRT_RENDERER=${VRT_RENDERER} `# chart renderer under test: canvas (default) or svg ` \
  -w /app/e2e `# working directory` \
  -v $(pwd)/:/app/e2e `# mount local e2e/ directory in app/e2e directory in container` \
  -v $(pwd)/../e2e_server/tmp/:/app/e2e_server/tmp `# mount required example.json file in container` \
  ${pw_image} `# playwright docker image derived above from @playwright/test version used ` \
  ${TEST_COMMAND} "${SCRIPT_ARGS[@]}" # runs test script forwarding any additional passed args
