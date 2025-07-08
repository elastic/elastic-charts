/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Scales Chart Accessibility', () => {
  test('should generate correct a11y summary for log scale options', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/scales--log-scale-options',
      'Chart type:line chart',
    );
  });

  test('should generate correct a11y summary for linear binary scale', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/scales--linear-binary',
      'Chart type:line chart',
    );
  });
});
