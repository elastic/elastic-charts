/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common, CommonPage } from '../page_objects';

test.describe('Performance', () => {
  for (let i = 0; i < 10; i++) {
    test(`Get performance metrics ${i}`, async ({ page, browser }) => {
      await browser.startTracing(page, { path: 'perfTraces.json', screenshots: true });

      const url = CommonPage.parseUrl('http://localhost:9001/?path=/story/test-cases--lens-stress-test');
      await page.goto(url);

      await common.waitForElement(page)(common.chartWaitSelector);
      await page.evaluate(() => window.performance.measure('overall', 'Perf:Started', 'Perf:Ended'));

      console.log('=============Performance Metrics===============');

      const getAllMarksJson = await page.evaluate(() => JSON.stringify(window.performance.getEntriesByType('mark')));
      const getAllMarks = await JSON.parse(getAllMarksJson);
      console.log('window.performance.getEntriesByType("mark")', getAllMarks);

      const getAllMeasuresJson = await page.evaluate(() =>
        JSON.stringify(window.performance.getEntriesByType('measure')),
      );
      const getAllMeasures = await JSON.parse(getAllMeasuresJson);
      console.log('window.performance.getEntriesByType("measure")', getAllMeasures);
      await browser.stopTracing();
      // using these two values as min/max to understand if we are increasing or decreasing the rendering speed.
      expect(getAllMeasures[0].duration).toBeLessThan(2200);
      expect(getAllMeasures[0].duration).toBeGreaterThan(2000);
    });
  }
});
