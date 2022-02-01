/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { eachTheme, pwEach } from '../helpers';
import { common } from '../page_objects';

test.describe('Heatmap stories', () => {
  test('should not have brush tool extend into axes', async ({ page }) => {
    await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/heatmap-alpha--basic',
      { left: 100, top: 100 },
      { left: 300, top: 300 },
    );
  });

  eachTheme.describe(({ urlParam }) => {
    test('should render basic heatmap', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        `http://localhost:9001/?path=/story/heatmap-alpha--basic&${urlParam}`,
      );
    });

    test('should render correct brush area', async ({ page }) => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
        `http://localhost:9001/?path=/story/heatmap-alpha--basic&${urlParam}`,
        { left: 200, top: 100 },
        { left: 400, top: 250 },
      );
    });
  });

  test('should maximize the label with an unique fontSize', async ({ page }) => {
    await page.setViewport({ width: 450, height: 600 });
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/heatmap-alpha--categorical',
    );
  });

  test('should maximize the label fontSize', async ({ page }) => {
    await page.setViewport({ width: 420, height: 600 });
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/heatmap-alpha--categorical&knob-use global min fontSize_labels=false',
    );
  });

  pwEach.test([[2], [3], [4], [5], [6], [7], [8], [9]])(
    (d) => `time snap with dataset ${d}`,
    async (page, dataset) => {
      await page.setViewport({ width: 785, height: 600 });
      await common.expectChartAtUrlToMatchScreenshot(page)(
        `http://localhost:9001/?path=/story/heatmap-alpha--time-snap&globals=theme:light&knob-dataset=${dataset}`,
      );
    },
  );

  test('should show x and y axis titles', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/heatmap-alpha--basic&knob-Show%20x%20axis%20title=true&knob-Show%20y%20axis%20title=true',
    );
  });
});
