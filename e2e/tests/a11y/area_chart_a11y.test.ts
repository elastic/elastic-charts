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
    expect(summaryText).toBe('Area chart with 120 time periods, values ranging from 4.26171875 to 34.28125.');
  });

  test('should generate correct a11y summary for stacked area chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/area-chart--stacked';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Stacked area chart with 3 areas: 15m, 5m, 1m. X axis displays timestamp per 1 minute from Mar 1, 11:00 AM to Mar 1, 11:59 AM. Y axis displays System Load, ranging from 0 to 61.5546875.',
    );
  });
});
