/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { PartitionLayout, SeriesType } from '../constants';
import { eachRotation, pwEach } from '../helpers';
import { common } from '../page_objects';

test.describe('Test cases stories', () => {
  test('should render custom no results component', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/test-cases--no-series&knob-Show custom no results=true',
      {
        waitSelector: '.echReactiveChart_noResults .euiIcon:not(.euiIcon-isLoading)',
      },
    );
  });

  test('should render default no results component', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/test-cases--no-series&knob-Show custom no results=false',
      {
        waitSelector: '.echReactiveChart_noResults',
      },
    );
  });

  test.describe('annotation marker rotation', () => {
    eachRotation.test(
      async ({ page, rotation }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/iframe.html?id=test-cases--no-axes-annotation-bug-fix&knob-horizontal marker position=undefined&knob-vertical marker position=undefined&knob-chartRotation=${rotation}`,
        );
      },
      (r) => `should render marker with annotations with ${r} degree rotations`,
    );
  });

  test.describe('RTL support', () => {
    pwEach.describe([SeriesType.Bar, PartitionLayout.treemap, PartitionLayout.sunburst])(
      (l) => `${l} chart type`,
      (type) => {
        pwEach.describe(['HE', 'AR'])(
          (l) => `lang ${l}`,
          (lang) => {
            pwEach.describe(['rtl', 'ltr', 'mostly-rtl', 'mostly-ltr'])(
              (t) => `${t} text`,
              (charSet) => {
                test('should render with correct direction', async ({ page }) => {
                  await common.expectChartAtUrlToMatchScreenshot(page)(
                    `http://localhost:9001/?path=/story/test-cases--rtl-text&globals=theme:light&knob-Chart type=${type}&knob-character set=${charSet}&knob-show legend=true&knob-clockwiseSectors=true&knob-rtl language=${lang}`,
                  );
                });

                if (type === PartitionLayout.sunburst) {
                  test('should render with correct direction - clockwiseSectors', async ({ page }) => {
                    await common.expectChartAtUrlToMatchScreenshot(page)(
                      `http://localhost:9001/?path=/story/test-cases--rtl-text&globals=theme:light&knob-Chart type=${type}&knob-character set=${charSet}&knob-show legend=true&knob-clockwiseSectors=false&knob-rtl language=${lang}`,
                    );
                  });
                }
              },
            );
          },
        );
      },
    );
  });

  test.describe('Data points outside of the configured Y domain', () => {
    test('should not render points outside domain with line chart', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--test-points-outside-of-domain&knob-series%20type=line',
      );
    });
  });

  test.describe('Legend last value should be aligned across areas and bars', () => {
    test('data domain', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--domain-edges&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-custom domain=&knob-start time=0&knob-end time=19&knob-subtract 1ms=',
        { screenshotSelector: '#story-root' },
      );
    });
    test('custom domain', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--domain-edges&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-custom domain=true&knob-start time=0&knob-end time=19&knob-subtract 1ms=',
        { screenshotSelector: '#story-root' },
      );
    });
    test('custom -1ms', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--domain-edges&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-custom domain=true&knob-start time=0&knob-end time=19&knob-subtract 1ms=true',
        { screenshotSelector: '#story-root' },
      );
    });
    test('custom empty', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--domain-edges&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-custom domain=true&knob-end time=10.2&knob-start time=0&knob-subtract 1ms=true',
        { screenshotSelector: '#story-root' },
      );
    });
  });
});
