/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../../page_objects/common';

test.describe('Waffle Chart Accessibility', () => {
  test('should generate correct a11y summary for simple waffle chart', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/waffle-alpha--simple',
      'Chart type:waffle chart The table represents only 20 of the 100 data pointsLabelValuePercentageAl$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Al$3,110 Bn46%Click to show more data',
    );
  });

  test('should generate correct a11y summary for waffle test chart', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/waffle-alpha--test',
      'Chart type:waffle chart The table represents only 20 of the 100 data pointsLabelValuePercentage01348%01348%01348%01348%01348%01348%01348%01348%01348%01348%01348%01348%01348%01348%01348%01348%01348%01348%01348%01348%Click to show more data',
    );
  });
});
