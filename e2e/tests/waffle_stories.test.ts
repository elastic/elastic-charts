/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects/common';

test.describe('Waffle', () => {
  test('should render cells in ascending order', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/waffle-alpha--simple&globals=theme:eui-light&knob-show table for debugging=&knob-ascending sort=true',
    );
  });
  test('no stroke artifacts when using semi-transparent colors', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/waffle-alpha--test&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;theme:eui-light&knob-use alpha=true',
    );
  });
});
