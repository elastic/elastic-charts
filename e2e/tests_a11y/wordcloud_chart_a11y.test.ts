/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Word Cloud Chart Accessibility', () => {
  test('should generate correct a11y summary for simple wordcloud', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/wordcloud-alpha--simple-wordcloud',
      'Chart type:Word cloud chart',
    );
  });

  test('should generate correct a11y summary for single template wordcloud', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/wordcloud-alpha--simple-wordcloud&knob-template=single',
      'Chart type:Word cloud chart',
    );
  });

  test('should generate correct a11y summary for right angled template wordcloud', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/wordcloud-alpha--simple-wordcloud&knob-template=rightAngled',
      'Chart type:Word cloud chart',
    );
  });

  test('should generate correct a11y summary for multiple template wordcloud', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/wordcloud-alpha--simple-wordcloud&knob-template=multiple',
      'Chart type:Word cloud chart',
    );
  });
});
