/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Metric Chart Accessibility', () => {
  test('should generate correct a11y summary for metric chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/metric-alpha--basic';
    await common.loadElementFromURL(page)(url, '.echChart');

    const sparklines = await page.locator('.echSingleMetricSparkline').elementHandles();
    expect(sparklines.length).toBe(1);

    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('The Cluster CPU Usage trend The trend shows a peak of CPU usage in the last 5 minutes');
  });
});
