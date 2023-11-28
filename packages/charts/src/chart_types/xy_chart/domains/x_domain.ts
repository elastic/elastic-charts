/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Optional } from 'utility-types';

import { XDomain } from './types';
import { ScaleType } from '../../../scales/constants';
import { compareByValueAsc } from '../../../utils/common';
import { computeContinuousDataDomain, computeOrdinalDataDomain } from '../../../utils/domain';
import { Logger } from '../../../utils/logger';
import { getZoneFromSpecs, getValidatedTimeZone } from '../../../utils/time_zone';
import { getXNiceFromSpec, getXScaleTypeFromSpec } from '../scales/get_api_scales';
import { ScaleConfigs } from '../state/selectors/get_api_scale_configs';
import { BasicSeriesSpec, SeriesType, XScaleType } from '../utils/specs';

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
  let seriesXComputedDomains;
  let minInterval = 0;

  if (type === ScaleType.Ordinal || fallbackScale === ScaleType.Ordinal) {
    if (type !== ScaleType.Ordinal) {
      Logger.warn(`Each X value in a ${type} x scale needs be be a number. Using ordinal x scale as fallback.`);
    }

    seriesXComputedDomains = computeOrdinalDataDomain([...xValues], false, true, locale);
    if (customDomain) {
      if (Array.isArray(customDomain)) {
        seriesXComputedDomains = [...customDomain];
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
    seriesXComputedDomains = computeContinuousDataDomain([...xValues] as number[], type, domainOptions);
    let customMinInterval: undefined | number;

    if (customDomain) {
      if (Array.isArray(customDomain)) {
        Logger.warn('xDomain for continuous scale should be a DomainRange object, not an array');
      } else {
        customMinInterval = customDomain.minInterval;
        const [computedDomainMin, computedDomainMax] = seriesXComputedDomains;

        if (Number.isFinite(customDomain.min) && Number.isFinite(customDomain.max)) {
          if (customDomain.min > customDomain.max) {
            Logger.warn('Custom xDomain is invalid: min is greater than max. Custom domain is ignored.');
          } else {
            seriesXComputedDomains = [customDomain.min, customDomain.max];
          }
        } else if (Number.isFinite(customDomain.min)) {
          if (customDomain.min > computedDomainMax) {
            Logger.warn(
              'Custom xDomain is invalid: custom min is greater than computed max. Custom domain is ignored.',
            );
          } else {
            seriesXComputedDomains = [customDomain.min, computedDomainMax];
          }
        } else if (Number.isFinite(customDomain.max)) {
          if (computedDomainMin > customDomain.max) {
            Logger.warn(
              'Custom xDomain is invalid: computed min is greater than custom max. Custom domain is ignored.',
            );
          } else {
            seriesXComputedDomains = [computedDomainMin, customDomain.max];
          }
        }
      }
    }
    const computedMinInterval = findMinInterval([...xValues.values()] as number[]);
    minInterval = getMinInterval(computedMinInterval, xValues.size, customMinInterval);
  }

  return {
    type: fallbackScale ?? type,
    nice,
    isBandScale,
    domain: seriesXComputedDomains,
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
 * Find the minimum interval between xValues.
 * Default to 0 if an empty array, 1 if one item array
 * @internal
 */
export function findMinInterval(xValues: number[]): number {
  return xValues.length < 2
    ? xValues.length
    : [...xValues].sort(compareByValueAsc).reduce((minInterval, current, i, sortedValues) => {
        return i < xValues.length - 1
          ? Math.min(minInterval, Math.abs((sortedValues[i + 1] ?? 0) - current))
          : minInterval;
      }, Infinity);
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
      ? scaleTypes.values().next().value // pick the only scaleType present
      : scaleTypes.has(ScaleType.Ordinal)
        ? ScaleType.Ordinal
        : ScaleType.Linear; // if Ordinal is not present, coerce to Linear, whether it's present or not
  const nice = !niceDomains.includes(false);
  const isBandScale = seriesTypes.has(SeriesType.Bar);
  return { type, nice, isBandScale, timeZone };
}
