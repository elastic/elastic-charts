/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { pwEach } from '../helpers';
import { common } from '../page_objects';

const story = (slug: string, params = '') => `http://localhost:9001/?path=/story/trace-alpha--${slug}${params}`;

test.describe('Trace stories', () => {
  test.describe('tooltip', () => {
    test('shows the default tooltip on span hover', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        story('tooltip-events'),
        { left: 300, top: 60 },
        { screenshotSelector: 'body' },
      );
    });

    test('shows a tooltip over an empty region when enabled', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        story('tooltip-events', '&knob-tooltip over empty region=true'),
        { left: 600, bottom: 20 },
        { screenshotSelector: 'body' },
      );
    });

    test('renders the custom workflow tooltip on hover', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        story('kibana-workflow'),
        { left: 300, top: 80 },
        { screenshotSelector: 'body' },
      );
    });

    test('pins the tooltip on right-click', async ({ page }) => {
      await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
        story('pinned-tooltip'),
        { left: 300, top: 40 },
        { button: 'right' },
        { screenshotSelector: 'body' },
      );
    });

    test('dismisses the pinned tooltip on Escape', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(story('pinned-tooltip'), {
        action: async () => {
          await common.clickMouseRelativeToDOMElement(page)({ left: 300, top: 40 }, common.chartSelector, {
            button: 'right',
          });
          await page.keyboard.press('Escape');
        },
        screenshotSelector: 'body',
      });
    });
  });

  test.describe('element events', () => {
    test('clicks a span in the kibana trace', async ({ page }) => {
      await common.expectChartWithClickAtUrlToMatchScreenshot(page)(story('kibana-trace'), { left: 300, top: 60 });
    });
  });

  test.describe('segment selection', () => {
    // SELECTION_TRACE plot starts after the ~210 px label gutter; the root's first active segment
    // (0–150 ms) sits on the first lane and the DB.query segments on the third lane.
    const rootSegment = { left: 255, top: 45 };
    const dbSegment = { left: 345, top: 93 };

    test('selects a segment on click', async ({ page }) => {
      await common.expectChartWithClickAtUrlToMatchScreenshot(page)(story('segment-selection'), rootSegment);
    });

    test('adds to the selection on shift-click', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(story('segment-selection'), {
        action: async () => {
          await common.clickMouseRelativeToDOMElement(page)(rootSegment, common.chartSelector);
          await page.keyboard.down('Shift');
          await common.clickMouseRelativeToDOMElement(page)(dbSegment, common.chartSelector);
          await page.keyboard.up('Shift');
        },
      });
    });

    test('toggles a segment with the platform modifier', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(story('segment-selection'), {
        action: async () => {
          const modifier = await common.getModifierKey(page)();
          await common.clickMouseRelativeToDOMElement(page)(rootSegment, common.chartSelector);
          await page.keyboard.down(modifier);
          await common.clickMouseRelativeToDOMElement(page)(dbSegment, common.chartSelector);
          await page.keyboard.up(modifier);
        },
      });
    });

    test('selects the whole span on double-click', async ({ page }) => {
      await common.expectChartWithClickAtUrlToMatchScreenshot(page)(story('segment-selection'), rootSegment, {
        clickCount: 2,
      });
    });

    test('selects the focused span with Enter', async ({ page }) => {
      await common.expectChartWithKeyboardEventsAtUrlToMatchScreenshot(page)(story('segment-selection'), [
        { key: 'ArrowDown', count: 1 },
        { key: 'Enter', count: 1 },
      ]);
    });

    pwEach.describe(['root-active-0', 'db-whole-span', 'multi-root-db'])(
      (preset) => `controlled preset - ${preset}`,
      (preset) => {
        test('renders the preset selection', async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            story('segment-selection-controlled', `&knob-Preset selection=${preset}`),
          );
        });
      },
    );
  });

  test.describe('zoom and pan', () => {
    pwEach.describe(['pan', 'brush'])(
      (mode) => `drag mode - ${mode}`,
      (mode) => {
        test('draws the drag gesture', async ({ page }) => {
          await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
            story('brush-zoom', `&knob-drag mode=${mode}`),
            { left: 150, top: 80 },
            { left: 400, top: 80 },
          );
        });
      },
    );

    test('locks zoom gestures when zoomable is false', async ({ page }) => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(page)(
        story('zoom-lock', '&knob-zoomable=false'),
        { left: 150, top: 60 },
        { left: 400, top: 60 },
      );
    });
  });

  test.describe('structure', () => {
    test('collapses a subtree on caret click', async ({ page }) => {
      await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
        story('collapsible-nesting'),
        { left: 12, top: 45 },
        undefined,
        { delay: 400 },
      );
    });

    test('collapses the focused subtree with the c key', async ({ page }) => {
      await common.expectChartWithKeyboardEventsAtUrlToMatchScreenshot(page)(
        story('collapsible-nesting'),
        [
          { key: 'ArrowDown', count: 1 },
          { key: 'c', count: 1 },
        ],
        { delay: 400 },
      );
    });

    test('scrolls to a lane via the external search box', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(story('scroll-to-lane'), {
        action: async () => {
          await page.locator('input[type="text"]').fill('Redis.get');
          await page.getByRole('button', { name: 'Go' }).click();
        },
        delay: 400,
      });
    });
  });

  test.describe('badges', () => {
    // Inline label mode renders badges on the row below each bar; the root's language badge sits
    // just right of its label.
    test('clicks a span badge', async ({ page }) => {
      await common.expectChartWithClickAtUrlToMatchScreenshot(page)(story('span-badges'), { left: 150, top: 58 });
    });

    test('truncates and overflows badges at a narrow width', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        story('span-badges', '&knob-chart width (px) — narrow to force overflow=360'),
      );
    });
  });

  test.describe('annotations', () => {
    // The "Deploy" time-point marker sits at 300 ms in the lower half of the time bar; hovering it
    // fires onElementOver and drives the story's top-right consumer tooltip overlay.
    test('drives the consumer tooltip on annotation hover', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        story('trace-annotations'),
        { left: 395, top: 25 },
        { screenshotSelector: 'body' },
      );
    });

    test('renders plot-placed time annotations', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        story('trace-annotations', '&knob-time annotation placement=plot'),
      );
    });
  });

  test.describe('data shape', () => {
    pwEach.describe(['Kibana baseline cases', 'Malformed topology'])(
      (dataset) => `clock skew dataset - ${dataset}`,
      (dataset) => {
        test('renders the corrected trace', async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(story('clock-skew', `&knob-Dataset=${dataset}`));
        });
      },
    );

    test('reparents orphans without a recorded root', async ({ page }) => {
      await common.expectChartAtUrlToMatchScreenshot(page)(
        story('partial-trace-reparenting', '&knob-Dataset=No recorded root'),
      );
    });

    // The no-data variant never mounts the canvas (the library empty-state DOM overlay is shown
    // instead), so render-complete never fires — wait on `.echChart` rather than the chart status.
    test('renders the no-data empty state', async ({ page }) => {
      await common.expectElementAtUrlToMatchScreenshot(page)(
        story('empty-trace', '&knob-empty state=no data — empty data prop (DOM overlay)'),
        common.chartSelector,
        { waitSelector: common.chartSelector },
      );
    });
  });

  test.describe('accessibility', () => {
    test('highlights the focused lane on keyboard navigation', async ({ page }) => {
      await common.expectChartWithKeyboardEventsAtUrlToMatchScreenshot(page)(story('accessibility'), [
        { key: 'ArrowDown', count: 1 },
      ]);
    });

    test('advances the focused lane with repeated navigation', async ({ page }) => {
      await common.expectChartWithKeyboardEventsAtUrlToMatchScreenshot(page)(story('accessibility'), [
        { key: 'ArrowDown', count: 3 },
      ]);
    });
  });
});
