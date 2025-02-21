/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Radian } from './../../../../common/geometry';
import { normalizeAngles } from './utils';

const normalize = (a: Radian): number => a / Math.PI;
const denormalize = (a: number): Radian => a * Math.PI;

/**
 * Units of π
 */
type AngleTuple = [start: number, end: number];

describe('Goal utils', () => {
  type TestCase = [initial: AngleTuple, final: AngleTuple];
  describe('#normalizeAngles', () => {
    const testCases: TestCase[] = [
      [
        [1.5, 2.5],
        [-0.5, 0.5],
      ],
      [
        [-1.5, -2.5],
        [0.5, -0.5],
      ],
      [
        [0.5, 1],
        [0.5, 1],
      ],
      [
        [-0.5, -1],
        [-0.5, -1],
      ],
      [
        [0, 2],
        [0, 2],
      ],
      [
        [0, -2],
        [0, -2],
      ],
      [
        [2, 4],
        [0, 2],
      ],
      [
        [-2, -4],
        [0, -2],
      ],
      [
        [20, 21],
        [0, 1],
      ],
      [
        [-20, -21],
        [0, -1],
      ],
    ];

    describe('counterclockwise', () => {
      it.each<TestCase>(testCases)('should normalize angles from %j to %j', (inital, final) => {
        const initialAngles = inital.map(denormalize) as AngleTuple;
        const result = normalizeAngles(...initialAngles).map(normalize);
        // needed for rounding errrors with normalizing
        expect(result[0]).toBeCloseTo(final[0]);
        expect(result[1]).toBeCloseTo(final[1]);
      });
    });

    describe('clockwise', () => {
      it.each<TestCase>(testCases.map((arr) => arr.map((a) => a.reverse() as AngleTuple) as TestCase))(
        'should normalize angles from %j to %j',
        (inital, final) => {
          const initialAngles = inital.map(denormalize) as AngleTuple;
          const result = normalizeAngles(...initialAngles).map(normalize);
          // needed for rounding errrors with normalizing
          expect(result[0]).toBeCloseTo(final[0]);
          expect(result[1]).toBeCloseTo(final[1]);
        },
      );
    });
  });
});
