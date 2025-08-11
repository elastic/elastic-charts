/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../page_objects/common';

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

  test('should generate correct a11y summary for mosaic chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/mosaic-alpha--other-slices';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Chart type:mosaic chart The table fully represents the dataset of 14 data pointsDepthLabelParentValuePercentage1AMERICASnone1,30740%1ASIAnone1,02532%1EUROPEnone59418%1AFRICAnone3059%2United StatesAMERICAS55317%2OtherAMERICAS75323%2South KoreaASIA1775%2JapanASIA1775%2ChinaASIA39312%2OtherASIA2779%2San MarinoEUROPE1354%2GermanyEUROPE2538%2OtherEUROPE2056%2OtherAFRICA3059%',
    );
  });

  test('should generate correct a11y summary for sunburst with linked labels', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/sunburst--linked-labels-only';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Chart type:sunburst chart The table fully represents the dataset of 10 data pointsLabelValuePercentageMineral fuels, lubricants and related materials$1,930 Bn22%Chemicals and related products$848 Bn10%Miscellaneous manufactured articles$817 Bn9%Manufactured goods classified chiefly by material$745 Bn9%Commodities and transactions not classified elsewhere$451 Bn5%Crude materials, inedible, except fuels$394 Bn5%Food and live animals$353 Bn4%Beverages and tobacco$54 Bn1%Animal and vegetable oils, fats and waxes$36 Bn0%Machinery and transport equipment$3,110 Bn36%',
    );
  });

  test('should generate correct a11y summary for treemap with fill labels', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/treemap--one-layer2';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Chart type:treemap chart The table fully represents the dataset of 10 data pointsLabelValuePercentageMachinery and transport equipment$3,110 Bn36%Mineral fuels, lubricants and related materials$1,930 Bn22%Chemicals and related products$848 Bn10%Miscellaneous manufactured articles$817 Bn9%Manufactured goods classified chiefly by material$745 Bn9%Commodities and transactions not classified elsewhere$451 Bn5%Crude materials, inedible, except fuels$394 Bn5%Food and live animals$353 Bn4%Beverages and tobacco$54 Bn1%Animal and vegetable oils, fats and waxes$36 Bn0%',
    );
  });
});
