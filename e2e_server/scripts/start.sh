#!/usr/bin/sh

export TZ=UTC
export RNG_SEED=elastic-charts
export NODE_ENV=development
export NODE_OPTIONS=--openssl-legacy-provider

FILE=e2e_server/tmp/examples.json

if [[ -n "${LOCAL_VRT_SERVER}" ]] && [[ ! -f "$FILE" ]]; then
  echo
  echo -e "\033[31m$FILE does not exist"
  echo -e "Please run yarn test:e2e:generate first"
  echo
  exit 1
fi

cd e2e_server/server

node ../../node_modules/webpack/bin/webpack.js serve --progress "$@"
