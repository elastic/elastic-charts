/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { chromium } from 'playwright-core';

async function getChromeVersions() {
  const browser = await chromium.launch();
  const result = browser.version();
  await browser.close();
  return result;
}

async function main() {
  const result = await getChromeVersions();
  console.log('getChromeVersions', result);
}

void main();
