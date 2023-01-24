/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isVerticalAxis, isHorizontalAxis, isVerticalGrid, isHorizontalGrid } from './axis_type_utils';
import { Position } from '../../../utils/common';

describe('Axis type utils', () => {
  test('should determine orientation of axis position', () => {
    expect(isVerticalAxis(Position.Left)).toBe(true);
    expect(isVerticalAxis(Position.Right)).toBe(true);
    expect(isVerticalAxis(Position.Top)).toBe(false);
    expect(isVerticalAxis(Position.Bottom)).toBe(false);

    expect(isHorizontalAxis(Position.Left)).toBe(false);
    expect(isHorizontalAxis(Position.Right)).toBe(false);
    expect(isHorizontalAxis(Position.Top)).toBe(true);
    expect(isHorizontalAxis(Position.Bottom)).toBe(true);
  });

  test('should determine orientation of gridlines from axis position', () => {
    expect(isVerticalGrid(Position.Left)).toBe(false);
    expect(isVerticalGrid(Position.Right)).toBe(false);
    expect(isVerticalGrid(Position.Top)).toBe(true);
    expect(isVerticalGrid(Position.Bottom)).toBe(true);

    expect(isHorizontalGrid(Position.Left)).toBe(true);
    expect(isHorizontalGrid(Position.Right)).toBe(true);
    expect(isHorizontalGrid(Position.Top)).toBe(false);
    expect(isHorizontalGrid(Position.Bottom)).toBe(false);
  });
});
