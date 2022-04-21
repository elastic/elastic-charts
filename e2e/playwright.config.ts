/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PlaywrightTestConfig } from '@playwright/test';

const isCI = process.env.CI === 'true';

const config: PlaywrightTestConfig = {
  use: {
    headless: true,
    locale: 'en-us',
    viewport: { width: 785, height: 600 },
    trace: 'off',
    screenshot: 'off', // already testing screenshots
    video: 'retain-on-failure',
    launchOptions: {
      ignoreDefaultArgs: ['--hide-scrollbars'],
      args: ['--use-gl=egl'],
    },
  },
  reporter: [['html', { open: 'never', outputFolder: 'html_report' }], isCI ? ['line'] : ['list']],
  expect: {
    toMatchSnapshot: {
      threshold: 0,
      // This is to allow a 2 px diff whenever expectChartWithMouseAtUrlToMatchScreenshot is used
      // https://buildkite.com/elastic/elastic-charts-ci/builds/237#36e8d2d7-2cc0-473b-9c10-1fdab7df1fef/162
      maxDiffPixels: 4,
    },
  },
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
};

export default config;
