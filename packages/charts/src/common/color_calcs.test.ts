/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { integerSnap, monotonicHillClimb } from '../solvers/monotonic_hill_climb';
import { BLACK_COLOR, WHITE_COLOR } from './color';
import { makeHighContrastColor, combineColors } from './color_calcs';

describe('calcs', () => {
  describe('test makeHighContrastColor', () => {
    it('hex input - should change white text to black when background is white', () => {
      expect(makeHighContrastColor('#fff', '#fff')).toBe(BLACK_COLOR);
    });
    it('rgb input - should change white text to black when background is white', () => {
      expect(makeHighContrastColor('rgb(255, 255, 255)', 'rgb(255, 255, 255)')).toBe(BLACK_COLOR);
    });
    it('rgba input - should change white text to black when background is white', () => {
      expect(makeHighContrastColor('rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)')).toBe(BLACK_COLOR);
    });
    it('word input - should change white text to black when background is white', () => {
      expect(makeHighContrastColor(WHITE_COLOR, WHITE_COLOR)).toBe(BLACK_COLOR);
    });
    // test contrast computation
    it('should provide at least 4.5 contrast', () => {
      const foreground = WHITE_COLOR;
      const background = 'rgba(255, 255, 51, 0.3)'; // light yellow
      expect(makeHighContrastColor(foreground, background)).toBe(BLACK_COLOR);
    });
    it('should use black text for hex value', () => {
      const foreground = WHITE_COLOR;
      const background = '#7874B2'; // Thailand color
      expect(makeHighContrastColor(foreground, background)).toBe(BLACK_COLOR);
    });
    it('should switch to black text if background color is in rgba() format - Thailand', () => {
      const containerBackground = WHITE_COLOR;
      const background = 'rgba(120, 116, 178, 0.7)';
      const resultForCombined = 'rgba(161, 158, 201, 1)'; // 0.3 'rgba(215, 213, 232, 1)'; // 0.5 - 'rgba(188, 186, 217, 1)'; //0.7 - ;
      expect(combineColors(background, containerBackground)).toBe(resultForCombined);
      expect(makeHighContrastColor(WHITE_COLOR, resultForCombined)).toBe(BLACK_COLOR);
    });
  });
  describe('test the combineColors function', () => {
    it('should return correct RGBA with opacity greater than 0.7', () => {
      const expected = 'rgba(102, 43, 206, 1)';
      const result = combineColors('rgba(121, 47, 249, 0.8)', '#1c1c24');
      expect(result).toBe(expected);
    });
    it('should return correct RGBA with opacity less than 0.7', () => {
      const expected = 'rgba(226, 186, 187, 1)';
      const result = combineColors('rgba(228, 26, 28, 0.3)', 'rgba(225, 255, 255, 1)');
      expect(result).toBe(expected);
    });
    it('should return correct RGBA with the input color as a word vs rgba or hex value', () => {
      const expected = 'rgba(0, 0, 255, 1)';
      const result = combineColors('blue', 'black');
      expect(result).toBe(expected);
    });
    it('should return the correct RGBA with hex input', () => {
      const expected = 'rgba(212, 242, 210, 1)';
      const result = combineColors('#D4F2D2', '#BEB7DF');
      expect(result).toBe(expected);
    });
  });
});

describe('monotonicHillClimb', () => {
  const arbitraryNumber = 27;

  describe('continuous functions', () => {
    test('linear case', () => {
      expect(monotonicHillClimb((n: number) => n, 100, arbitraryNumber)).toBeCloseTo(arbitraryNumber, 6);
    });

    test('flat case should yield `maxVar`', () => {
      expect(monotonicHillClimb(() => arbitraryNumber, 100, 50)).toBeCloseTo(100, 6);
    });

    test('nonlinear case', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n), Math.PI / 2, Math.sqrt(2) / 2)).toBeCloseTo(Math.PI / 4, 6);
    });

    test('non-compliant for even `minVar` should yield NaN', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n), Math.PI / 2, -1)).toBeNaN();
    });

    test('`loVar > hiVar` should yield NaN', () => {
      expect(
        monotonicHillClimb(
          (n: number) => Math.sin(n),
          1,
          arbitraryNumber,
          (n: number) => n,
          2,
        ),
      ).toBeNaN();
    });

    test('compliant for `maxVar` should yield `maxVar`', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n), Math.PI / 2, 1)).toBeCloseTo(Math.PI / 2, 6);
    });

    test('`loVar === hiVar`, compliant', () => {
      expect(
        monotonicHillClimb(
          (n: number) => Math.sin(n),
          Math.PI / 2,
          1,
          (n: number) => n,
          Math.PI / 2,
        ),
      ).toBe(Math.PI / 2);
    });

    test('`loVar === hiVar`, non-compliant', () => {
      expect(
        monotonicHillClimb(
          (n: number) => Math.sin(n),
          Math.PI / 2,
          Math.sqrt(2) / 2,
          (n: number) => n,
          Math.PI / 2,
        ),
      ).toBeNaN();
    });
  });

  describe('integral domain functions', () => {
    test('linear case', () => {
      expect(monotonicHillClimb((n: number) => n, 100, arbitraryNumber, integerSnap)).toBe(arbitraryNumber);
    });

    test('flat case should yield `maxVar`', () => {
      expect(monotonicHillClimb(() => arbitraryNumber, 100, 50)).toBe(100);
    });

    test('nonlinear case', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n / 10), 15, Math.sqrt(2) / 2, integerSnap)).toBe(7);
    });

    test('non-compliant for even `minVar` should yield NaN', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n), Math.PI / 2, -1, integerSnap)).toBeNaN();
    });

    test('`loVar > hiVar` should yield NaN', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n), 1, arbitraryNumber, integerSnap, 2)).toBeNaN();
    });

    test('compliant for `maxVar` should yield `maxVar`', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n / 10), 15, 1, integerSnap)).toBe(15);
    });

    test('`loVar === hiVar`, compliant', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n / 10), 15, 1, integerSnap, 15)).toBe(15);
    });

    test('`loVar === hiVar`, non-compliant', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n / 10), 15, Math.sqrt(2) / 2, integerSnap, 15)).toBeNaN();
    });

    test('`loVar + 1 === hiVar`, latter is compliant', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n / 10), 15, 1, integerSnap, 14)).toBe(15);
    });

    test('`loVar + 1 === hiVar`, only former is compliant', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n / 10), 15, 0.99, integerSnap, 14)).toBe(14);
    });

    test('`loVar + 1 === hiVar`, non-compliant', () => {
      expect(monotonicHillClimb((n: number) => Math.sin(n / 10), 15, Math.sqrt(2) / 2, integerSnap, 14)).toBeNaN();
    });
  });
});
