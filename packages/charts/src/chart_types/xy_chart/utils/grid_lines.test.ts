/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getGridLineForHorizontalAxisAt, getGridLineForVerticalAxisAt } from './grid_lines';

describe('Grid lines', () => {
  test('should compute positions for grid lines', () => {
    const tickPosition = 25;
    const panel = {
      width: 100,
      height: 100,
      top: 0,
      left: 0,
    };
    const verticalAxisGridLines = getGridLineForVerticalAxisAt(tickPosition, panel);
    expect(verticalAxisGridLines).toEqual({ x1: 0, y1: 25, x2: 100, y2: 25 });

    const horizontalAxisGridLines = getGridLineForHorizontalAxisAt(tickPosition, panel);
    expect(horizontalAxisGridLines).toEqual({ x1: 25, y1: 0, x2: 25, y2: 100 });
  });

  test('should compute axis grid line positions', () => {
    const panel = {
      width: 100,
      height: 200,
      top: 0,
      left: 0,
    };
    const tickPosition = 10;

    const verticalAxisGridLinePositions = getGridLineForVerticalAxisAt(tickPosition, panel);

    expect(verticalAxisGridLinePositions).toEqual({ x1: 0, y1: 10, x2: 100, y2: 10 });

    const horizontalAxisGridLinePositions = getGridLineForHorizontalAxisAt(tickPosition, panel);

    expect(horizontalAxisGridLinePositions).toEqual({ x1: 10, y1: 0, x2: 10, y2: 200 });
  });
});
