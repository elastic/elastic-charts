#!/usr/bin/env bash

# Absolute, since callers source this file and then change directory
BUILDKITE_SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

retry() {
  local retries=$1; shift
  local delay=$1; shift
  local attempts=1

  until "$@"; do
    retry_exit_status=$?
    echo "Exited with $retry_exit_status" >&2
    if (( retries == "0" )); then
      return $retry_exit_status
    elif (( attempts == retries )); then
      echo "Failed $attempts retries" >&2
      return $retry_exit_status
    else
      echo "Retrying $((retries - attempts)) more times..." >&2
      attempts=$((attempts + 1))
      sleep "$delay"
    fi
  done
}

# If this pnpm install is terminated early, e.g. if the build is cancelled in buildkite,
# A node module could end up in a bad state that can cause all future builds to fail
# So, let's prune the store and try again to make sure that's not what caused the error
install_deps() {
  bash "$BUILDKITE_SCRIPTS_DIR/purge_foreign_node_modules.sh"
  pnpm install --frozen-lockfile --prod --filter elastic-charts-buildkite --config.confirmModulesPurge=false
  EXIT=$?
  if [[ "$EXIT" != "0" ]]; then
    pnpm store prune
  fi
  return $EXIT
}
