/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { common } from '../page_objects/common';

describe('Small multiples - dark mode', () => {
  it('renders panel titles', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      `http://localhost:9001/?path=/story/small-multiples-alpha--sunbursts&knob-darkMode=true`,
    );
  });
});
