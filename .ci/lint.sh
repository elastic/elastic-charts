#!/usr/bin/env bash

###
### global setup
###
source .ci/global_setup.sh

###
### building
###
echo " -- building"
yarn build

###
### run linter
###
echo " -- run linter"
yarn run github-checks-reporter yarn lint yarn lint

###
### run prettier check
###
echo " -- run prettier check"
yarn run github-checks-reporter yarn prettier yarn prettier:check
