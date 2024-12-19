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
  test.describe('Points auto visibility', () => {
    test('show points when space between point is enough', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/line-chart--isolated-data-points&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-default point radius=3&knob-enable fit function=true&knob-max data points=25&knob-point shape=circle&knob-point visibility=auto&knob-point visibility min distance=20&knob-series type=line&knob-visible series[0]=A&knob-visible series[1]=B&knob-visible series[2]=C&knob-visible series[3]=D',
      );
    });
    test('hide points when space between point is small', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/line-chart--isolated-data-points&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-default point radius=3&knob-enable fit function=true&knob-max data points=60&knob-point shape=circle&knob-point visibility=auto&knob-point visibility min distance=20&knob-series type=line&knob-visible series[0]=A&knob-visible series[1]=B&knob-visible series[2]=C&knob-visible series[3]=D',
      );
    });
  });
});
