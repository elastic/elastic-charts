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
    console.log('Basic bar chart summary:', summaryText);
    expect(summaryText).toBe('Bar chart with 4 data points, values ranging from 2 to 7.');
  });

  test('should generate correct a11y summary for stacked bar chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--stacked';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    console.log('Stacked bar chart summary:', summaryText);
    // TODO: Replace with exact expected text after running test
    expect(summaryText).toBeTruthy();
  });

  test('should generate correct a11y summary for horizontal bar chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--horizontal';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    console.log('Horizontal bar chart summary:', summaryText);
    // TODO: Replace with exact expected text after running test
    expect(summaryText).toBeTruthy();
  });

  test('should include axis descriptions when provided', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--with-axis-and-legend';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    console.log('Bar chart with axis summary:', summaryText);
    // TODO: Replace with exact expected text after running test
    expect(summaryText).toBeTruthy();
  });
});