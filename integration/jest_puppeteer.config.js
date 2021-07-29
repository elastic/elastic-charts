/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const getConfig = require('jest-puppeteer-docker/lib/config');

const { debug, port, isLocalVRTServer, isLegacyVRTServer } = require('./config');

const baseConfig = debug ? {} : getConfig();

const defaultViewport = {
  width: 800,
  height: 600,
};
const sharedConfig = {
  defaultViewport,
  ignoreHTTPSErrors: true,
};

/**
 * combined config object
 *
 * https://github.com/smooth-code/jest-puppeteer/tree/master/packages/jest-environment-puppeteer#jest-puppeteerconfigjs
 */
const customConfig = {
  ...(debug
    ? {
        launch: {
          args: ['--no-sandbox'], // required to connect puppeteer to chromium devtools ws
          dumpio: false,
          headless: false,
          slowMo: 500,
          devtools: true,
          ...sharedConfig,
        },
      }
    : {
        // https://github.com/gidztech/jest-puppeteer-docker/issues/24
        chromiumFlags: [], // for docker chromium options
        connect: {
          ...sharedConfig,
        },
      }),
  server: isLocalVRTServer
    ? null
    : {
        command: isLegacyVRTServer
          ? `yarn start --port=${port} --quiet`
          : `yarn test:integration:server --port=${port}`,
        port,
        usedPortAction: 'error',
        launchTimeout: 150000,
        ...(!isLegacyVRTServer && {
          waitOnScheme: {
            // using localhost as the server is running on the local machine
            resources: [`http://localhost:${port}`],
            // delay for the initial check request
            delay: 1000,
            // interval for subsequent requests
            interval: 250,
          },
        }),
        debug: true,
      },
  ...baseConfig,
};

module.exports = customConfig;
