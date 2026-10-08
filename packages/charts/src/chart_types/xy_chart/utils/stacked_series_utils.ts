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
import type { DataSeries, DataSeriesDatum } from './series';
import { SeriesType, StackMode } from './specs';
import { ScaleType } from '../../../scales/constants';
import { clamp } from '../../../utils/common';
import { Logger } from '../../../utils/logger';

/** @internal */
export interface StackedValues {
  values: number[];
  percent: Array<number>;
  total: number;
}

/** @internal */
export const datumXSortPredicate = (xScaleType: ScaleType, sortedXValues?: Set<string | number>) => {
  let xValueIndices: Map<string | number, number> | undefined;
  return (a: { x: number | string }, b: { x: number | string }) => {
    if (xScaleType === ScaleType.Ordinal || typeof a.x === 'string' || typeof b.x === 'string') {
      if (!xValueIndices && sortedXValues) {
        xValueIndices = new Map();
        for (const xValue of sortedXValues) xValueIndices.set(xValue, xValueIndices.size);
      }
      return xValueIndices ? (xValueIndices.get(a.x) ?? -1) - (xValueIndices.get(b.x) ?? -1) : 0;
    }
    return a.x - b.x;
  };
};

/** @internal */
export function formatStackedDataSeriesValues(
  dataSeries: DataSeries[],
  xValues: Set<string | number>,
  seriesType: SeriesType,
  stackMode?: StackMode,
): DataSeries[] {
  const xIndex = new Map<string | number, number>();
  for (const xValue of xValues) {
    xIndex.set(xValue, xIndex.size);
  }

  const cellCapacity = dataSeries.reduce((count, { data }) => count + data.length, 0);
  const columns: number[][] = Array.from({ length: xValues.size }, () => []);
  const series = new Int32Array(cellCapacity);
  const values = new Float64Array(cellCapacity);
  const datums: DataSeriesDatum[] = [];
  const seriesEnds = new Int32Array(dataSeries.length);
  const lastSeriesAtX = new Int32Array(xValues.size).fill(-1);
  let hasNegative = false;
  let hasPositive = false;
  for (let seriesIndex = 0; seriesIndex < dataSeries.length; seriesIndex++) {
    const { data, isFiltered } = dataSeries[seriesIndex]!;
    for (const datum of data) {
      const xPosition = xIndex.get(datum.x);
      if (xPosition === undefined || lastSeriesAtX[xPosition] === seriesIndex) continue;
      lastSeriesAtX[xPosition] = seriesIndex;
      const y1 = datum.y1 ?? 0;
      if (y1 > 0) hasPositive = true;
      if (y1 < 0) hasNegative = true;
      const cell = datums.length;
      columns[xPosition]!.push(cell);
      series[cell] = seriesIndex;
      values[cell] = isFiltered ? 0 : y1;
      datums.push(datum);
    }
    seriesEnds[seriesIndex] = datums.length;
  }

  if (hasNegative && hasPositive && seriesType === SeriesType.Area) {
    Logger.warn(
      `Area series should be avoided with dataset containing positive and negative values. Use a bar series instead.`,
    );
  }

  const cellCount = datums.length;
  const { y0, y1 } = stackCells(
    {
      columns,
      series: series.subarray(0, cellCount),
      values: values.subarray(0, cellCount),
    },
    getOffsetBasedOnStackMode(stackMode, hasNegative && !hasPositive),
  );

  /**
   * Due to floating point errors, values computed on a stack
   * could falls out of the current defined domain boundaries.
   * This in particular cause issues with percent stack, where the domain
   * is hardcoded to [0,1] and some value can fall outside that domain.
   */
  const clampStackedValue =
    stackMode === StackMode.Percentage ? (value: number) => clamp(value, 0, 1) : (value: number) => value;

  const formattedDataSeries: DataSeries[] = [];
  let cell = 0;
  for (let seriesIndex = 0; seriesIndex < dataSeries.length; seriesIndex++) {
    const data: DataSeriesDatum[] = [];
    for (const seriesEnd = seriesEnds[seriesIndex]!; cell < seriesEnd; cell++) {
      const d = datums[cell]!;
      data.push({
        x: d.x,
        y1: clampStackedValue(y1[cell]!),
        y0: clampStackedValue(y0[cell]!),
        initialY0: d.initialY0,
        initialY1: d.initialY1,
        mark: d.mark,
        datum: d.datum,
        filled: d.filled,
      });
    }
    formattedDataSeries.push({
      ...dataSeries[seriesIndex]!,
      data,
    });
  }
  return formattedDataSeries;
}

function getOffsetBasedOnStackMode(stackMode?: StackMode, onlyNegative = false): StackOffset {
  // TODO: fix diverging wiggle offset for negative polarity data
  if (onlyNegative && stackMode === StackMode.Wiggle) return stackOffsetWiggle;

  switch (stackMode) {
    case StackMode.Percentage:
      return divergingPercentage;
    case StackMode.Silhouette:
      return divergingSilhouette;
    case StackMode.Wiggle:
      return divergingWiggle;
    default:
      return diverging;
  }
}
