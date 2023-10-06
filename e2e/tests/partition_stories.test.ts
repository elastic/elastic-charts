/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { PartitionLayout } from '../constants';
import { eachTheme, pwEach } from '../helpers';
import { common } from '../page_objects';

test.describe('Axis stories', () => {
  test('should sort the first layer too', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/mosaic-alpha--other-slices&globals=background:white;theme:eui-light&knob-"Other" on bottom even if not the smallest=true&knob-Alphabetical outer group sorting=true',
    );
  });
  test('should sort just the first layer', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/mosaic-alpha--other-slices&globals=background:white;theme:eui-light&knob-"Other" on bottom even if not the smallest=false&knob-Alphabetical outer group sorting=true',
    );
  });

  eachTheme.describe(
    ({ urlParam }) => {
      test('should show default textColor', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/sunburst--linked-labels-only&${urlParam}&knob-custom linkLabel.textColor=false`,
        );
      });
      test('should show custom red textColor', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/sunburst--linked-labels-only&${urlParam}&knob-custom linkLabel.textColor=true&knob-linkLabel.textColor=rgba(171, 146, 146, .85)`,
        );
      });
      test('should show custom white textColor', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/sunburst--linked-labels-only&${urlParam}&knob-custom linkLabel.textColor=true&knob-linkLabel.textColor=rgba(255, 255, 255, 1)`,
        );
      });
      test('should show custom black textColor', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/sunburst--linked-labels-only&${urlParam}&knob-custom linkLabel.textColor=true&knob-linkLabel.textColor=rgba(0, 0, 0, 1)`,
        );
      });
      test('should show custom white/translucent textColor', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/sunburst--linked-labels-only&${urlParam}&knob-custom linkLabel.textColor=true&knob-linkLabel.textColor=rgba(255, 255, 255, 0.3)`,
        );
      });
      test('should show custom black/translucent textColor', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/sunburst--linked-labels-only&${urlParam}&knob-custom linkLabel.textColor=true&knob-linkLabel.textColor=rgba(0, 0, 0, 0.3)`,
        );
      });
    },
    (t) => `linkLabel textcolor - ${t} theme`,
  );

  pwEach.describe([PartitionLayout.treemap, PartitionLayout.sunburst])(
    (c) => `fillLabel textcolor - ${c}`,
    (partitionLayout) => {
      test('should show custom red textColor', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/treemap--one-layer2&knob-partitionLayout=${partitionLayout}&knob-custom fillLabel.textColor=true&knob-fillLabel.textColor=rgba(255, 0, 0, 0.85)`,
        );
      });
      test('should show custom white textColor', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/treemap--one-layer2&knob-partitionLayout=${partitionLayout}&knob-custom fillLabel.textColor=true&knob-fillLabel.textColor=rgba(255, 255, 255, 1)`,
        );
      });
      test('should show custom black textColor', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/treemap--one-layer2&knob-partitionLayout=${partitionLayout}&knob-custom fillLabel.textColor=true&knob-fillLabel.textColor=rgba(0, 0, 0, 1)`,
        );
      });
      test('should show custom white/translucent textColor', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/treemap--one-layer2&knob-partitionLayout=${partitionLayout}&knob-custom fillLabel.textColor=true&knob-fillLabel.textColor=rgba(255, 255, 255, 0.3)`,
        );
      });
      test('should show custom black/translucent textColor', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/treemap--one-layer2&knob-partitionLayout=${partitionLayout}&knob-custom fillLabel.textColor=true&knob-fillLabel.textColor=rgba(0, 0, 0, 0.3)`,
        );
      });
    },
  );

  eachTheme.test(
    async ({ page, urlParam }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        `http://localhost:9001/?path=/story/sunburst--value-formatted-with-categorical-color-palette&${urlParam}`,
      );
    },
    (theme) => `should render link labels with fallback text color for ${theme} theme`,
  );
});
