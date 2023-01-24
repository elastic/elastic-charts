/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getProjectedPointerPositionSelector } from './get_projected_pointer_position';
import { Line } from '../../../../geoms/types';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getCursorLinePosition } from '../../crosshair/crosshair_utils';

/** @internal */
export const getCursorLinePositionSelector = createCustomCachedSelector(
  [computeChartDimensionsSelector, getSettingsSpecSelector, getProjectedPointerPositionSelector],
  (chartDimensions, settingsSpec, projectedPointerPosition): Line | undefined =>
    getCursorLinePosition(settingsSpec.rotation, chartDimensions.chartDimensions, projectedPointerPosition),
);
