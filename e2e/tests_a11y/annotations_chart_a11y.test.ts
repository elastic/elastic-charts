/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Annotations Chart Accessibility', () => {
  test('should generate correct a11y summary for line annotation', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/annotations-lines--single-bar-histogram',
      'Chart type:bar chart',
    );
  });

  test('should generate correct a11y summary for rect annotation', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/annotations-rects--styling&knob-showLineAnnotations=true&knob-chartRotation=0',
      'Chart type:line chart',
    );
  });

  test('should generate correct a11y summary for advanced markers', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/annotations-lines--advanced-markers',
      'Chart type:bar chart',
    );
  });

  test('should generate correct a11y summary for outside annotations', async ({ page }) => {
    await common.testA11ySummary(page)(
      'http://localhost:9001/?path=/story/annotations-rects--outside',
      'Chart type:line chart',
    );
  });
});
