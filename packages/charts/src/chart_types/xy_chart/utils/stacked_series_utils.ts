/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { stack as D3Stack, stackOffsetWiggle, stackOrderNone } from 'd3-shape';

import { SeriesKey } from '../../../common/series_id';
import { ScaleType } from '../../../scales/constants';
import { clamp, isFiniteNumber } from '../../../utils/common';
import {
  diverging,
  divergingPercentage,
  divergingSilhouette,
  divergingWiggle,
  XValueMap,
  XValueSeriesDatum,
} from './diverging_offsets';
import { DataSeries, DataSeriesDatum } from './series';
import { StackMode } from './specs';

/** @internal */
export interface StackedValues {
  values: number[];
  percent: Array<number>;
  total: number;
}

/** @internal */
export const datumXSortPredicate = (xScaleType: ScaleType, sortedXValues?: (string | number)[]) => (
  a: { x: number | string },
  b: { x: number | string },
) => {
  if (xScaleType === ScaleType.Ordinal || typeof a.x === 'string' || typeof b.x === 'string') {
    return sortedXValues ? sortedXValues.indexOf(a.x) - sortedXValues.indexOf(b.x) : 0;
  }
  return a.x - b.x;
};

/** @internal */
export function formatStackedDataSeriesValues(
  dataSeries: DataSeries[],
  xValues: Set<string | number>,
  stackMode?: StackMode,
): DataSeries[] {
  const stackAsPercentage = stackMode === StackMode.Percentage;
  const dataSeriesKeys = dataSeries.reduce<Record<SeriesKey, DataSeries>>((acc, curr) => {
    acc[curr.key] = curr;
    return acc;
  }, {});
  let hasNegative = false;
  let hasPositive = false;

  // group data series by x values
  const xMap: XValueMap = new Map();
  [...xValues].forEach((xValue) => {
    const seriesMap = new Map<SeriesKey, DataSeriesDatum>();
    dataSeries.forEach(({ key, data, isFiltered }) => {
      if (isFiltered) return;
      const datum = data.find(({ x }) => x === xValue);
      if (!datum) return;
      const y1 = datum.y1 ?? 0;
      if (hasPositive || y1 > 0) hasPositive = true;
      if (hasNegative || y1 < 0) hasNegative = true;
      seriesMap.set(`${key}-y0`, datum);
      seriesMap.set(key, datum);
    });
    xMap.set(xValue, seriesMap);
  });
  const keys = Object.keys(dataSeriesKeys).reduce<string[]>((acc, key) => [...acc, `${key}-y0`, key], []);
  const stackOffset = getOffsetBasedOnStackMode(stackMode, hasNegative && !hasPositive);
  const stack = D3Stack<XValueSeriesDatum>()
    .keys(keys)
    .value(([, indexMap], key) => {
      const datum = indexMap.get(key);
      if (!datum) return NaN;

      const { y0, y1 } = datum;
      if (key.endsWith('-y0')) {
        return isFiniteNumber(y0) ? (stackAsPercentage ? Math.abs(y0) : y0) : 0;
      }

      // if y0 is available, we have to count y1 as the different of y1 and y0
      // to correctly stack them when stacking banded charts
      const nonNullY1 = y1 ?? 0;
      const nonNullY0 = y0 ?? 0;
      return (
        (stackAsPercentage ? Math.abs(nonNullY1) : nonNullY1) - (stackAsPercentage ? Math.abs(nonNullY0) : nonNullY0)
      );
    })
    .order(stackOrderNone)
    .offset(stackOffset)(xMap)
    .filter(({ key }) => !key.endsWith('-y0'));

  return stack.map((stackedSeries) => {
    const dataSeriesProps = dataSeriesKeys[stackedSeries.key];
    const data = stackedSeries
      .map<DataSeriesDatum | null>((row) => {
        const d = row.data[1].get(stackedSeries.key);
        if (!d || d.x === undefined || d.x === null) return null;
        const { initialY0, initialY1, mark, datum, filled, x } = d;
        const [y0, y1] = row;

        return {
          x,
          /**
           * Due to floating point errors, values computed on a stack
           * could falls out of the current defined domain boundaries.
           * This in particular cause issues with percent stack, where the domain
           * is hardcoded to [0,1] and some value can fall outside that domain.
           */
          y1: clampIfStackedAsPercentage(y1, stackMode),
          y0: clampIfStackedAsPercentage(y0, stackMode),
          initialY0,
          initialY1,
          mark,
          datum,
          filled,
        };
      })
      .filter((d) => d !== null) as DataSeriesDatum[];
    return {
      ...dataSeriesProps,
      data,
    };
  });
}

function clampIfStackedAsPercentage(value: number, stackMode?: StackMode) {
  return stackMode === StackMode.Percentage ? clamp(value, 0, 1) : value;
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
