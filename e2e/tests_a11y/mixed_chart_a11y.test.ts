/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Mixed Chart Accessibility', () => {
  test('should generate correct a11y summary for fitting functions non-stacked', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series',
      'Chart type:area chart',
    );
  });

  test('should generate correct a11y summary for fitting functions stacked', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series',
      'Chart type:area chart',
    );
  });

  test('should generate correct a11y summary for polarized stacked charts', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/mixed-charts--polarized-stacked',
      'Chart type:bar chart',
    );
  });
});
