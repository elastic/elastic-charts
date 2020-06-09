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

import { sum } from 'd3-array';

import { ScaleContinuousType } from '../../../scales';
import { ScaleType } from '../../../scales/constants';
import { identity } from '../../../utils/commons';
import { computeContinuousDataDomain } from '../../../utils/domain';
import { GroupId, SpecId } from '../../../utils/ids';
import { isCompleteBound, isLowerBound, isUpperBound } from '../utils/axis_type_utils';
import { RawDataSeries } from '../utils/series';
import { BasicSeriesSpec, DomainRange, DEFAULT_GLOBAL_ID, SeriesTypes } from '../utils/specs';
import { YDomain } from './types';

export type YBasicSeriesSpec = Pick<
  BasicSeriesSpec,
  'id' | 'seriesType' | 'yScaleType' | 'groupId' | 'stackAccessors' | 'yScaleToDataExtent' | 'useDefaultGroupDomain'
> & { stackAsPercentage?: boolean; enableHistogramMode?: boolean };

interface GroupSpecs {
  isPercentageStack: boolean;
  stacked: YBasicSeriesSpec[];
  nonStacked: YBasicSeriesSpec[];
}

/** @internal */
export function mergeYDomain(
  dataSeries: Map<SpecId, RawDataSeries[]>,
  specs: YBasicSeriesSpec[],
  domainsByGroupId: Map<GroupId, DomainRange>,
): YDomain[] {
  // group specs by group ids
  const specsByGroupIds = splitSpecsByGroupId(specs);
  const specsByGroupIdsEntries = [...specsByGroupIds.entries()];
  const globalId = DEFAULT_GLOBAL_ID;

  const yDomains = specsByGroupIdsEntries.map<YDomain>(([groupId, groupSpecs]) => {
    const customDomain = domainsByGroupId.get(groupId);
    return mergeYDomainForGroup(dataSeries, groupId, groupSpecs, customDomain);
  });

  const globalGroupIds: Set<GroupId> = specs.reduce<Set<GroupId>>((acc, { groupId, useDefaultGroupDomain }) => {
    if (groupId !== globalId && useDefaultGroupDomain) {
      acc.add(groupId);
    }
    return acc;
  }, new Set());
  globalGroupIds.add(globalId);

  const globalYDomains = yDomains.filter((domain) => globalGroupIds.has(domain.groupId));
  let globalYDomain = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
  globalYDomains.forEach((domain) => {
    globalYDomain = [Math.min(globalYDomain[0], domain.domain[0]), Math.max(globalYDomain[1], domain.domain[1])];
  });
  return yDomains.map((domain) => {
    if (globalGroupIds.has(domain.groupId)) {
      return {
        ...domain,
        domain: globalYDomain,
      };
    }
    return domain;
  });
}

function mergeYDomainForGroup(
  dataSeries: Map<SpecId, RawDataSeries[]>,
  groupId: GroupId,
  groupSpecs: GroupSpecs,
  customDomain?: DomainRange,
): YDomain {
  const groupYScaleType = coerceYScaleTypes([...groupSpecs.stacked, ...groupSpecs.nonStacked]);
  const { isPercentageStack } = groupSpecs;

  let domain: number[];
  if (isPercentageStack) {
    domain = computeContinuousDataDomain([0, 1], identity, customDomain?.fit);
  } else {
    // compute stacked domain
    const isStackedScaleToExtent = groupSpecs.stacked.some(({ yScaleToDataExtent }) => yScaleToDataExtent);
    const stackedDataSeries = getDataSeriesOnGroup(dataSeries, groupSpecs.stacked);
    const stackedDomain = computeYStackedDomain(stackedDataSeries, isStackedScaleToExtent, customDomain?.fit);

    // compute non stacked domain
    const isNonStackedScaleToExtent = groupSpecs.nonStacked.some(({ yScaleToDataExtent }) => yScaleToDataExtent);
    const nonStackedDataSeries = getDataSeriesOnGroup(dataSeries, groupSpecs.nonStacked);
    const nonStackedDomain = computeYNonStackedDomain(
      nonStackedDataSeries,
      isNonStackedScaleToExtent,
      customDomain?.fit,
    );

    // merge stacked and non stacked domain together
    domain = computeContinuousDataDomain(
      [...stackedDomain, ...nonStackedDomain],
      identity,
      isStackedScaleToExtent || isNonStackedScaleToExtent,
      customDomain?.fit,
    );

    const [computedDomainMin, computedDomainMax] = domain;

    if (customDomain && isCompleteBound(customDomain)) {
      // Don't need to check min > max because this has been validated on axis domain merge
      domain = [customDomain.min, customDomain.max];
    } else if (customDomain && isLowerBound(customDomain)) {
      if (customDomain.min > computedDomainMax) {
        throw new Error(`custom yDomain for ${groupId} is invalid, custom min is greater than computed max`);
      }

      domain = [customDomain.min, computedDomainMax];
    } else if (customDomain && isUpperBound(customDomain)) {
      if (computedDomainMin > customDomain.max) {
        throw new Error(`custom yDomain for ${groupId} is invalid, computed min is greater than custom max`);
      }

      domain = [computedDomainMin, customDomain.max];
    }
  }
  return {
    type: 'yDomain',
    isBandScale: false,
    scaleType: groupYScaleType,
    groupId,
    domain,
  };
}

