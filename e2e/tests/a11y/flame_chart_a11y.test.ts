/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Flame Chart Accessibility', () => {
  test('should generate correct a11y summary for CPU profile flame chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/flame-alpha--cpu-profile-g-l-flame-chart';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });

  test('should generate correct a11y summary for flame chart with search', async ({ page }) => {
    const url =
      'http://localhost:9001/?path=/story/flame-alpha--cpu-profile-g-l-flame-chart&knob-Text%20to%20search=gotype';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:');
  });
});
