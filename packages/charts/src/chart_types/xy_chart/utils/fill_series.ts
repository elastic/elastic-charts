/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { DataSeries } from './series';
import type { BasicSeriesSpec } from './specs';
import { isLineSeriesSpec, isAreaSeriesSpec } from './specs';
import { ScaleType } from '../../../scales/constants';

/**
 * @internal
 */
export function fillSeries(
  dataSeries: DataSeries[],
  xValues: Set<string | number>,
  groupScaleType: ScaleType,
): DataSeries[] {
  const sortedXValues = [...xValues.values()];
  return dataSeries.map((series) => {
    const { spec, data, isStacked } = series;

    const noFillRequired = isXFillNotRequired(spec, groupScaleType, isStacked);
    if (data.length === xValues.size || noFillRequired) {
      return series;
    }
    const filledData: typeof data = [];
    const missingValues = new Set(xValues);

    data.forEach((datum) => {
      filledData.push(datum);
      missingValues.delete(datum.x);
    });

    const missingValuesArray = [...missingValues.values()];

    missingValuesArray.forEach((missingValue) => {
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
    });

    return {
      ...series,
      data: filledData,
    };
  });
}

function isXFillNotRequired(spec: BasicSeriesSpec, groupScaleType: ScaleType, isStacked: boolean) {
  const onlyNoFitAreaLine = (isAreaSeriesSpec(spec) || isLineSeriesSpec(spec)) && !spec.fit;
  const onlyContinuous =
    groupScaleType === ScaleType.Linear ||
    groupScaleType === ScaleType.LinearBinary ||
    groupScaleType === ScaleType.Time;
  return onlyNoFitAreaLine && onlyContinuous && !isStacked;
}
