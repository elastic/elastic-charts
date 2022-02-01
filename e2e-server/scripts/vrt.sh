#!/usr/bin/env bash
set -e

export TZ=UTC
export JEST_PUPPETEER_CONFIG=e2e-server/jest_puppeteer.config.js
FILE=e2e-server/tmp/examples.json

if [[ -n "${LOCAL_VRT_SERVER}" ]] && [[ ! -f "$FILE" ]]; then
  echo
  echo -e "\033[31m$FILE does not exist"
  echo -e "Please run yarn test:e2e-server:generate first"
  echo
  exit 1
fi


rm -rf ./e2e-server/tests/__image_snapshots__/__diff_output__

jest --verbose --rootDir=e2e-server -c=e2e-server/jest.config.js --runInBand "$@"
