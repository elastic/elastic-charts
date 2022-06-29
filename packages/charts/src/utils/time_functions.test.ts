/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TimingFunctions, TimeFunction } from './time_functions';

describe('TimingFunctions', () => {
  const timeValues = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  describe.each<TimeFunction>(Object.values(TimeFunction))('time function - %s', (type) => {
    test('should allow inverting time function', () => {
      const timeFn = TimingFunctions[type];

      timeValues.forEach((t) => {
        const y = timeFn(t);
        const newT = timeFn.inverse(y);
        expect(t).toBeCloseTo(newT);
      });
    });
  });
});
