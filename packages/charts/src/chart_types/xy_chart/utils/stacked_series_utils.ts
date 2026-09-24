/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { stack as D3Stack, stackOffsetWiggle, stackOrderNone } from 'd3-shape';

import type { XValueMap, XValueSeriesDatum } from './diverging_offsets';
import { diverging, divergingPercentage, divergingSilhouette, divergingWiggle } from './diverging_offsets';
import type { DataSeries, DataSeriesDatum } from './series';
import { SeriesType, StackMode } from './specs';
import type { SeriesKey } from '../../../common/series_id';
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
  let hasNegative = false;
  let hasPositive = false;

  // `fillSeries` pads every stacked series to one datum per x value and `getSortedDataSeries` puts
  // them in `xValues` order, so `data[j]` is normally the datum at the jth x: index instead of look up
  const isDense = dataSeries.every(({ data }) => data.length === xValues.size);

  // group data series by x values
  const xMap: XValueMap = new Map();
  for (const xValue of xValues) {
    xMap.set(xValue, new Map<SeriesKey, DataSeriesDatum>());
  }
  const filteredKeys = new Set<SeriesKey>();
  for (const { key, data, isFiltered } of dataSeries) {
    if (isFiltered) filteredKeys.add(key);
    for (const datum of data) {
      const y1 = datum.y1 ?? 0;
      if (y1 > 0) hasPositive = true;
      if (y1 < 0) hasNegative = true;
      if (isDense) continue;
      const seriesMap = xMap.get(datum.x);
      if (!seriesMap || seriesMap.has(key)) continue;
      seriesMap.set(key, datum);
    }
  }

  if (hasNegative && hasPositive && seriesType === SeriesType.Area) {
    Logger.warn(
      `Area series should be avoided with dataset containing positive and negative values. Use a bar series instead.`,
    );
  }

  const stackOffset = getOffsetBasedOnStackMode(stackMode, hasNegative && !hasPositive);
  const stack = D3Stack<XValueSeriesDatum, number>()
    .keys(dataSeries.map((_, index) => index))
    .value(([, indexMap], seriesIndex, xIndex) => {
      const series = dataSeries[seriesIndex];
      if (!series || filteredKeys.has(series.key)) return 0; // hides filtered series while maintaining their existence
      const datum = isDense ? series.data[xIndex] : indexMap.get(series.key);
      return datum ? datum.y1 ?? 0 : 0;
    })
    .order(stackOrderNone)
    .offset(stackOffset)(xMap);

  /**
   * Due to floating point errors, values computed on a stack
   * could falls out of the current defined domain boundaries.
   * This in particular cause issues with percent stack, where the domain
   * is hardcoded to [0,1] and some value can fall outside that domain.
   */
  const clampStackedValue =
    stackMode === StackMode.Percentage ? (value: number) => clamp(value, 0, 1) : (value: number) => value;

  const formattedDataSeries: DataSeries[] = [];
  for (const stackedSeries of stack) {
    const dataSeriesProps = dataSeries[stackedSeries.key];
    if (!dataSeriesProps) continue;
    const { key, data: seriesData } = dataSeriesProps;
    const data: DataSeriesDatum[] = [];
    let xIndex = 0;
    for (const row of stackedSeries) {
      const d = isDense ? seriesData[xIndex++] : row.data[1].get(key);
      if (!d || d.x === undefined || d.x === null) continue;

      data.push({
        x: d.x,
        y1: clampStackedValue(row[1]),
        y0: clampStackedValue(row[0]),
        initialY0: d.initialY0,
        initialY1: d.initialY1,
        mark: d.mark,
        datum: d.datum,
        filled: d.filled,
      });
    }
    formattedDataSeries.push({
      ...dataSeriesProps,
      data,
    });
  }
  return formattedDataSeries;
}

function getOffsetBasedOnStackMode(stackMode?: StackMode, onlyNegative = false) {
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
