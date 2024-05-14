/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects';

test.describe('Area series stories', () => {
  test('stacked as NOT percentage', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/area-chart--stacked-percentage&knob-stacked as percentage=',
    );
  });

  test.describe('accessorFormats', () => {
    test('should show custom format', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/area-chart--band-area&knob-scale to extent=&knob-y0AccessorFormat= [min]&knob-y1AccessorFormat= [max]',
      );
    });
  });

  test.describe('Non-Stacked Linear Area with discontinuous data points', () => {
    test('with fit', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/line-chart--discontinuous-data-points&knob-enable fit function=false&knob-switch to area=true',
      );
    });

    test('no fit function', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/line-chart--discontinuous-data-points&knob-enable fit function=true&knob-switch to area=true',
      );
    });
  });
  test.describe('Negative log Areas', () => {
    test('shows negative values with log scale', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/area-chart--with-negative-values&knob-Y scale=log',
      );
    });
    test('shows only positive domain mixed polarity domain', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/area-chart--with-negative-and-positive&knob-Y scale=log',
      );
    });

    test('shows only positive domain mixed polarity domain with limit', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/area-chart--with-negative-and-positive&knob-Y scale=log&knob-Y log limit=0.01',
      );
    });

    test('shows only positive domain mixed polarity domain with limit of 0', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/area-chart--with-negative-and-positive&knob-Y scale=log&knob-Y log limit=0',
      );
    });

    test('shows only positive values when hiding negative one', async ({ page }) => {
      const action = async () => {
        // hold the meta/control key to hide rather than isolate
        await page.keyboard.down((await common.isMacOs(page)()) ? 'Meta' : 'Control');
        await page.click('.echLegendItem:nth-child(2) .echLegendItem__label');
      };
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/area-chart--with-negative-and-positive&knob-Y scale=log',
        { action },
      );
    });

    test('shows only negative values when hiding positive one', async ({ page }) => {
      const action = async () => {
        // hold the meta/control key to hide rather than isolate
        await page.keyboard.down((await common.isMacOs(page)()) ? 'Meta' : 'Control');
        await page.click('.echLegendItem:nth-child(1) .echLegendItem__label');
      };
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/area-chart--with-negative-and-positive&knob-Y scale=log',
        { action },
      );
    });
  });

  test.describe('Area with isolated data points', () => {
    test('render correctly fit function', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/line-chart--isolated-data-points&knob-enable fit function=&knob-series type=area',
      );
    });
  });

  test('small multiples with log scale dont clip', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/small-multiples-alpha--vertical-areas&globals=theme:light&knob-Show Legend=true&knob-Use log scale (different data)=true',
    );
  });
});
