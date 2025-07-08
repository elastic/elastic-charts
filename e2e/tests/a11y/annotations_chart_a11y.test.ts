/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Annotations Chart Accessibility', () => {
  test('should generate correct a11y summary for line annotation', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/annotations-lines--single-bar-histogram';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for rect annotation', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/annotations-rects--styling';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for advanced markers', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/annotations-lines--advanced-markers';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for outside annotations', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/annotations-rects--outside';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });
});
