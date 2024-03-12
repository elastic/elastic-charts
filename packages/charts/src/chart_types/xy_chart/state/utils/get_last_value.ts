/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values } from 'utility-types';

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
import { ScaleType } from '../../../../scales/constants';
import { XDomain } from '../../domains/types';
import { DataSeries, DataSeriesDatum } from '../../utils/series';

/** @public */
export const LegendValue = Object.freeze({
  None: 'none' as const,
  /** Last value considering all data points in the chart */
  LastValue: 'lastValue' as const,
  /** Last non-null value */
  LastNonNullValue: 'lastNonNullValue' as const,
  /** Average value considering all data points in the chart */
  Average: 'average' as const,
  /** Median value considering all data points in the chart */
  Median: 'median' as const,
  /** Maximum value considering all data points in the chart */
  Max: 'max' as const,
  /** Minimum value considering all data points in the chart */
  Min: 'min' as const,
  /** First value considering all data points in the chart */
  FirstValue: 'firstValue' as const,
  /** First non-null value */
  FirstNonNullValue: 'firstNonNullValue' as const,
  /** Sum of al values plotted in the chart */
  Total: 'total' as const,
  /** number of data points plotted in the chart */
  Count: 'count' as const,
  /** number of data points with different values plotted in the chart */
  DistinctCount: 'distinctCount' as const,
  /** Variance of all data points plotted in the chart */
  Variance: 'variance' as const,
  /** Standard deviation of all data points plotted in the chart */
  StdDeviation: 'stdDeviation' as const,
  /**  Difference between min and max values */
  Range: 'range' as const,
  /** Difference between first and last values */
  Difference: 'difference' as const,
  /** % difference between first and last values */
  DifferencePercent: 'differencePercent' as const,
  /** Partition section value */
  Value: 'value' as const,
  /** Partition section value in percent */
  Percent: 'percent' as const,
});
/** @public */
export type LegendValue = $Values<typeof LegendValue>;

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
    case LegendValue.LastValue:
      const last = series.data.findLast((d) => d.x === xDomain.dataDomain[1]);
      return last ? valueAccessor(last) : null;
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
    case LegendValue.None:
      return null;
  }
}
