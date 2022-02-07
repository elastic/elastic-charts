/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { pwEach } from '../helpers';
import { common } from '../page_objects';

test.describe('Scales stories', () => {
  pwEach.describe([
    ['Negative', true],
    ['Positive', false],
  ])(
    ([l]) => `${l} values`,
    (negative) => {
      pwEach.test(['common', 'binary', 'natural'])(
        (base) => `should render proper ticks with ${base} base`,
        async (page, base) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/scales--log-scale-options&knob-Use negative values_Y - Axis=${negative}&knob-Log base_Y - Axis=${base}&knob-Fit domain_Y - Axis=true&knob-Use default limit_Y - Axis=true`,
          );
        },
      );

      test('should render with baseline set to 1 if fit is false', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/scales--log-scale-options&knob-Use negative values_Y - Axis=${negative}&knob-Log base_Y - Axis=common&knob-Fit domain_Y - Axis=false&knob-Use default limit_Y - Axis=true`,
        );
      });

      test('should render with baseline set to 1 if fit is false and limit is set', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/scales--log-scale-options&knob-Use negative values_Y - Axis=${negative}&knob-Log base_Y - Axis=common&knob-Fit domain_Y - Axis=false&knob-Use default limit_Y - Axis=true&knob-Log min limit_Y - Axis=0.01`,
        );
      });

      test('should render values with log limit', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/scales--log-scale-options&knob-Use negative values_Y - Axis=${negative}&knob-Log base_Y - Axis=common&knob-Fit domain_Y - Axis=true&knob-Log min limit_Y - Axis=0.01&knob-Use default limit_Y - Axis=false`,
        );
      });
    },
  );
  test('should render linear binary with nicing', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      `http://localhost:9001/?path=/story/scales--linear-binary&globals=theme:light&knob-Data type=Base 2&knob-yScaleType=linear_binary&knob-Nice y ticks=true`,
    );
  });
});
