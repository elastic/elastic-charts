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
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for horizontal bar chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--with-axis-and-legend';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should include axis descriptions when provided', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--with-axis-and-legend';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for bar chart with ordinal axis', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--test-switch-ordinal-linear-axis&knob-scaleType=ordinal';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for bar chart with discover configuration', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--test-discover&knob-use custom minInterval of 30s=';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for histogram mode bar chart', async ({ page }) => {
    const url =
      'http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-linear&knob-chartRotation=0&knob-stacked=false&knob-bars padding=0.25&knob-histogram padding=0.05&knob-other series=line&knob-point series alignment=center&knob-hasHistogramBarSeries=&knob-debug=false&knob-bars-1 enableHistogramMode=true&knob-bars-2 enableHistogramMode=';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for bar chart with value labels', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--with-value-label';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for bar chart with functional accessors', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--functional-accessors';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for basic stacked bar chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bar-chart--stacked-as-percentage';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });
});
