/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { common } from '../page_objects';

describe('Area series stories', () => {
  it('stacked as NOT percentage', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/area-chart--stacked-percentage&knob-stacked as percentage=',
    );
  });

  describe('accessorFormats', () => {
    it('should show custom format', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/area-chart--band-area&knob-scale to extent=&knob-y0AccessorFormat= [min]&knob-y1AccessorFormat= [max]',
      );
    });
  });

  describe('Non-Stacked Linear Area with discontinuous data points', () => {
    it('with fit', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/line-chart--discontinuous-data-points&knob-enable fit function=false&knob-switch to area=true',
      );
    });

    it('no fit function', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/line-chart--discontinuous-data-points&knob-enable fit function=true&knob-switch to area=true',
      );
    });
  });
  describe('Negative log Areas', () => {
    it('shows negative values with log scale', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/area-chart--with-negative-values&knob-Y scale=log',
      );
    });
    it('shows only positive domain mixed polarity domain', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/area-chart--with-negative-and-positive&knob-Y scale=log',
      );
    });

    it('shows only positive domain mixed polarity domain with limit', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/area-chart--with-negative-and-positive&knob-Y scale=log&knob-Y log limit=0.01',
      );
    });

    it('shows only positive domain mixed polarity domain with limit of 0', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/area-chart--with-negative-and-positive&knob-Y scale=log&knob-Y log limit=0',
      );
    });

    it('shows only positive values when hiding negative one', async () => {
      const action = async () => {
        await page.click('.echLegendItem:nth-child(2) .echLegendItem__label');
      };
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/area-chart--with-negative-and-positive&knob-Y scale=log',
        { action },
      );
    });

    it('shows only negative values when hiding positive one', async () => {
      const action = async () => {
        await page.click('.echLegendItem:nth-child(1) .echLegendItem__label');
      };
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/area-chart--with-negative-and-positive&knob-Y scale=log',
        { action },
      );
    });
  });
  describe('Area with orphan data points', () => {
    it('render correctly fit function', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/line-chart--test-orphan-data-points&knob-enable fit function=&knob-switch to area=true',
      );
    });
  });
});
