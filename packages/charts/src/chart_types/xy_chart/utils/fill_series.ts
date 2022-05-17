/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DataSeries } from './series';
import { BasicSeriesSpec, isLineSeriesSpec, isAreaSeriesSpec } from './specs';

/**
 * @internal
 */
export function fillSeries(dataSeries: DataSeries[], xValues: Set<string | number>): DataSeries[] {
  const sortedXValues = [...xValues.values()];
  return dataSeries.map((series) => {
    const { spec, data, isStacked } = series;
    const xFillRequired = isXFillRequired(spec, isStacked);
    if (data.length === xValues.size || !xFillRequired) {
      return {
        ...series,
        data,
      };
    }
    const filledData: typeof data = [];
    const missingValues = new Set(xValues);
    for (let i = 0; i < data.length; i++) {
      const { x } = data[i];
      filledData.push(data[i]);
      missingValues.delete(x);
    }

    const missingValuesArray = [...missingValues.values()];
    for (let i = 0; i < missingValuesArray.length; i++) {
      const missingValue = missingValuesArray[i];
      const index = sortedXValues.indexOf(missingValue);

      filledData.splice(index, 0, {
        x: missingValue,
        y1: null,
        y0: null,
        initialY1: null,
        initialY0: null,
        mark: null,
        datum: undefined,
        filled: {
          x: missingValue,
        },
      });
    }
    return {
      ...series,
      data: filledData,
    };
  });
}

function isXFillRequired(spec: BasicSeriesSpec, isStacked: boolean): boolean {
  return (isAreaSeriesSpec(spec) || isLineSeriesSpec(spec)) && (isStacked || !!spec.fit);
}
