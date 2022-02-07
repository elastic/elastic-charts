/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { eachRotation } from '../helpers';
import { common } from '../page_objects';

test.describe('Line series stories', () => {
  test.describe('rotation', () => {
    eachRotation.test(async ({ page, rotation }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        `http://localhost:9001/?path=/story/line-chart--ordinal-with-axis&knob-chartRotation=${rotation}`,
      );
    });
  });

  test.describe('Line paths for ordered values', () => {
    test('should render correct line path - non-stacked', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/line-chart--test-path-ordering&knob-enable orderOrdinalBinsBy=true&knob-Stacked=false',
      );
    });

    test('should render correct line path - stacked', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/line-chart--test-path-ordering&knob-enable orderOrdinalBinsBy=true&knob-Stacked=true',
      );
    });
  });
  test.describe('Non-Stacked Linear Line with discontinuous data points', () => {
    test('with fit', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/line-chart--discontinuous-data-points&knob-enable fit function=false&knob-switch to area=',
      );
    });

    test('no fit function', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/line-chart--discontinuous-data-points&knob-enable fit function=true&knob-switch to area=',
      );
    });
  });

  test.describe('Line with mark accessor', () => {
    test('with hidden points, default point highlighter size', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/line-chart--line-with-mark-accessor&knob-markSizeRatio=10&knob-show line points=false&knob-debug=',
        { left: 115, top: 170 },
        {
          screenshotSelector: '#story-root',
        },
      );
    });
  });
});
