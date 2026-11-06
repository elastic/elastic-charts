/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderer } from '../e2e_config';
import { expect, test } from '../fixtures';
import { common } from '../page_objects';

const url = 'http://localhost:9001/?path=/story/sunburst--most-basic';

test.describe('Stage renderer', () => {
  test(`draws the chart stage as ${renderer === 'svg' ? 'an svg element' : 'a canvas element'}`, async ({ page }) => {
    await common.loadElementFromURL(page)(url, common.chartWaitSelector);
    const stage = page.locator('.echCanvasRenderer');
    await expect(stage).toHaveCount(1);
    expect(await stage.evaluate((element) => element.tagName.toLowerCase())).toBe(
      renderer === 'svg' ? 'svg' : 'canvas',
    );
    if (renderer === 'svg') {
      expect(await stage.locator('path').count()).toBeGreaterThan(0);
    }
  });
});
