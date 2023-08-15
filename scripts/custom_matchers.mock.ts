/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { matcherErrorMessage } from 'jest-matcher-utils';

/**
 * Expect array to be filled with value, and optionally length
 */
function toEqualArrayOf(this: jest.MatcherUtils, received: any[], value: any, length?: number) {
  const matcherName = 'toEqualArrayOf';

  if (!Array.isArray(received)) {
    throw new TypeError(
      matcherErrorMessage(
        this.utils.matcherHint(matcherName),
        `${this.utils.RECEIVED_COLOR('received')} value must be an array.`,
        `Received type: ${typeof received}`,
      ),
    );
  }

  const receivedPretty = this.utils.printReceived(received);
  const lengthCheck = length === undefined || received.length === length;
  const elementCheck = received.every((v) => v === value);

  if (!lengthCheck) {
    return {
      pass: false,
      message: () => `expected array length to be ${length} but got ${received.length}`,
    };
  }

  if (!elementCheck) {
    return {
      pass: false,
      message: () => `expected ${receivedPretty} to be an array of ${value}'s`,
    };
  }

  return {
    pass: true,
    message: () => `expected ${receivedPretty} not to be an array of ${value}'s`,
  };
}

expect.extend({
  toEqualArrayOf,
});
