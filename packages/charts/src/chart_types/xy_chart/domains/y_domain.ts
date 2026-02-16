/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { YDomain } from './types';
import { ScaleType } from '../../../scales/constants';
import type { ContinuousDomain } from '../../../utils/domain';
import { computeContinuousDataDomain } from '../../../utils/domain';
import type { GroupId } from '../../../utils/ids';
import { Logger } from '../../../utils/logger';
import { getYNiceFromSpec, getYScaleTypeFromSpec } from '../scales/get_api_scales';
import type { ScaleConfigs } from '../state/selectors/get_api_scale_configs';
import { getSpecDomainGroupId } from '../state/utils/spec';
import { groupBy } from '../utils/group_data_series';
import type { DataSeries } from '../utils/series';
import type { BasicSeriesSpec, SeriesScales, YDomainRange } from '../utils/specs';
import { DomainPaddingUnit, SeriesType, StackMode } from '../utils/specs';

/** @internal */
export type YBasicSeriesSpec = Pick<
  BasicSeriesSpec,
  'id' | 'seriesType' | 'yScaleType' | 'groupId' | 'stackAccessors' | 'useDefaultGroupDomain'
> & { stackMode?: StackMode; enableHistogramMode?: boolean };

/** @internal */
export function mergeYDomain(
  yScaleAPIConfig: ScaleConfigs['y'],
  dataSeries: DataSeries[],
  annotationYValueMap: Map<GroupId, number[]>,
): YDomain[] {
  const dataSeriesByGroupId = groupBy(dataSeries, ({ spec }) => getSpecDomainGroupId(spec), true);
  return dataSeriesByGroupId.reduce<YDomain[]>((acc, groupedDataSeries) => {
    const stacked = groupedDataSeries.filter(({ isStacked, isFiltered }) => isStacked && !isFiltered);
    const nonStacked = groupedDataSeries.filter(({ isStacked, isFiltered }) => !isStacked && !isFiltered);
    const hasNonZeroBaselineTypes = groupedDataSeries.some(
      ({ seriesType, isFiltered }) => seriesType === SeriesType.Bar || (seriesType === SeriesType.Area && !isFiltered),
    );
    const domain = mergeYDomainForGroup(
      stacked,
      nonStacked,
      annotationYValueMap,
      hasNonZeroBaselineTypes,
      yScaleAPIConfig,
    );
    return domain ? [...acc, domain] : acc;
  }, []);
}

function mergeYDomainForGroup(
  stacked: DataSeries[],
  nonStacked: DataSeries[],
  annotationYValueMap: Map<GroupId, number[]>,
  hasZeroBaselineSpecs: boolean,
  yScaleConfig: ScaleConfigs['y'],
): YDomain | null {
  const dataSeries = stacked.concat(nonStacked);
  if (!dataSeries[0]) return null;

  const [{ isStacked, stackMode, spec }] = dataSeries;
  const groupId = getSpecDomainGroupId(spec);
  const scaleConfig = yScaleConfig[groupId];

  if (!scaleConfig) return null;

  const { customDomain, type, nice, desiredTickCount } = scaleConfig;
  const newCustomDomain: YDomainRange = customDomain ? { ...customDomain } : { min: NaN, max: NaN };
  const { paddingUnit, padding, constrainPadding } = newCustomDomain;

  let mergedDomain: ContinuousDomain;
  if (isStacked && stackMode === StackMode.Percentage) {
    mergedDomain = computeContinuousDataDomain([0, 1], type, customDomain);
  } else {
    const annotationData = annotationYValueMap.get(groupId) ?? [];
    const stackedDomain = computeYDomain(stacked, annotationData, hasZeroBaselineSpecs, type, newCustomDomain);
    const nonStackedDomain = computeYDomain(nonStacked, annotationData, hasZeroBaselineSpecs, type, newCustomDomain);
    mergedDomain = computeContinuousDataDomain([...stackedDomain, ...nonStackedDomain], type, newCustomDomain);
    const [computedDomainMin, computedDomainMax] = mergedDomain;

    if (newCustomDomain && Number.isFinite(newCustomDomain.min) && Number.isFinite(newCustomDomain.max)) {
      // Don't need to check min > max because this has been validated on axis domain merge
      mergedDomain = [newCustomDomain.min, newCustomDomain.max];
    } else if (newCustomDomain && Number.isFinite(newCustomDomain.min)) {
      if (newCustomDomain.min > computedDomainMax) {
        Logger.warn(`custom yDomain for ${groupId} is invalid, custom min is greater than computed max.`);
        mergedDomain = [newCustomDomain.min, newCustomDomain.min];
      } else {
        mergedDomain = [newCustomDomain.min, computedDomainMax];
      }
    } else if (newCustomDomain && Number.isFinite(newCustomDomain.max)) {
      if (computedDomainMin > newCustomDomain.max) {
        Logger.warn(`custom yDomain for ${groupId} is invalid, custom max is less than computed max.`);
        mergedDomain = [newCustomDomain.max, newCustomDomain.max];
      } else {
        mergedDomain = [computedDomainMin, newCustomDomain.max];
      }
    }
  }

  return {
    type,
    nice,
    isBandScale: false,
    groupId,
    domain: mergedDomain,
    logBase: customDomain?.logBase,
    logMinLimit: customDomain?.logMinLimit,
    desiredTickCount,
    domainPixelPadding: paddingUnit === DomainPaddingUnit.Pixel ? padding : 0,
    constrainDomainPadding: constrainPadding,
  };
}

