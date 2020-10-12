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

import { ScaleType } from '../../../scales/constants';
import { compareByValueAsc, identity } from '../../../utils/commons';
import { computeContinuousDataDomain, computeOrdinalDataDomain, Domain } from '../../../utils/domain';
import { Logger } from '../../../utils/logger';
import { isCompleteBound, isLowerBound, isUpperBound } from '../utils/axis_type_utils';
import { BasicSeriesSpec, DomainRange, SeriesTypes, XScaleType } from '../utils/specs';
import { XDomain } from './types';

/**
 * Merge X domain value between a set of chart specification.
 * @param specs an array of [{ seriesType, xScaleType }]
 * @param xValues a set of unique x values from all specs
 * @param customXDomain if specified, a custom xDomain
 * @returns a merged XDomain between all series.
 * @internal
 */
export function mergeXDomain(
  specs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType'>[],
  xValues: Set<string | number>,
  customXDomain?: DomainRange | Domain,
  fallbackScale?: XScaleType,
): XDomain {
  const mainXScaleType = convertXScaleTypes(specs);
  if (!mainXScaleType) {
    throw new Error(`Cannot merge the domain. Missing X scale types ${JSON.stringify(specs)}`);
  }

  const values = [...xValues.values()];
  let seriesXComputedDomains;
  let minInterval = 0;

  if (mainXScaleType.scaleType === ScaleType.Ordinal || fallbackScale === ScaleType.Ordinal) {
    if (mainXScaleType.scaleType !== ScaleType.Ordinal) {
      Logger.warn(
        `Each X value in a ${mainXScaleType.scaleType} x scale needs be be a number. Using ordinal x scale as fallback.`,
      );
    }

    seriesXComputedDomains = computeOrdinalDataDomain(values, identity, false, true);
    if (customXDomain) {
      if (Array.isArray(customXDomain)) {
        seriesXComputedDomains = customXDomain;
      } else {
        if (fallbackScale === ScaleType.Ordinal) {
          Logger.warn(`xDomain ignored for fallback ordinal scale. Options to resolve:

1) Correct data to match ${mainXScaleType.scaleType} scale type (see previous warning)
2) Change xScaleType to ordinal and set xDomain to Domain array`);
        } else {
          throw new TypeError('xDomain for ordinal scale should be an array of values, not a DomainRange object.');
        }
      }
    }
  } else {
    seriesXComputedDomains = computeContinuousDataDomain(values, identity, { fit: true });
    let customMinInterval: undefined | number;

    if (customXDomain) {
      if (Array.isArray(customXDomain)) {
        throw new TypeError('xDomain for continuous scale should be a DomainRange object, not an array');
      }

      customMinInterval = customXDomain.minInterval;
      const [computedDomainMin, computedDomainMax] = seriesXComputedDomains;

      if (isCompleteBound(customXDomain)) {
        if (customXDomain.min > customXDomain.max) {
          throw new Error('custom xDomain is invalid, min is greater than max');
        }

        seriesXComputedDomains = [customXDomain.min, customXDomain.max];
      } else if (isLowerBound(customXDomain)) {
        if (customXDomain.min > computedDomainMax) {
          throw new Error('custom xDomain is invalid, custom min is greater than computed max');
        }

        seriesXComputedDomains = [customXDomain.min, computedDomainMax];
      } else if (isUpperBound(customXDomain)) {
        if (computedDomainMin > customXDomain.max) {
          throw new Error('custom xDomain is invalid, computed min is greater than custom max');
        }

        seriesXComputedDomains = [computedDomainMin, customXDomain.max];
      }
    }
    const computedMinInterval = findMinInterval(values as number[]);
    if (customMinInterval != null) {
      // Allow greater custom min iff xValues has 1 member.
      if (xValues.size > 1 && customMinInterval > computedMinInterval) {
        throw new Error('custom xDomain is invalid, custom minInterval is greater than computed minInterval');
      }
      if (customMinInterval < 0) {
        throw new Error('custom xDomain is invalid, custom minInterval is less than 0');
      }
    }

    minInterval = customMinInterval || computedMinInterval;
  }

  return {
    type: 'xDomain',
    scaleType: fallbackScale ?? mainXScaleType.scaleType,
    isBandScale: mainXScaleType.isBandScale,
    domain: seriesXComputedDomains,
    minInterval,
    timeZone: mainXScaleType.timeZone,
  };
}

/**
 * Find the minimum interval between xValues.
 * Default to 0 if an empty array, 1 if one item array
 * @internal
 */
export function findMinInterval(xValues: number[]): number {
  const valuesLength = xValues.length;
  if (valuesLength <= 0) {
    return 0;
  }
  if (valuesLength === 1) {
    return 1;
  }
  const sortedValues = xValues.slice().sort(compareByValueAsc);
  let i;
  let minInterval = Math.abs(sortedValues[1] - sortedValues[0]);
  for (i = 1; i < valuesLength - 1; i++) {
    const current = sortedValues[i];
    const next = sortedValues[i + 1];
    const interval = Math.abs(next - current);
    minInterval = Math.min(minInterval, interval);
  }
  return minInterval;
}

/**
 * Convert the scale types of a set of specification to a generic one.
 * If there are at least one `ordinal` scale type, the resulting scale is coerched to ordinal.
 * If there are only `continuous` scale types, the resulting scale is coerched to linear.
 * If there are only `time` scales, we coerch the timeZone to `utc` only if we have multiple
 * different timezones.
 * @returns the coerched scale type, the timezone and a parameter that describe if its a bandScale or not
 * @internal
 */
export function convertXScaleTypes(
  specs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType' | 'timeZone'>[],
): {
  scaleType: XScaleType;
  isBandScale: boolean;
  timeZone?: string;
} | null {
  const seriesTypes = new Set<string>();
  const scaleTypes = new Set<ScaleType>();
  const timeZones = new Set<string>();
  specs.forEach((spec) => {
    seriesTypes.add(spec.seriesType);
    scaleTypes.add(spec.xScaleType);
    if (spec.timeZone) {
      timeZones.add(spec.timeZone.toLowerCase());
    }
  });
  if (specs.length === 0 || seriesTypes.size === 0 || scaleTypes.size === 0) {
    return null;
  }
  const isBandScale = seriesTypes.has(SeriesTypes.Bar);
  if (scaleTypes.size === 1) {
    const scaleType = scaleTypes.values().next().value;
    let timeZone: string | undefined;
    if (scaleType === ScaleType.Time) {
      if (timeZones.size > 1) {
        timeZone = 'utc';
      } else {
        timeZone = timeZones.values().next().value;
      }
    }
    return { scaleType, isBandScale, timeZone };
  }

  if (scaleTypes.size > 1 && scaleTypes.has(ScaleType.Ordinal)) {
    return { scaleType: ScaleType.Ordinal, isBandScale };
  }
  return { scaleType: ScaleType.Linear, isBandScale };
}
