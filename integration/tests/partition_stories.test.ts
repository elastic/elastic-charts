/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { common } from '../page_objects';

describe('Axis stories', () => {
  it('should sort the first layer too', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/mosaic-alpha--other-slices&globals=background:white;theme:light&knob-"Other" on bottom even if not the smallest=true&knob-Alphabetical outer group sorting=true',
    );
  });
  it('should sort just the first layer', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/mosaic-alpha--other-slices&globals=background:white;theme:light&knob-"Other" on bottom even if not the smallest=false&knob-Alphabetical outer group sorting=true',
    );
  });
});
