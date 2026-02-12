/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  firstNonNull,
  lastNonNull,
  median,
  average,
  min,
  max,
  sum,
  countNonNull,
  distinctCount,
  variance,
  stdDeviation,
  range,
  difference,
  differencePercent,
} from '../../../../common/aggregations';
import { LegendValue } from '../../../../common/legend';
import { ScaleType } from '../../../../scales/constants';
import type { XDomain } from '../../domains/types';
import type { DataSeries, DataSeriesDatum } from '../../utils/series';
import type { TickFormatter } from '../../utils/specs';

/**
 * This method return legend values from a DataSeries that correspond to the type of value requested.
 * It in general compute the last, min, max, avg, sum of the value in a series.
 * @internal
 */
export function getLegendValues(
  series: DataSeries,
  xDomain: XDomain,
  types: LegendValue[],
  valueAccessor: (d: DataSeriesDatum) => number | null,
  tickFormatter: TickFormatter<any> | ((tick: unknown) => string),
) {
  return types.map((type) => {
    const value = getLegendValue(series, xDomain, type, valueAccessor);
    const formatter =
      type === LegendValue.Percent || type === LegendValue.DifferencePercent ? percentFormatter : tickFormatter;

    const label = typeof value === 'number' && isFinite(value) ? formatter(value) : '';

    return {
      type,
      label,
      value,
    };
  });
}

function percentFormatter(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * This method return a value from a DataSeries that correspond to the type of value requested.
 * It in general compute the last, min, max, avg, sum of the value in a series.
 * NOTE: not every type can work correctly with the data provided, for example a sum will not work when using the percentage chart
 * @internal
 */
export function getLegendValue(
  series: DataSeries,
  xDomain: XDomain,
  type: LegendValue,
  valueAccessor: (d: DataSeriesDatum) => number | null,
): number | null {
  // See https://github.com/elastic/elastic-charts/issues/2050
  if (xDomain.type === ScaleType.Ordinal) {
    return null;
  }
  switch (type) {
    case LegendValue.FirstNonNullValue:
      return firstNonNull(series.data, valueAccessor);
    case LegendValue.LastNonNullValue:
      return lastNonNull(series.data, valueAccessor);
    case LegendValue.FirstValue:
      const first = series.data.find((d) => d.x === xDomain.dataDomain[0]);
      return first ? valueAccessor(first) : null;
    case LegendValue.CurrentAndLastValue: // the current value will be passed directly to the legend component
    case LegendValue.LastValue:
      for (let i = series.data.length - 1; i >= 0; i--) {
        const value = series.data[i];
        if (value && value.x === xDomain.dataDomain[1]) {
          return valueAccessor(value);
        }
      }
      return null;
    case LegendValue.Average:
      return average(series.data, valueAccessor);
    case LegendValue.Median:
      return median(series.data, valueAccessor);
    case LegendValue.Min:
      return min(series.data, valueAccessor);
    case LegendValue.Max:
      return max(series.data, valueAccessor);
    case LegendValue.Total:
      return sum(series.data, valueAccessor).sum;
    case LegendValue.Count:
      return countNonNull(series.data, valueAccessor);
    case LegendValue.DistinctCount:
      return distinctCount(series.data, valueAccessor);
    case LegendValue.Variance:
      return variance(series.data, valueAccessor);
    case LegendValue.StdDeviation:
      return stdDeviation(series.data, valueAccessor);
    case LegendValue.Range:
      return range(series.data, valueAccessor);
    case LegendValue.Difference:
      return difference(series.data, valueAccessor);
    case LegendValue.DifferencePercent:
      return differencePercent(series.data, valueAccessor);
    default:
      return null;
  }
}
