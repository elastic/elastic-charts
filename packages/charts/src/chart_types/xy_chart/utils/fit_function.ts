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

import { DeepNonNullable } from 'utility-types';

import { ScaleType } from '../../../scales/constants';
import { DataSeriesDatum } from './series';
import { Fit, FitConfig } from './specs';
import { datumXSortPredicate } from './stacked_series_utils';

/**
 * Fit type that requires previous and/or next `non-nullable` values
 *
 */
type BoundingFit = Exclude<Fit, 'none' | 'explicit'>;

/**
 * `DataSeriesDatum` with non-`null` value for `x` and `y1`
 * @internal
 */
export type FullDataSeriesDatum = Omit<DataSeriesDatum, 'y1' | 'x'> &
  DeepNonNullable<Pick<DataSeriesDatum, 'y1' | 'x'>>;

/**
 * Embellishes `FullDataSeriesDatum` with `fittingIndex` for ordinal scales
 * @internal
 */
export type WithIndex<T> = T & { fittingIndex: number };

/**
 * Returns `[x, y1]` values for a given datum with `fittingIndex`
 *
 */
const getXYValues = ({ x, y1, fittingIndex }: WithIndex<FullDataSeriesDatum>): [number, number] => [
  typeof x === 'string' ? fittingIndex : x,
  y1,
];

/** @internal */
export const getValue = (
  current: DataSeriesDatum,
  currentIndex: number,
  previous: WithIndex<FullDataSeriesDatum> | null,
  next: WithIndex<FullDataSeriesDatum> | null,
  type: BoundingFit,
  endValue?: number | 'nearest',
): DataSeriesDatum => {
  if (previous !== null && type === Fit.Carry) {
    const { y1 } = previous;
    return {
      ...current,
      y1,
      metadata: {
        ...current.metadata,
        y1: {
          ...current.metadata.y1,
          isFilled: true,
        },
      },
    };
  }
  if (next !== null && type === Fit.Lookahead) {
    const { y1 } = next;
    return {
      ...current,
      y1,
      metadata: {
        ...current.metadata,
        y1: {
          ...current.metadata.y1,
          isFilled: true,
        },
      },
    };
  }
  if (previous !== null && next !== null) {
    if (type === Fit.Average) {
      const y1 = (previous.y1 + next.y1) / 2;
      return {
        ...current,
        y1,
        metadata: {
          ...current.metadata,
          y1: {
            ...current.metadata.y1,
            isFilled: true,
          },
        },
      };
    }
    if (current.x !== null && previous.x !== null && next.x !== null) {
      const [x1, y1] = getXYValues(previous);
      const [x2, y2] = getXYValues(next);
      const currentX = typeof current.x === 'string' ? currentIndex : current.x;

      if (type === Fit.Nearest) {
        const x1Delta = Math.abs(currentX - x1);
        const x2Delta = Math.abs(currentX - x2);
        const y1Delta = x1Delta > x2Delta ? y2 : y1;
        return {
          ...current,
          y1: y1Delta,
          metadata: {
            ...current.metadata,
            y1: {
              ...current.metadata.y1,
              isFilled: true,
            },
          },
        };
      }
      if (type === Fit.Linear) {
        // simple linear interpolation function
        const linearInterpolatedY1 = previous.y1 + (currentX - x1) * ((y2 - y1) / (x2 - x1));
        return {
          ...current,
          y1: linearInterpolatedY1,
          metadata: {
            ...current.metadata,
            y1: {
              ...current.metadata.y1,
              isFilled: true,
            },
          },
        };
      }
    }
  } else if ((previous !== null || next !== null) && (type === Fit.Nearest || endValue === 'nearest')) {
    const nearestY1 = previous !== null ? previous.y1 : next!.y1;
    return {
      ...current,
      y1: nearestY1,
      metadata: {
        ...current.metadata,
        y1: {
          ...current.metadata.y1,
          isFilled: true,
        },
      },
    };
  }

  if (endValue === undefined || typeof endValue === 'string') {
    return current;
  }

  // No matching fit - should only fall here on end conditions
  return {
    ...current,
    y1: endValue,
    metadata: {
      ...current.metadata,
      y1: {
        ...current.metadata.y1,
        isFilled: true,
      },
    },
  };
};

/** @internal */
export const parseConfig = (config?: Exclude<Fit, 'explicit'> | FitConfig): FitConfig => {
  if (!config) {
    return {
      type: Fit.None,
    };
  }

  if (typeof config === 'string') {
    return {
      type: config,
    };
  }

  if (config.type === Fit.Explicit && config.value === undefined) {
    // Using explicit fit function requires a value
    return {
      type: Fit.None,
    };
  }

  return {
    type: config.type,
    value: config.type === Fit.Explicit ? config.value : undefined,
    endValue: config.endValue,
  };
};

/** @internal */
export const fitFunction = (
  data: DataSeriesDatum[],
  fitConfig: Exclude<Fit, 'explicit'> | FitConfig,
  xScaleType: ScaleType,
  sorted = false,
): DataSeriesDatum[] => {
  const { type, value, endValue } = parseConfig(fitConfig);

  if (type === Fit.None) {
    return data;
  }

  if (type === Fit.Zero || type === Fit.Explicit) {
    const valueToFill = type === Fit.Zero ? 0 : value;
    if (valueToFill === undefined) {
      return data;
    }
    return data.map((datum) => {
      const toFill = datum.metadata.y1.isNil || isNaN(datum.metadata.y1.validated);

      return {
        ...datum,
        y1: toFill ? valueToFill : datum.y1,
        metadata: {
          ...datum.metadata,
          y1: {
            ...datum.metadata.y1,
            isFilled: toFill,
          },
        },
      };
    });
  }

  const sortedData =
    sorted || xScaleType === ScaleType.Ordinal ? data : data.slice().sort(datumXSortPredicate(xScaleType));
  const newData: DataSeriesDatum[] = [];
  let previousNonNullDatum: WithIndex<FullDataSeriesDatum> | null = null;
  let nextNonNullDatum: WithIndex<FullDataSeriesDatum> | null = null;

  for (let i = 0; i < sortedData.length; i++) {
    let j = i;
    const currentValue = sortedData[i];
    const isCurrentValueNaN = isNaN(currentValue.y1);

    if (
      isCurrentValueNaN &&
      nextNonNullDatum === null &&
      (type === Fit.Lookahead ||
        type === Fit.Nearest ||
        type === Fit.Average ||
        type === Fit.Linear ||
        endValue === 'nearest')
    ) {
      // Forward lookahead to get next non-null value
      for (j = i + 1; j < sortedData.length; j++) {
        const nextValue = sortedData[j];

        if (!isNaN(nextValue.y1) && nextValue.x !== null) {
          nextNonNullDatum = {
            ...(nextValue as FullDataSeriesDatum),
            fittingIndex: j,
          };
          break;
        }
      }
    }

    newData[i] = isCurrentValueNaN
      ? getValue(currentValue, i, previousNonNullDatum, nextNonNullDatum, type, endValue)
      : currentValue;

    if (!isCurrentValueNaN) {
      previousNonNullDatum = {
        ...(currentValue as FullDataSeriesDatum),
        fittingIndex: i,
      };
    }

    if (nextNonNullDatum !== null && nextNonNullDatum.x <= currentValue.x) {
      nextNonNullDatum = null;
    }
  }

  return newData;
};
