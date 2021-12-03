/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  stack as D3Stack,
  stackOffsetDiverging as D3StackOffsetDiverging,
  stackOffsetExpand as D3StackOffsetExpand,
  stackOffsetNone as D3StackOffsetNone,
  stackOffsetSilhouette as D3StackOffsetSilhouette,
  stackOffsetWiggle as D3StackOffsetWiggle,
  stackOrderInsideOut,
  stackOrderNone,
  SeriesPoint,
  Series,
} from 'd3-shape';

import { SeriesKey } from '../../../common/series_id';
import { ScaleType } from '../../../scales/constants';
import { clamp } from '../../../utils/common';
import { DataSeries, DataSeriesDatum } from './series';
import { StackMode } from './specs';

/** @internal */
export interface StackedValues {
  values: number[];
  percent: Array<number>;
  total: number;
}

/** @internal */
export const datumXSortPredicate = (xScaleType: ScaleType, sortedXValues?: (string | number)[]) => (
  a: { x: number | string },
  b: { x: number | string },
) => {
  if (xScaleType === ScaleType.Ordinal || typeof a.x === 'string' || typeof b.x === 'string') {
    return sortedXValues ? sortedXValues.indexOf(a.x) - sortedXValues.indexOf(b.x) : 0;
  }
  return a.x - b.x;
};

/** @internal */
export function formatStackedDataSeriesValues(
  dataSeries: DataSeries[],
  xValues: Set<string | number>,
  stackMode?: StackMode,
): DataSeries[] {
  const dataSeriesKeys = dataSeries.reduce<Record<SeriesKey, DataSeries>>((acc, curr) => {
    acc[curr.key] = curr;
    return acc;
  }, {});

  // group data series by x values
  const xMap: Map<string | number, Map<SeriesKey, DataSeriesDatum>> = new Map();
  [...xValues].forEach((xValue) => {
    const seriesMap = new Map<SeriesKey, DataSeriesDatum>();
    dataSeries.forEach(({ key, data }) => {
      const datum = data.find(({ x }) => x === xValue);

      if (!datum) return;

      // console.log(datum);

      seriesMap.set(`${key}-y0`, datum);
      seriesMap.set(key, datum);
    });
    xMap.set(xValue, seriesMap);
  });

  const keys = Object.keys(dataSeriesKeys).reduce<string[]>((acc, key) => [...acc, `${key}-y0`, key], []);
  const stackOffset = getOffsetBasedOnStackMode(stackMode);

  function diverging(series, order) {
    if (!((n = series.length) > 0)) return;
    for (var i, j = 0, y, d, dy, yp, yn = 0, n, s0, s1 = series[order[0]], m = s1.length; j < m; ++j) {
      (s0 = s1), (s1 = series[order[j]]);
      // sum negative values per x before to maintain original sort for negative values
      for (yn = 0, y = 0, i = 0; i < n; ++i) {
        // const d = s1[j];
        const d = series[order[i]][j];
        y += Math.abs(d[1]) || 0;
        yn += (dy = d[1] - d[0]) < 0 ? dy : 0;
      }

      // s0[j][1] += s0[j][0] = -y / 2;

      // console.log(y);

      for (yp = 0, i = 0; i < n; ++i) {
        if ((dy = (d = series[order[i]][j])[1] - d[0]) > 0) {
          (d[0] = yp), (d[1] = yp += dy);
        } else if (dy < 0) {
          (d[1] = yn), (d[0] = yn -= dy);
        } else {
          (d[0] = 0), (d[1] = dy);
        }
      }
    }
  }

  const stack = D3Stack<[string | number, Map<SeriesKey, DataSeriesDatum>]>()
    .keys(keys)
    .value(([, indexMap], key) => {
      const datum = indexMap.get(key);
      return (datum ? (key.endsWith('-y0') ? datum.y0 : datum.y1) : null) ?? NaN;
    })
    .order(stackOrderNone)
    .offset(diverging)(xMap)
    // .offset(D3StackOffsetDiverging)(xMap)
    .filter(({ key }) => !key.endsWith('-y0'));

  const test = stack.map((stackedSeries) => {
    const dataSeriesProps = dataSeriesKeys[stackedSeries.key];
    const data = stackedSeries
      .map<DataSeriesDatum | null>((row) => {
        const d = row.data[1].get(stackedSeries.key);
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
      .filter((d) => d !== null) as DataSeriesDatum[];
    return {
      ...dataSeriesProps,
      data,
    };
  });

  return test;
}

function clampIfStackedAsPercentage(value: number, stackMode?: StackMode) {
  return stackMode === StackMode.Percentage ? clamp(value, 0, 1) : value;
}

function getOffsetBasedOnStackMode(stackMode?: StackMode) {
  switch (stackMode) {
    case StackMode.Percentage:
      return D3StackOffsetExpand;
    case StackMode.Silhouette:
      return D3StackOffsetSilhouette;
    case StackMode.Wiggle:
      return D3StackOffsetWiggle;
    default:
      return D3StackOffsetNone;
  }
}
