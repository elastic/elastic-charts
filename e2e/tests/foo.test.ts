/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

// eslint-disable-next-line jest/no-done-callback
test('basic test', async ({ page }, info) => {
  await page.goto('https://playwright.dev/'); // test
  const title = page.locator('.navbar__inner .navbar__title');
  await expect(title).toHaveText('Playwright');

  // console.log(info);
  expect(await page.screenshot()).toMatchSnapshot([`${info.title}.png`]);
});
