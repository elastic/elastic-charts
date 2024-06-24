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
  // See https://github.com/elastic/elastic-charts/issues/2456
  test('should render sunburst as full circle', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/sunburst--single-slice&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-Banded=true&knob-EUI%20icon%20glyph%20name=warning&knob-EUI%20value%20icon%20glyph%20name=sortUp&knob-Scale%20Type=log&knob-Series%20Type=bar&knob-Split=true&knob-Stacked=true&knob-Trend%20length=0&knob-Trend%20length%20x=3&knob-attach%20click%20handler=true&knob-blending%20background=rgba(255,255,255,1)&knob-brush%20axis=x&knob-chartRotation=90&knob-custom%20value=678&knob-use%20custom%20value=',
    );
  });

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

  test.describe('Start day of week', () => {
    test('should correctly render histogram with start of week as Sunday', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--start-day-of-week&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-start date=1710796632334&knob-start dow=7&knob-data count=18&knob-data interval (amount)=1&knob-data interval (unit)=week',
      );
    });
  });

  test.describe('Log scales', () => {
    test('should correctly render negative values from baseline when banded', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--log-with-negative-values&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-Show legend=&knob-Scale Type=log&knob-Series Type=bar&knob-logMinLimit=1&knob-Nice y ticks=&knob-Banded=true&knob-Split=&knob-Stacked=false&knob-Show positive data=',
      );
    });

    test('should correctly render tooltip values for banded bars', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--log-with-negative-values&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-Show legend=&knob-Scale Type=log&knob-Series Type=bar&knob-logMinLimit=1&knob-Nice y ticks=&knob-Banded=true&knob-Split=&knob-Stacked=false&knob-Show positive data=',
        {
          top: 240,
          right: 240,
        },
      );
    });

    test('should correctly render negative values from baseline when stacked', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--log-with-negative-values&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-Show legend=&knob-Scale Type=log&knob-Series Type=bar&knob-logMinLimit=1&knob-Nice y ticks=&knob-Banded=&knob-Split=true&knob-Stacked=true&knob-Show positive data=',
      );
    });
  });

  test.describe('Isolated point styles', () => {
    test('should disable isolated point styles', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--point-style-overrides&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-disable isolated point styles=true&knob-series type=line&knob-point.stroke - theme level=red&knob-isolatedPoint.stroke - theme level=green&knob-use series overrides=&knob-point.stroke - series level=blue&knob-use series iso overrides=&knob-isolatedPoint.stroke - series level=orange&knob-use point style overrides=&knob-stroke - pointStyleAccessor=black',
      );
    });

    test('should override theme point and iso point styles with series styles', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--point-style-overrides&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-isolatedPoint.stroke - series level=orange&knob-isolatedPoint.stroke - theme level=green&knob-point.stroke - series level=blue&knob-point.stroke - theme level=red&knob-series type=line&knob-stroke - pointStyleAccessor=black&knob-use point style overrides=false&knob-use series iso overrides=false&knob-use series overrides=true',
      );
    });

    test('should override theme and series point styles with iso point styles', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--point-style-overrides&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-isolatedPoint.stroke - series level=orange&knob-isolatedPoint.stroke - theme level=green&knob-point.stroke - series level=blue&knob-point.stroke - theme level=red&knob-series type=line&knob-stroke - pointStyleAccessor=black&knob-use point style overrides=false&knob-use series iso overrides=true&knob-use series overrides=true',
      );
    });

    test('should override all point styles with point accessor styles', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/test-cases--point-style-overrides&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-isolatedPoint.stroke - series level=orange&knob-isolatedPoint.stroke - theme level=green&knob-point.stroke - series level=blue&knob-point.stroke - theme level=red&knob-series type=line&knob-stroke - pointStyleAccessor=black&knob-use point style overrides=true&knob-use series iso overrides=true&knob-use series overrides=true',
      );
    });
  });
});
