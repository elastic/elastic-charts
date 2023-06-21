/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { Position } from '../constants';
import { pwEach } from '../helpers';
import { common } from '../page_objects/common';

test.describe('Chart', () => {
  test.describe('Sizing', () => {
    test('should accommodate chart title only', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9002/?path=/story/legend--positioning&knob-position=bottom&globals=toggles.showChartTitle:true',
      );
    });

    test('should accommodate chart description only', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9002/?path=/story/legend--positioning&knob-position=bottom&globals=toggles.showChartDescription:true',
      );
    });

    test('should render multiple charts with titles', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--multi-chart-cursor-sync',
        { screenshotSelector: '#story-root' },
      );
    });

    pwEach.test<Position>(['bottom', 'left', 'right', 'top'])(
      (position) => `should accommodate chart title and description - legend ${position}`,
      async (page, position) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9002/?path=/story/legend--positioning&globals=toggles.showChartTitle:true;toggles.showChartDescription:true&knob-position=${position}`,
        );
      },
    );

    pwEach.test<[type: string, url: string]>([
      ['Cartesian', 'http://localhost:9001/?path=/story/mixed-charts--areas-and-bars'],
      ['Partition', 'http://localhost:9001/?path=/story/sunburst--sunburst-with-three-layers'],
      ['Heatmap', 'http://localhost:9001/?path=/story/heatmap-alpha--basic'],
      ['WordCloud', 'http://localhost:9001/?path=/story/wordcloud-alpha--simple-wordcloud'],
      ['Metric SM', 'http://localhost:9001/?path=/story/metric-alpha--grid'],
    ])(
      ([type]) => `should accommodate chart title and description - ${type}`,
      async (page, [, url]) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `${url}&globals=toggles.showChartTitle:true;toggles.showChartDescription:true`,
        );
      },
    );
  });
});
