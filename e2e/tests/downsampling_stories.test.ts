/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects';

test.describe('Downsampling stories', () => {
  test('should render every chart of the dense and sparse grid', async ({ page }) => {
    await common.expectElementAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/downsampling--dense-sparse-grid',
      '#story-root',
      {
        waitSelector: common.chartWaitSelector,
        action: async () => {
          // six cases, each with three curves
          await page.waitForFunction(() => {
            return document.querySelectorAll('.echChartStatus[data-ech-render-complete="true"]').length >= 18;
          });
        },
      },
    );
  });
});
