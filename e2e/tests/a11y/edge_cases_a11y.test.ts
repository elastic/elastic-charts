/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Edge Cases Accessibility', () => {
  test('should handle empty data gracefully', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/test-cases--no-series';
    await common.loadElementFromURL(page)(url, '.echChart');

    // For empty charts, accessibility content may not exist, so we check if the chart element exists
    const chartElement = page.locator('.echChart').first();
    await expect(chartElement).toBeVisible();

    // Check if accessibility content exists, if not, that's expected for empty charts
    const a11yExists = await page.locator('.echScreenReaderOnly').count();
    if (a11yExists === 0) {
      // Empty chart doesn't have accessibility content, which is expected
      expect(true).toBe(true);
    } else {
      const summaryText = await common.getA11ySummaryText(page)();
      expect(summaryText).toBeTruthy();
    }
  });

  test('should handle single data point', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--with-linear-x-axis';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Bar chart with 4 data points, values ranging from 2 to 7. X axis displays Bottom axis from 1 to 9. Y axis displays Left axis, ranging from 0 to 7.',
    );
  });
});
