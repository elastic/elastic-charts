/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { common } from '../page_objects/common';

describe('Time zone', () => {
  it('UTC plus 8', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/scales--timezone-configuration&globals=theme:light&knob-dataset=utc%2B8&knob-tooltip=utc',
    );
  });
  it('UTC minus 8', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/scales--timezone-configuration&globals=theme:light&knob-dataset=utc-8&knob-tooltip=utc',
    );
  });
  // skip until puppeteer is updated to > 4.x
  it.skip('use default local timezone America/New_York', async () => {
    // await page.emulateTimezone('America/New_York');
    // time should start at 06:00 (UTC time is 11:00)
    await common.expectChartWithMouseAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/bar-chart--with-time-x-axis',
      { left: 80, top: 100 },
      { screenshotSelector: 'body' },
    );
  });
  // skipped until puppeteer is updated to > 4.x
  it.skip('use default local timezone Europe/Rome', async () => {
    // await page.emulateTimezone('Europe/Rome');
    // time should start at 12:00 (UTC time is 11:00)
    await common.expectChartWithMouseAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/bar-chart--with-time-x-axis',
      { left: 80, top: 100 },
      { screenshotSelector: 'body' },
    );
  });
});
