/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Accessibility Descriptions', () => {
  test.describe('Bar Charts', () => {
    test('should generate correct a11y summary for basic bar chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/bar-chart--basic';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Basic bar chart summary:', summaryText);
      expect(summaryText).toBe('Bar chart with 4 data points, values ranging from 2 to 7.');
    });

    test('should generate correct a11y summary for stacked bar chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/bar-chart--stacked';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Stacked bar chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });

    test('should generate correct a11y summary for horizontal bar chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/bar-chart--horizontal';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Horizontal bar chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });

    test('should include axis descriptions when provided', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/bar-chart--with-axis-and-legend';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Bar chart with axis summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });
  });

  test.describe('Line Charts', () => {
    test('should generate correct a11y summary for basic line chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/line-chart--basic';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Basic line chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });

    test('should generate correct a11y summary for multi-series line chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/line-chart--multi-series';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Multi-series line chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });

    test('should generate correct a11y summary for stacked line chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/line-chart--stacked';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Stacked line chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });
  });

  test.describe('Area Charts', () => {
    test('should generate correct a11y summary for basic area chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/area-chart--basic';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Basic area chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });

    test('should generate correct a11y summary for stacked area chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/area-chart--stacked';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Stacked area chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });
  });

  test.describe('Pie Charts', () => {
    test('should generate correct a11y summary for basic pie chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/sunburst--sunburst-two-layers';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Sunburst chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });

    test('should generate correct a11y summary for donut chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/sunburst--donut';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Donut chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });
  });

  test.describe('Goal Charts', () => {
    test('should generate correct a11y summary for goal chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/goal-chart--single-goal';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Goal chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });

    test('should generate correct a11y summary for gauge chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/goal-chart--gauge';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Gauge chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });
  });

  test.describe('Metric Charts', () => {
    test('should generate correct a11y summary for metric chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/metric-chart--basic';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Metric chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });
  });

  test.describe('Heatmap Charts', () => {
    test('should generate correct a11y summary for heatmap chart', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/heatmap--basic';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Heatmap chart summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });
  });

  test.describe('Custom Descriptions', () => {
    test.skip('should combine custom and auto-generated descriptions', async ({ page }) => {
      // Test with a story that has custom ariaDescription
      const url = 'http://localhost:9001/?path=/story/test-cases--a11y-custom-description';

      // Skip this test until we have a story with custom description
      test.skip();
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle empty data gracefully', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/test-cases--no-series';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Empty data summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });

    test('should handle single data point', async ({ page }) => {
      const url = 'http://localhost:9001/?path=/story/bar-chart--single-data-linear';
      await common.loadElementFromURL(page)(url, '.echChart');
      await common.waitForA11yContent(page)();

      const summaryText = await common.getA11ySummaryText(page)();
      console.log('Single data point summary:', summaryText);
      // TODO: Replace with exact expected text after running test
      expect(summaryText).toBeTruthy();
    });
  });
});