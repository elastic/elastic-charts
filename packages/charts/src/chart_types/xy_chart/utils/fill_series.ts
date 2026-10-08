/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { DataSeries } from './series';
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
  const isContinuous =
    groupScaleType === ScaleType.Linear ||
    groupScaleType === ScaleType.LinearBinary ||
    groupScaleType === ScaleType.Time;
  const xValuesByPosition = [...xValues];
  const xIndex = new Map(xValuesByPosition.map((x, position) => [x, position]));
  return dataSeries.map((series) => {
    const { spec, data, isStacked } = series;

    if (!isAreaSeriesSpec(spec) && !isLineSeriesSpec(spec)) return series;
    if (!spec.fit && isContinuous && !isStacked) return series;
    const gapEndsOnly = !spec.fit;
    const positions = data.map(({ x }) => xIndex.get(x)!).sort((a, b) => a - b);
    positions.push(xValues.size);
    const filledData = data.slice();
    let gapStart = 0;
    for (const position of positions) {
      for (let missing = gapStart; missing < position; missing++) {
        if (gapEndsOnly && missing > gapStart) missing = position - 1;
        const missingValue = xValuesByPosition[missing]!;
        filledData.push({
          x: missingValue,
          y1: null,
          y0: null,
          initialY0: null,
          initialY1: null,
          mark: null,
          datum: undefined,
          filled: {
            x: missingValue,
          },
        });
      }
      gapStart = position + 1;
    }

    return {
      ...series,
      data: filledData,
    };
  });
}
