#!/bin/bash

set -euo pipefail

cd '.buildkite'

echo '--- build pipeline'

yarn build:pipeline
