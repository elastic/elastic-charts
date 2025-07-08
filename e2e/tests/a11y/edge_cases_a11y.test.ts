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
  test('no screen reader summary for empty charts', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/test-cases--no-series';
    await common.loadElementFromURL(page)(url, '.echChart');

    // For empty charts, accessibility content may not exist, so we check if the chart element exists
    const chartElement = page.locator('.echChart').first();
    await expect(chartElement).toBeVisible();
    const chartText = await chartElement.textContent();
    expect(chartText).toBe('No Results');
    const a11yExists = await page.locator('.echScreenReaderOnly').count();
    expect(a11yExists).toBe(0);
  });

  test('should handle bar chart with empty data points', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--with-linear-x-axis';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });
});
