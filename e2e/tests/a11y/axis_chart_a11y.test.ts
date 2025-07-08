/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Axis Chart Accessibility', () => {
  test('should generate correct a11y summary for basic axis chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--basic';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for tick label rotation', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--tick-label-rotation';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for many tick labels', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--many-tick-labels';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for custom mixed axes', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--custom-mixed';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:Mixed chart: bar and line chart');
  });

  test('should generate correct a11y summary for duplicate ticks', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--duplicate-ticks';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:line chart');
  });

  test('should generate correct a11y summary for fit domain', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--fit-domain';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:line chart');
  });

  test('should generate correct a11y summary for timeslip with different locale', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/area-chart--timeslip';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for small multiples', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/small-multiples-alpha--sunbursts';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:sunburst chart');
  });
});
