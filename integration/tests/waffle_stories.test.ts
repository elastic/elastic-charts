/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { common } from '../page_objects/common';

describe('Waffle', () => {
  it('should render cells in ascending order', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/waffle-alpha--simple&globals=theme:light&knob-show table for debugging=&knob-ascending sort=true',
    );
  });
});
