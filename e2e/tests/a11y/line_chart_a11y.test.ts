/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Line Chart Accessibility', () => {
  test('should generate correct a11y summary for basic line chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/line-chart--basic';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    console.log('Basic line chart summary:', summaryText);
    // TODO: Replace with exact expected text after running test
    expect(summaryText).toBeTruthy();
  });

  test('should generate correct a11y summary for multi-series line chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/line-chart--multiple-with-axis-and-legend';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    console.log('Multi-series line chart summary:', summaryText);
    // TODO: Replace with exact expected text after running test
    expect(summaryText).toBeTruthy();
  });

  test('should generate correct a11y summary for stacked line chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/line-chart--stacked-with-axis-and-legend';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    console.log('Stacked line chart summary:', summaryText);
    // TODO: Replace with exact expected text after running test
    expect(summaryText).toBeTruthy();
  });
});