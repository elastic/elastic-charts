/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Time zone', () => {
  test('UTC plus 8', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/scales--timezone-configuration&globals=theme:eui-light&knob-dataset=utc%2B8&knob-tooltip=utc',
    );
  });

  test('UTC minus 8', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/scales--timezone-configuration&globals=theme:eui-light&knob-dataset=utc-8&knob-tooltip=utc',
    );
  });

  test.describe('timezone America/New_York', () => {
    const timezoneId = 'America/New_York';
    test.use({ timezoneId });
    test('use default local timezone America/New_York', async ({ page }) => {
      // time should start at 06:00 (UTC time is 11:00)
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--with-time-x-axis',
        { left: 80, top: 100 },
        { screenshotSelector: 'body' },
      );
    });
  });

  test.describe('timezone Europe/Rome', () => {
    const timezoneId = 'Europe/Rome';
    test.use({ timezoneId });
    test('use default local timezone Europe/Rome', async ({ page }) => {
      // time should start at 12:00 (UTC time is 11:00)
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--with-time-x-axis',
        { left: 80, top: 100 },
        { screenshotSelector: 'body' },
      );
    });
  });
});
