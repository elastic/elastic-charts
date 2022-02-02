/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { CommonPage } from '../page_objects';

test.skip('basicTest', async ({ page }, info) => {
  await page.goto('https://example.com/');

  const url = CommonPage.getPathFromTestInfo();
  console.log(url);

  expect(await page.screenshot()).toMatchSnapshot([`${info.title}.png`]);
});
