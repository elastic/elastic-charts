#!/usr/bin/env bash

###
### global setup
###
source global_setup.sh


###
### install dependencies
###
echo " -- installing dependencies"
yarn install --frozen-lockfile


fossa analyze --output
