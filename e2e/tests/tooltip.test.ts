/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects/common';

process.env.ENV_URL = 'http://localhost:9002/';

test.describe('Tooltip', () => {
  test.describe('Chart Types', () => {
    test.describe('Cartesian', () => {
      test('pinning without selection', async ({ page }) => {
        await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
          'http://localhost:9001/?path=/story/components-tooltip--cartesian-charts&globals=theme:light&knob-Chart%20type=treemap&knob-SeriesType=bar&knob-async%20delay%20(ms)=1500&knob-character%20set=rtl&knob-data%20polarity=Mixed&knob-pinned=true&knob-rtl%20language=AR&knob-show%20legend=true&knob-stacked=true&knob-visible=true',
          { left: 240, bottom: 260 },
          'right',
        );
      });

      test('pinning over selection', async ({ page }) => {
        await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
          'http://localhost:9001/?path=/story/components-tooltip--cartesian-charts&globals=theme:light&knob-Chart type=treemap&knob-SeriesType=bar&knob-async delay=1000&knob-async delay (ms)=1500&knob-character set=rtl&knob-chart type=line&knob-data polarity=Mixed&knob-pinned=true&knob-rtl language=AR&knob-show legend=true&knob-stacked=true&knob-visible=true&knob-reduce data=true&knob-async actions delay=0',
          { left: 220, bottom: 285 },
          'right',
        );
      });

      test('show loading prompt for async actions', async ({ page }) => {
        await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
          'http://localhost:9001/?path=/story/components-tooltip--cartesian-charts&globals=theme:light&knob-Chart type=treemap&knob-SeriesType=bar&knob-async delay=1000&knob-async delay (ms)=1500&knob-character set=rtl&knob-chart type=line&knob-data polarity=Mixed&knob-pinned=true&knob-rtl language=AR&knob-show legend=true&knob-stacked=true&knob-visible=true&knob-reduce data=true&knob-async actions delay=1000',
          { left: 220, bottom: 285 },
          'right',
        );
      });

      test('selecting series on pinned tooltip', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          'http://localhost:9001/?path=/story/components-tooltip--cartesian-charts&globals=theme:light&knob-Chart type=treemap&knob-SeriesType=bar&knob-async delay=1000&knob-async delay (ms)=1500&knob-character set=rtl&knob-chart type=bar&knob-data polarity=Mixed&knob-pinned=true&knob-rtl language=AR&knob-show legend=true&knob-stacked=true&knob-visible=true&knob-reduce data=true&knob-async actions delay=0',
          {
            action: async () => {
              await common.clickMouseRelativeToDOMElement(page)({ left: 260, top: 180 }, common.chartSelector, 'right');
              // table row not visible thus not clickable by playwright
              const items = page.locator('.echTooltip__tableRow .echTooltip__tableCell:first-of-type');
              await items.nth(5).click();
              await items.nth(0).click();
              await items.nth(2).click();
            },
          },
        );
      });

      test('selecting series on pinned tooltip async', async ({ page }) => {
        const delay = 100;
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/components-tooltip--cartesian-charts&globals=theme:light&knob-Chart type=treemap&knob-SeriesType=bar&knob-async delay=1000&knob-async delay (ms)=1500&knob-character set=rtl&knob-chart type=bar&knob-data polarity=Mixed&knob-pinned=true&knob-rtl language=AR&knob-show legend=true&knob-stacked=true&knob-visible=true&knob-reduce data=true&knob-async actions delay=${delay}`,
          {
            action: async () => {
              await common.clickMouseRelativeToDOMElement(page)({ left: 260, top: 180 }, common.chartSelector, 'right');
              // table row not visible thus not clickable by playwright
              const items = page.locator('.echTooltip__tableRow .echTooltip__tableCell:first-of-type');
              await items.nth(2).click();
            },
            delay,
          },
        );
      });
    });

    test.describe('Partition', () => {
      test('pinning with selection', async ({ page }) => {
        await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
          'http://localhost:9001/?path=/story/components-tooltip--partition-charts&globals=background:white;theme:light&knob-Chart%20type=treemap&knob-SeriesType=bar&knob-async%20delay%20(ms)=1500&knob-character%20set=rtl&knob-data%20polarity=Mixed&knob-pinned=true&knob-rtl%20language=AR&knob-show%20legend=true&knob-stacked=true&knob-visible=true',
          { left: 245, bottom: 185 },
          'right',
        );
      });
    });

    test.describe('Heatmap', () => {
      test('pinning with selection', async ({ page }) => {
        await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
          'http://localhost:9001/?path=/story/components-tooltip--heatmap-chart&globals=theme:light&knob-Chart%20type=treemap&knob-SeriesType=bar&knob-async%20delay%20(ms)=1500&knob-character%20set=rtl&knob-data%20polarity=Mixed&knob-pinned=true&knob-rtl%20language=AR&knob-show%20legend=true&knob-stacked=true&knob-visible=true',
          { left: 300, bottom: 180 },
          'right',
        );
      });
    });

    test.describe('Flamegraph', () => {
      test('pinning with selection', async ({ page }) => {
        await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
          'http://localhost:9001/?path=/story/components-tooltip--flamegraph&globals=theme:light&knob-Chart%20type=treemap&knob-SeriesType=bar&knob-async%20delay%20(ms)=1500&knob-character%20set=rtl&knob-data%20polarity=Mixed&knob-pinned=true&knob-rtl%20language=AR&knob-show%20legend=true&knob-stacked=true&knob-visible=true',
          { left: 220, bottom: 220 },
          'right',
        );
      });
    });
  });
});
