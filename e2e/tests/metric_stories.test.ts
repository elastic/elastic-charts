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

test.describe('Metric', () => {
  test('should render horizontal progress bar', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:light&knob-use progress bar=true&knob-progress bar direction=horizontal&knob-max trend data points=30&knob-layout=grid',
    );
  });
  test('should render no progress bar', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:light&knob-use progress bar=&knob-progress bar direction=horizontal&knob-max trend data points=30&knob-layout=grid',
    );
  });
  test('should render vertical progress bar in dark mode', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=vertical&knob-use progress bar=true',
    );
  });
  test('should render horizontal progress bar in dark mode', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=horizontal&knob-use progress bar=true',
    );
  });
  test('should render no progress bar in dark mode', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=horizontal&knob-use progress bar=',
    );
  });
  test('text value with trend', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--basic&globals=theme:light&knob-EUI icon glyph name=warning&knob-color=rgba(166, 219, 208, 1)&knob-extra=1310 (-74% week before)&knob-is numeric metric=false&knob-progress bar direction=vertical&knob-progress max=100&knob-progress or trend=trend&knob-subtitle=&knob-title=Most used in&knob-trend a11y description=The trend shows a peak of CPU usage in the last 5 minutes&knob-trend a11y title=The Cluster CPU Usage trend&knob-trend data points=30&knob-trend shape=area&knob-value=United States&knob-value postfix=&knob-value prefix=&knob-show icon=',
    );
  });
  test('value icon and value color', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--basic&globals=theme:light&knob-title=Network out&knob-subtitle=host: 1dc4e&knob-progress or trend=trend&knob-progress bar direction=vertical&knob-trend data points=30&knob-trend shape=area&knob-trend a11y title=The Cluster CPU Usage trend&knob-trend a11y description=The trend shows a peak of CPU usage in the last 5 minutes&knob-extra=last <b>5m</b>&knob-progress max=100&knob-is numeric metric=true&knob-value=55.23&knob-value prefix=&knob-value postfix=GB&knob-color=rgba(255, 255, 255, 1)&knob-use value color=true&knob-value color=rgba(189, 0, 0, 1)&knob-show icon=true&knob-EUI icon glyph name=warning&knob-show value icon=true&knob-EUI value icon glyph name=sortUp',
    );
  });
  test('should render with empty and missing background colors', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:light;background:gray&knob-empty background=white&knob-number of columns=3',
    );
  });

  pwEach.describe(['trend', 'bar', 'none'])(
    (v) => `Metric - ${v} type`,
    (type) => {
      eachTheme.describe(
        ({ urlParam }) => {
          const metricUrl = `http://localhost:9001/?path=/story/metric-alpha--basic&${urlParam}&knob-EUI icon glyph name=warning&knob-EUI value icon glyph name=sortUp&knob-color=rgba(157, 66, 66, 0.44)&knob-extra=last <b>5m</b>&knob-is numeric metric=true&knob-progress bar direction=vertical&knob-progress max=100&knob-progress or trend=${type}&knob-subtitle=Cluster CPU usage&knob-title=21d7f8b7-92ea-41a0-8c03-0db0ec7e11b9&knob-trend a11y description=The trend shows a peak of CPU usage in the last 5 minutes&knob-trend a11y title=The Cluster CPU Usage trend&knob-trend data points=30&knob-trend shape=area&knob-value=55.23&knob-value color=#3c3c3c&knob-value prefix=&knob-value postfix= %&knob-use value color=&knob-show icon=&knob-show value icon=`;
          test('should render metric with transparent bg color', async ({ page }) => {
            await common.expectChartAtUrlToMatchScreenshot(page)(metricUrl);
          });

          test('should render metric with hover interaction', async ({ page }) => {
            await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(metricUrl, { top: 100, left: 100 });
          });

          test('should render metric with click interaction', async ({ page }) => {
            await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
              metricUrl,
              { top: 100, left: 100 },
              { delay: 400 }, // 10ms delay to capture click and hold
            );
          });
        },
        (t) => `${t} theme`,
      );
    },
  );
});
