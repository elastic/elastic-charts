/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SeriesType, StackMode } from './specs';
import { formatStackedDataSeriesValues } from './stacked_series_utils';
import { MockDataSeries } from '../../../mocks/series';

type Matrix = Array<Array<number | null>>;

/** Stacks one series per row and one x value per column; `null` is a missing data point */
const stackMatrix = (matrix: Matrix, stackMode?: StackMode): Array<Array<[number, number] | null>> => {
  const xIndex = new Map((matrix[0] ?? []).map((_, x) => [x, x]));
  const dataSeries = matrix.map((row) =>
    MockDataSeries.fromData(
      row.flatMap((y1, x) =>
        y1 === null ? [] : [{ x, y1, y0: null, initialY1: y1, initialY0: null, mark: null, datum: undefined }],
      ),
    ),
  );
  return formatStackedDataSeriesValues(dataSeries, xIndex, SeriesType.Bar, stackMode).map(({ data }, s) => {
    const stacked = new Map(data.map(({ x, y0, y1 }) => [x, [y0, y1] as [number, number]]));
    return matrix[s]!.map((_, x) => stacked.get(x) ?? null);
  });
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
  it('default stacking stacks positive values upward and negative values downward', () => {
    expect(stackMatrix(MIXED)).toEqual([
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

  it('silhouette centers the stack around zero', () => {
    expect(stackMatrix(MIXED, StackMode.Silhouette)).toEqual([
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

  it('percentage normalizes each x to its participation and skips all-zero x values', () => {
    expect(stackMatrix(MIXED, StackMode.Percentage)).toEqual([
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

  it('wiggle with mixed polarity shifts each x by the wiggle-minimizing baseline', () => {
    expect(stackMatrix(MIXED, StackMode.Wiggle)).toEqual([
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

  it('wiggle with a single x value has no baseline shift', () => {
    expect(stackMatrix([[2], [-3], [5]], StackMode.Wiggle)).toEqual([[[3, 5]], [[3, 0]], [[5, 10]]]);
  });

  it('wiggle with no series returns an empty stack', () => {
    expect(stackMatrix([], StackMode.Wiggle)).toEqual([]);
  });

  it('wiggle with only negative values uses the non-diverging wiggle offset', () => {
    expect(stackMatrix(NEGATIVE, StackMode.Wiggle)).toEqual([
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

    it.each<[string, StackMode | undefined, Matrix]>([
      ['default', undefined, SPARSE],
      ['silhouette', StackMode.Silhouette, SPARSE],
      ['percentage', StackMode.Percentage, SPARSE],
      ['wiggle', StackMode.Wiggle, SPARSE],
      ['negative-only wiggle', StackMode.Wiggle, SPARSE_NEGATIVE],
    ])('%s stacks absent cells like zero values, up to the sign of zero', (_, stackMode, matrix) => {
      expect(signlessZeros(stackMatrix(matrix, stackMode), matrix)).toEqual(
        signlessZeros(stackMatrix(zeroFilled(matrix), stackMode), matrix),
      );
    });

    it('visits only the cells that exist, so an x position without cells is left empty', () => {
      expect(stackMatrix([[2, null, 3]])).toEqual([[[0, 2], null, [0, 3]]]);
    });
  });
});
