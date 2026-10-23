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
 *
 * The x values of a downsampled series arrive in one of two ways:
 * - no series of the chart is stacked or has a fit: `xValues` holds those of its summary rows, which include its
 *   first and last, and `rawXValues` has a list of all of them
 * - some series is stacked or has a fit: those series get gaps at every x value of the chart, so `xValues` holds all
 *   of them, and `rawXValues` has no list for it
 *
 * @param xScaleConfig the x scale configuration of the specs and settings
 * @param xValues the distinct x values of the data rows of every series:
 * - non-downsampled series: all its x values
 * - downsampled series: those of its summary rows, or all its x values, as above
 * @param locale unused: ordinal x values keep the order of `xValues`
 * @param fallbackScale default ordinal scale for when the x values of a continuous scale aren't all numbers
 * @param rawXValues the x values of all the rows of a series, sorted, one list per series:
 * - non-downsampled series: not represented, as `xValues` holds all its x values
 * - downsampled series: represented, unless `xValues` holds all its x values, as above
 * @param rawXValuesHoldAll whether `rawXValues` hold every x value of `xValues`, which then only adds those of the
 * summary rows of downsampled series
 * @internal
 */
export function mergeXDomain(
  xScaleConfig: ScaleConfigs['x'],
  xValues: Set<string | number>,
  locale: string,
  fallbackScale?: XScaleType,
  rawXValues: Float64Array[] = [],
  rawXValuesHoldAll = false,
): XDomain {
  const { type, nice, isBandScale, timeZone, desiredTickCount, customDomain } = xScaleConfig;
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
    const computedMinInterval = findMinInterval(
      rawXValuesHoldAll ? rawXValues : [Float64Array.from(xValues as Set<number>).sort(), ...rawXValues],
    );
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
 * distinct values.
 * @internal
 */
export function findMinInterval(sortedArrays: Float64Array[]): number {
  if (sortedArrays.length === 0) return 1;
  const values = sortedUnionOf(sortedArrays);
  let minInterval = Infinity;
  for (let i = 1; i < values.length; i++) {
    const step = values[i]! - values[i - 1]!;
    if (step > 0 && step < minInterval) minInterval = step;
  }
  return Number.isFinite(minInterval) ? minInterval : 1;
}

/**
 * The distinct, sorted values of one or more sorted arrays. Hierarchical aggregation helps with cases where each series
 * covers part of the full domain, but their union covers the entire domain, as each pairwise union uses shorter arrays.
 */
function sortedUnionOf(arrays: Float64Array[]): Float64Array {
  if (arrays.length === 1) return arrays[0]!;
  const mid = Math.floor(arrays.length / 2);
  return sortedUnion(sortedUnionOf(arrays.slice(0, mid)), sortedUnionOf(arrays.slice(mid)));
}

/** The distinct values of two sorted arrays, sorted */
function sortedUnion(a: Float64Array, b: Float64Array): Float64Array {
  const union = new Float64Array(a.length + b.length);
  let i = 0; // the index of the next value of a
  let j = 0; // the index of the next value of b
  let n = 0; // the count of distinct values so far
  while (i < a.length || j < b.length) {
    const value = j >= b.length || (i < a.length && a[i]! <= b[j]!) ? a[i++]! : b[j++]!;
    if (n === 0 || value !== union[n - 1]) union[n++] = value;
  }
  return union.subarray(0, n);
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
