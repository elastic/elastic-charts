/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { PlaywrightTestConfig } from '@playwright/test';
import { expect } from '@playwright/test';
import * as pwExpect from 'expect-playwright';

import { snapshotDir } from './e2e_config';

expect.extend(pwExpect.matchers);

const isCI = process.env.CI === 'true';

// On sharded CI runs each shard emits a `blob` report that is later merged into a
// single HTML report via `playwright merge-reports`. Locally we keep the directly
// viewable `html` report.
const useBlobReport = process.env.PLAYWRIGHT_BLOB_REPORT === 'true';

const fastMode = process.env.VRT_FAST === 'true';

const config: PlaywrightTestConfig = {
  use: {
    headless: true,
    locale: 'en-us',
    viewport: { width: 785, height: 1000 },
    trace: fastMode ? 'off' : 'retain-on-failure',
    screenshot: 'off', // already testing screenshots
    video: fastMode ? 'off' : 'retain-on-failure',
    launchOptions: {
      ignoreDefaultArgs: ['--hide-scrollbars'],
      args: ['--use-gl=egl'],
    },
  },
  reporter: [
    ['list'],
    useBlobReport ? ['blob', { outputDir: 'reports/blob' }] : ['html', { open: 'never', outputFolder: 'reports/html' }],
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
  // one `chrome` project for both renderers (the project name is part of the snapshot file names), each
  // renderer with its own baseline directory, see e2e_config.ts
  snapshotDir,
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
