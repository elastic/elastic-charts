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

  describe('Sagitta offset', () => {
    it('should render goal with asymetric angle', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/goal-alpha--gauge-with-target&knob-angleStart (n * π/8)=10&knob-angleEnd (n * π/8)=1',
      );
    });

    it('should limit min offset to π/2', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/goal-alpha--gauge-with-target&knob-angleStart (n * π/8)=6&knob-angleEnd (n * π/8)=2',
      );
    });

    it('should limit max offset to 3/2π', async () => {
      // TODO revist once full circle chart is handled
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/goal-alpha--gauge-with-target&knob-angleStart (n * π/8)=11&knob-angleEnd (n * π/8)=-3',
      );
    });

    it('should show custom value formatter in tooltip', async () => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/goal-alpha--gauge-with-target&knob-test tooltip value formatter=true',
        { right: 245, bottom: 120 },
      );
    });
  });

  eachTheme.describe((_, params) => {
    it('should render gauge with target story', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `https://elastic.github.io/elastic-charts/?path=/story/goal-alpha--gauge-with-target&${params}`,
      );
    });

    it('should render minimal goal story', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `https://elastic.github.io/elastic-charts/?path=/story/goal-alpha--minimal-goal&${params}`,
      );
    });

    it('should render vertical negative story', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `https://elastic.github.io/elastic-charts/?path=/story/goal-alpha--vertical-negative&${params}`,
      );
    });
  });

  it('should prevent overlapping angles - clockwise', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/goal-alpha--full-circle&globals=theme:light&knob-endAngle%20(%CF%80)=-0.625&knob-startAngle%20(%CF%80)=1.5',
    );
  });

  it('should prevent overlapping angles - counterclockwise', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/goal-alpha--full-circle&globals=theme:light&knob-endAngle%20(%CF%80)=1.625&knob-startAngle%20(%CF%80)=-0.5',
    );
  });

  describe('auto ticks', () => {
    it.each<boolean>([true, false])('reverse %p', async (reverse) => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/goal-alpha--auto-linear-ticks&knob-reverse=${reverse}`,
      );
    });
  });

  describe('sagitta shifted goal charts', () => {
    it.each<[title: string, startAngle: number, endAngle: number]>([
      // top openings
      ['π/8 -> neg π', 1 / 8, -1],
      ['neg π/8 -> neg π', -1 / 8, -1],
      ['neg π -> π/8', -1, 1 / 8],
      ['neg π -> neg π/8', -1, -1 / 8],
      ['neg π/4 -> neg 3π/4', -1 / 4, -3 / 4],
      ['neg 3π/4 -> neg π/4', -3 / 4, -1 / 4],
    ])('should apply correct top shift (%s)', async (_, startAngle, endAngle) => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/goal-alpha--full-circle&globals=theme:light&knob-startAngle%20(%CF%80)=${startAngle}&knob-endAngle%20(%CF%80)=${endAngle}`,
      );
    });
    it.each<[title: string, startAngle: number, endAngle: number]>([
      // bottom openings
      ['π -> 0', 1, 0],
      ['3π/4 -> 0', 3 / 4, 0],
      ['neg π/8 -> π', -1 / 8, 1],
      ['π/8 -> π', 1 / 8, 1],
      ['3π/4 -> π/4', 3 / 4, 1 / 4],
      ['π/4 -> 3π/4', 1 / 4, 3 / 4],
    ])('should apply correct bottom shift (%s)', async (_, startAngle, endAngle) => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/goal-alpha--full-circle&globals=theme:light&knob-startAngle%20(%CF%80)=${startAngle}&knob-endAngle%20(%CF%80)=${endAngle}`,
      );
    });
  });
});
