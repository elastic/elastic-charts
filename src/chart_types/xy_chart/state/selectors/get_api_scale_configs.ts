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
import createCachedSelector from 're-reselect';

import { ScaleContinuousType } from '../../../../scales';
import { ScaleType } from '../../../../scales/constants';
import { SettingsSpec } from '../../../../specs/settings';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { GroupId } from '../../../../utils/ids';
import { convertXScaleTypes } from '../../domains/x_domain';
import { coerceYScaleTypes } from '../../domains/y_domain';
import { getYAPIScale } from '../../scales/get_api_scales';
import { X_SCALE_DEFAULT, Y_SCALE_DEFAULT } from '../../scales/scale_defaults';
import { APIScale } from '../../scales/types';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';
import { groupBy } from '../../utils/group_data_series';
import { AxisSpec, BasicSeriesSpec, CustomXDomain, XScaleType, YDomainRange } from '../../utils/specs';
import { isHorizontalRotation } from '../utils/common';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { mergeYCustomDomainsByGroupId } from './merge_y_custom_domains';

/** @internal */
export type APIScaleConfigBase<T extends ScaleType, D extends CustomXDomain | YDomainRange> = APIScale<T> & {
  ticks: number;
  customDomain?: D;
};
type APIXScaleConfigBase = APIScaleConfigBase<XScaleType, CustomXDomain>;
type APIYScaleConfigBase = APIScaleConfigBase<ScaleContinuousType, YDomainRange>;

/** @internal */
export interface APIScaleConfigs {
  x: APIXScaleConfigBase & {
    isBandScale: boolean;
    timeZone?: string;
  };
  y: Record<GroupId, APIYScaleConfigBase>;
}

/** @internal */
export const getAPIScaleConfigsSelector = createCachedSelector(
  [getAxisSpecsSelector, getSeriesSpecsSelector, getSettingsSpecSelector],
  getAPIScaleConfigs,
)(getChartIdSelector);

/** @internal */
export function getAPIScaleConfigs(
  axisSpecs: AxisSpec[],
  seriesSpecs: BasicSeriesSpec[],
  settingsSpec: SettingsSpec,
): APIScaleConfigs {
  const isHorizontalChart = isHorizontalRotation(settingsSpec.rotation);

  // x axis
  const xAxes = axisSpecs.filter((d) => isHorizontalChart === isHorizontalAxis(d.position));
  const xTicks = xAxes.reduce<number>((acc, { ticks = X_SCALE_DEFAULT.ticks }) => {
    return Math.max(acc, ticks);
  }, X_SCALE_DEFAULT.ticks);

  const xScaleConfig = convertXScaleTypes(seriesSpecs);
  const x: APIScaleConfigs['x'] = {
    customDomain: settingsSpec.xDomain,
    ...xScaleConfig,
    ticks: xTicks,
  };

  // y axes
  const scaleTypeByGroupId = groupBy(seriesSpecs, ['groupId'], true).reduce<
    Record<GroupId, APIScale<ScaleContinuousType>>
  >((acc, series) => {
    const yScaleTypes = series.map(({ yScaleType }) => getYAPIScale(yScaleType));
    acc[series[0].groupId] = coerceYScaleTypes(yScaleTypes);
    return acc;
  }, {});

  const customDomainByGroupId = mergeYCustomDomainsByGroupId(axisSpecs, settingsSpec.rotation);

  const yAxes = axisSpecs.filter((d) => isHorizontalChart === isVerticalAxis(d.position));
  const y = Object.keys(scaleTypeByGroupId).reduce<APIScaleConfigs['y']>((acc, groupId) => {
    const axis = yAxes.find((yAxis) => yAxis.groupId === groupId);
    const ticks = axis?.ticks ?? Y_SCALE_DEFAULT.ticks;
    const apiScale = scaleTypeByGroupId[groupId];
    const customDomain = customDomainByGroupId.get(groupId);
    if (!acc[groupId]) {
      acc[groupId] = {
        customDomain,
        ...apiScale,
        ticks,
      };
    }
    acc[groupId].ticks = Math.max(acc[groupId].ticks, ticks);
    return acc;
  }, {});
  return { x, y };
}
