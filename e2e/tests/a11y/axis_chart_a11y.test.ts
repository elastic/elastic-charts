/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Axis Chart Accessibility', () => {
  test('should generate correct a11y summary for basic axis chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--basic';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for tick label rotation', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--tick-label-rotation';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for many tick labels', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--many-tick-labels';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for custom mixed axes', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--custom-mixed';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:Mixed chart: bar and line chart');
  });

  test('should generate correct a11y summary for duplicate ticks', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--duplicate-ticks';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:line chart');
  });

  test('should generate correct a11y summary for fit domain', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/axes--fit-domain';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:line chart');
  });

  test('should generate correct a11y summary for timeslip with different locale', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/area-chart--timeslip';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for small multiples of sunburst charts', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/small-multiples-alpha--sunbursts';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Chart type:sunburst chart The table represents only 20 of the 179 data pointsSmall multiple titleDepthLabelParentValuePercentageAfrica1Machinery and transport equipmentnone$12 Bn48%Africa2LiberiaMachinery and transport equipment$12 Bn48%Africa1Mineral fuels, lubricants and related materialsnone$13 Bn52%Africa2South AfricaMineral fuels, lubricants and related materials$13 Bn52%Asia1Mineral fuels, lubricants and related materialsnone$717 Bn26%Asia2JapanMineral fuels, lubricants and related materials$177 Bn6%Asia2ChinaMineral fuels, lubricants and related materials$168 Bn6%Asia2South KoreaMineral fuels, lubricants and related materials$108 Bn4%Asia2IndiaMineral fuels, lubricants and related materials$97 Bn4%Asia2SingaporeMineral fuels, lubricants and related materials$67 Bn2%Asia2ThailandMineral fuels, lubricants and related materials$27 Bn1%Asia2IndonesiaMineral fuels, lubricants and related materials$24 Bn1%Asia2TurkeyMineral fuels, lubricants and related materials$22 Bn1%Asia2MalaysiaMineral fuels, lubricants and related materials$13 Bn0%Asia2Hong KongMineral fuels, lubricants and related materials$13 Bn0%Asia1Manufactured goods classified chiefly by materialnone$238 Bn9%Asia2ChinaManufactured goods classified chiefly by material$79 Bn3%Asia2South KoreaManufactured goods classified chiefly by material$33 Bn1%Asia2JapanManufactured goods classified chiefly by material$32 Bn1%Asia2IndiaManufactured goods classified chiefly by material$31 Bn1%Click to show more data',
    );
  });
});
