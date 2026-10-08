/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { StackOffset } from './diverging_offsets';
import {
  diverging,
  divergingPercentage,
  divergingSilhouette,
  divergingWiggle,
  stackCells,
  stackOffsetWiggle,
} from './diverging_offsets';

type Matrix = Array<Array<number | null>>;

/** Stacks one row per series, one column per x value, the same way `formatStackedDataSeriesValues` does; `null` is an absent cell */
const stackMatrix = (matrix: Matrix, offset: StackOffset): Array<Array<[number, number] | null>> => {
  const columns: number[][] = Array.from({ length: matrix[0]?.length ?? 0 }, () => []);
  const series: number[] = [];
  const values: number[] = [];
  matrix.forEach((row, seriesIndex) =>
    row.forEach((value, xPosition) => {
      if (value === null) return;
      columns[xPosition]!.push(values.length);
      series.push(seriesIndex);
      values.push(value);
    }),
  );
  const { y0, y1 } = stackCells(
    { columns, series: Int32Array.from(series), values: Float64Array.from(values) },
    offset,
  );
  let cell = 0;
  return matrix.map((row) =>
    row.map((value): [number, number] | null => (value === null ? null : [y0[cell]!, y1[cell++]!])),
  );
};

const MIXED = [
  [1, 2, -1, 0],
  [3, -2, 4, 0],
  [-1, 1, 2, 0],
];

const NEGATIVE = [
  [-1, -2, -3, -1],
  [-2, -1, -1, -4],
  [-3, -3, -2, -2],
];

describe('Stacking offsets', () => {
  it('diverging stacks positive values upward and negative values downward', () => {
    expect(stackMatrix(MIXED, diverging)).toEqual([
      [
        [0, 1],
        [0, 2],
        [0, -1],
        [0, 0],
      ],
      [
        [1, 4],
        [0, -2],
        [0, 4],
        [0, 0],
      ],
      [
        [0, -1],
        [2, 3],
        [4, 6],
        [0, 0],
      ],
    ]);
  });

  it('divergingSilhouette centers the stack around zero', () => {
    expect(stackMatrix(MIXED, divergingSilhouette)).toEqual([
      [
        [-1.5, -0.5],
        [-0.5, 1.5],
        [-2.5, -3.5],
        [-0, 0],
      ],
      [
        [-0.5, 2.5],
        [-0.5, -2.5],
        [-2.5, 1.5],
        [0, 0],
      ],
      [
        [-1.5, -2.5],
        [1.5, 2.5],
        [1.5, 3.5],
        [0, 0],
      ],
    ]);
  });

  it('divergingPercentage normalizes each x to its participation and skips all-zero x values', () => {
    expect(stackMatrix(MIXED, divergingPercentage)).toEqual([
      [
        [0.2, 0.4],
        [0.4, 0.8],
        [0, 0.14285714285714285],
        [0, 0],
      ],
      [
        [0.4, 1],
        [0, 0.4],
        [0.14285714285714285, 0.7142857142857142],
        [0, 0],
      ],
      [
        [0, 0.2],
        [0.8, 1],
        [0.7142857142857142, 0.9999999999999999],
        [0, 0],
      ],
    ]);
  });

  it('divergingWiggle shifts each x by the wiggle-minimizing baseline', () => {
    expect(stackMatrix(MIXED, divergingWiggle)).toEqual([
      [
        [1, 2],
        [1, 3],
        [-1.7000000000000002, -2.7],
        [-2.7, -2.7],
      ],
      [
        [2, 5],
        [1, -1],
        [-1.7000000000000002, 2.3],
        [-2.7, -2.7],
      ],
      [
        [1, 0],
        [3, 4],
        [2.3, 4.3],
        [-2.7, -2.7],
      ],
    ]);
  });

  it('divergingWiggle with a single x value has no baseline shift', () => {
    expect(stackMatrix([[2], [-3], [5]], divergingWiggle)).toEqual([[[3, 5]], [[3, 0]], [[5, 10]]]);
  });

  it('divergingWiggle with no series returns an empty stack', () => {
    expect(stackMatrix([], divergingWiggle)).toEqual([]);
  });

  it('stackOffsetWiggle, used for all-negative wiggle stacks, shifts each x by the wiggle-minimizing baseline', () => {
    expect(stackMatrix(NEGATIVE, stackOffsetWiggle)).toEqual([
      [
        [0, -1],
        [0.25, -1.75],
        [0.8333333333333334, -2.1666666666666665],
        [0.6904761904761905, -0.30952380952380953],
      ],
      [
        [-1, -3],
        [-1.75, -2.75],
        [-2.1666666666666665, -3.1666666666666665],
        [-0.30952380952380953, -4.309523809523809],
      ],
      [
        [-3, -6],
        [-2.75, -5.75],
        [-3.1666666666666665, -5.166666666666666],
        [-4.309523809523809, -6.309523809523809],
      ],
    ]);
  });

  it('stackOffsetWiggle with no series returns an empty stack', () => {
    expect(stackMatrix([], stackOffsetWiggle)).toEqual([]);
  });

  describe('absent cells', () => {
    const SPARSE: Matrix = [
      [1, null, -1, 2, null],
      [null, -2, 4, null, 5],
      [-1, 1, null, 3, -2],
    ];
    const SPARSE_NEGATIVE: Matrix = [
      [-1, null, -3, -1],
      [null, -1, -1, null],
      [-3, -3, null, -2],
    ];
    const zeroFilled = (matrix: Matrix) => matrix.map((row) => row.map((value) => value ?? 0));
    const signlessZeros = (stacked: Array<Array<[number, number] | null>>, matrix: Matrix) =>
      stacked.map((row, seriesIndex) =>
        row.map((point, xPosition) =>
          matrix[seriesIndex]?.[xPosition] === null || !point ? null : point.map((value) => value + 0),
        ),
      );

    it.each<[string, StackOffset, Matrix]>([
      ['diverging', diverging, SPARSE],
      ['divergingSilhouette', divergingSilhouette, SPARSE],
      ['divergingPercentage', divergingPercentage, SPARSE],
      ['divergingWiggle', divergingWiggle, SPARSE],
      ['stackOffsetWiggle', stackOffsetWiggle, SPARSE_NEGATIVE],
    ])('%s stacks absent cells like zero values, up to the sign of zero', (_, offset, matrix) => {
      expect(signlessZeros(stackMatrix(matrix, offset), matrix)).toEqual(
        signlessZeros(stackMatrix(zeroFilled(matrix), offset), matrix),
      );
    });

    it('visits only the cells that exist, so an x position without cells is left empty', () => {
      expect(stackMatrix([[2, null, 3]], diverging)).toEqual([[[0, 2], null, [0, 3]]]);
    });
  });
});
