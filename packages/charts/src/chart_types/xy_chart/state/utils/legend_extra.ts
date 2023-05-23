/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleType } from '../../../../scales/constants';
import { LegendSpec } from '../../../../specs';
import { roundDateToESInterval } from '../../../../utils/chrono/elasticsearch';
import { XDomain } from '../../domains/types';
import { isDatumFilled } from '../../rendering/utils';
import { DataSeries, DataSeriesDatum } from '../../utils/series';

/**
 * This method return a value from a DataSeries that correspond to the type of value requested.
 * It in general compute the last, min, max, avg, sum of the value in a series.
 * NOTE: not every type can work correctly with the data provided, for example a sum will not work when using the percentage chart
 * @internal
 */
export function getLegendExtraValue(
  series: DataSeries,
  xDomain: XDomain,
  type: LegendSpec['legendExtra'],
  valueAccessor: (d: DataSeriesDatum) => number | null,
): number | null {
  //TODO: this is a hacky way to give ordinal charts the right space in the legend in order to render the current value
  if (xDomain.type === ScaleType.Ordinal) {
    const lastDataPoint = series.data.at(-1);
    if (!lastDataPoint) {
      return null;
    }
    return valueAccessor(lastDataPoint);
  }

  switch (type) {
    case 'lastBucket':
      const lastDataPoint = series.data.at(-1);
      if (!lastDataPoint) {
        return null;
      }

      const lastX = lastDataPoint.x as number;
      const lastDomainValue = xDomain.domain[1] as number;
      const lastBucket = roundDateToESInterval(
        lastDomainValue,
        { type: 'fixed', unit: 'ms', value: xDomain.minInterval },
        'start',
        xDomain.timeZone,
      );
      if (lastDataPoint && !isDatumFilled(lastDataPoint) && lastX >= lastBucket) {
        return valueAccessor(lastDataPoint);
      }
      return null;
    case 'avg':
      const avg = series.data.reduce(
        (acc, curr) => {
          const value = valueAccessor(curr);
          console.log(value, acc);
          return value !== null
            ? {
                count: acc.count + 1,
                sum: acc.sum + value,
              }
            : acc;
        },
        { count: 0, sum: 0 },
      );
      return avg.count > 0 ? avg.sum / avg.count : 0;
    case 'sum':
      return series.data.reduce((acc, curr) => acc + (valueAccessor(curr) ?? 0), 0);
    case 'min':
      return series.data.reduce((acc, curr) => Math.min(acc, valueAccessor(curr) ?? Infinity), Infinity);
    case 'max':
      return series.data.reduce((acc, curr) => Math.max(acc, valueAccessor(curr) ?? -Infinity), -Infinity);
    case 'lastInSeries':
      const dataPoint = series.data.length > 0 ? series.data[series.data.length - 1] : undefined;
      return dataPoint ? valueAccessor(dataPoint) : null;
    default:
    case 'none':
      return null;
  }

  // if (last.x !== xDomain.domain.at(-1)) {
  //   // we have a dataset that is not filled with all x values
  //   // and the last value of the series is not the last value for every series
  //   // let's skip it
  //   return;
  // }

  // const { y0, y1, initialY0, initialY1 } = last;
  // const seriesKey = getSeriesKey(series as XYChartSeriesIdentifier, series.groupId);

  // if (series.stackMode === StackMode.Percentage) {
  //   const y1InPercentage = y1 === null || y0 === null ? null : y1 - y0;
  //   extraValues.set(seriesKey, { y0, y1: y1InPercentage });
  //   return;
  // }
  // if (initialY0 !== null || initialY1 !== null) {
  //   extraValues.set(seriesKey, { y0: initialY0, y1: initialY1 });
  // }
}
