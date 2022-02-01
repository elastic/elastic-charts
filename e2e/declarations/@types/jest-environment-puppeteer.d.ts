/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

declare global {
  // @ts-ignore - force external global overrides
  const browser: never;
  // @ts-ignore - force external global overrides
  const context: never;
  // @ts-ignore - force external global overrides
  const page: never;
  // @ts-ignore - force external global overrides
  const jestPuppeteer: never;
}

export {}; // ensure this is parsed as a module.
