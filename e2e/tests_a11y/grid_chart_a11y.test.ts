/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Grid Chart Accessibility', () => {
  test('should generate correct a11y summary for grid lines chart', async ({ page }) => {
    await common.testA11ySummary(page)('http://localhost:9001/?path=/story/grids--lines', 'Chart type:line chart');
  });
});
