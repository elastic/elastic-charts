/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { mergeYCustomDomainsByGroupId } from './merge_y_custom_domains';
import { ScaleContinuousType } from '../../../../scales';
import { ScaleType } from '../../../../scales/constants';
import { SettingsSpec } from '../../../../specs/settings';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { GroupId } from '../../../../utils/ids';
import { convertXScaleTypes } from '../../domains/x_domain';
import { coerceYScaleTypes } from '../../domains/y_domain';
import { X_SCALE_DEFAULT, Y_SCALE_DEFAULT } from '../../scales/scale_defaults';
import { isXDomain } from '../../utils/axis_utils';
import { groupBy } from '../../utils/group_data_series';
import { AxisSpec, BasicSeriesSpec, CustomXDomain, XScaleType, YDomainRange } from '../../utils/specs';
import { getSpecDomainGroupId } from '../utils/spec';

/** @internal */
export type ScaleConfigBase<T extends ScaleType, D extends CustomXDomain | YDomainRange> = {
  type: T;
  nice: boolean;
  desiredTickCount: number;
  customDomain?: D;
};
type XScaleConfigBase = ScaleConfigBase<XScaleType, CustomXDomain>;
type YScaleConfigBase = ScaleConfigBase<ScaleContinuousType, YDomainRange>;

/** @internal */
export interface ScaleConfigs {
  x: XScaleConfigBase & {
    isBandScale: boolean;
    timeZone?: string;
  };
  y: Record<GroupId, YScaleConfigBase>;
}

/** @internal */
export const getScaleConfigsFromSpecsSelector = createCustomCachedSelector(
  [getAxisSpecsSelector, getSeriesSpecsSelector, getSettingsSpecSelector],
  getScaleConfigsFromSpecs,
);

/** @internal */
export function getScaleConfigsFromSpecs(
  axisSpecs: AxisSpec[],
  seriesSpecs: BasicSeriesSpec[],
  settingsSpec: SettingsSpec,
): ScaleConfigs {
  // x axis
  const xAxesSpecs = axisSpecs.filter((spec) => isXDomain(spec.position, settingsSpec.rotation));
  const maxTickCountForXAxes = xAxesSpecs.reduce<number>((acc, { ticks = X_SCALE_DEFAULT.desiredTickCount }) => {
    return Math.max(acc, ticks);
  }, -Infinity);

  const xScaleConfig = convertXScaleTypes(seriesSpecs);
  const x: ScaleConfigs['x'] = {
    customDomain: settingsSpec.xDomain,
    ...xScaleConfig,
    desiredTickCount: Number.isFinite(maxTickCountForXAxes) ? maxTickCountForXAxes : X_SCALE_DEFAULT.desiredTickCount,
  };

  // y axes
  const scaleConfigsByGroupId = groupBy(seriesSpecs, getSpecDomainGroupId, true).reduce<
    Record<GroupId, { nice: boolean; type: ScaleContinuousType }>
  >((acc, series) => {
    if (series[0]) {
      const groupId = getSpecDomainGroupId(series[0]);
      acc[groupId] = coerceYScaleTypes(series);
    }
    return acc;
  }, {});

  const customDomainByGroupId = mergeYCustomDomainsByGroupId(axisSpecs, settingsSpec.rotation);

  const yAxisSpecs = axisSpecs.filter((spec) => !isXDomain(spec.position, settingsSpec.rotation));
  const y = Object.keys(scaleConfigsByGroupId).reduce<ScaleConfigs['y']>((acc, groupId) => {
    const maxTickCountYAxes = yAxisSpecs.reduce<number>((maxTickCount, yAxis) => {
      return yAxis.groupId === groupId
        ? Math.max(maxTickCount, yAxis.ticks ?? Y_SCALE_DEFAULT.desiredTickCount)
        : maxTickCount;
    }, -Infinity);
    const desiredTickCount = Number.isFinite(maxTickCountYAxes) ? maxTickCountYAxes : Y_SCALE_DEFAULT.desiredTickCount;

    if (!acc[groupId]) {
      acc[groupId] = {
        customDomain: customDomainByGroupId.get(groupId),
        ...(scaleConfigsByGroupId[groupId] || {
          nice: false,
          type: ScaleType.Linear,
        }),
        desiredTickCount,
      };
    }

    acc[groupId]!.desiredTickCount = Math.max(
      acc[groupId]?.desiredTickCount ?? Number.NEGATIVE_INFINITY,
      desiredTickCount,
    );

    return acc;
  }, {});
  return { x, y };
}
