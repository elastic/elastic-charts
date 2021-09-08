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
});
