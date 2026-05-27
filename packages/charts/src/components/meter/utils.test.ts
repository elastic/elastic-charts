/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  getMeterGeometry,
  getMeterGradientFill,
  getMeterRevealWindow,
  getMeterScalePosition,
  getMeterSolidFillColor,
} from './utils';
import { LayoutDirection } from '../../utils/common';

describe('Meter utils', () => {
  test('should anchor positive domains at the left edge', () => {
    expect(getMeterGeometry([0, 100], 40)).toEqual({
      fillStart: 0,
      fillEnd: 40,
      fillSize: 40,
      rawValuePosition: 40,
      rawZeroPosition: 0,
      hasZeroBaseline: false,
    });
  });

  test('should anchor negative-only domains at the right edge', () => {
    expect(getMeterGeometry([-100, -10], -55)).toEqual({
      fillStart: 50,
      fillEnd: 100,
      fillSize: 50,
      rawValuePosition: 50,
      rawZeroPosition: 111.11111111111111,
      hasZeroBaseline: false,
    });
  });

  test('should anchor mixed-sign domains at zero', () => {
    expect(getMeterGeometry([-100, 40], -50)).toEqual({
      fillStart: 35.714285714285715,
      fillEnd: 71.42857142857143,
      fillSize: 35.714285714285715,
      rawValuePosition: 35.714285714285715,
      rawZeroPosition: 71.42857142857143,
      hasZeroBaseline: true,
    });
  });

  test('should normalize reversed domains before scaling', () => {
    expect(getMeterGeometry([40, -100], -50)).toEqual({
      fillStart: 35.714285714285715,
      fillEnd: 71.42857142857143,
      fillSize: 35.714285714285715,
      rawValuePosition: 35.714285714285715,
      rawZeroPosition: 71.42857142857143,
      hasZeroBaseline: true,
    });
  });

  test('should keep degenerate domains centered on the track', () => {
    expect(getMeterScalePosition([0, 0], 0)).toBe(50);
    expect(getMeterScalePosition([5, 5], 10)).toBe(50);
  });

  test('should preserve full-track gradients for revealed fills', () => {
    expect(
      getMeterGradientFill(
        [-100, 40],
        [
          { stop: -100, color: '#006BB4' },
          { stop: 0, color: '#F5A700' },
          { stop: 40, color: '#BD271E' },
        ],
        LayoutDirection.Horizontal,
      ),
    ).toBe('linear-gradient(to right, #006BB4 0%, #F5A700 71.42857142857143%, #BD271E 100%)');
  });

  test('should derive a stable reveal window from the filled span', () => {
    expect(getMeterRevealWindow(25, 50)).toEqual({
      scaleFactor: 2,
      offset: -50,
    });
  });

  test('should fall back to a single stop color for solid fills', () => {
    expect(getMeterSolidFillColor([0, 100], [{ stop: 100, color: '#BD271E' }], 50, '#000000')).toBe('#BD271E');
  });
});
