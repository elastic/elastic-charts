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

  test('should generate correct a11y summary for error boundary', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/test-cases--error-boundary';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    // TODO This doesn't throw the error yet, the default storybook pages first
    // loads without error, the error needs then to be triggered manually.
    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for RTL text', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/test-cases--rtl-text';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Chart type:treemap chart The table fully represents the dataset of 10 data pointsLabelValuePercentageמכונות וציוד הובלה3.1 t36%דלקים מינרליים, חומרי סיכה וחומרים נלווים1.9 t22%כימיקלים ומוצרים נלווים848.2 b10%מוצרים מיוצרים שונים816.8 b9%מוצרים מיוצרים המסווגים בעיקר לפי חומר745.2 b9%סחורות ועסקאות שאינן מסווגות במקום אחר450.5 b5%חומרים גולמיים, בלתי אכילים, למעט דלקים393.9 b5%מזון וחיות חיות353.3 b4%משקאות וטבק54.5 b1%שמנים, שומנים ושעווה מהחי וצומח36.0 b0%',
    );
  });

  test('should generate correct a11y summary for point style override', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/test-cases--point-style-overrides';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:line chart');
  });
});
