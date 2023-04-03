/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

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
  test('should render vertical progress bar  in dark mode', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:eui-dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=vertical&knob-use progress bar=true',
    );
  });
  test('should render horizontal progress bar in dark mode', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:eui-dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=horizontal&knob-use progress bar=true',
    );
  });
  test('should render no progress bar  in dark mode', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:eui-dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=horizontal&knob-use progress bar=',
    );
  });
  test('text value with trend', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--basic&globals=theme:light&knob-EUI%20icon%20glyph%20name=warning&knob-color=rgba(43,%2028,%20115,%201)&knob-extra=last 5m 94%25&knob-progress%20bar%20direction=vertical&knob-progress%20max=100&knob-progress%20or%20trend=trend&knob-subtitle=Cluster%20CPU%20usage&knob-title=21d7f8b7-92ea-41a0-8c03-0db0ec7e11b9&knob-trend%20a11y%20description=The%20trend%20shows%20a%20peak%20of%20CPU%20usage%20in%20the%20last%205%20minutes&knob-trend%20a11y%20title=The%20Cluster%20CPU%20Usage%20trend&knob-trend%20data%20points=30&knob-trend%20shape=area&knob-value=United%20States&knob-value%20postfix=%20%',
    );
  });
});
