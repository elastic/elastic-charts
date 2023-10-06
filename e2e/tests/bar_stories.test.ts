/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { DisplayValueStyleAlignment, HorizontalAlignment, VerticalAlignment } from '../constants';
import { eachRotation, pwEach } from '../helpers';
import { common } from '../page_objects';

test.describe('Bar series stories', () => {
  test.describe('[test] axis positions with histogram bar series', () => {
    eachRotation.test(
      async ({ page, rotation }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/interactions--brush-selection-tool-on-histogram-time-charts&knob-debug=&knob-chartRotation=${rotation}`,
        );
      },
      (r) => `Should render correct axis - rotation ${r}`,
    );
  });

  test.describe('[test] switch ordinal/linear x axis', () => {
    test('using ordinal x axis', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--test-switch-ordinal-linear-axis&knob-scaleType=ordinal',
      );
    });
  });

  test.describe('[test] discover', () => {
    test('using no custom minInterval', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--test-discover&knob-use custom minInterval of 30s=',
      );
    });
  });

  test.describe('[test] histogram mode (linear)', () => {
    test.describe('enableHistogramMode is true', () => {
      eachRotation.test(async ({ page, rotation }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-linear&knob-chartRotation=${rotation}&knob-bars padding=0.25&knob-histogram padding=0.05&knob-other series=line&knob-point series alignment=center&knob-hasHistogramBarSeries=&knob-debug=true&knob-bars-1 enableHistogramMode=true&knob-bars-2 enableHistogramMode=`,
        );
      });
    });

    test.describe('enableHistogramMode is false', () => {
      eachRotation.test(async ({ page, rotation }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-linear&knob-chartRotation=${rotation}&knob-bars padding=0.25&knob-histogram padding=0.05&knob-other series=line&knob-point series alignment=center&knob-hasHistogramBarSeries=&knob-debug=true&knob-bars-1 enableHistogramMode=&knob-bars-2 enableHistogramMode=`,
        );
      });
    });

    test.describe('point alignment', () => {
      test('start', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          'http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-linear&knob-chartRotation=-90&knob-bars padding=0.25&knob-histogram padding=0.05&knob-other series=area&knob-point series alignment=start&knob-hasHistogramBarSeries=true&knob-debug=true&knob-bars-1 enableHistogramMode=&knob-bars-2 enableHistogramMode=',
        );
      });
      test('center', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          'http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-linear&knob-chartRotation=-90&knob-bars padding=0.25&knob-histogram padding=0.05&knob-other series=area&knob-point series alignment=center&knob-hasHistogramBarSeries=true&knob-debug=true&knob-bars-1 enableHistogramMode=&knob-bars-2 enableHistogramMode=',
        );
      });
      test('end', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          'http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-linear&knob-chartRotation=-90&knob-bars padding=0.25&knob-histogram padding=0.05&knob-other series=area&knob-point series alignment=end&knob-hasHistogramBarSeries=true&knob-debug=true&knob-bars-1 enableHistogramMode=&knob-bars-2 enableHistogramMode=',
        );
      });
    });
  });

  test.describe('[test] histogram mode (ordinal)', () => {
    test.describe('enableHistogramMode is false, hasHistogramBarSeries is false', () => {
      eachRotation.test(async ({ page, rotation }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-ordinal&knob-chartRotation=${rotation}&knob-bars padding=0.25&knob-hasHistogramBarSeries=&knob-debug=true&knob-bars-1 enableHistogramMode=true&knob-bars-2 enableHistogramMode=`,
        );
      });
    });

    test.describe('enableHistogramMode is true, hasHistogramBarSeries is true', () => {
      eachRotation.test(async ({ page, rotation }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-ordinal&knob-chartRotation=${rotation}&knob-bars padding=0.25&knob-hasHistogramBarSeries=true&knob-debug=true&knob-bars-1 enableHistogramMode=true&knob-bars-2 enableHistogramMode=`,
        );
      });
    });
  });

  test.describe('different groupId', () => {
    test('render different axis scale', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        `http://localhost:9001/?path=/story/bar-chart--dual-axis-same-y-domain&knob-Apply a different groupId to some series=true&knob-Use the same data domain for each group=`,
      );
    });

    test('render the same domain with useDefaultGroupDomain', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        `http://localhost:9001/?path=/story/bar-chart--dual-axis-same-y-domain&knob-Apply a different groupId to some series=true&knob-Use the same data domain for each group=true`,
      );
    });
  });

  test.describe('value labels positioning', () => {
    test('clip both geometry and chart area values', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--with-value-label&knob-show single series=&knob-show value label=true&knob-alternating value label=&knob-contain value label within bar element=&knob-hide label if overflows chart edges=true&knob-hide label if overflows bar geometry=true&knob-debug=&knob-value font size=11&knob-value color=%23000&knob-offsetX=0&knob-offsetY=10&knob-data volume size=s&knob-split series=&knob-stacked series=&knob-chartRotation=0&knob-legend=right',
      );
    });
  });

  test.describe('value label positioning and formatting', () => {
    eachRotation.describe(({ rotation }) => {
      pwEach.describe<NonNullable<DisplayValueStyleAlignment>['vertical']>([
        VerticalAlignment.Middle,
        VerticalAlignment.Top,
        VerticalAlignment.Bottom,
      ])(
        (v) => `Vertical Alignment - ${v}`,
        (verticalAlignment) => {
          pwEach.describe<NonNullable<DisplayValueStyleAlignment>['horizontal']>([
            HorizontalAlignment.Left,
            HorizontalAlignment.Center,
            HorizontalAlignment.Right,
          ])(
            (h) => `Horizontal Alignment - ${h}`,
            (horizontalAlignment) => {
              const url = `http://localhost:9001/?path=/story/bar-chart--data-value&args=&globals=theme:eui-light&knob-chartRotation=${rotation}&knob-Horizontal alignment=${horizontalAlignment}&knob-Vertical alignment=${verticalAlignment}`;
              test('place the value labels on the correct area', async ({ page }) => {
                await common.expectChartAtUrlToMatchScreenshot(page)(url);
              });
            },
          );
        },
      );
    });
  });

  test.describe('functional accessors', () => {
    test('functional accessors with fieldName', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--functional-accessors&knob-y fn name=testY&knob-split fn name=testSplit',
      );
    });

    test('functional accessors with fieldName - with tooltip', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--functional-accessors&knob-y fn name=testY&knob-split fn name=testSplit',
        {
          top: 60,
          right: 180,
        },
        {
          screenshotSelector: 'body',
        },
      );
    });

    test('y1Accessors and y0Accessors', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--band-bar-chart&knob-fit Y domain=true&knob-use fn accessors=true',
      );
    });
  });
  test.describe('custom bar width', () => {
    test('pixel size', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/stylings--custom-series-styles-bars&knob-apply bar style (bar 1 series)_Chart Global Theme=true&knob-enable custom rect width (px)_Bar width=true&knob-rect width (px)_Bar width=15&knob-enable custom rect width (ratio)_Bar width=&knob-rect width (ratio)_Bar width=0.5&knob-border stroke_Bar 1 Style=blue&knob-border strokeWidth_Bar 1 Style=2&knob-border visible_Bar 1 Style=true&knob-rect fill_Bar 1 Style=%2322C61A&knob-rect opacity_Bar 1 Style=0.3&knob-theme border stroke_Chart Global Theme=red&knob-theme border strokeWidth_Chart Global Theme=2&knob-theme border visible_Chart Global Theme=true&knob-theme opacity _Chart Global Theme=0.9',
      );
    });
    test('ratio size', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/stylings--custom-series-styles-bars&knob-apply bar style (bar 1 series)_Chart Global Theme=true&knob-enable custom rect width (px)_Bar width=&knob-rect width (px)_Bar width=30&knob-enable custom rect width (ratio)_Bar width=true&knob-rect width (ratio)_Bar width=0.5&knob-border stroke_Bar 1 Style=blue&knob-border strokeWidth_Bar 1 Style=2&knob-border visible_Bar 1 Style=true&knob-rect fill_Bar 1 Style=%2322C61A&knob-rect opacity_Bar 1 Style=0.3&knob-theme border stroke_Chart Global Theme=red&knob-theme border strokeWidth_Chart Global Theme=2&knob-theme border visible_Chart Global Theme=true&knob-theme opacity _Chart Global Theme=0.9',
      );
    });
    test('pixel and ratio size', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/stylings--custom-series-styles-bars&knob-apply bar style (bar 1 series)_Chart Global Theme=true&knob-enable custom rect width (px)_Bar width=true&knob-rect width (px)_Bar width=40&knob-enable custom rect width (ratio)_Bar width=true&knob-rect width (ratio)_Bar width=0.2&knob-border stroke_Bar 1 Style=blue&knob-border strokeWidth_Bar 1 Style=2&knob-border visible_Bar 1 Style=true&knob-rect fill_Bar 1 Style=%2322C61A&knob-rect opacity_Bar 1 Style=0.3&knob-theme border stroke_Chart Global Theme=red&knob-theme border strokeWidth_Chart Global Theme=2&knob-theme border visible_Chart Global Theme=true&knob-theme opacity _Chart Global Theme=0.9',
      );
    });
  });

  test.describe('domain padding', () => {
    test('should allow domain space padding', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-yScaleDataToExtent=&knob-fit Y domain to data=true&knob-constrain padding=true&knob-domain padding=5&knob-Domain padding unit=domain&knob-data=all negative&knob-console log domains=true&knob-nice ticks=',
      );
    });
    test('should allow pixel space padding', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-yScaleDataToExtent=&knob-fit Y domain to data=true&knob-constrain padding=true&knob-domain padding=100&knob-Domain padding unit=pixel&knob-data=all negative&knob-console log domains=true&knob-nice ticks=',
      );
    });
    test('should apply padding with positive and negative values', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-fit Y domain to data=true&knob-constrain padding=true&knob-nice ticks=&knob-domain padding=50&knob-Domain padding unit=pixel&knob-data=mixed&knob-SeriesType=bar&knob-console log domains=true',
      );
    });
    test('should apply padding within intersept - positive values', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-fit Y domain to data=true&knob-constrain padding=true&knob-nice ticks=&knob-domain padding=50&knob-Domain padding unit=pixel&knob-data=all positive&knob-SeriesType=line&knob-console log domains=true',
      );
    });
    test('should constrain padding to intersept - positive values', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-fit Y domain to data=true&knob-constrain padding=true&knob-nice ticks=&knob-domain padding=100&knob-Domain padding unit=pixel&knob-data=all positive&knob-SeriesType=line&knob-console log domains=true',
      );
    });
    test('should apply padding within intersept - negative values', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-fit Y domain to data=true&knob-constrain padding=true&knob-nice ticks=&knob-domain padding=50&knob-Domain padding unit=pixel&knob-data=all negative&knob-SeriesType=line&knob-console log domains=true',
      );
    });
    test('should constrain padding to intersept - negative values', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-fit Y domain to data=true&knob-constrain padding=true&knob-nice ticks=&knob-domain padding=100&knob-Domain padding unit=pixel&knob-data=all negative&knob-SeriesType=line&knob-console log domains=true',
      );
    });
    test('should allow domain ratio padding', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-yScaleDataToExtent=&knob-fit Y domain to data=true&knob-constrain padding=true&knob-domain padding=0.5&knob-Domain padding unit=domainRatio&knob-data=all negative&knob-console log domains=true&knob-nice ticks=',
      );
    });
    test('should nice ticks after domain padding is applied', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-yScaleDataToExtent=&knob-fit Y domain to data=true&knob-constrain padding=&knob-domain padding=100&knob-Domain padding unit=pixel&knob-data=all negative&knob-console log domains=true&knob-nice ticks=true',
      );
    });
  });
  test.describe('Stacked bars configs', () => {
    test('percentage stacked with internal fn', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--stacked-as-percentage&globals=theme:eui-light&knob-mode=stackAsPercentage&knob-use computeRatioByGroups fn=',
      );
    });
    test('percentage stacked with external fn', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--stacked-as-percentage&globals=theme:eui-light&knob-mode=stackAsPercentage&knob-use computeRatioByGroups fn=true',
      );
    });
    test('non stacked with external fn', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--stacked-as-percentage&globals=theme:eui-light&knob-mode=unstacked&knob-use computeRatioByGroups fn=true',
      );
    });

    test('percentage stacked with external fn multi Y', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--stacked-as-percentage&globals=theme:eui-light&knob-mode=stackAsPercentage&knob-use computeRatioByGroups fn=true&knob-use multiple Y accessors=true',
      );
    });
    test('non stacked with external fn multi Y', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--stacked-as-percentage&globals=theme:eui-light&knob-mode=unstacked&knob-use computeRatioByGroups fn=true&knob-use multiple Y accessors=true',
      );
    });
  });
});
