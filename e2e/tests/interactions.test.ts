/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';
import { camelCase } from 'change-case';

import { Placement } from '../constants';
import { eachRotation, pwEach } from '../helpers';
import { common } from '../page_objects';

test.describe('Interactions', () => {
  test.describe('Tooltips', () => {
    test.describe('Positioning', () => {
      const left = 20;
      const top = 20;
      const bottom = 20;
      const right = 20;

      pwEach.describe<string>(['default', 'chart'])(
        (b) => `Boundary El - ${b}`,
        (boundary) => {
          eachRotation.describe((rotation) => {
            pwEach.describe<Placement>([Placement.Right, Placement.Left, Placement.Top, Placement.Bottom])(
              (p) => `Placement - ${p}`,
              (placement) => {
                const boundaryStr = boundary === 'default' ? '' : boundary;
                const url = `http://localhost:9001/?path=/story/bar-chart--test-tooltip-and-rotation&knob-Boundary Element=${boundaryStr}&knob-chartRotation=${rotation}&knob-Tooltip placement=${placement}`;
                test('shows tooltip in top-left corner', async ({ page }) => {
                  await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
                    url,
                    { left, top },
                    { screenshotSelector: 'body' },
                  );
                });

                test('shows tooltip in top-right corner', async ({ page }) => {
                  await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
                    url,
                    { right, top },
                    { screenshotSelector: 'body' },
                  );
                });

                test('shows tooltip in bottom-left corner', async ({ page }) => {
                  await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
                    url,
                    { left, bottom },
                    { screenshotSelector: 'body' },
                  );
                });

                test('shows tooltip in bottom-right corner', async ({ page }) => {
                  await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
                    url,
                    { right, bottom },
                    { screenshotSelector: 'body' },
                  );
                });
              },
            );
          });
        },
      );
    });

    test.describe('Hover over specific bars', () => {
      test.describe('rotation 0', () => {
        test('shows tooltip on first bar group - top', async ({ page }) => {
          await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
            'http://localhost:9001/?path=/story/bar-chart--test-tooltip-and-rotation',
            { left: 50, top: 50 },
            { screenshotSelector: 'body' },
          );
        });
        test('shows tooltip on last bar group - top', async ({ page }) => {
          await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
            'http://localhost:9001/?path=/story/bar-chart--test-tooltip-and-rotation',
            { right: 50, top: 50 },
            { screenshotSelector: 'body' },
          );
        });
        test('shows tooltip on first bar group - bottom', async ({ page }) => {
          await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
            'http://localhost:9001/?path=/story/bar-chart--test-tooltip-and-rotation',
            { left: 50, bottom: 50 },
            { screenshotSelector: 'body' },
          );
        });
        test('shows tooltip on last bar group - bottom', async ({ page }) => {
          await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
            'http://localhost:9001/?path=/story/bar-chart--test-tooltip-and-rotation',
            { left: 50, bottom: 50 },
            { screenshotSelector: 'body' },
          );
        });
      });

      test.describe('rotation 90', () => {
        test('shows tooltip on first bar group - top', async ({ page }) => {
          await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
            'http://localhost:9001/?path=/story/bar-chart--test-tooltip-and-rotation&knob-chartRotation=90',
            { left: 50, top: 50 },
            { screenshotSelector: 'body' },
          );
        });
        test('shows tooltip on last bar group - top', async ({ page }) => {
          await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
            'http://localhost:9001/?path=/story/bar-chart--test-tooltip-and-rotation&knob-chartRotation=90',
            { left: 50, top: 50 },
            { screenshotSelector: 'body' },
          );
        });
        test('shows tooltip on first bar group - bottom', async ({ page }) => {
          await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
            'http://localhost:9001/?path=/story/bar-chart--test-tooltip-and-rotation&knob-chartRotation=90',
            { left: 50, bottom: 50 },
            { screenshotSelector: 'body' },
          );
        });
        test('shows tooltip on last bar group - bottom', async ({ page }) => {
          await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
            'http://localhost:9001/?path=/story/bar-chart--test-tooltip-and-rotation&knob-chartRotation=90',
            { right: 50, bottom: 50 },
            { screenshotSelector: 'body' },
          );
        });
      });
    });

    test('should show tooltip on sunburst', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--sunburst-slice-clicks',
        { left: 350, top: 100 },
      );
    });

    test('should render custom tooltip', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--test-tooltip-and-rotation&knob-Custom Tooltip=true&knob-Show Legend=true',
        { left: 330, top: 40 },
        { screenshotSelector: 'body' },
      );
    });

    test('should render current tooltip for split and y accessors', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/bar-chart--bar-chart2y2g',
        { left: 330, top: 40 },
      );
    });

    test('should render current tooltip in dark theme', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/stylings--dark-theme',
        { left: 120, bottom: 80 },
      );
    });

    pwEach.describe<[element: string, groups: number]>([
      // TODO: find why these vrt don't position tooltip wrt boundary
      // ['root', 7],
      // ['red', 6],
      // ['white', 5],
      // ['blue', 3],
      ['chart', 2],
    ])(
      ([b]) => `Boundary - ${camelCase(b)}`,
      ([boundary, groups]) => {
        test('should contain tooltip inside boundary near top', async ({ page }) => {
          await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/bar-chart--tooltip-boundary&knob-Boundary Element=${boundary}&knob-Groups=${groups}&knob-Show axes=false`,
            { left: 100, top: 20 },
            { screenshotSelector: 'body' },
          );
        });
        test('should contain tooltip inside boundary near bottom', async ({ page }) => {
          await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/bar-chart--tooltip-boundary&knob-Boundary Element=${boundary}&knob-Groups=${groups}&knob-Show axes=false`,
            { left: 100, bottom: 20 },
            { screenshotSelector: 'body' },
          );
        });
      },
    );
  });

  test.describe('brushing', () => {
    test('show rectangular brush selection', async ({ page }) => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--brush-tool',
        { left: 100, top: 100 },
        { left: 250, top: 250 },
      );
    });
    test('show y brush selection', async ({ page }) => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--brush-tool&knob-brush axis=y&knob-chartRotation=0',
        { left: 100, top: 100 },
        { left: 250, top: 250 },
      );
    });
    test('show x brush selection', async ({ page }) => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--brush-tool&knob-brush axis=x&knob-chartRotation=0',
        { left: 100, top: 100 },
        { left: 250, top: 250 },
      );
    });

    test('show rectangular brush selection -90 degree', async ({ page }) => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--brush-tool&knob-brush axis=both&knob-chartRotation=-90',
        { left: 100, top: 100 },
        { left: 250, top: 250 },
      );
    });
    test('show y brush selection -90 degree', async ({ page }) => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--brush-tool&knob-brush axis=y&knob-chartRotation=-90',
        { left: 100, top: 100 },
        { left: 250, top: 250 },
      );
    });
    test('show x brush selection -90 degree', async ({ page }) => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--brush-tool&knob-brush axis=x&knob-chartRotation=-90',
        { left: 100, top: 100 },
        { left: 250, top: 250 },
      );
    });
  });

  test.describe('Tooltip sync', () => {
    test('show synced tooltips', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--cursor-update-action&knob-local%20tooltip%20type_Top%20Chart=vertical&knob-local%20tooltip%20type_Bottom%20Chart=vertical&knob-enable%20external%20tooltip_Top%20Chart=true&knob-enable%20external%20tooltip_Bottom%20Chart=true&knob-external%20tooltip%20placement_Top%20Chart=left&knob-external%20tooltip%20placement_Bottom%20Chart=left&knob-pointer update debounce=0',
        { right: 200, top: 80 },
        {
          screenshotSelector: '#story-root',
        },
      );
    });

    test('show synced crosshairs', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--cursor-update-action&knob-local%20tooltip%20type_Top%20Chart=vertical&knob-local%20tooltip%20type_Bottom%20Chart=vertical&knob-enable%20external%20tooltip_Top%20Chart=true&knob-enable%20external%20tooltip_Bottom%20Chart=false&knob-external%20tooltip%20placement_Top%20Chart=left&knob-external%20tooltip%20placement_Bottom%20Chart=left&knob-pointer update debounce=0',
        { right: 200, top: 80 },
        {
          screenshotSelector: '#story-root',
        },
      );
    });

    test('show synced extra values in legend', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--cursor-update-action&knob-Series type_Top Chart=line&knob-enable external tooltip_Top Chart=true&knob-Series type_Bottom Chart=line&knob-enable external tooltip_Bottom Chart=false&knob-pointer update debounce=0',
        { right: 200, top: 80 },
        {
          screenshotSelector: '#story-root',
        },
      );
    });
  });

  test.describe('Tooltip formatting', () => {
    test('should use all custom tick formatters', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/axes--different-tooltip-formatter&knob-Show%20legend_Y%20axis=true&knob-Disable%20Axis%20tickFormat_Y%20axis=&knob-Axis%20value%20format_Y%20axis=0[.]0&knob-Axis%20unit_Y%20axis=pets&knob-Disable%20header%20tickFormat_X%20axis=&knob-Header%20unit_X%20axis=(header)&knob-Disable%20Axis%20tickFormat_X%20axis=&knob-Axis%20unit_X%20axis=(axis)&knob-Disable%20dog%20line%20tickFormat_Y%20axis=&knob-Dog%20line%20unit_Y%20axis=dogs&knob-Disable%20cat%20line%20tickFormat_Y%20axis=&knob-Cat%20line%20unit_Y%20axis=cats',
        { left: 280, top: 80 },
      );
    });

    test('should use series tick formatter with no axis tick formatter', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/axes--different-tooltip-formatter&knob-Show legend_Y axis=true&knob-Disable Axis tickFormat_Y axis=true&knob-Axis value format_Y axis=0[.]0&knob-Axis unit_Y axis=pets&knob-Disable header tickFormat_X axis=&knob-Header unit_X axis=(header)&knob-Disable Axis tickFormat_X axis=&knob-Axis unit_X axis=(axis)&knob-Disable dog line tickFormat_Y axis=&knob-Dog line unit_Y axis=dogs&knob-Disable cat line tickFormat_Y axis=&knob-Cat line unit_Y axis=cats',
        { left: 280, top: 80 },
      );
    });

    test('should use series tick formatter with no axis tick formatter, missing series tick formatter', async ({
      page,
    }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/axes--different-tooltip-formatter&knob-Show legend_Y axis=true&knob-Disable Axis tickFormat_Y axis=true&knob-Axis value format_Y axis=0[.]0&knob-Axis unit_Y axis=pets&knob-Disable header tickFormat_X axis=&knob-Header unit_X axis=(header)&knob-Disable Axis tickFormat_X axis=&knob-Axis unit_X axis=(axis)&knob-Disable dog line tickFormat_Y axis=true&knob-Dog line unit_Y axis=dogs&knob-Disable cat line tickFormat_Y axis=&knob-Cat line unit_Y axis=cats',
        { left: 280, top: 80 },
      );
    });

    test('should use default tick formatter with no axis tick formatter, nor series tick formatter', async ({
      page,
    }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/axes--different-tooltip-formatter&knob-Show legend_Y axis=true&knob-Disable Axis tickFormat_Y axis=true&knob-Axis value format_Y axis=0[.]0&knob-Axis unit_Y axis=pets&knob-Disable header tickFormat_X axis=&knob-Header unit_X axis=(header)&knob-Disable Axis tickFormat_X axis=&knob-Axis unit_X axis=(axis)&knob-Disable dog line tickFormat_Y axis=true&knob-Dog line unit_Y axis=dogs&knob-Disable cat line tickFormat_Y axis=true&knob-Cat line unit_Y axis=cats',
        { left: 280, top: 80 },
      );
    });

    test('should use headerFormatter for x axis', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/axes--different-tooltip-formatter&knob-Show legend_Y axis=true&knob-Disable Axis tickFormat_Y axis=&knob-Axis value format_Y axis=0[.]0&knob-Axis unit_Y axis=pets&knob-Disable header tickFormat_X axis=&knob-Header unit_X axis=(header)&knob-Disable Axis tickFormat_X axis=&knob-Axis unit_X axis=(axis)&knob-Disable dog line tickFormat_Y axis=&knob-Dog line unit_Y axis=dogs&knob-Disable cat line tickFormat_Y axis=&knob-Cat line unit_Y axis=cats',
        { left: 280, top: 80 },
      );
    });

    test('should use axis tick formatter with no headerFormatter', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/axes--different-tooltip-formatter&knob-Show legend_Y axis=true&knob-Disable Axis tickFormat_Y axis=&knob-Axis value format_Y axis=0[.]0&knob-Axis unit_Y axis=pets&knob-Disable header tickFormat_X axis=true&knob-Header unit_X axis=(header)&knob-Disable Axis tickFormat_X axis=&knob-Axis unit_X axis=(axis)&knob-Disable dog line tickFormat_Y axis=&knob-Dog line unit_Y axis=dogs&knob-Disable cat line tickFormat_Y axis=&knob-Cat line unit_Y axis=cats',
        { left: 280, top: 80 },
      );
    });

    test('should use default tick formatter with no axis tick formatter nor headerFormatter', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/axes--different-tooltip-formatter&knob-Show legend_Y axis=true&knob-Disable Axis tickFormat_Y axis=&knob-Axis value format_Y axis=0[.]0&knob-Axis unit_Y axis=pets&knob-Disable header tickFormat_X axis=true&knob-Header unit_X axis=(header)&knob-Disable Axis tickFormat_X axis=true&knob-Axis unit_X axis=(axis)&knob-Disable dog line tickFormat_Y axis=&knob-Dog line unit_Y axis=dogs&knob-Disable cat line tickFormat_Y axis=&knob-Cat line unit_Y axis=cats',
        { left: 280, top: 80 },
      );
    });

    test('should use custom mark formatters', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/mixed-charts--mark-size-accessor',
        { left: 400, top: 80 },
      );
    });
  });
  test('should size legends with ordinal x axis', async ({ page }) => {
    await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/iframe.html?id=axes--different-tooltip-formatter',
      { left: 350, top: 130 },
    );
  });

  test.describe('legend items with color picker clicking hidden or unhidden', () => {
    // eslint-disable-next-line jest/expect-expect
    test('legend items should not move when color picker series is hidden or unhidden', async ({ page }) => {
      await common.moveMouse(page)(0, 0);
      await common.expectChartWithKeyboardEventsAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/legend--color-picker',
        [
          {
            key: 'tab',
            count: 2,
          },
          {
            key: 'enter',
            count: 1,
          },
        ],
      );
    });
  });

  test('Hide null bars in tooltip in percentage mode', async ({ page }) => {
    await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/bar-chart--test-stacked-bar-chart-with-null-bars&knob-stack%20as%20percentage=true',
      { left: 350, top: 150 },
      {
        screenshotSelector: '#story-root',
        delay: 1000,
      },
    );
  });

  test.describe('should show null values in tooltip if configured', () => {
    test('show N/A tooltip for areas', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--interaction-with-null-values&knob-Series type=area&knob-show null values=true',
        { left: 300, top: 80 },
        {
          screenshotSelector: '#story-root',
          delay: 1000,
        },
      );
    });
    test('show N/A tooltip for bars', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--interaction-with-null-values&knob-Series type=bar&knob-show null values=true',
        { left: 300, top: 80 },
        {
          screenshotSelector: '#story-root',
          delay: 1000,
        },
      );
    });
    test('hide tooltip if configured', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/interactions--interaction-with-null-values&knob-Series type=bar&knob-show null values=false',
        { left: 282, top: 80 },
        {
          screenshotSelector: '#story-root',
          delay: 1000,
        },
      );
    });
  });

  test.describe('mouse cursor', () => {
    pwEach.test<string>(['eui-light', 'eui-dark'])(
      (t) => `should show cursor when background is set with ${t} theme`,
      async (page, theme) => {
        await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/mixed-charts--lines-and-areas&globals=theme:${theme}&knob-Fit%20domain_Y%20-%20Axis=true&knob-Log%20base_Y%20-%20Axis=natural&knob-Use%20default%20limit_Y%20-%20Axis=true&knob-Use%20negative%20values_Y%20-%20Axis=false`,
          { top: 150, left: 250 },
        );
      },
    );

    pwEach.test<string>(['eui-light', 'eui-dark'])(
      (t) => `should show cursor band when background is set with ${t} theme`,
      async (page, theme) => {
        await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/mixed-charts--bars-and-lines&globals=theme:${theme}&knob-Fit%20domain_Y%20-%20Axis=true&knob-Log%20base_Y%20-%20Axis=natural&knob-Use%20default%20limit_Y%20-%20Axis=true&knob-Use%20negative%20values_Y%20-%20Axis=false`,
          { top: 150, left: 150 },
        );
      },
    );
  });
  // currently wrong due to https://github.com/elastic/elastic-charts/issues/1921
  test('highlighter zIndex should respect geometry zIndex', async ({ page }) => {
    await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/test-cases--highlighter-z-index',
      { left: 247, top: 76 }, // mouse over the second point
    );
  });
});
