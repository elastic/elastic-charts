/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Line Chart Accessibility', () => {
  test('should generate correct a11y summary for basic line chart', async ({ page }) => {
    await common.testA11ySummary(page)('http://localhost:9001/?path=/story/line-chart--basic', 'Chart type:line chart');
  });

  test('should generate correct a11y summary for multi-series line chart', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/line-chart--multiple-with-axis-and-legend',
      'Chart type:line chart',
    );
  });

  test('should generate correct a11y summary for stacked line chart', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/line-chart--stacked-with-axis-and-legend',
      'Chart type:line chart',
    );
  });

  test('should generate correct a11y summary for line chart with ordinal axis', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/line-chart--ordinal-with-axis',
      'Chart type:line chart',
    );
  });

  test('should generate correct a11y summary for line chart with path ordering', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/line-chart--test-path-ordering',
      'Chart type:line chart',
    );
  });

  test('should generate correct a11y summary for line chart with discontinuous data', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/line-chart--discontinuous-data-points',
      'Chart type:line chart',
    );
  });
});
