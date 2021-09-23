/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export * from 'jest-extended'; // https://github.com/jest-community/jest-extended

/**
 * Final Matcher type with `this` and `received` args removed from jest matcher function
 */
type MatcherParameters<T extends (this: any, received: any, ...args: any[]) => any> = T extends (
  this: any,
  received: any,
  ...args: infer P
) => any
  ? P
  : never;

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Expect array to be filled with value, and optionally length
       */
      toEqualArrayOf(...args: MatcherParameters<typeof toEqualArrayOf>): R;
    }
  }
}

export {}; // ensure this is parsed as a module.
