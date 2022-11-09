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
    await page.setViewportSize({ width: 450, height: 600 });
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/heatmap-alpha--categorical',
    );
  });

  test('should maximize the label fontSize', async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 600 });
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/heatmap-alpha--categorical&knob-use global min fontSize_labels=false',
    );
  });

  pwEach.test([[2], [3], [4], [5], [6], [7], [8], [9]])(
    (d) => `time snap with dataset ${d}`,
    async (page, dataset) => {
      await page.setViewportSize({ width: 785, height: 600 });
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

  test('rotate categorical axis labels', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/heatmap-alpha--label-rotation&globals=theme:light&knob-Y-axis auto width=true&knob-Y-axis width=50&knob-X-Axis visible=true&knob-X-Axis label fontSize=12&knob-X-Axis label padding=6&knob-X-Axis label rotation=45&knob-Use categorical data=true&knob-Show legend=',
    );
  });

  test('rotate time axis labels', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/heatmap-alpha--label-rotation&globals=theme:light&knob-Y-axis auto width=true&knob-Y-axis width=50&knob-X-Axis visible=true&knob-X-Axis label fontSize=12&knob-X-Axis label padding=6&knob-X-Axis label rotation=45&knob-Use categorical data=&knob-Show legend=',
    );
  });

  test('render table with all nulls', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/heatmap-alpha--sorting&globals=theme:light&knob-Fill gaps with nulls=true&knob-Fill everything with nulls=true&knob-X sorting predicate=dataIndex&knob-Y sorting predicate=dataIndex',
    );
  });

  eachTheme.describe(({ theme, urlParam }) => {
    test(`should highlight band on legend hover - ${theme}`, async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        `http://localhost:9001/?path=/story/heatmap-alpha--time&knob-Chart type=treemap&knob-SeriesType=bar&knob-X-Axis label fontSize=12&knob-X-Axis label padding=6&knob-X-Axis label rotation=0&knob-X-Axis visible=true&knob-Y-axis auto width=true&knob-Y-axis width=50&knob-async actions delay=0&knob-async delay=1000&knob-async delay (ms)=1500&knob-chart type=bar&knob-disable actions=true&knob-reduce data=true&knob-tooltip type=vertical&knob-start time offset=0&knob-end time offset=0&${urlParam}`,
        { right: 35, top: 111 },
      );
    });
  });
});
