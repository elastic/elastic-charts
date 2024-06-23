/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { Position } from '../constants';
import { eachRotation, pwEach } from '../helpers';
import { common } from '../page_objects';

test.describe('Annotations stories', () => {
  test.describe('rotation', () => {
    eachRotation.test(async ({ page, rotation }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        `http://localhost:9001/?path=/story/annotations-lines--single-bar-histogram&knob-debug=&knob-chartRotation=${rotation}`,
      );
    });
  });

  test.describe('Hover state', () => {
    const url =
      'http://localhost:9001/?path=/story/annotations-rects--styling&knob-showLineAnnotations=true&knob-chartRotation=0';

    test('should fade all other annotations when line marker is hovered', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(url, {
        bottom: 52,
        left: 196,
      });
    });
    test('should fade all other annotations when rect annotation is hovered', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        url,
        {
          bottom: 188,
          left: 225,
        },
        {
          maxDiffPixels: 10,
        },
      );
    });
  });

  test.describe('Render within domain', () => {
    test('cover from 0 to end domain', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--linear-bar-chart&knob-debug=&knob-chartRotation=0&knob-x0 coordinate=0&knob-x1 coordinate=none',
      );
    });
    test('cover from 0 to 1', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--linear-bar-chart&knob-debug=&knob-chartRotation=0&knob-x0 coordinate=0&knob-x1 coordinate=1',
      );
    });
    test('cover from 3 only on bar chart', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--linear-bar-chart&knob-debug=&knob-chartRotation=0&knob-x0 coordinate=3&knob-x1 coordinate=none',
      );
    });
    test('cover from 1 only on bar chart', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--linear-bar-chart&knob-debug=&knob-chartRotation=0&knob-x0 coordinate=1&knob-x1 coordinate=1',
      );
    });
    test("don't render outside domain", async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--linear-bar-chart&knob-debug=&knob-chartRotation=0&knob-x0 coordinate=3.1&knob-x1 coordinate=none',
      );
    });
  });

  test.describe('Render with zero domain or fit to domain', () => {
    test('show annotation when yDomain is not zero value', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--zero-domain&knob-min y=0&knob-max y=20&knob-x0=5&knob-x1=10&knob-enable y0 and y1 values=&knob-y0=1&knob-y1=5',
      );
    });
    test('show annotation when yDomain is [0, 20] and y0 and y1 are specified', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--zero-domain&knob-min y=0&knob-max y=20&knob-x0=5&knob-x1=10&knob-enable y0 and y1 values=true&knob-y0=1&knob-y1=5',
      );
    });
    test('show annotation when yDomain is [0, 0]', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--zero-domain&knob-min y=0&knob-max y=0&knob-x0=5&knob-x1=10&knob-enable y0 and y1 values=&knob-y0=1&knob-y1=5&knob-fit to the domain=',
      );
    });
    test('show annotation when yDomain fit is true', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--zero-domain&knob-min y=10&knob-max y=10&knob-x0=5&knob-x1=10&knob-enable y0 and y1 values=&knob-y0=1&knob-y1=5&knob-fit to the domain=true',
      );
    });
    test('does not show annotation with yDomain is [0, 0] and y0 and y1 specified', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--zero-domain&knob-min y=0&knob-max y=0&knob-x0=5&knob-x1=10&knob-enable y0 and y1 values=true&knob-y0=1&knob-y1=5&knob-fit to the domain=',
      );
    });
    test('does not show annotation with yDomain is [20, 20] and y0 and y1 values are specified', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--zero-domain&knob-min y=20&knob-max y=20&knob-x0=5&knob-x1=10&knob-enable y0 and y1 values=true&knob-y0=1&knob-y1=5&knob-fit to the domain=true',
      );
    });
  });

  test.describe('Render with no group id provided', () => {
    test('show annotation when group id is provided no y0 nor y1 values specified', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--with-group-id&knob-enable annotation=true&knob-Annotation groupId=group1&knob-x0=5&knob-x1=10&knob-enable y0 and y1 values=',
      );
    });
    test('show annotation when group id is provided and y0 and y1 values specified', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--with-group-id&knob-enable annotation=true&knob-Annotation groupId=group1&knob-x0=5&knob-x1=10&knob-enable y0 and y1 values=true&knob-y0=2&knob-y1=3',
      );
    });
    test('show annotation when group id is provided y0 and y1 values specified', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--with-group-id&knob-enable annotation=true&knob-Annotation groupId=group1&knob-x0=5&knob-x1=10&knob-enable y0 and y1 values=true&knob-y0=0&knob-y1=3',
      );
    });
    test('show annotation when no group id provided and no y0 nor y1 values specified', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--with-group-id&knob-enable annotation=true&knob-Annotation groupId=none&knob-x0=5&knob-x1=10&knob-enable y0 and y1 values=',
      );
    });
    test('does not show annotation when no group id provided and y0 and y1 values specified', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--with-group-id&knob-enable%20annotation=true&knob-Annotation%20groupId=none&knob-x0=5&knob-x1=10&knob-enable%20y0%20and%20y1%20values=true&knob-y0=0&knob-y1=3',
      );
    });
  });

  test.describe('Advanced markers', () => {
    pwEach.describe<Position>(Object.values(Position))(
      (p) => `Annotation marker side - ${p}`,
      (side) => {
        eachRotation.describe(({ rotation }) => {
          pwEach.test<number>([0, 15, 30])(
            (n) => `renders marker annotation within chart canvas - metric: ${n}`,
            async (page, metric) => {
              await common.expectChartAtUrlToMatchScreenshot(page)(
                `http://localhost:9001/?path=/story/annotations-lines--advanced-markers&knob-Debug=&knob-show legend=true&knob-chartRotation=${rotation}&knob-Side=${side}&knob-TickLine padding for markerBody=30&knob-Annotation metric=${metric}`,
              );
            },
          );
        });
      },
    );
  });

  test.describe('Outside annotations', () => {
    pwEach.describe(['x', 'y'])(
      (d) => `Domain - ${d}`,
      (domain) => {
        eachRotation.test(async ({ page, rotation }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/annotations-rects--outside&knob-debug=&knob-chartRotation=${rotation}&knob-Domain%20axis_Annotations=${domain}&knob-Render%20outside%20chart_Annotations=true&knob-Red%20groupId_Annotations=primary&knob-Blue%20groupId_Annotations=secondary&knob-Tick%20size=10`,
          );
        });
      },
    );

    test('should show tooltip on hover - x domain', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--outside&knob-Outside dimension_Annotations=20&knob-debug=&knob-chartRotation=0&knob-Tick size=20&knob-Domain axis_Annotations=x&knob-Render outside chart_Annotations=true&knob-Red groupId_Annotations=primary&knob-Blue groupId_Annotations=secondary',
        {
          top: 60,
          right: 100,
        },
      );
    });

    test('should show tooltip on hover - y domain', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--outside&knob-Outside dimension_Annotations=20&knob-debug=&knob-chartRotation=0&knob-Tick size=20&knob-Domain axis_Annotations=y&knob-Render outside chart_Annotations=true&knob-Red groupId_Annotations=primary&knob-Blue groupId_Annotations=secondary',
        {
          top: 125,
          left: 60,
        },
      );
    });

    test('should render outside annotations when tickLine is not rendered', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--outside&knob-debug=&knob-chartRotation=180&knob-Tick size=0&knob-Domain axis_Annotations=x&knob-Render outside chart_Annotations=true&knob-Red groupId_Annotations=primary&knob-Blue groupId_Annotations=secondary',
      );
    });

    test('should render outside annotations when axes are hidden', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--outside&knob-debug=&knob-chartRotation=0&knob-Tick size=10&knob-Hide all axes=true&knob-Domain axis_Annotations=x&knob-Render outside chart_Annotations=true&knob-Outside dimension_Annotations=5&knob-Red groupId_Annotations=primary&knob-Blue groupId_Annotations=secondary',
      );
    });

    test('should render outside annotations with no groupIds', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/annotations-rects--outside&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-disable isolated point styles=true&knob-isolatedPoint.stroke - series level=orange&knob-isolatedPoint.stroke - theme level=green&knob-point.stroke - series level=blue&knob-point.stroke - theme level=red&knob-series type=line&knob-stroke - pointStyleAccessor=black&knob-use series iso overrides=true&knob-use series overrides=true&knob-use groupIds_Annotations=&knob-debug=&knob-chartRotation=0&knob-Tick size=10&knob-Hide all axes=&knob-Domain axis_Annotations=x&knob-Render outside chart_Annotations=true&knob-Outside dimension_Annotations=5&knob-Red groupId_Annotations=primary&knob-Blue groupId_Annotations=secondary',
      );
    });
  });
});
