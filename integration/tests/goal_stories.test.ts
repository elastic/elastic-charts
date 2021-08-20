/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { eachTheme } from '../helpers';
import { common } from '../page_objects';

describe('Goal stories', () => {
  it('should render without target', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/goal-alpha--gaps&knob-show target=false&knob-target=260',
    );
  });

  it('should render actual tooltip color on hover', async () => {
    await common.expectChartWithMouseAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/goal-alpha--gaps&knob-show target=false&knob-target=260&globals=background:white',
      { right: 245, bottom: 120 },
    );
  });

  eachTheme.describe((_, params) => {
    it('should render gauge with target story', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `https://elastic.github.io/elastic-charts/?path=/story/goal-alpha--gauge-with-target${params}`,
      );
    });

    it('should render minimal goal story', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `https://elastic.github.io/elastic-charts/?path=/story/goal-alpha--minimal-goal${params}`,
      );
    });

    it('should render vertical negative story', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `https://elastic.github.io/elastic-charts/?path=/story/goal-alpha--vertical-negative${params}`,
      );
    });
  });
});
