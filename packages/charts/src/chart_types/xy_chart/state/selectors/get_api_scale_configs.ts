/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleContinuousType } from '../../../../scales';
import { ScaleType } from '../../../../scales/constants';
import { SettingsSpec } from '../../../../specs/settings';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { GroupId } from '../../../../utils/ids';
import { convertXScaleTypes } from '../../domains/x_domain';
import { coerceYScaleTypes } from '../../domains/y_domain';
import { X_SCALE_DEFAULT, Y_SCALE_DEFAULT } from '../../scales/scale_defaults';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';
import { isXDomain } from '../../utils/axis_utils';
import { groupBy } from '../../utils/group_data_series';
import { AxisSpec, BasicSeriesSpec, CustomXDomain, XScaleType, YDomainRange } from '../../utils/specs';
import { isHorizontalRotation } from '../utils/common';
import { getAxesSpecForSpecId, getSpecDomainGroupId } from '../utils/spec';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { mergeYCustomDomainsByGroupId } from './merge_y_custom_domains';

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
  const isHorizontalChart = isHorizontalRotation(settingsSpec.rotation);

  // x axis
  const xAxes = axisSpecs.filter((d) => isHorizontalChart === isHorizontalAxis(d.position));
  const xTicks = xAxes.reduce<number>((acc, { ticks = X_SCALE_DEFAULT.desiredTickCount }) => {
    return Math.max(acc, ticks);
  }, 1); // TODO TEMP value
  const xScaleConfig = convertXScaleTypes(seriesSpecs);
  const x: ScaleConfigs['x'] = {
    customDomain: settingsSpec.xDomain,
    ...xScaleConfig,
    desiredTickCount: xTicks,
  };

  // y axes
  const scaleConfigsByGroupId = groupBy(seriesSpecs, getSpecDomainGroupId, true).reduce<
    Record<GroupId, { nice: boolean; type: ScaleContinuousType }>
  >((acc, series) => {
    const groupId = getSpecDomainGroupId(series[0]);
    acc[groupId] = coerceYScaleTypes(series);
    return acc;
  }, {});

  const customDomainByGroupId = mergeYCustomDomainsByGroupId(axisSpecs, settingsSpec.rotation);

  const yAxes = axisSpecs.filter((d) => isHorizontalChart === isVerticalAxis(d.position));
  const y = Object.keys(scaleConfigsByGroupId).reduce<ScaleConfigs['y']>((acc, groupId) => {
    const axis = yAxes.find((yAxis) => yAxis.groupId === groupId);
    const desiredTickCount = axis?.ticks ?? Y_SCALE_DEFAULT.desiredTickCount;
    const scaleConfig = scaleConfigsByGroupId[groupId];
    const customDomain = customDomainByGroupId.get(groupId);
    if (!acc[groupId]) {
      acc[groupId] = {
        customDomain,
        ...scaleConfig,
        desiredTickCount,
      };
    }
    acc[groupId].desiredTickCount = Math.max(acc[groupId].desiredTickCount, desiredTickCount);
    return acc;
  }, {});
  return { x, y };
}
