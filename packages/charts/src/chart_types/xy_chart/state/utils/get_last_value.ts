/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values } from 'utility-types';

import { ScaleType } from '../../../../scales/constants';
import { roundDateToESInterval } from '../../../../utils/chrono/elasticsearch';
import { XDomain } from '../../domains/types';
import { isDatumFilled } from '../../rendering/utils';
import { DataSeries, DataSeriesDatum } from '../../utils/series';

/** @internal */
export const LegendValue = Object.freeze({
  None: 'none' as const,
  LastTimeBucket: 'lastTimeBucket' as const,
  LastBucket: 'lastBucket' as const,
  LastNonNull: 'lastNonNull' as const,
  Average: 'avg' as const,
  Min: 'min' as const,
  Max: 'max' as const,
  Sum: 'sum' as const,
});
/** @internal */
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
    case LegendValue.LastBucket: {
      const last = series.data.at(-1);
      return last ? valueAccessor(last) : null;
    }
    case LegendValue.LastNonNull: {
      const last = series.data.findLast((d) => valueAccessor(d) !== null);
      return last ? valueAccessor(last) : null;
    }
    case LegendValue.LastTimeBucket:
      if (xDomain.type !== ScaleType.Time) {
        return null;
      }
      const upperDomainBound = xDomain.domain[1] as number;
      // This has a problem: the minInterval could be smaller then the last bucket interval due to DTS
      // this cause the bucket to be smaller and the round date wrongly computed.
      const lastBucket = roundDateToESInterval(
        upperDomainBound,
        { type: 'fixed', unit: 'ms', value: xDomain.minInterval },
        'start',
        xDomain.timeZone,
      );
      let lastIndex = series.data.findLastIndex((d) => (d.x as number) <= lastBucket);
      if (lastIndex < series.data.length - 1) {
        lastIndex = series.data.length - 1;
      }
      const last = series.data.at(lastIndex);
      if (last && !isDatumFilled(last)) {
        return valueAccessor(last);
      }
      return null;
    // all these cases are not currently used and exposed. We need to test and enable them
    // then the legend value will be configurable by the user.
    // case LegendValue.Average:
    //   const avg = series.data.reduce(
    //     (acc, curr) => {
    //       const value = valueAccessor(curr);
    //       return value !== null
    //         ? {
    //             count: acc.count + 1,
    //             sum: acc.sum + value,
    //           }
    //         : acc;
    //     },
    //     { count: 0, sum: 0 },
    //   );
    //   return avg.count > 0 ? avg.sum / avg.count : 0;
    // case LegendValue.Sum:
    //   return series.data.reduce((acc, curr) => acc + (valueAccessor(curr) ?? 0), 0);
    // case LegendValue.Min:
    //   return series.data.reduce((acc, curr) => Math.min(acc, valueAccessor(curr) ?? Infinity), Infinity);
    // case LegendValue.Max:
    //   return series.data.reduce((acc, curr) => Math.max(acc, valueAccessor(curr) ?? -Infinity), -Infinity);
    default:
    case LegendValue.None:
      return null;
  }
}
