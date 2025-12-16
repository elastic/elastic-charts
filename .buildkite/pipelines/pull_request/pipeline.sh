#!/bin/bash

set -euo pipefail

cd '.buildkite'

if [[ "${ELASTIC_BUILDKITE_INFRA:-}" =~ ^(1|true)$ ]]; then
  # Yarn install completely silently:
  yarn install 1>&2

  # The new infra requires the pipeline to emit the steps
  yarn -s print:pipeline > pipeline.debug.txt
  buildkite-agent artifact upload pipeline.debug.txt
  cat pipeline.debug.txt
else
  # The old infra required pipeline upload
  echo '--- Build pipeline'

  yarn build:pipeline
fi
