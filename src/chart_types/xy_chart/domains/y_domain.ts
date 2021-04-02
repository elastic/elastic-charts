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

import { ScaleContinuousType } from '../../../scales';
import { ScaleType } from '../../../scales/constants';
import { identity } from '../../../utils/common';
import { computeContinuousDataDomain, ContinuousDomain } from '../../../utils/domain';
import { GroupId } from '../../../utils/ids';
import { Logger } from '../../../utils/logger';
import { getSpecDomainGroupId } from '../state/utils/spec';
import { isCompleteBound, isLowerBound, isUpperBound } from '../utils/axis_type_utils';
import { groupBy } from '../utils/group_data_series';
import { DataSeries } from '../utils/series';
import { BasicSeriesSpec, YDomainRange, SeriesType, StackMode } from '../utils/specs';
import { YDomain } from './types';

export type YBasicSeriesSpec = Pick<
  BasicSeriesSpec,
  'id' | 'seriesType' | 'yScaleType' | 'groupId' | 'stackAccessors' | 'yScaleToDataExtent' | 'useDefaultGroupDomain'
> & { stackMode?: StackMode; enableHistogramMode?: boolean };

/** @internal */
export function mergeYDomain(dataSeries: DataSeries[], domainsByGroupId: Map<GroupId, YDomainRange>): YDomain[] {
  const dataSeriesByGroupId = groupBy(dataSeries, ({ spec }) => getSpecDomainGroupId(spec), true);

  return dataSeriesByGroupId.reduce<YDomain[]>((acc, groupedDataSeries) => {
    const [{ spec }] = groupedDataSeries;
    const groupId = getSpecDomainGroupId(spec);

    const stacked = groupedDataSeries.filter(({ isStacked, isFiltered }) => isStacked && !isFiltered);
    const nonStacked = groupedDataSeries.filter(({ isStacked, isFiltered }) => !isStacked && !isFiltered);
    const customDomain = domainsByGroupId.get(groupId);
    const hasNonZeroBaselineTypes = groupedDataSeries.some(
      ({ seriesType, isFiltered }) => seriesType === SeriesType.Bar || (seriesType === SeriesType.Area && !isFiltered),
    );
    const domain = mergeYDomainForGroup(stacked, nonStacked, hasNonZeroBaselineTypes, customDomain);
    if (!domain) {
      return acc;
    }
    return [...acc, domain];
  }, []);
}

function mergeYDomainForGroup(
  stacked: DataSeries[],
  nonStacked: DataSeries[],
  hasZeroBaselineSpecs: boolean,
  customDomain?: YDomainRange,
): YDomain | null {
  const dataSeries = [...stacked, ...nonStacked];
  if (dataSeries.length === 0) {
    return null;
  }
  const yScaleTypes = dataSeries.map(({ spec: { yScaleType } }) => ({
    yScaleType,
  }));
  const groupYScaleType = coerceYScaleTypes(yScaleTypes);
  const [{ stackMode, spec }] = dataSeries;
  const groupId = getSpecDomainGroupId(spec);

  let domain: ContinuousDomain;
  if (stackMode === StackMode.Percentage) {
    domain = computeContinuousDataDomain([0, 1], identity, customDomain);
  } else {
    // TODO remove when removing yScaleToDataExtent
    const newCustomDomain = customDomain ? { ...customDomain } : {};
    const shouldScaleToExtent = dataSeries.some(({ spec: { yScaleToDataExtent } }) => yScaleToDataExtent);
    if (customDomain?.fit !== true && shouldScaleToExtent) {
      newCustomDomain.fit = true;
    }

    // compute stacked domain
    const stackedDomain = computeYDomain(stacked, hasZeroBaselineSpecs);

    // compute non stacked domain
    const nonStackedDomain = computeYDomain(nonStacked, hasZeroBaselineSpecs);

    // merge stacked and non stacked domain together
    domain = computeContinuousDataDomain([...stackedDomain, ...nonStackedDomain], identity, newCustomDomain);

    const [computedDomainMin, computedDomainMax] = domain;

    if (newCustomDomain && isCompleteBound(newCustomDomain)) {
      // Don't need to check min > max because this has been validated on axis domain merge
      domain = [newCustomDomain.min, newCustomDomain.max];
    } else if (newCustomDomain && isLowerBound(newCustomDomain)) {
      if (newCustomDomain.min > computedDomainMax) {
        Logger.warn(`custom yDomain for ${groupId} is invalid, custom min is greater than computed max.`);
        domain = [newCustomDomain.min, newCustomDomain.min];
      } else {
        domain = [newCustomDomain.min, computedDomainMax];
      }
    } else if (newCustomDomain && isUpperBound(newCustomDomain)) {
      if (computedDomainMin > newCustomDomain.max) {
        Logger.warn(`custom yDomain for ${groupId} is invalid, custom max is less than computed max.`);
        domain = [newCustomDomain.max, newCustomDomain.max];
      } else {
        domain = [computedDomainMin, newCustomDomain.max];
      }
    }
  }
  return {
    type: 'yDomain',
    isBandScale: false,
    scaleType: groupYScaleType,
    groupId,
    domain,
    logBase: customDomain?.logBase,
    logMinLimit: customDomain?.logMinLimit,
  };
}

