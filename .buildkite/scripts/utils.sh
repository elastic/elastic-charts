#!/usr/bin/env bash

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

# If this yarn install is terminated early, e.g. if the build is cancelled in buildkite,
# A node module could end up in a bad state that can cause all future builds to fail
# So, let's cache clean and try again to make sure that's not what caused the error
install_deps() {
  yarn install --frozen-lockfile --prod
  EXIT=$?
  if [[ "$EXIT" != "0" ]]; then
    yarn cache clean
  fi
  return $EXIT
}
