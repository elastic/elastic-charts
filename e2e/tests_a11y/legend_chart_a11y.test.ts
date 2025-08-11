/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Legend Chart Accessibility', () => {
  test('should generate correct a11y summary for legend positioning', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--positioning';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for legend actions', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--actions';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for legend color picker', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--color-picker';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for legend inside chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--inside-chart';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:area chart');
  });

  test('should generate correct a11y summary for legend spacing buffer', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--legend-spacing-buffer';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });

  test('should generate correct a11y summary for legend with pie chart', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--piechart';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe(
      'Chart type:sunburst chart The table represents only 20 of the 31 data pointsDepthLabelParentValuePercentage1Mineral fuels, lubricants and related materialsnone$779 Bn24%2AsiaMineral fuels, lubricants and related materials$454 Bn14%3JapanAsia$177 Bn5%3ChinaAsia$168 Bn5%3South KoreaAsia$108 Bn3%2North AmericaMineral fuels, lubricants and related materials$325 Bn10%3United StatesNorth America$325 Bn10%1Miscellaneous manufactured articlesnone$227 Bn7%2North AmericaMiscellaneous manufactured articles$227 Bn7%3United StatesNorth America$227 Bn7%1Crude materials, inedible, except fuelsnone$174 Bn5%2AsiaCrude materials, inedible, except fuels$174 Bn5%3ChinaAsia$174 Bn5%1Manufactured goods classified chiefly by materialnone$130 Bn4%2North AmericaManufactured goods classified chiefly by material$130 Bn4%3United StatesNorth America$130 Bn4%1Chemicals and related productsnone$128 Bn4%2North AmericaChemicals and related products$128 Bn4%3United StatesNorth America$128 Bn4%1Machinery and transport equipmentnone$1,854 Bn56%Click to show more data',
    );
  });

  test('should generate correct a11y summary for legend tabular data', async ({ page }) => {
    const url = 'http://localhost:9001/?path=/story/legend--tabular-data';
    await common.loadElementFromURL(page)(url, '.echChart');
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toBe('Chart type:bar chart');
  });
});
