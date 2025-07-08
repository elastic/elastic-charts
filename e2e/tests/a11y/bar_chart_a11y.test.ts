/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Bar Chart Accessibility', () => {
  test('should generate correct a11y summary for basic bar chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--basic';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Bar chart with 4 data points, values ranging from 2 to 7.');
  });

  test('should generate correct a11y summary for stacked bar chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--stacked-with-axis-and-legend';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Stacked bar chart with 2 bars: a, b. X axis displays Bottom axis from 0 to 3. Y axis displays Left axis, ranging from 0 to 12.',
    );
  });

  test('should generate correct a11y summary for horizontal bar chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--with-axis-and-legend';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Bar chart with 4 data points, values ranging from 2 to 7. X axis displays Bottom axis from 0 to 3. Y axis displays Left axis, ranging from 0 to 7.',
    );
  });

  test('should include axis descriptions when provided', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--with-axis-and-legend';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Bar chart with 4 data points, values ranging from 2 to 7. X axis displays Bottom axis from 0 to 3. Y axis displays Left axis, ranging from 0 to 7.',
    );
  });
});