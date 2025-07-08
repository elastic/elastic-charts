/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { PlaywrightTestConfig } from '@playwright/test';

import baseConfig from './playwright.config';

const config: PlaywrightTestConfig = {
  ...baseConfig,
  testIgnore: undefined, // Reset the testIgnore from base config
  testMatch: ['**/tests/a11y/**/*.test.ts'],
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'reports/a11y-html' }],
    ['json', { outputFile: 'reports/a11y-json/report.json' }],
  ],
  use: {
    ...baseConfig.use,
    // Disable visual regression for a11y tests since we're testing text content
    screenshot: 'off',
    video: 'off',
  },
  expect: {
    // Remove visual regression expectations for a11y tests
    toMatchSnapshot: undefined,
  },
};

export default config;