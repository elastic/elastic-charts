/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { stack as D3Stack, stackOffsetExpand as D3StackOffsetExpand, stackOffsetNone as D3StackOffsetNone, stackOrderNone } from 'd3-shape';

import { SeriesKey } from '../../../commons/series_id';
import { ScaleType } from '../../../scales/constants';
import { DataSeries, DataSeriesDatum } from './series';

/** @internal */
export interface StackedValues {
  values: number[];
  percent: Array<number>;
  total: number;
}

/** @internal */
export const datumXSortPredicate = (xScaleType: ScaleType, sortedXValues?: (string | number)[]) => (a: {x: number| string}, b: {x: number| string}) => {
  if (xScaleType === ScaleType.Ordinal || typeof a.x === 'string' || typeof b.x === 'string') {
    return sortedXValues ? sortedXValues.indexOf(a.x) - sortedXValues.indexOf(b.x) : 0;
  }
  return a.x - b.x;
};

/** @internal */
export function formatStackedDataSeriesValues(
  dataSeries: DataSeries[],
  isPercentageMode: boolean,
  xValues: Set<string | number>,
): DataSeries[] {
  const dataSeriesKeys = dataSeries.reduce<Record<SeriesKey, DataSeries>>((acc, curr) => {
    acc[curr.key] = curr;
    return acc;
  }, {});

  const xValuesArray = [...xValues];
  const reorderedArray: Array<Record<SeriesKey, string| number| null>> = [];
  const xValueMap: Map<SeriesKey, Map<string|number, DataSeriesDatum>> = new Map();
  dataSeries.forEach(({ data, key }) => {
    const dsMap: Map<string|number, DataSeriesDatum> = new Map();
    data.forEach((d) => {
      const { x, y0, y1 } = d;
      const xIndex = xValuesArray.indexOf(x);

      if (reorderedArray[xIndex] === undefined) {
        reorderedArray[xIndex] = { x };
      }
      reorderedArray[xIndex][`${key}-y0`] = y0;
      reorderedArray[xIndex][`${key}-y1`] = (y1 ?? 0) - (y0 ?? 0);
      dsMap.set(x, d);
    });
    xValueMap.set(key, dsMap);
  });

  const stackOffset = isPercentageMode ? D3StackOffsetExpand : D3StackOffsetNone;

  const y1Stack = D3Stack<Record<SeriesKey, string| number| null>>()
    .keys(Object.keys(dataSeriesKeys).reduce<string[]>((acc, key) => ([...acc, `${key}-y0`, `${key}-y1`]), []))
    .order(stackOrderNone)
    .offset(stackOffset)(reorderedArray);

  const unionYStacks = y1Stack.reduce<Record<SeriesKey, {y0: any, y1: any}>>((acc, d) => {
    const key = d.key.slice(0, -3);
    const accessor = d.key.slice(-2);
    if (accessor !== 'y1' && accessor !== 'y0') {
      return acc;
    }
    if (!acc[key]) {
      acc[key] = {
        y0: [],
        y1: [],
      };
    }
    acc[key][accessor] = d.map((da) => da);
    return acc;
  }, {});

  return Object.keys(unionYStacks).map((stackedDataSeriesKey) => {
    const dataSeriesProps = dataSeriesKeys[stackedDataSeriesKey];
    const dsMap = xValueMap.get(stackedDataSeriesKey);
    const { y0, y1 } = unionYStacks[stackedDataSeriesKey];

    const data = y1.map((value: any, index: number) => {
      const originalData = dsMap?.get(value.data.x!);
      const [,y0Value] = y0[index];
      return {
        x: value.data.x!,
        y1: value[1],
        y0: y0Value,
        initialY0: originalData ? originalData.initialY0 : null,
        initialY1: originalData ? originalData.initialY1 : null,
        mark: originalData ? originalData.mark : null,
        datum: originalData ? originalData.datum : null,
        filled: originalData ? originalData.filled : undefined,
      };
    });
    return {
      ...dataSeriesProps,
      data,
    };
  });
}
