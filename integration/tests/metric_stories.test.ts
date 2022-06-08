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
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:light&knob-progress bar=small&knob-progress bar orientation=horizontal&knob-orientation=grid',
    );
  });
  it('should render no progress bar', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:light&knob-progress bar=none&knob-progress bar orientation=vertical&knob-orientation=grid',
    );
  });
  it('should render vertical progress bar  in dark mode', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:eui-dark&knob-orientation=grid&knob-progress bar=small&knob-progress bar orientation=vertical',
    );
  });
  it('should render horizontal progress bar in dark mode', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:eui-dark&knob-orientation=grid&knob-progress bar=small&knob-progress bar orientation=horizontal',
    );
  });
  it('should render no progress bar  in dark mode', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:eui-dark&knob-orientation=grid&knob-progress bar=none&knob-progress bar orientation=horizontal',
    );
  });
});
