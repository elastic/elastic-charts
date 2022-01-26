# Version must match `@playwright/test` in e2e/package.json
FROM mcr.microsoft.com/playwright:v1.18.0-focal

WORKDIR /e2e

# yarn.lock is duplicated at the root in postinstall script
# this allows for less of the image to be rebuilt when external
# dependecies change.
COPY package.json yarn.lock /e2e/

RUN yarn install
# RUN yarn install --frozen-lockfile

COPY playwright.config.ts tsconfig.json /e2e/

# Test file volume
VOLUME /e2e/tests

# Test file volume
VOLUME /e2e/screenshots

CMD "playwright test --workers=1 tests/*"
