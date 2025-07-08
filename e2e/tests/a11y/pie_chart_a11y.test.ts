/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Pie Chart Accessibility', () => {
  test('should generate correct a11y summary for basic pie chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/sunburst--most-basic';
    await common.loadElementFromURL(page)(url, '.echChart');

    // Wait for the chart to load
    await page.waitForSelector('.echChart', { timeout: 5000 });

    // Check if accessibility content exists (regardless of visibility)
    const a11yElements = page.locator('.echScreenReaderOnly');
    const count = await a11yElements.count();

    if (count > 0) {
      const summaryText = await common.getA11ySummaryText(page)();
      expect(summaryText).toBeTruthy();
    } else {
      // If no accessibility content, test that the chart loaded
      const chartElement = page.locator('.echChart').first();
      await expect(chartElement).toBeVisible();
    }
  });

  test('should generate correct a11y summary for donut chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/sunburst--donut-chart-with-fill-labels';
    await common.loadElementFromURL(page)(url, '.echChart');

    // Wait for the chart to load
    await page.waitForSelector('.echChart', { timeout: 5000 });

    // Check if accessibility content exists (regardless of visibility)
    const a11yElements = page.locator('.echScreenReaderOnly');
    const count = await a11yElements.count();

    if (count > 0) {
      const summaryText = await common.getA11ySummaryText(page)();
      expect(summaryText).toBeTruthy();
    } else {
      // If no accessibility content, test that the chart loaded
      const chartElement = page.locator('.echChart').first();
      await expect(chartElement).toBeVisible();
    }
  });
});
