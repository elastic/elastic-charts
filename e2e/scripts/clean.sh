#!/usr/bin/env bash

set -e

### Finds and removes screenshots that are .gitignored to prevent commiting bad screenshots

# remove all .png files
find ./screenshots -type f -name '*.png' -not -name '*-linux.png' -exec rm {} +

# remove all .jpg and .jpeg files to enforce using .png images
find ./screenshots -type f -name '*.jpg' -exec rm {} +
find ./screenshots -type f -name '*.jpeg' -exec rm {} +
