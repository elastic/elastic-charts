/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getScaleConfigsFromSpecsSelector } from './get_api_scale_configs';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { Rotation } from '../../../../utils/common';
import { SpecId } from '../../../../utils/ids';
import { defaultTickFormatter, isXDomain } from '../../utils/axis_utils';
import { groupBy } from '../../utils/group_data_series';
import { AxisSpec } from '../../utils/specs';

/** @internal */
export type AxisLabelFormatter<V = unknown> = (value: V) => string;

/** @internal */
export type AxisLabelFormatters = { x: Map<SpecId, AxisLabelFormatter>; y: Map<SpecId, AxisLabelFormatter> };

/** @internal */
export const getAxisTickLabelFormatter = createCustomCachedSelector(
  [getSeriesSpecsSelector, getAxisSpecsSelector, getSettingsSpecSelector, getScaleConfigsFromSpecsSelector],
  (seriesSpecs, axesSpecs, { rotation }, scaleConfigs): AxisLabelFormatters => {
    const seriesByGroupId = groupBy(seriesSpecs, ['groupId'], false);
    const axesByGroupId = groupBy(axesSpecs, ['groupId'], false);
    const groupIds = [...new Set([...Object.keys(seriesByGroupId), ...Object.keys(axesByGroupId)])];
    const { timeZone } = scaleConfigs.x;
    // we need to do that by groupId to find the first Y spec formatter fallback
    return groupIds.reduce<AxisLabelFormatters>(
      (acc, groupId) => {
        const ySpecDataFormatter = (seriesByGroupId[groupId] ?? []).find(({ tickFormat }) => tickFormat)?.tickFormat;
        const axes = groupAxesByCartesianCoords(axesByGroupId[groupId] ?? [], rotation);
        axes.x.forEach((spec) => {
          acc.x.set(spec.id, (v) => (spec?.labelFormat ?? spec?.tickFormat ?? defaultTickFormatter)(v, { timeZone }));
        });
        axes.y.forEach((spec) => {
          acc.y.set(spec.id, (v) =>
            (spec.labelFormat ?? spec.tickFormat ?? ySpecDataFormatter ?? defaultTickFormatter)(v, {}),
          );
        });
        return acc;
      },
      { x: new Map(), y: new Map() },
    );
  },
);

function groupAxesByCartesianCoords(sameGroupAxes: AxisSpec[], chartRotation: Rotation = 0) {
  return sameGroupAxes.reduce<{ x: AxisSpec[]; y: AxisSpec[] }>(
    (acc, spec) => {
      acc[isXDomain(spec.position, chartRotation) ? 'x' : 'y'].push(spec);
      return acc;
    },
    { x: [], y: [] },
  );
}
