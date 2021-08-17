/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { common } from '../page_objects/common';

describe('Heatmap color scale', () => {
  it('quantile', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/heatmap-alpha--categorical&knob-color scale=quantile&knob-ranges=auto&knob-colors=green, yellow, red',
    );
  });
  it('quantize', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/heatmap-alpha--categorical&knob-color scale=quantize&knob-ranges=auto&knob-colors=green, yellow, red',
    );
  });
  it('threshold', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/heatmap-alpha--categorical&knob-color scale=threshold&knob-ranges=10000, 40000&knob-colors=green, yellow, red',
    );
  });

  it('linear', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/heatmap-alpha--categorical&knob-color scale=linear&knob-ranges=0, 10000, 25000, 50000, 100000&knob-colors=green, yellow, red, purple',
    );
  });
});
