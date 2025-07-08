/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Area Chart Accessibility', () => {
  test('should generate correct a11y summary for basic area chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/area-chart--basic';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for stacked area chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/area-chart--stacked';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for stacked percentage area chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/area-chart--stacked-percentage';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for band area chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/area-chart--band-area';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:Mixed chart: area and line chart');
  });

  test('should generate correct a11y summary for discontinuous area chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/line-chart--discontinuous-data-points';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:line chart');
  });
});
