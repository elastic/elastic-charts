/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Word Cloud Chart Accessibility', () => {
  test('should generate correct a11y summary for simple wordcloud', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/wordcloud-alpha--simple-wordcloud';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for single template wordcloud', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/wordcloud-alpha--simple-wordcloud&knob-template=single';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for right angled template wordcloud', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/wordcloud-alpha--simple-wordcloud&knob-template=rightAngled';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for multiple template wordcloud', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/wordcloud-alpha--simple-wordcloud&knob-template=multiple';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });
});
