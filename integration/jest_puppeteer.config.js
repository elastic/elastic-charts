/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const getConfig = require('jest-puppeteer-docker/lib/config');

const isDebug = process.env.DEBUG === 'true';
const baseConfig = isDebug ? {} : getConfig();
const defaults = require('./defaults');

const port = process.env.PORT || defaults.PORT;
const useLocalStorybook = process.env.LOCAL_STORYBOOK_VRT || defaults.LOCAL_STORYBOOK_VRT;

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
  ...(isDebug
    ? {
        launch: {
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
  server: useLocalStorybook
    ? null
    : {
        command: `yarn start --port=${port} --quiet`,
        port,
        usedPortAction: 'error',
        launchTimeout: 120000,
        debug: true,
      },
  ...baseConfig,
};

module.exports = customConfig;
