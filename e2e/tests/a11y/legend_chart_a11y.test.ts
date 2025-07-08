/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Legend Chart Accessibility', () => {
  test('should generate correct a11y summary for legend positioning', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--positioning';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for legend actions', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--actions';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for legend color picker', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--color-picker';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for legend inside chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--inside-chart';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for legend spacing buffer', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--legend-spacing-buffer';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for legend with pie chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--piechart';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for legend tabular data', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--tabular-data';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });
});
