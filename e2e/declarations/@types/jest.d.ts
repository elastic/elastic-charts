/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// TODO fix these overrides
// This file does not take priority of the external jest types in `@types/jest`
// But the jest-environment-puppeteer override works fine....I'm lost

// @ts-ignore - force external global overrides
declare global {
  const beforeAll: never;
  const beforeEach: never;
  const afterAll: never;
  const afterEach: never;
  const describe: never;
  const fdescribe: never;
  const xdescribe: never;
  const it: never;
  const fit: never;
  const xit: never;
  const test: never;
  const xtest: never;
  const expect: never;
}

export {}; // ensure this is parsed as a module.
