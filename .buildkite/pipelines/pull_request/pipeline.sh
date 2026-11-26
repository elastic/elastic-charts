#!/bin/bash

set -euo pipefail

cd '.buildkite'

# pnpm install completely silently:
pnpm install --frozen-lockfile --filter elastic-charts-buildkite 1>&2

# The new infra requires the pipeline to emit the steps
pnpm -s print:pipeline
