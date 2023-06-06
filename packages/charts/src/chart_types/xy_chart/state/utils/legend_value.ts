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
export function getLegendValue(
  series: DataSeries,
  xDomain: XDomain,
  type: LegendSpec['legendValue'],
  valueAccessor: (d: DataSeriesDatum) => number | null,
): number | null {
  // 24/05/2023 A decision was made by the Kibana Visualization Team (MarcoV, StratoulaK)
  // to disable representing `current` hovered values if the X scale is Ordinal. at Elastic this feature wasn't used
  // and the the information was redundant because it was alredy available in the tooltip.
  // A possible enhancement will probably update this configuration to allow `current` values if explicitly configured.
  // See https://github.com/elastic/elastic-charts/issues/2050
  if (xDomain.type === ScaleType.Ordinal) {
    return null;
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
      const dataPoint = series.data.length > 0 ? series.data.at(-1) : undefined;
      return dataPoint ? valueAccessor(dataPoint) : null;
    default:
    case 'none':
      return null;
  }
}
