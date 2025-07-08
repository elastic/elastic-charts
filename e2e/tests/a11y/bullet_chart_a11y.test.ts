/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Bullet Chart Accessibility', () => {
  test('should generate correct a11y summary for single bullet chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bullet-graph--single';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for angular bullet chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bullet-graph--angular';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for single row bullet chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bullet-graph--single-row';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for single column bullet chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bullet-graph--single-column';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for grid bullet chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bullet-graph--grid';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for color bands bullet chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/bullet-graph--color-bands';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });
});
