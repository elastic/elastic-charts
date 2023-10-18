/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Bullet stories', () => {
  test('renders single bullet', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)('http://localhost:9001/?path=/story/bullet-graph--single');
  });

  test('renders angular bullet', async ({ page }) => {
    await page.setViewportSize({ width: 785, height: 800 });
    await common.expectChartAtUrlToMatchScreenshot(page)('http://localhost:9001/?path=/story/bullet-graph--angular');
  });

  test('renders single row bullet', async ({ page }) => {
    await page.setViewportSize({ width: 850, height: 800 });
    await common.expectChartAtUrlToMatchScreenshot(page)('http://localhost:9001/?path=/story/bullet-graph--single-row');
  });

  test('renders single column bullet', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/bullet-graph--single-column',
    );
  });

  test('renders grid bullet', async ({ page }) => {
    await page.setViewportSize({ width: 785, height: 1000 });
    await common.expectChartAtUrlToMatchScreenshot(page)('http://localhost:9001/?path=/story/bullet-graph--grid');
  });
});
