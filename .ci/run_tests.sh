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

###
### install codecov dependencies
###
echo " -- installing codecov dependencies"
yarn add codecov --prefer-offline --frozen-lockfile

###
### building
###
echo " -- building"
yarn build

###
### run linter
###
echo " -- run linter"
yarn lint

###
### run prettier check
###
echo " -- run prettier check"
yarn prettier:check

###
### timezone specific testing
###
echo " -- tz testing"
yarn test:tz --ci

###
### testing
###
echo " -- testing"
yarn test --coverage --ci

###
### upload code coverage
###
echo " -- upload code coverage"
./node_modules/.bin/codecov

###
### visual testing
###
echo " -- visual testing"
yarn test:integration --ci
