/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Stylings Chart Accessibility', () => {
  test('should generate correct a11y summary for charts with texture', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/stylings--with-texture';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for texture multiple series', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/stylings--texture-multiple-series';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for highlighter style', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/stylings--highlighter-style';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:line chart');
  });
});
