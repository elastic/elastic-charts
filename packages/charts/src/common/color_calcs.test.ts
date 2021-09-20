/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { integerSnap, monotonicHillClimb } from '../solvers/monotonic_hill_climb';
import { highContrastColor, combineColors } from './color_calcs';
import { RgbaTuple } from './color_library_wrappers';
import { fillTextColor } from './fill_text_color';

describe('Color calcs', () => {
  describe('test highContrastColor', () => {
    it('should return black when background is white', () => {
      expect(fillTextColor('white')).toEqual('rgba(0, 0, 0, 1)');
    });
    // test contrast computation
    it('should return black with yellow/semi-transparent background', () => {
      expect(fillTextColor(`rgba(255,255,51,0.3)`)).toEqual('rgba(0, 0, 0, 1)');
    });
    it('should use white text for Thailand color', () => {
      // black for WCAG2, white for WCAG3
      expect(fillTextColor(`rgba(120, 116, 178, 1)`)).toEqual('rgba(0, 0, 0, 1)');
    });
    it('should switch to black text if background color is in rgba() format - Thailand', () => {
      const containerBackground: RgbaTuple = [255, 255, 255, 1]; // white
      const background: RgbaTuple = [120, 116, 178, 0.7];
      const blendedBackground: RgbaTuple = [161, 158, 201, 1];
      expect(combineColors(background, containerBackground)).toEqual(blendedBackground);
      expect(highContrastColor(blendedBackground, 'WCAG2')).toEqual([0, 0, 0, 1]);
      expect(highContrastColor(blendedBackground, 'WCAG3')).toEqual([255, 255, 255, 1]);
    });
  });
  describe('test the combineColors function', () => {
    it('should return correct RGBA with opacity greater than 0.7', () => {
      const expected = [102, 43, 206, 1];
      const result = combineColors([121, 47, 249, 0.8], [28, 28, 36, 1]);
      expect(result).toEqual(expected);
    });
    it('should return correct RGBA with opacity less than 0.7', () => {
      const expected = [226, 186, 187, 1];
      const result = combineColors([228, 26, 28, 0.3], [225, 255, 255, 1]);
      expect(result).toEqual(expected);
    });
    it('should return correct RGBA with the input color as a word vs rgba or hex value', () => {
      const expected = [0, 0, 255, 1];
      const result = combineColors([0, 0, 255, 1], [0, 0, 0, 1]);
      expect(result).toEqual(expected);
    });
    it('should return the correct RGBA with hex input', () => {
      const expected = [212, 242, 210, 1];
      const result = combineColors([212, 242, 210, 1], [190, 183, 223, 1]);
      expect(result).toEqual(expected);
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
