import { DeepNonNullable } from 'utility-types';

import { Fit, FitConfig } from './specs';
import { DataSeries, DataSeriesDatum } from './series';
import { datumXSortPredicate } from './stacked_series_utils';
import { ScaleType } from '../../../utils/scales/scales';

/**
 * Fit type that requires previous or next non-`null` value
 */
export type BoundingFit = Exclude<Fit, 'none' | 'explicit'>;
/**
 * `DataSeriesDatum` with non-`null` value for `x` and `y1`
 */
export type FullDataSeriesDatum = Omit<DataSeriesDatum, 'y1' | 'x'> &
  DeepNonNullable<Pick<DataSeriesDatum, 'y1' | 'x'>>;

function getValue(
  current: DataSeriesDatum,
  previous: FullDataSeriesDatum | null,
  next: FullDataSeriesDatum | null,
  type: BoundingFit,
): DataSeriesDatum {
  if (current.x === 5) debugger;
  if (previous !== null && type === Fit.Carry) {
    return {
      ...current,
      filled: {
        y1: previous.y1,
      },
    };
  } else if (next !== null && type === Fit.Lookahead) {
    return {
      ...current,
      filled: {
        y1: next.y1,
      },
    };
  } else if (previous !== null && next !== null) {
    if (type === Fit.Average) {
      return {
        ...current,
        filled: {
          y1: (previous.y1 + next.y1) / 2,
        },
      };
    } else if (
      current.x !== null &&
      typeof current.x === 'number' &&
      previous.x !== null &&
      typeof previous.x === 'number' &&
      next.x !== null &&
      typeof next.x === 'number'
    ) {
      const { y1, x: x1 } = previous;
      const { y1: y2, x: x2 } = next;

      if (type === Fit.Nearest) {
        const x1Delta = Math.abs(current.x - x1);
        const x2Delta = Math.abs(current.x - x2);
        return {
          ...current,
          filled: {
            y1: x1Delta > x2Delta ? y2 : y1,
          },
        };
      } else if (type === Fit.Linear) {
        return {
          ...current,
          filled: {
            // simple linear interpolation function
            y1: previous.y1 + (current.x - x1) * ((y2 - y1) / (x2 - x1)),
          },
        };
      }
    }
  }

  console.warn('No fit matched point');

  return current;
}

export function fitFunction(dataSeries: DataSeries, fit: FitConfig | null, xScaleType: ScaleType): DataSeries {
  const type = (fit !== null && (typeof fit === 'string' ? fit : fit.type)) || Fit.None;

  if (type === Fit.None) {
    return dataSeries;
  }

  const { data } = dataSeries;

  if (type === Fit.Zero) {
    return {
      ...dataSeries,
      data: data.map((datum) => ({
        ...datum,
        filled: {
          y1: datum.y1 === null ? 0 : undefined,
        },
      })),
    };
  }

  if (type === Fit.Explicit) {
    const value = typeof fit !== 'string' ? fit!.value : null;

    if (value === undefined) {
      console.warn('Using explicit fit function requires a value');
      return dataSeries;
    }

    if (value === null) {
      return dataSeries;
    }

    return {
      ...dataSeries,
      data: data.map((datum) => ({
        ...datum,
        filled: {
          y1: datum.y1 === null ? value : undefined,
        },
      })),
    };
  }

  const sortedData = data.slice().sort(datumXSortPredicate(xScaleType));
  const newData: DataSeriesDatum[] = [];
  let previousNonNullDatum: FullDataSeriesDatum | null = null;
  let nextNonNullDatum: FullDataSeriesDatum | null = null;

  for (let i = 0; i < sortedData.length; i++) {
    let j = i;
    const current = sortedData[i];
    if (i === 5) debugger;

    // Get next non-null value
    if (
      current.y1 === null &&
      nextNonNullDatum === null &&
      (type === Fit.Lookahead || type === Fit.Nearest || type === Fit.Average || type === Fit.Linear)
    ) {
      if (i === 5) debugger;
      // Forward lookahead to get next non-null value
      for (j = i + 1; j < sortedData.length; j++) {
        const value = sortedData[j];

        if (value.y1 !== null && value.x !== null) {
          nextNonNullDatum = value as FullDataSeriesDatum;
          break;
        }
      }
    }

    const newValue = current.y1 === null ? getValue(current, previousNonNullDatum, nextNonNullDatum, type) : current;
    newData[i] = newValue;

    if (current.y1 !== null && current.x !== null) {
      previousNonNullDatum = current as FullDataSeriesDatum;
    }
  }

  return {
    ...dataSeries,
    data: newData,
  };
}
