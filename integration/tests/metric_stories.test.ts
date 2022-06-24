/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { common } from '../page_objects';

describe('Metric', () => {
  it('should render horizontal progress bar', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:light&knob-use progress bar=true&knob-progress bar direction=horizontal&knob-max trend data points=30&knob-layout=grid',
    );
  });
  it('should render no progress bar', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:light&knob-use progress bar=&knob-progress bar direction=horizontal&knob-max trend data points=30&knob-layout=grid',
    );
  });
  it('should render vertical progress bar  in dark mode', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:eui-dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=vertical&knob-use progress bar=true',
    );
  });
  it('should render horizontal progress bar in dark mode', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:eui-dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=horizontal&knob-use progress bar=true',
    );
  });
  it('should render no progress bar  in dark mode', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:eui-dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=horizontal&knob-use progress bar=',
    );
  });
});