function computeYDomain(dataSeries: DataSeries[], hasZeroBaselineSpecs: boolean) {
  const yValues = new Set<any>();
  dataSeries.forEach(({ data }) => {
    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      yValues.add(datum.y1);
      if (hasZeroBaselineSpecs && datum.y0 != null) {
        yValues.add(datum.y0);
      }
    }
  });
  if (yValues.size === 0) {
    return [];
  }
  return computeContinuousDataDomain([...yValues.values()], identity, null);
}

/** @internal */
export function groupSeriesByYGroup(specs: YBasicSeriesSpec[]) {
  const specsByGroupIds = new Map<
    GroupId,
    { stackMode: StackMode | undefined; stacked: YBasicSeriesSpec[]; nonStacked: YBasicSeriesSpec[] }
  >();

  const histogramEnabled = isHistogramEnabled(specs);
  // split each specs by groupId and by stacked or not
  specs.forEach((spec) => {
    const group = specsByGroupIds.get(spec.groupId) || {
      stackMode: undefined,
      stacked: [],
      nonStacked: [],
    };

    if (isStackedSpec(spec, histogramEnabled)) {
      group.stacked.push(spec);
    } else {
      group.nonStacked.push(spec);
    }
    if (group.stackMode === undefined && spec.stackMode !== undefined) {
      group.stackMode = spec.stackMode;
    }
    if (spec.stackMode !== undefined && group.stackMode !== undefined && group.stackMode !== spec.stackMode) {
      Logger.warn(`Is not possible to mix different stackModes, please align all stackMode on the same GroupId
      to the same mode. The default behaviour will be to use the first encountered stackMode on the series`);
    }
    specsByGroupIds.set(spec.groupId, group);
  });
  return specsByGroupIds;
}

/**
 * Histogram mode is forced on every specs if at least one specs has that prop flagged
 * @remarks
 * After mobx->redux https://github.com/elastic/elastic-charts/pull/281 we keep the specs untouched on mount
 * in MobX version, the stackAccessors was programmatically added to every histogram specs
 * in ReduX version, we left untouched the specs, so we have to manually check that
 * @param specs
 * @internal
 */
export function isHistogramEnabled(specs: YBasicSeriesSpec[]) {
  return specs.some(({ seriesType, enableHistogramMode }) => seriesType === SeriesType.Bar && enableHistogramMode);
}

/**
 * Return true if the passed spec needs to be rendered as stack
 * @param spec
 * @param histogramEnabled
 * @internal
 */
export function isStackedSpec(spec: YBasicSeriesSpec, histogramEnabled: boolean) {
  const isBarAndHistogram = spec.seriesType === SeriesType.Bar && histogramEnabled;
  const hasStackAccessors = spec.stackAccessors && spec.stackAccessors.length > 0;
  return isBarAndHistogram || hasStackAccessors;
}

/**
 * Coerce the scale types of a set of specification to a generic one.
 * If there is at least one bar series type, than the response will specity
 * that the coerced scale is a `scaleBand` (each point needs to have a surrounding empty
 * space to draw the bar width).
 * If there are multiple continuous scale types, is coerced to linear.
 * If there are at least one Ordinal scale type, is coerced to ordinal.
 * If none of the above, than coerce to the specified scale.
 * @returns {ScaleContinuousType}
 * @internal
 */
export function coerceYScaleTypes(scales: { yScaleType: ScaleContinuousType }[]): ScaleContinuousType {
  const scaleTypes = new Set<ScaleContinuousType>();
  scales.forEach(({ yScaleType }) => {
    scaleTypes.add(yScaleType);
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
