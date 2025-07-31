/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Stylings Chart Accessibility', () => {
  test('should generate correct a11y summary for charts with texture', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/stylings--with-texture',
      'Chart type:area chart',
    );
  });

  test('should generate correct a11y summary for texture multiple series', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/stylings--texture-multiple-series',
      'Chart type:area chart',
    );
  });

  test('should generate correct a11y summary for highlighter style', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/stylings--highlighter-style',
      'Chart type:line chart',
    );
  });
});