function computeYDomain(
  dataSeries: DataSeries[],
  annotationYValues: number[],
  hasZeroBaselineSpecs: boolean,
  scaleType: ScaleType,
  customDomain: YDomainRange,
) {
  const yValues = new Set<any>();
  dataSeries.forEach(({ data }) => {
    for (const datum of data) {
      yValues.add(datum.y1);
      if (hasZeroBaselineSpecs && datum.y0 !== null) yValues.add(datum.y0);
    }
  });
  if (yValues.size === 0) {
    return [];
  }
  // padding already applied, set to 0 here to avoid duplicating
  const domainOptions = { ...customDomain, padding: 0 };
  return computeContinuousDataDomain([...yValues, ...annotationYValues], scaleType, domainOptions);
}

/**
 * Returns a string key uniquely identifying a small multiples panel.
 * Uses the same stringification as the `barPanelKey` in `renderGeometries()`:
 * `[smV, smH].join('|')` which converts `undefined` to the string `"undefined"`.
 * @internal
 */
export function getPanelKey(smV: string | number | undefined, smH: string | number | undefined): string {
  return [smV, smH].join('|');
}

/**
 * Compute Y domains independently per small multiples panel.
 *
 * Groups `dataSeries` by their panel key (derived from `smVerticalAccessorValue` and
 * `smHorizontalAccessorValue`), then calls `mergeYDomain()` on each group to produce
 * panel-specific Y domains. This allows each panel to fit its Y-axis to its own data.
 *
 * @internal
 */
export function mergeYDomainPerPanel(
  yScaleAPIConfig: ScaleConfigs['y'],
  dataSeries: DataSeries[],
  annotationYValueMap: Map<GroupId, number[]>,
): Map<string, YDomain[]> {
  const seriesByPanel = new Map<string, DataSeries[]>();

  for (const ds of dataSeries) {
    const key = getPanelKey(ds.smVerticalAccessorValue, ds.smHorizontalAccessorValue);
    const existing = seriesByPanel.get(key);
    if (existing) {
      existing.push(ds);
    } else {
      seriesByPanel.set(key, [ds]);
    }
  }

  const result = new Map<string, YDomain[]>();
  for (const [panelKey, panelSeries] of seriesByPanel) {
    result.set(panelKey, mergeYDomain(yScaleAPIConfig, panelSeries, annotationYValueMap));
  }
  return result;
}

/** @internal */
export function groupSeriesByYGroup(specs: YBasicSeriesSpec[]) {
  const specsByGroupIds = new Map<
    GroupId,
    { stackMode: StackMode | undefined; stacked: YBasicSeriesSpec[]; nonStacked: YBasicSeriesSpec[] }
  >();

  // split each specs by groupId and by stacked or not
  specs.forEach((spec) => {
    const group = specsByGroupIds.get(spec.groupId) || {
      stackMode: undefined,
      stacked: [],
      nonStacked: [],
    };

    if (isStackedSpec(spec)) {
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

/** @internal */
export function hasHistogramBarSpec(specs: YBasicSeriesSpec[]) {
  return specs.some(({ seriesType, enableHistogramMode }) => seriesType === SeriesType.Bar && enableHistogramMode);
}

/** @internal */
export function isStackedSpec(spec: YBasicSeriesSpec) {
  return spec.stackAccessors && spec.stackAccessors.length > 0;
}

/** @internal */
export function coerceYScaleTypes(series: Pick<SeriesScales, 'yScaleType' | 'yNice'>[]) {
  const scaleTypes = new Set(series.map((s) => getYScaleTypeFromSpec(s.yScaleType)));
  const niceDomains = series.map((s) => getYNiceFromSpec(s.yNice));
  const type = scaleTypes.size === 1 ? scaleTypes.values().next().value : ScaleType.Linear;
  return { type, nice: !niceDomains.includes(false) };
}
