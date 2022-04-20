/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Nick', () => {
  test('Testing hover with body', async ({ page }) => {
    await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/bar-chart--with-time-x-axis',
      { left: 80, top: 100 },
      { screenshotSelector: 'body' },
    );
  });

  test('Testing hover with root', async ({ page }) => {
    await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/bar-chart--with-time-x-axis',
      { left: 80, top: 100 },
      { screenshotSelector: '#root' },
    );
  });

  test('Testing hover with chart', async ({ page }) => {
    await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/bar-chart--with-time-x-axis',
      { left: 80, top: 100 },
    );
  });
});
