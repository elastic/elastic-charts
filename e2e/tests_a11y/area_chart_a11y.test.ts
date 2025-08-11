/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Area Chart Accessibility', () => {
  test('should generate correct a11y summary for basic area chart', async ({ page }) => {
    await common.testA11ySummary(page)('http://localhost:9001/?path=/story/area-chart--basic', 'Chart type:area chart');
  });

  test('should generate correct a11y summary for stacked area chart', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/area-chart--stacked',
      'Chart type:area chart',
    );
  });

  test('should generate correct a11y summary for stacked percentage area chart', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/area-chart--stacked-percentage',
      'Chart type:area chart',
    );
  });

  test('should generate correct a11y summary for band area chart', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/area-chart--band-area',
      'Chart type:Mixed chart: area and line chart',
    );
  });

  test('should generate correct a11y summary for discontinuous area chart', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/line-chart--discontinuous-data-points',
      'Chart type:line chart',
    );
  });
});
