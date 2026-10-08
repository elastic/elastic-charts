/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { stackCells } from './diverging_offsets';
import type { DataSeries, DataSeriesDatum } from './series';
import type { StackMode } from './specs';
import { SeriesType } from './specs';
import { ScaleType } from '../../../scales/constants';
import { Logger } from '../../../utils/logger';

/** @internal */
export const datumXSortPredicate =
  (xScaleType: ScaleType, xIndex?: Map<string | number, number>) =>
  (a: { x: number | string }, b: { x: number | string }) => {
    if (xScaleType === ScaleType.Ordinal || typeof a.x === 'string' || typeof b.x === 'string') {
      return xIndex ? (xIndex.get(a.x) ?? -1) - (xIndex.get(b.x) ?? -1) : 0;
    }
    return a.x - b.x;
  };

/** @internal */
export function formatStackedDataSeriesValues(
  dataSeries: DataSeries[],
  xIndex: Map<string | number, number>,
  seriesType: SeriesType,
  stackMode?: StackMode,
): DataSeries[] {
  const columns: number[][] = Array.from({ length: xIndex.size }, () => []);
  const series: number[] = [];
  const values: number[] = [];
  const datums: DataSeriesDatum[] = [];
  const seriesEnds: number[] = [];
  let hasNegative = false;
  let hasPositive = false;
  for (let seriesIndex = 0; seriesIndex < dataSeries.length; seriesIndex++) {
    const { data, isFiltered } = dataSeries[seriesIndex]!;
    let previousPosition = -1;
    for (const datum of data) {
      const xPosition = xIndex.get(datum.x)!;
      if (xPosition === previousPosition) continue;
      previousPosition = xPosition;
      const y1 = datum.y1 ?? 0;
      if (y1 > 0) hasPositive = true;
      if (y1 < 0) hasNegative = true;
      columns[xPosition]!.push(datums.length);
      series.push(seriesIndex);
      values.push(isFiltered ? 0 : y1);
      datums.push(datum);
    }
    seriesEnds.push(datums.length);
  }

  if (hasNegative && hasPositive && seriesType === SeriesType.Area) {
    Logger.warn(
      `Area series should be avoided with dataset containing positive and negative values. Use a bar series instead.`,
    );
  }

  const { y0, y1 } = stackCells(columns, series, values, stackMode, hasNegative && !hasPositive);

  const formattedDataSeries: DataSeries[] = [];
  let cell = 0;
  for (let seriesIndex = 0; seriesIndex < dataSeries.length; seriesIndex++) {
    const data: DataSeriesDatum[] = [];
    for (const seriesEnd = seriesEnds[seriesIndex]!; cell < seriesEnd; cell++) {
      const d = datums[cell]!;
      data.push({
        x: d.x,
        y1: y1[cell]!,
        y0: y0[cell]!,
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
