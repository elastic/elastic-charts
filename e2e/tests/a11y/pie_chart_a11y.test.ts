/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Pie Chart Accessibility', () => {
  test('should generate correct a11y summary for basic pie chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/sunburst--most-basic';
    await common.loadElementFromURL(page)(url, '.echChart');

    // Wait for the chart to load
    await page.waitForSelector('.echChart', { timeout: 5000 });

    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Chart type:sunburst chart The table fully represents the dataset of 10 data pointsLabelValuePercentageMineral fuels, lubricants and related materials$1,930 Bn22%Chemicals and related products$848 Bn10%Miscellaneous manufactured articles$817 Bn9%Manufactured goods classified chiefly by material$745 Bn9%Commodities and transactions not classified elsewhere$451 Bn5%Crude materials, inedible, except fuels$394 Bn5%Food and live animals$353 Bn4%Beverages and tobacco$54 Bn1%Animal and vegetable oils, fats and waxes$36 Bn0%Machinery and transport equipment$3,110 Bn36%',
    );
  });

  test('should generate correct a11y summary for donut chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/sunburst--donut-chart-with-fill-labels';
    await common.loadElementFromURL(page)(url, '.echChart');

    // Wait for the chart to load
    await page.waitForSelector('.echChart', { timeout: 5000 });

    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Chart type:sunburst chart The table fully represents the dataset of 10 data pointsLabelValuePercentageMineral fuels, lubricants and related materials$1,930 Bn22%Chemicals and related products$848 Bn10%Miscellaneous manufactured articles$817 Bn9%Manufactured goods classified chiefly by material$745 Bn9%Commodities and transactions not classified elsewhere$451 Bn5%Crude materials, inedible, except fuels$394 Bn5%Food and live animals$353 Bn4%Beverages and tobacco$54 Bn1%Animal and vegetable oils, fats and waxes$36 Bn0%Machinery and transport equipment$3,110 Bn36%',
    );
  });
});
