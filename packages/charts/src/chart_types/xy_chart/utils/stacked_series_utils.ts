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
import { clamp, isDefined } from '../../../utils/common';
import { Logger } from '../../../utils/logger';

/** @internal */
export interface StackedValues {
  values: number[];
  percent: Array<number>;
  total: number;
}

/** @internal */
export const datumXSortPredicate =
  (xScaleType: ScaleType, sortedXValues?: (string | number)[]) =>
  (a: { x: number | string }, b: { x: number | string }) => {
    if (xScaleType === ScaleType.Ordinal || typeof a.x === 'string' || typeof b.x === 'string') {
      return sortedXValues ? sortedXValues.indexOf(a.x) - sortedXValues.indexOf(b.x) : 0;
    }
    return a.x - b.x;
  };

/** @internal */
export function formatStackedDataSeriesValues(
  dataSeries: DataSeries[],
  xValues: Set<string | number>,
  seriesType: SeriesType,
  stackMode?: StackMode,
): DataSeries[] {
  const dataSeriesMap = dataSeries.reduce<Map<SeriesKey, DataSeries>>((acc, curr) => {
    return acc.set(curr.key, curr);
  }, new Map());
  let hasNegative = false;
  let hasPositive = false;

  // group data series by x values
  const xMap: XValueMap = new Map();
  [...xValues].forEach((xValue) => {
    const seriesMap = new Map<SeriesKey, DataSeriesDatum & { isFiltered: boolean }>();
    dataSeries.forEach(({ key, data, isFiltered }) => {
      const datum = data.find(({ x }) => x === xValue);
      if (!datum) return;
      const y1 = datum.y1 ?? 0;
      if (hasPositive || y1 > 0) hasPositive = true;
      if (hasNegative || y1 < 0) hasNegative = true;
      const newDatum = Object.assign(datum, { isFiltered });
      seriesMap.set(`${key}-y0`, newDatum);
      seriesMap.set(key, newDatum);
    });
    xMap.set(xValue, seriesMap);
  });

  if (hasNegative && hasPositive && seriesType === SeriesType.Area) {
    Logger.warn(
      `Area series should be avoided with dataset containing positive and negative values. Use a bar series instead.`,
    );
  }

  const keys = [...dataSeriesMap.keys()].reduce<string[]>((acc, key) => [...acc, `${key}-y0`, key], []);
  const stackOffset = getOffsetBasedOnStackMode(stackMode, hasNegative && !hasPositive);
  const stack = D3Stack<XValueSeriesDatum>()
    .keys(keys)
    .value(([, indexMap], key) => {
      const datum = indexMap.get(key);
      if (!datum || datum.isFiltered) return 0; // hides filtered series while maintaining their existence
      return key.endsWith('-y0') ? datum.y0 ?? 0 : datum.y1 ?? 0;
    })
    .order(stackOrderNone)
    .offset(stackOffset)(xMap)
    .filter(({ key }) => !key.endsWith('-y0'));

  return stack
    .map<DataSeries | null>((stackedSeries) => {
      const dataSeriesProps = dataSeriesMap.get(stackedSeries.key);
      if (!dataSeriesProps) return null;
      const data = stackedSeries
        .map<DataSeriesDatum | null>((row) => {
          const d = row.data[1]?.get(stackedSeries.key);
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
        .filter(isDefined);
      return {
        ...dataSeriesProps,
        data,
      };
    })
    .filter(isDefined);
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
