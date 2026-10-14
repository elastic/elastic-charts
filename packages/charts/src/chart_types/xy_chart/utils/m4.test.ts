/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { m4 } from './m4';

const N = NaN;
const binsOf = (ys: number[], scale: number, origin = 0, offset = 0, keepGaps = true) =>
  m4(
    Float64Array.from(ys, (_, x) => x),
    Float64Array.from(ys),
    scale,
    origin,
    offset,
    keepGaps,
  );

describe('m4', () => {
  it('keeps the first, lowest, highest and last row of each pixel bin, in row order', () => {
    // four rows per bin: x 0-3 in bin 0, x 4-7 in bin 1
    expect(binsOf([5, 9, 1, 6, 2, 3, 8, 4], 0.25)).toEqual([0, 1, 2, 3, 4, 6, 7]);
  });

  it('keeps every row when no bin holds more than one row', () => {
    expect(binsOf([3, 1, 4, 1, 5], 1)).toEqual([0, 1, 2, 3, 4]);
  });

  it('keeps the first occurrence of a repeated extreme', () => {
    expect(binsOf([2, 7, 7, 2, 4], 0)).toEqual([0, 1, 4]);
  });

  it('ends a run at a missing y and keeps only the first and last of a run of missing values', () => {
    expect(binsOf([N, N, N, 5, N, 4, 6, 2, 7, 9, N, N], 0)).toEqual([0, 2, 3, 4, 5, 7, 9, 10, 11]);
  });

  it('places bins at floor(offset + scale * (x - origin))', () => {
    // x 0-1 fall in bin 0, x 2-5 in bin 1, x 6 in bin 2
    expect(binsOf([1, 2, 6, 5, 4, 3, 7], 0.25, 2, 1)).toEqual([0, 1, 2, 5, 6]);
  });

  it('without keepGaps, skips missing ys, so a single bin keeps at most the four summary rows', () => {
    expect(binsOf([N, 5, 9, N, 1, 6, N], 0, 0, 0, false)).toEqual([1, 2, 4, 5]);
    expect(binsOf([N, N], 0, 0, 0, false)).toEqual([]);
  });
});
