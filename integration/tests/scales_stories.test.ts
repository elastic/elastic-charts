/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LogBase } from '../../packages/charts/src/scales/scale_continuous';
import { common } from '../page_objects';

describe('Scales stories', () => {
  describe.each`
    polarity      | value
    ${'Negative'} | ${true}
    ${'Positive'} | ${false}
  `('$polarity values', ({ value: negative }) => {
    it.each(Object.values(LogBase))('should render proper ticks with %s base', async (base) => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/scales--log-scale-options&knob-Use negative values_Y - Axis=${negative}&knob-Log base_Y - Axis=${base}&knob-Fit domain_Y - Axis=true&knob-Use default limit_Y - Axis=true`,
      );
    });

    it('should render with baseline set to 1 if fit is false', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/scales--log-scale-options&knob-Use negative values_Y - Axis=${negative}&knob-Log base_Y - Axis=common&knob-Fit domain_Y - Axis=false&knob-Use default limit_Y - Axis=true`,
      );
    });

    it('should render with baseline set to 1 if fit is false and limit is set', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/scales--log-scale-options&knob-Use negative values_Y - Axis=${negative}&knob-Log base_Y - Axis=common&knob-Fit domain_Y - Axis=false&knob-Use default limit_Y - Axis=true&knob-Log min limit_Y - Axis=0.01`,
      );
    });

    it('should render values with log limit', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/scales--log-scale-options&knob-Use negative values_Y - Axis=${negative}&knob-Log base_Y - Axis=common&knob-Fit domain_Y - Axis=true&knob-Log min limit_Y - Axis=0.01&knob-Use default limit_Y - Axis=false`,
      );
    });
  });
});
