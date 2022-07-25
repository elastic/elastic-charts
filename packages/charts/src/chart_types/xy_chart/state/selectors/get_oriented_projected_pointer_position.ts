/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SettingsSpec } from '../../../../specs/settings';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getOrientedXPosition, getOrientedYPosition } from '../../utils/interactions';
import { getPanelSize } from '../../utils/panel';
import { computeSmallMultipleScalesSelector, SmallMultipleScales } from './compute_small_multiple_scales';
import { getProjectedPointerPositionSelector, PointerPosition } from './get_projected_pointer_position';

/** @internal */
export const getOrientedProjectedPointerPositionSelector = createCustomCachedSelector(
  [getProjectedPointerPositionSelector, getSettingsSpecSelector, computeSmallMultipleScalesSelector],
  getOrientedProjectedPointerPosition,
);

function getOrientedProjectedPointerPosition(
  { x, y, horizontalPanelValue, verticalPanelValue }: PointerPosition,
  settingsSpec: SettingsSpec,
  scales: SmallMultipleScales,
): PointerPosition {
  // get the oriented projected pointer position
  const panel = getPanelSize(scales);
  return {
    x: getOrientedXPosition(x, y, settingsSpec.rotation, panel),
    y: getOrientedYPosition(x, y, settingsSpec.rotation, panel),
    horizontalPanelValue,
    verticalPanelValue,
  };
}
