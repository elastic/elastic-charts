/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Optional } from 'utility-types';

import type { XDomain } from './types';
import { ScaleType } from '../../../scales/constants';
import { computeContinuousDataDomain, computeOrdinalDataDomain } from '../../../utils/domain';
import { Logger } from '../../../utils/logger';
import { getZoneFromSpecs, getValidatedTimeZone } from '../../../utils/time_zone';
import { getXNiceFromSpec, getXScaleTypeFromSpec } from '../scales/get_api_scales';
import type { ScaleConfigs } from '../state/selectors/get_api_scale_configs';
import type { BasicSeriesSpec, XScaleType } from '../utils/specs';
import { SeriesType } from '../utils/specs';

/**
 * Merge X domain value between a set of chart specification.
 * @internal
 */
export function mergeXDomain(
  { type, nice, isBandScale, timeZone, desiredTickCount, customDomain }: ScaleConfigs['x'],
  xValues: Set<string | number>,
  locale: string,
  fallbackScale?: XScaleType,
): XDomain {
  let domain;
  let dataDomain;
  let minInterval = 0;

  if (type === ScaleType.Ordinal || fallbackScale === ScaleType.Ordinal) {
    if (type !== ScaleType.Ordinal) {
      Logger.warn(`Each X value in a ${type} x scale needs be be a number. Using ordinal x scale as fallback.`);
    }

    dataDomain = computeOrdinalDataDomain([...xValues], false, true, locale);
    domain = dataDomain;
    if (customDomain) {
      if (Array.isArray(customDomain)) {
        domain = [...customDomain];
      } else {
        if (fallbackScale === ScaleType.Ordinal) {
          Logger.warn(`xDomain ignored for fallback ordinal scale. Options to resolve:
1) Correct data to match ${type} scale type (see previous warning)
2) Change xScaleType to ordinal and set xDomain to Domain array`);
        } else {
          Logger.warn(
            'xDomain for ordinal scale should be an array of values, not a DomainRange object. xDomain is ignored.',
          );
        }
      }
    }
  } else {
    const domainOptions = { min: NaN, max: NaN, fit: true };
    dataDomain = computeContinuousDataDomain([...xValues] as number[], type, domainOptions);
    domain = dataDomain;
    let customMinInterval: undefined | number;

    if (customDomain) {
      if (Array.isArray(customDomain)) {
        Logger.warn('xDomain for continuous scale should be a DomainRange object, not an array');
      } else {
        customMinInterval = customDomain.minInterval;
        const [computedDomainMin, computedDomainMax] = domain;

        if (Number.isFinite(customDomain.min) && Number.isFinite(customDomain.max)) {
          if (customDomain.min > customDomain.max) {
            Logger.warn('Custom xDomain is invalid: min is greater than max. Custom domain is ignored.');
          } else {
            domain = [customDomain.min, customDomain.max];
          }
        } else if (Number.isFinite(customDomain.min)) {
          if (customDomain.min > computedDomainMax) {
            Logger.warn(
              'Custom xDomain is invalid: custom min is greater than computed max. Custom domain is ignored.',
            );
          } else {
            domain = [customDomain.min, computedDomainMax];
          }
        } else if (Number.isFinite(customDomain.max)) {
          if (computedDomainMin > customDomain.max) {
            Logger.warn(
              'Custom xDomain is invalid: computed min is greater than custom max. Custom domain is ignored.',
            );
          } else {
            domain = [computedDomainMin, customDomain.max];
          }
        }
      }
    }
    const computedMinInterval = findMinInterval([Float64Array.from(xValues as Set<number>).sort()]);
    minInterval = getMinInterval(computedMinInterval, xValues.size, customMinInterval);
  }

  return {
    type: fallbackScale ?? type,
    nice,
    isBandScale,
    domain,
    dataDomain,
    minInterval,
    timeZone: getValidatedTimeZone(timeZone),
    logBase: customDomain && 'logBase' in customDomain ? customDomain.logBase : 10, // fixme preexisting TS workaround
    desiredTickCount,
  };
}

