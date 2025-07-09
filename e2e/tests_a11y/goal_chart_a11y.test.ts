/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Goal Chart Accessibility', () => {
  test('should generate correct a11y summary for goal chart', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/goal-alpha--minimal-goal',
      'Revenue 2020 YTD  (thousand USD)  Chart type:goal chartMinimum:0Maximum:300Target:260Value:280',
    );
  });

  test('should generate correct a11y summary for gauge chart', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/goal-alpha--gauge-with-target',
      'Revenue 2020 YTD  (thousand USD)  Chart type:goal chartMinimum:0Maximum:300Target:260Value:170',
    );
  });

  test('should generate correct a11y summary for goal chart without target', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/goal-alpha--gaps',
      'Revenue 2020 YTD  (thousand USD)  Chart type:goal chartMinimum:0Maximum:300Target:260Value:280',
    );
  });

  test('should generate correct a11y summary for full circle goal chart', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/goal-alpha--full-circle',
      'Chart type:goal chartMinimum:0Maximum:300Target:260Value:280',
    );
  });
});
