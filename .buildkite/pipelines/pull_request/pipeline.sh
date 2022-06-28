#!/bin/bash

set -euo pipefail

cd '.buildkite'

echo '--- Build pipeline'

yarn build:pipeline
