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

const CHARTS: [string, string][] = [
  ['XY', 'http://localhost:9001/?path=/story/bar-chart--test-discover'],
  ['Heatmap', 'http://localhost:9001/?path=/story/heatmap-alpha--basic'],
  ['Partition', 'http://localhost:9001/?path=/story/sunburst--sunburst-with-three-layers'],
  ['Goal', 'http://localhost:9001/?path=/story/goal-alpha--gauge-with-target'],
  ['Bullet', 'http://localhost:9001/?path=/story/bullet-graph--single'],
];

test.describe('Canvas DPR zoom', () => {
  // All tests run at 4x so Playwright screenshots are captured at 4x resolution.
  test.use({ deviceScaleFactor: 4 });

  test.describe('Initial 4x DPR', () => {
    pwEach.test<[string, string]>(CHARTS)(
      ([type]) => `${type} renders crisp chart`,
      async (page, [, url]) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(url);
      },
    );
  });

  test.describe('Change DPR to 4x after mount', () => {
    pwEach.test<[string, string]>(CHARTS)(
      ([type]) => `${type} renders crisp chart`,
      async (page, [, url]) => {
        // Intercept matchMedia before navigation to capture every MediaQueryList
        // the chart registers. Exposes __simulateDPRChange(newDPR) in page context
        // to fire the 'change' event on resolution queries — replicating what a
        // real browser zoom does (headless Chromium does not fire these events when
        // deviceScaleFactor is changed via CDP).
        await page.addInitScript(() => {
          const orig = window.matchMedia.bind(window);
          const allLists: MediaQueryList[] = [];
          window.matchMedia = (query: string): MediaQueryList => {
            const mql = orig(query);
            allLists.push(mql);
            return mql;
          };
          (window as any).__simulateDPRChange = (newDPR: number) => {
            Object.defineProperty(window, 'devicePixelRatio', { value: newDPR, configurable: true, writable: true });
            allLists
              .filter((mql) => mql.media.includes('resolution'))
              .forEach((mql) => mql.dispatchEvent(new Event('change')));
          };
        });

        const cdpSession = await page.context().newCDPSession(page);
        const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };

        // Start at 1x so the chart mounts with a 1x canvas.
        await cdpSession.send('Emulation.setDeviceMetricsOverride', {
          width,
          height,
          deviceScaleFactor: 1,
          mobile: false,
        });

        await common.expectChartAtUrlToMatchScreenshot(page)(url, {
          action: async () => {
            // Restore original 4x canvas so the screenshot is captured at full resolution.
            await cdpSession.send('Emulation.setDeviceMetricsOverride', {
              width,
              height,
              deviceScaleFactor: 4,
              mobile: false,
            });

            // Fire the matchMedia 'change' event so the chart re-renders its
            // canvas at the new DPR. forceUpdate() in each renderer bypasses
            // shouldComponentUpdate so the canvas dimensions update immediately.
            await page.evaluate(() => (window as any).__simulateDPRChange(4));
          },
        });

        await cdpSession.detach();
      },
    );
  });
});
