#!/usr/bin/env bash

###
### global setup
###
source .ci/global_setup.sh


###
### removing the unused canvas package conflicting with the CI missing C++ lib
###
yarn remove canvas

VRTS_FILES=$1
###
### visual testing
###
echo " -- visual testing"

yarn test:integration:generate
yarn test:integration --ci $VRTS_FILES
