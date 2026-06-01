#!/bin/bash

set -euo pipefail

cd '.buildkite'

# Yarn install completely silently:
yarn install 1>&2

# The new infra requires the pipeline to emit the steps
yarn -s print:pipeline
