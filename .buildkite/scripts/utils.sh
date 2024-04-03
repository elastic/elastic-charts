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

# If npm install is terminated early, e.g. because the build was cancelled in buildkite,
# a package directory is left behind in a bad state that can cause all subsequent installs to fail
# So this function contains some cleanup/retry logic to try to recover from this kind of situation
npm_install_global() {
  package="$1"
  version="${2:-latest}"
  toInstall="$package@$version"

  npmRoot=$(npm root -g)
  packageRoot="${npmRoot:?}/$package"

  # The success flag file exists just to try to make sure we know that the full install was done
  # For example, if a job terminates in the middle of npm install, a directory could be left behind that we don't know the state of
  successFlag="${packageRoot:?}/.install-success"

  if [[ -d "$packageRoot" && ! -f "$successFlag" ]]; then
    echo "Removing existing package directory $packageRoot before install, seems previous installation was not successful"
    rm -rf "$packageRoot"
  fi

  if [[ ! $(npm install -g "$toInstall" && touch "$successFlag") ]]; then
    rm -rf "$packageRoot"
    echo "Trying again to install $toInstall..."
    npm install -g "$toInstall" && touch "$successFlag"
  fi
}
