FROM mcr.microsoft.com/playwright:v1.18.0-focal

WORKDIR /app

# yarn.lock is duplicated at the root in postinstall script
# this allows for less of the image to be rebuilt when external
# dependecies change.
COPY package.json yarn.lock ./

RUN yarn install
# RUN yarn install --frozen-lockfile

COPY playwright.config.ts tsconfig.json ./

# copy test file into screenshots to set stored directory
COPY e2e /app/e2e

VOLUME /app/e2e

CMD ["yarn", "test"]
