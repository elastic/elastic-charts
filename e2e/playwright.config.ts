/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PlaywrightTestConfig, expect } from '@playwright/test';
import * as pwExpect from 'expect-playwright';

expect.extend(pwExpect.matchers);

const isCI = process.env.CI === 'true';

const config: PlaywrightTestConfig = {
  use: {
    headless: true,
    locale: 'en-us',
    viewport: { width: 785, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'off', // already testing screenshots
    video: 'retain-on-failure',
    launchOptions: {
      ignoreDefaultArgs: ['--hide-scrollbars'],
      args: ['--use-gl=egl'],
    },
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/json/report.json' }],
  ],
  expect: {
    toMatchSnapshot: {
      threshold: 0,
      maxDiffPixelRatio: 0,
      maxDiffPixels: 0,
    },
  },
  retries: isCI ? 0 : 1, // retry for locally run tests
  forbidOnly: isCI,
  timeout: 10 * 1000,
  preserveOutput: 'failures-only',
  snapshotDir: 'screenshots',
  testDir: 'tests',
  outputDir: 'test_failures',
  fullyParallel: true, // all tests must be independent
  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
      },
    },
  ],
  webServer: isCI
    ? {
        command: 'yarn start',
        port: 9002,
        timeout: 120 * 1000,
        reuseExistingServer: process.env.CI !== 'true',
      }
    : undefined,
};

export default config;