function getMinInterval(computedMinInterval: number, size: number, customMinInterval?: number): number {
  if (customMinInterval === undefined) {
    return computedMinInterval;
  }
  // Allow greater custom min if xValues has 1 member.
  if (size > 1 && customMinInterval > computedMinInterval) {
    Logger.warn(
      'Custom xDomain is invalid: custom minInterval is greater than computed minInterval. Using computed minInterval.',
    );
    return computedMinInterval;
  }
  if (customMinInterval < 0) {
    Logger.warn('Custom xDomain is invalid: custom minInterval is less than 0. Using computed minInterval.');
    return computedMinInterval;
  }

  return customMinInterval;
}

/**
 * The smallest gap between the distinct values of sorted arrays, as if merged into one, or 1 with fewer than two
 * distinct values. An array equal to an earlier one, like the x values of aligned series, adds nothing.
 * @internal
 */
export function findMinInterval(sortedArrays: Float64Array[]): number {
  // dedupe: eliminate arrays that have the same content as a previous array
  const arrays = sortedArrays.filter(
    (array, i) => sortedArrays.findIndex((other) => haveSameValues(other, array)) === i,
  );

  // a single array needs no merge: the smallest step between its consecutive distinct values
  if (arrays.length === 1) {
    const [array] = arrays as [Float64Array];
    let minInterval = Infinity;
    for (let i = 1; i < array.length; i++) {
      const step = array[i]! - array[i - 1]!;
      if (step > 0 && step < minInterval) minInterval = step;
    }
    return Number.isFinite(minInterval) ? minInterval : 1;
  }

  // multi-array merge-reduce to find the minimum interval across the sorted arrays
  const heads = arrays.map(() => 0); // the index of the next value of each array
  let previous = NaN; // the latest value taken
  let minInterval = Infinity;
  while (true) {
    // the array whose next value is the smallest
    let next = -1;
    for (let a = 0; a < arrays.length; a++) {
      const candidate = arrays[a]![heads[a]!]; // undefined once the array is used up
      if (candidate !== undefined && (next < 0 || candidate < arrays[next]![heads[next]!]!)) next = a;
    }
    if (next < 0) break;
    const value = arrays[next]![heads[next]!]!;
    heads[next] = heads[next]! + 1;
    if (value > previous) minInterval = Math.min(minInterval, value - previous);
    previous = value;
  }
  return Number.isFinite(minInterval) ? minInterval : 1;
}

function haveSameValues(a: Float64Array, b: Float64Array) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/**
 * Convert the scale types of a set of specification to a generic one.
 * If there are at least one `ordinal` scale type, the resulting scale is coerced to ordinal.
 * If there are only `continuous` scale types, the resulting scale is coerced to linear.
 * If there are only `time` scales, we coerce the timeZone to `local` only if we have multiple
 * different timezones.
 * @returns the coerced scale type, the timezone and a parameter that describe if its a bandScale or not
 * @internal
 */
export function convertXScaleTypes(
  specs: Optional<Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType' | 'xNice' | 'timeZone'>, 'seriesType'>[],
): {
  type: XScaleType;
  nice: boolean;
  isBandScale: boolean;
  timeZone: string;
} {
  const seriesTypes = new Set<string | undefined>(specs.map((s) => s.seriesType));
  const scaleTypes = new Set(specs.map((s) => getXScaleTypeFromSpec(s.xScaleType)));
  const niceDomains = specs.map((s) => getXNiceFromSpec(s.xNice));
  const timeZone = getZoneFromSpecs(specs);
  const type =
    scaleTypes.size === 1
      ? // TODO fix this non-null assertion
        scaleTypes.values().next().value! // pick the only scaleType present
      : scaleTypes.has(ScaleType.Ordinal)
        ? ScaleType.Ordinal
        : ScaleType.Linear; // if Ordinal is not present, coerce to Linear, whether it's present or not
  const nice = !niceDomains.includes(false);
  const isBandScale = seriesTypes.has(SeriesType.Bar);
  return { type, nice, isBandScale, timeZone };
}
