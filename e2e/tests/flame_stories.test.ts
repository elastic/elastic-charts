/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { common } from '../page_objects';

test.describe('Flame stories', () => {
  test('should focus element on click', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9002/?path=/story/flame-alpha--cpu-profile-g-l-flame-chart',
      {
        action: async () => {
          await common.clickMouseRelativeToDOMElement(page)(
            {
              left: 225,
              top: 100,
            },
            common.chartSelector,
          );
        },
        // replace this with render count selector when render count fixed
        delay: 300, // wait for tweening and blinking to finish
      },
    );
  });
  test('should focus on searched terms', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      `http://localhost:9001/?path=/story/flame-alpha--cpu-profile-gl-flame-chart&globals=theme:light&knob-Text%20to%20search=gotype`,
      {
        // replace this with render count selector when render count fixed
        delay: 300, // wait for tweening and blinking to finish
      },
    );
  });
});
