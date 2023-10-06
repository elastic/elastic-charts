/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { eachTheme, pwEach } from '../helpers';
import { common } from '../page_objects';

test.describe('Goal stories', () => {
  test('should render without target', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/goal-alpha--gaps&knob-show target=false&knob-target=260',
    );
  });

  test('should render actual tooltip color on hover', async ({ page }) => {
    await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/goal-alpha--gaps&knob-show target=false&knob-target=260&globals=background:white',
      { right: 245, bottom: 120 },
    );
  });

  test.describe('Sagitta offset', () => {
    test('should render goal with asymetric angle', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/goal-alpha--gauge-with-target&knob-angleStart (n * π/8)=10&knob-angleEnd (n * π/8)=1',
      );
    });

    test('should limit min offset to π/2', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/goal-alpha--gauge-with-target&knob-angleStart (n * π/8)=6&knob-angleEnd (n * π/8)=2',
      );
    });

    test('should limit max offset to 3/2π', async ({ page }) => {
      // TODO revist once full circle chart is handled
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/goal-alpha--gauge-with-target&knob-angleStart (n * π/8)=11&knob-angleEnd (n * π/8)=-3',
      );
    });

    test('should show custom value formatter in tooltip', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/goal-alpha--gauge-with-target&knob-test tooltip value formatter=true',
        {
          right: 245,
          bottom: 120,
        },
      );
    });
  });

  eachTheme.describe(({ urlParam }) => {
    test('should render gauge with target story', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        `https://elastic.github.io/elastic-charts/?path=/story/goal-alpha--gauge-with-target&${urlParam}`,
      );
    });

    test('should render minimal goal story', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        `https://elastic.github.io/elastic-charts/?path=/story/goal-alpha--minimal-goal&${urlParam}`,
      );
    });

    test('should render vertical negative story', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        `https://elastic.github.io/elastic-charts/?path=/story/goal-alpha--vertical-negative&${urlParam}`,
      );
    });
  });

  test('should prevent overlapping angles - clockwise', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/goal-alpha--full-circle&globals=theme:eui-light&knob-endAngle%20(%CF%80)=-0.625&knob-startAngle%20(%CF%80)=1.5',
    );
  });

  test('should prevent overlapping angles - counterclockwise', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/goal-alpha--full-circle&globals=theme:eui-light&knob-endAngle%20(%CF%80)=1.625&knob-startAngle%20(%CF%80)=-0.5',
    );
  });

  test.describe('auto ticks', () => {
    pwEach.test<boolean>([true, false])(
      (p) => `goal - reverse ${p}`,
      async (page, reverse) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/goal-alpha--auto-linear-ticks&knob-subtype=goal&knob-reverse=${reverse}`,
        );
      },
    );
  });

  test.describe('sagitta shifted goal charts', () => {
    pwEach.test<[title: string, startAngle: number, endAngle: number]>([
      // top openings
      ['π/8 -> neg π', 1 / 8, -1],
      ['neg π/8 -> neg π', -1 / 8, -1],
      ['neg π -> π/8', -1, 1 / 8],
      ['neg π -> neg π/8', -1, -1 / 8],
      ['neg π/4 -> neg 3π/4', -1 / 4, -3 / 4],
      ['neg 3π/4 -> neg π/4', -3 / 4, -1 / 4],
    ])(
      ([p]) => `should apply correct top shift (${p})`,
      async (page, [, startAngle, endAngle]) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/goal-alpha--full-circle&globals=theme:eui-light&knob-startAngle%20(%CF%80)=${startAngle}&knob-endAngle%20(%CF%80)=${endAngle}`,
        );
      },
    );
    pwEach.test<[title: string, startAngle: number, endAngle: number]>([
      // bottom openings
      ['π -> 0', 1, 0],
      ['3π/4 -> 0', 3 / 4, 0],
      ['neg π/8 -> π', -1 / 8, 1],
      ['π/8 -> π', 1 / 8, 1],
      ['3π/4 -> π/4', 3 / 4, 1 / 4],
      ['π/4 -> 3π/4', 1 / 4, 3 / 4],
    ])(
      ([p]) => `should apply correct bottom shift (${p})`,
      async (page, [, startAngle, endAngle]) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/goal-alpha--full-circle&globals=theme:eui-light&knob-startAngle%20(%CF%80)=${startAngle}&knob-endAngle%20(%CF%80)=${endAngle}`,
        );
      },
    );
  });
});
