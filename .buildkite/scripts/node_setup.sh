#!/usr/bin/env bash

set -euo pipefail

source .buildkite/scripts/utils.sh

echo "--- Setup Node"

ELASTIC_CHARTS_DIR=$(pwd)
CACHE_DIR="$HOME/.elastic-charts"

NODE_VERSION="$(cat "$ELASTIC_CHARTS_DIR/.node-version")"
NODE_DIR="$CACHE_DIR/node/$NODE_VERSION"
NODE_BIN_DIR="$NODE_DIR/bin"
PNPM_STORE_CACHE="$CACHE_DIR/pnpm-store"

## Install node for whatever the current os/arch are
hostArch="$(command uname -m)"
case "${hostArch}" in
  x86_64 | amd64) nodeArch="x64" ;;
  aarch64) nodeArch="arm64" ;;
  *) nodeArch="${hostArch}" ;;
esac
classifier="$nodeArch.tar.gz"

UNAME=$(uname)
OS="linux"
if [[ "$UNAME" = *"MINGW64_NT"* ]]; then
  OS="win"
  NODE_BIN_DIR="$HOME/node"
  classifier="x64.zip"
elif [[ "$UNAME" == "Darwin" ]]; then
  OS="darwin"
fi
echo " -- Running on OS: $OS"

nodeUrl="https://us-central1-elastic-kibana-184716.cloudfunctions.net/kibana-ci-proxy-cache/dist/v$NODE_VERSION/node-v$NODE_VERSION-${OS}-${classifier}"

echo " -- node: version=v${NODE_VERSION} dir=$NODE_DIR"

echo " -- setting up node.js"
if [ -x "$NODE_BIN_DIR/node" ] && [ "$("$NODE_BIN_DIR/node" --version)" == "v$NODE_VERSION" ]; then
  echo " -- reusing node.js install"
else
  if [ -d "$NODE_DIR" ]; then
    echo " -- clearing previous node.js install"
    rm -rf "$NODE_DIR"
  fi

  echo " -- downloading node.js from $nodeUrl"
  mkdir -p "$NODE_DIR"
  if [[ "$OS" == "win" ]]; then
    nodePkg="$NODE_DIR/${nodeUrl##*/}"
    curl --silent -L -o "$nodePkg" "$nodeUrl"
    unzip -qo "$nodePkg" -d "$NODE_DIR"
    mv "${nodePkg%.*}" "$NODE_BIN_DIR"
  else
    curl --silent -L "$nodeUrl" | tar -xz -C "$NODE_DIR" --strip-components=1
  fi
fi

export PATH="$NODE_BIN_DIR:$PATH"

source .buildkite/scripts/setup_pnpm.sh

# Move the prewarmed store into the repo so it's visible inside the docker plugin
# container (mounted at /app), where pnpm-workspace.yaml's storeDir points to it.
if [[ -d "$PNPM_STORE_CACHE" ]] && [[ ! -d "$ELASTIC_CHARTS_DIR/.pnpm-store" ]]; then
  echo " -- moving pnpm store to $ELASTIC_CHARTS_DIR/.pnpm-store"
  mv "$PNPM_STORE_CACHE" "$ELASTIC_CHARTS_DIR/.pnpm-store"
fi
