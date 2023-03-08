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

  test.describe('Small multiples', () => {
    const titleOptions = {
      panel: ' without panel titles',
      axes: ' without axes titles',
      both: ' without any titles',
    };

    pwEach.test<{
      vSplit: number | null;
      hSplit: number | null;
      density?: number;
      timeData?: boolean;
      hiddenTitles?: 'panel' | 'axes' | 'both';
    }>([
      { vSplit: 2, hSplit: 2 },
      { vSplit: 2, hSplit: 2, timeData: true },
      { vSplit: 3, hSplit: 3 },
      { vSplit: 1, hSplit: 3 },
      { vSplit: null, hSplit: 3 },
      { vSplit: 0, hSplit: 3 },
      { vSplit: 3, hSplit: 1 },
      { vSplit: 3, hSplit: 0 },
      { vSplit: 3, hSplit: null },
      { vSplit: 2, hSplit: 2, hiddenTitles: 'axes' },
      { vSplit: 2, hSplit: 2, hiddenTitles: 'panel' },
      { vSplit: 2, hSplit: 2, hiddenTitles: 'both' },
      { vSplit: 2, hSplit: 2, hiddenTitles: 'both', timeData: true },
    ])(
      ({ vSplit, hSplit, hiddenTitles, timeData }) => {
        const titleText = (hiddenTitles && titleOptions[hiddenTitles]) ?? '';
        const timeDataText = timeData ? ' - time data' : '';
        return `should render ${vSplit} x ${hSplit} trellis${titleText}${timeDataText}`;
      },
      async (page, { vSplit, hSplit, density = 30, hiddenTitles, timeData = false }) => {
        const showAxesTitles = hiddenTitles !== 'axes' && hiddenTitles !== 'both';
        const showPanelTitles = hiddenTitles !== 'panel' && hiddenTitles !== 'both';
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/small-multiples-alpha--heatmap&globals=background:white;theme:light&knob-Hide_left=true&knob-Hide_right=true&knob-Hide_top=true&knob-Horizontal inner pad=0.1&knob-Horizontal inner pad_SmallMultiples Styles=0.05&knob-Horizontal outer pad=0&knob-Horizontal outer pad_SmallMultiples Styles=0&knob-Persist cells selection=true&knob-Show Legend=true&knob-Show axes title_SmallMultiples Styles=${showAxesTitles}&knob-Show axes panel titles_SmallMultiples Styles=${showPanelTitles}&knob-Show grid line_bottom=true&knob-Show grid line_left=true&knob-Show x axis title_SmallMultiples Styles=true&knob-Show y axis title_SmallMultiples Styles=true&knob-Time data=${timeData}&knob-Title_bottom=Hosts - Bottom&knob-Title_left=Metrics - Left&knob-Title_right=Metrics - Right&knob-Title_top=Hosts - Top&knob-Vertical inner pad=0.3&knob-Vertical inner pad_SmallMultiples Styles=0.1&knob-Vertical outer pad=0&knob-Vertical outer pad_SmallMultiples Styles=0&knob-categories_Data=4&knob-cell%20density(%)_Data=${density}&knob-density(%)_Data=100&knob-density_Data=2&knob-group count_Data=9&knob-h - split count_Data=${hSplit}&knob-h - split_Data=${Number.isFinite(
            hSplit,
          )}&knob-number of groups_Data=4&knob-v - split count_Data=${vSplit}&knob-v - split_Data=${Number.isFinite(
            vSplit,
          )}&knob-Debug=&knob-Enable debug state=true&knob-cell density(%)_Data=75&knob-xScaleType_Data=linear&knob-Grid stroke_SmallMultiples Styles=1`,
        );
      },
    );

    test('should render tooltip over correct panel', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/small-multiples-alpha--heatmap&globals=theme:light&knob-Hide_left=true&knob-Hide_right=true&knob-Hide_top=true&knob-Horizontal inner pad=0.1&knob-Horizontal inner pad_SmallMultiples Styles=0.05&knob-Horizontal outer pad=0&knob-Horizontal outer pad_SmallMultiples Styles=0&knob-Persist cells selection=true&knob-Show Legend=true&knob-Show axes title_SmallMultiples Styles=true&knob-Show axis panel titles=true&knob-Show axis panel titles_SmallMultiples Styles=true&knob-Show grid line_bottom=true&knob-Show grid line_left=true&knob-Show x axis title_SmallMultiples Styles=true&knob-Show y axis title_SmallMultiples Styles=true&knob-Time data=true&knob-Title_bottom=Hosts - Bottom&knob-Title_left=Metrics - Left&knob-Title_right=Metrics - Right&knob-Title_top=Hosts - Top&knob-Vertical inner pad=0.3&knob-Vertical inner pad_SmallMultiples Styles=0.1&knob-Vertical outer pad=0&knob-Vertical outer pad_SmallMultiples Styles=0&knob-categories_Data=4&knob-cell%20density(%)_Data[0]=20&knob-cell%20density(%)_Data[1]=20,60,20,20,50,20,5,25,20,25,50,50,50,50,25,20,20&knob-density(%)_Data=100&knob-density_Data=2&knob-group count_Data=9&knob-h - split count_Data=2&knob-h - split_Data=true&knob-number of groups_Data=4&knob-v - split count_Data=2&knob-v - split_Data=true&knob-Debug=&knob-cell density(%)_Data=100',
        { left: 464, top: 212 },
      );
    });

    test('should constrain brush to active panel', async ({ page }) => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/small-multiples-alpha--heatmap&globals=background:white;theme:light&knob-Hide_left=true&knob-Hide_right=true&knob-Hide_top=true&knob-Horizontal%20inner%20pad=0.1&knob-Horizontal%20inner%20pad_SmallMultiples%20Styles=0.05&knob-Horizontal%20outer%20pad=0&knob-Horizontal%20outer%20pad_SmallMultiples%20Styles=0&knob-Persist%20cells%20selection=true&knob-Show%20Legend=true&knob-Show%20axes%20title_SmallMultiples%20Styles=true&knob-Show%20axis%20panel%20titles=true&knob-Show%20axis%20panel%20titles_SmallMultiples%20Styles=true&knob-Show%20grid%20line_bottom=true&knob-Show%20grid%20line_left=true&knob-Show%20x%20axis%20title_SmallMultiples%20Styles=true&knob-Show%20y%20axis%20title_SmallMultiples%20Styles=true&knob-Time%20data=true&knob-Title_bottom=Hosts%20-%20Bottom&knob-Title_left=Metrics%20-%20Left&knob-Title_right=Metrics%20-%20Right&knob-Title_top=Hosts%20-%20Top&knob-Vertical%20inner%20pad=0.3&knob-Vertical%20inner%20pad_SmallMultiples%20Styles=0.1&knob-Vertical%20outer%20pad=0&knob-Vertical%20outer%20pad_SmallMultiples%20Styles=0&knob-categories_Data=4&knob-cell%20density(%)_Data=20,20,60,20,20,50,20,5,25,20,25,50,50,50,50,25,20,20,20,20&knob-density(%)_Data=100&knob-density_Data=2&knob-group%20count_Data=9&knob-h%20-%20split%20count_Data=3&knob-h%20-%20split_Data=true&knob-number%20of%20groups_Data=4&knob-v%20-%20split%20count_Data=3&knob-v%20-%20split_Data=false',
        { left: 320, top: 100 },
        { left: 630, top: 245 },
      );
    });

    test('should brush panel with time data', async ({ page }) => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/small-multiples-alpha--heatmap&globals=background:white;theme:light&knob-Hide_left=true&knob-Hide_right=true&knob-Hide_top=true&knob-Horizontal inner pad=0.1&knob-Horizontal inner pad_SmallMultiples Styles=0.05&knob-Horizontal outer pad=0&knob-Horizontal outer pad_SmallMultiples Styles=0&knob-Persist cells selection=true&knob-Show Legend=&knob-Show axes title_SmallMultiples Styles=true&knob-Show axis panel titles=true&knob-Show axis panel titles_SmallMultiples Styles=true&knob-Show grid line_bottom=true&knob-Show grid line_left=true&knob-Show x axis title_SmallMultiples Styles=true&knob-Show y axis title_SmallMultiples Styles=true&knob-Time data=true&knob-Title_bottom=Hosts - Bottom&knob-Title_left=Metrics - Left&knob-Title_right=Metrics - Right&knob-Title_top=Hosts - Top&knob-Vertical inner pad=0.3&knob-Vertical inner pad_SmallMultiples Styles=0.1&knob-Vertical outer pad=0&knob-Vertical outer pad_SmallMultiples Styles=0&knob-categories_Data=4&knob-cell%20density(%)_Data=20,20,60,20,20,50,20,5,25,20,25,50,50,50,50,25,20,20,20,20&knob-density(%)_Data=100&knob-density_Data=2&knob-group count_Data=9&knob-h - split count_Data=2&knob-h - split_Data=true&knob-number of groups_Data=4&knob-v - split count_Data=2&knob-v - split_Data=true&knob-Debug=&knob-Enable debug state=true&knob-cell density(%)_Data=75&knob-xScaleType_Data=linear&knob-Show axes panel titles_SmallMultiples Styles=true&knob-Grid stroke_SmallMultiples Styles=1',
        { left: 520, top: 210 },
        { left: 710, top: 280 },
      );
    });

    test('should select single cell on click with time data', async ({ page }) => {
      await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/small-multiples-alpha--heatmap&globals=background:white;theme:light&knob-Enable debug state=true&knob-Grid stroke_SmallMultiples Styles=1&knob-Hide_left=true&knob-Hide_right=true&knob-Hide_top=true&knob-Horizontal inner pad=0.1&knob-Horizontal inner pad_SmallMultiples Styles=0.05&knob-Horizontal outer pad=0&knob-Horizontal outer pad_SmallMultiples Styles=0&knob-Persist cells selection=true&knob-Show axes panel titles_SmallMultiples Styles=true&knob-Show axes title_SmallMultiples Styles=true&knob-Show axis panel titles=true&knob-Show axis panel titles_SmallMultiples Styles=true&knob-Show grid line_bottom=true&knob-Show grid line_left=true&knob-Show x axis title_SmallMultiples Styles=true&knob-Show y axis title_SmallMultiples Styles=true&knob-Time data=true&knob-Title_bottom=Hosts - Bottom&knob-Title_left=Metrics - Left&knob-Title_right=Metrics - Right&knob-Title_top=Hosts - Top&knob-Vertical inner pad=0.3&knob-Vertical inner pad_SmallMultiples Styles=0.1&knob-Vertical outer pad=0&knob-Vertical outer pad_SmallMultiples Styles=0&knob-categories_Data=4&knob-cell%20density(%)_Data=20,20,60,20,20,50,20,5,25,20,25,50,50,50,50,25,20,20,20,20,75&knob-density(%)_Data=100&knob-density_Data=2&knob-group count_Data=9&knob-h - split count_Data=2&knob-h - split_Data=true&knob-number of groups_Data=4&knob-v - split count_Data=2&knob-v - split_Data=true&knob-xScaleType_Data=linear&knob-Debug=&knob-Show Legend=&knob-cell density(%)_Data=75',
        { left: 340, top: 250 },
      );
    });

    test('should select single cell on click with categorical data', async ({ page }) => {
      await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/small-multiples-alpha--heatmap&globals=background:white;theme:light&knob-Enable debug state=true&knob-Grid stroke_SmallMultiples Styles=1&knob-Hide_left=true&knob-Hide_right=true&knob-Hide_top=true&knob-Horizontal inner pad=0.1&knob-Horizontal inner pad_SmallMultiples Styles=0.05&knob-Horizontal outer pad=0&knob-Horizontal outer pad_SmallMultiples Styles=0&knob-Persist cells selection=true&knob-Show axes panel titles_SmallMultiples Styles=true&knob-Show axes title_SmallMultiples Styles=true&knob-Show axis panel titles=true&knob-Show axis panel titles_SmallMultiples Styles=true&knob-Show grid line_bottom=true&knob-Show grid line_left=true&knob-Show x axis title_SmallMultiples Styles=true&knob-Show y axis title_SmallMultiples Styles=true&knob-Time data=false&knob-Title_bottom=Hosts - Bottom&knob-Title_left=Metrics - Left&knob-Title_right=Metrics - Right&knob-Title_top=Hosts - Top&knob-Vertical inner pad=0.3&knob-Vertical inner pad_SmallMultiples Styles=0.1&knob-Vertical outer pad=0&knob-Vertical outer pad_SmallMultiples Styles=0&knob-categories_Data=4&knob-cell%20density(%)_Data=20,20,60,20,20,50,20,5,25,20,25,50,50,50,50,25,20,20,20,20,75&knob-density(%)_Data=100&knob-density_Data=2&knob-group count_Data=9&knob-h - split count_Data=2&knob-h - split_Data=true&knob-number of groups_Data=4&knob-v - split count_Data=2&knob-v - split_Data=true&knob-xScaleType_Data=linear&knob-Debug=&knob-Show Legend=&knob-cell density(%)_Data=75',
        { left: 340, top: 250 },
      );
    });
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
