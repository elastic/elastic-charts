/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values } from 'utility-types';

import { ScaleType } from '../../../../scales/constants';
import { XDomain } from '../../domains/types';
import { isDatumFilled } from '../../rendering/utils';
import { DataSeries, DataSeriesDatum } from '../../utils/series';

/** @internal */
export const LegendValue = Object.freeze({
  None: 'none' as const,
  LastValue: 'lastValue' as const,
  LastNonNullValue: 'lastNonNullValue' as const,
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
    case LegendValue.LastNonNullValue: {
      const last = series.data.findLast((d) => d.x === xDomain.dataDomain[1] && valueAccessor(d) !== null);
      return last ? valueAccessor(last) : null;
    }
    case LegendValue.LastValue:
      const last = series.data.findLast((d) => d.x === xDomain.dataDomain[1]);
      if (last && !isDatumFilled(last)) {
        return valueAccessor(last);
      }
      return null;
    default:
    case LegendValue.None:
      return null;
  }
}
