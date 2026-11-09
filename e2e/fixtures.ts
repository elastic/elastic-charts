/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { BrowserContext, Page } from '@playwright/test';
import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

interface WorkerSlot {
  context?: BrowserContext;
  page?: Page;
  /** serialized context options the shared context was created with */
  key?: string;
}

/**
 * Playwright's default `page` fixture creates a fresh browser context for every test,
 * so each of the ~1500 VRT tests re-downloads and re-compiles the full bundle.
 *
 * This `test` keeps one browser context and one page per worker. Tests switch stories
 * through the VRT page's in-page navigation (see `CommonPage.navigate`), which remounts
 * the page tree without reloading the document, so React and EUI boot once per worker
 * instead of once per test.
 *
 * The shared context is created lazily with the `contextOptions` of the first test in the
 * worker; a test whose options differ (e.g. `test.use({ timezoneId })`) gets a context and
 * page of its own.
 *
 * Tracing (when enabled by the config) still works: Playwright instruments every context
 * created from the `browser` fixture. Video recording is not supported.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const test = base.extend<{}, { workerSlot: WorkerSlot }>({
  workerSlot: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const slot: WorkerSlot = {};
      await use(slot);
      await slot.context?.close();
    },
    { scope: 'worker' },
  ],
  page: async (
    {
      browser,
      workerSlot,
      contextOptions,
      viewport,
      locale,
      timezoneId,
      deviceScaleFactor,
      colorScheme,
      hasTouch,
      isMobile,
      userAgent,
      javaScriptEnabled,
      ignoreHTTPSErrors,
      offline,
      geolocation,
      permissions,
      extraHTTPHeaders,
      storageState,
      baseURL,
    },
    use,
  ) => {
    // `contextOptions` alone does not include the individual options (`test.use({ timezoneId })`
    // etc.), Playwright's own `context` fixture merges them in the same way
    const options = {
      ...contextOptions,
      viewport,
      locale,
      timezoneId,
      deviceScaleFactor,
      colorScheme,
      hasTouch,
      isMobile,
      userAgent,
      javaScriptEnabled,
      ignoreHTTPSErrors,
      offline,
      geolocation,
      permissions,
      extraHTTPHeaders,
      storageState,
      baseURL,
    };
    const key = JSON.stringify(options);
    if (!workerSlot.context) {
      workerSlot.context = await browser.newContext(options);
      workerSlot.page = await workerSlot.context.newPage();
      workerSlot.key = key;
    }

    if (workerSlot.key === key && workerSlot.page && !workerSlot.page.isClosed()) {
      const page = workerSlot.page;
      await use(page);
      // reset input state for the next test: some tests leave a modifier key or the mouse button
      // held down, and a story must not mount under a hovering cursor
      for (const k of ['Shift', 'Control', 'Alt', 'Meta']) await page.keyboard.up(k);
      await page.mouse.up();
      await page.mouse.move(0, 0);
      return;
    }

    const context = await browser.newContext(options);
    const page = await context.newPage();
    await use(page);
    await page.close();
    await context.close();
  },
});
