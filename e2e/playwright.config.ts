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
    headless: true,
    locale: 'en-us',
    viewport: { width: 785, height: 600 },
    trace: 'off',
    screenshot: 'off', // already testing screenshots
    video: process.env.CI ? 'off' : 'retain-on-failure',
  },
  reporter: process.env.CI ? 'github' : [['html', { open: 'never', outputFolder: 'report' }], ['list']],
  expect: {
    toMatchSnapshot: { threshold: 0 },
  },
  forbidOnly: Boolean(process.env.CI),
  timeout: 10 * 1000,
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
