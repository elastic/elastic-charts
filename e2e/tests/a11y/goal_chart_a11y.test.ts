/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Goal Chart Accessibility', () => {
  test('should generate correct a11y summary for goal chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/goal-alpha--minimal-goal';
    await common.loadElementFromURL(page)(url, '.echChart');

    // Wait for the chart to load
    await page.waitForSelector('.echChart', { timeout: 5000 });
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Revenue 2020 YTD  (thousand USD)  Goal chart. Revenue 2020 YTD  (thousand USD). Minimum: 0, Maximum: 300, Target: 260, Value: 280.',
    );
  });

  test('should generate correct a11y summary for gauge chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/goal-alpha--gauge-with-target';
    await common.loadElementFromURL(page)(url, '.echChart');

    // Wait for the chart to load
    await page.waitForSelector('.echChart', { timeout: 5000 });
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Revenue 2020 YTD  (thousand USD)  Goal chart. Revenue 2020 YTD  (thousand USD). Minimum: 0, Maximum: 300, Target: 260, Value: 170.',
    );
  });
});