/** @internal */
export function getDataSeriesOnGroup(
  dataSeries: Map<SpecId, RawDataSeries[]>,
  specs: YBasicSeriesSpec[],
): RawDataSeries[] {
  return specs.reduce((acc, spec) => {
    const ds = dataSeries.get(spec.id) || [];
    return [...acc, ...ds];
  }, [] as RawDataSeries[]);
}

function computeYStackedDomain(
  dataseries: RawDataSeries[],
  scaleToExtent: boolean,
  fitToExtent: boolean = false,
): number[] {
  const stackMap = new Map<any, any[]>();
  dataseries.forEach((ds, index) => {
    ds.data.forEach((datum) => {
      const stack = stackMap.get(datum.x) || [];
      stack[index] = datum.y1;
      stackMap.set(datum.x, stack);
    });
  });
  const dataValues = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const stackValues of stackMap) {
    dataValues.push(...stackValues[1]);
    if (stackValues[1].length > 1) {
      dataValues.push(sum(stackValues[1]));
    }
  }
  if (dataValues.length === 0) {
    return [];
  }
  return computeContinuousDataDomain(dataValues, identity, scaleToExtent, fitToExtent);
}

function computeYNonStackedDomain(dataseries: RawDataSeries[], scaleToExtent: boolean, fitToExtent: boolean = false) {
  const yValues = new Set<any>();
  dataseries.forEach((ds) => {
    ds.data.forEach((datum) => {
      yValues.add(datum.y1);
      if (datum.y0 != null) {
        yValues.add(datum.y0);
      }
    });
  });
  if (yValues.size === 0) {
    return [];
  }
  return computeContinuousDataDomain([...yValues.values()], identity, scaleToExtent, fitToExtent);
}

/** @internal */
export function splitSpecsByGroupId(specs: YBasicSeriesSpec[]) {
  const specsByGroupIds = new Map<
    GroupId,
    { isPercentageStack: boolean; stacked: YBasicSeriesSpec[]; nonStacked: YBasicSeriesSpec[] }
  >();
  // After mobx->redux https://github.com/elastic/elastic-charts/pull/281 we keep the specs untouched on mount
  // in MobX version, the stackAccessors was programmatically added to every histogram specs
  // in ReduX version, we left untouched the specs, so we have to manually check that
  const isHistogramEnabled = specs.some(({ seriesType, enableHistogramMode }) => seriesType === SeriesTypes.Bar && enableHistogramMode);
  // split each specs by groupId and by stacked or not
  specs.forEach((spec) => {
    const group = specsByGroupIds.get(spec.groupId) || {
      isPercentageStack: false,
      stacked: [],
      nonStacked: [],
    };
    // stack every bars if using histogram mode
    // independenyly from lines and areas
    if (
      (spec.seriesType === SeriesTypes.Bar && isHistogramEnabled)
      || (spec.stackAccessors && spec.stackAccessors.length > 0)
    ) {
      group.stacked.push(spec);
    } else {
      group.nonStacked.push(spec);
    }
    if (spec.stackAsPercentage === true) {
      group.isPercentageStack = true;
    }
    specsByGroupIds.set(spec.groupId, group);
  });
  return specsByGroupIds;
}

/**
 * Coerce the scale types of a set of specification to a generic one.
 * If there is at least one bar series type, than the response will specity
 * that the coerced scale is a `scaleBand` (each point needs to have a surrounding empty
 * space to draw the bar width).
 * If there are multiple continuous scale types, is coerced to linear.
 * If there are at least one Ordinal scale type, is coerced to ordinal.
 * If none of the above, than coerce to the specified scale.
 * @returns {ChartScaleType}
 * @internal
 */
export function coerceYScaleTypes(specs: Pick<BasicSeriesSpec, 'yScaleType'>[]): ScaleContinuousType {
  const scaleTypes = new Set<ScaleContinuousType>();
  specs.forEach((spec) => {
    scaleTypes.add(spec.yScaleType);
  });
  return coerceYScale(scaleTypes);
}

function coerceYScale(scaleTypes: Set<ScaleContinuousType>): ScaleContinuousType {
  if (scaleTypes.size === 1) {
    const scales = scaleTypes.values();
    const { value } = scales.next();
    return value;
  }
  return ScaleType.Linear;
}
