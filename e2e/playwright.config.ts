/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    // headless: false,
    locale: 'en-us',
    viewport: { width: 785, height: 600 },
    screenshot: 'off',
    video: 'retain-on-failure',
  },
  reporter: process.env.CI ? 'github' : [
    ['html', { open: 'never', outputFolder: 'report' }],
    ['list'],
  ],
  expect: {
    toMatchSnapshot: { threshold: 0.1 },
  },
  preserveOutput: 'failures-only',
  snapshotDir: 'screenshots',
  testDir: 'tests',
  outputDir: 'test-failures',
  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
      },
    },
  ],
};

export default config;
