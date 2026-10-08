/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { common } from '../page_objects/common';

const story = (slug: string, params = '') => `http://localhost:9001/?path=/story/trace-alpha--${slug}${params}`;

test.describe('Trace Chart Accessibility', () => {
  test('exposes the chart type and span table to screen readers', async ({ page }) => {
    await common.loadElementFromURL(page)(story('accessibility'), common.chartSelector);
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toContain('Chart type:Trace chart');
    // Paginated span table headers (Spec 27 badge column included).
    expect(summaryText).toContain('NameTotal durationSelf timeStart offsetParentBadges');
    // Caption reports the dataset size for the fully-rendered (unpaginated) fixture.
    expect(summaryText).toContain('The table fully represents the dataset of');
    // A11Y_TRACE span names are exposed as row headers.
    expect(summaryText).toContain('AuthService.validate');
  });

  test('exposes a screen reader table for a realistic OTLP trace', async ({ page }) => {
    await common.loadElementFromURL(page)(story('kibana-trace'), common.chartSelector);
    await common.waitForA11yContent(page)();

    const summaryText = await common.getA11ySummaryText(page)();
    expect(summaryText).toContain('Chart type:Trace chart');
    expect(summaryText).toContain('NameTotal durationSelf timeStart offsetParentBadges');
  });

  test('announces the focused span via the aria-live region on keyboard navigation', async ({ page }) => {
    await common.loadElementFromURL(page)(story('accessibility'), common.chartWaitSelector);

    const liveRegion = page.locator('[aria-live]').first();
    await expect(liveRegion).toBeAttached();
    // Region starts empty; it is populated with the focused span on each keyboard lane move.
    expect((await liveRegion.textContent())?.trim()).toBe('');

    await common.clickMouseRelativeToDOMElement(page)({ top: 0, left: 0 }, common.chartSelector);
    await common.pressKey(page)('ArrowDown', 1);

    await expect(liveRegion).not.toBeEmpty();
  });

  test('omits screen reader content for the no-data empty state', async ({ page }) => {
    await common.loadElementFromURL(page)(
      story('empty-trace', '&knob-empty state=no data — empty data prop (DOM overlay)'),
      common.chartSelector,
    );

    const chartElement = page.locator('.echChart').first();
    await expect(chartElement).toBeVisible();
    const a11yExists = await page.locator('.echScreenReaderOnly').count();
    expect(a11yExists).toBe(0);
  });
});
