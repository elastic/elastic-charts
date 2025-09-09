#!/bin/bash

set -euo pipefail

cd '.buildkite'

if [[ "${ELASTIC_BUILDKITE_INFRA:-}" =~ ^(1|true)$ ]]; then
  # The new infra requires the pipeline to emit the steps
  yarn -s print:pipeline
else
  # The old infra required pipeline upload
  echo '--- Build pipeline'

  yarn build:pipeline
fi
