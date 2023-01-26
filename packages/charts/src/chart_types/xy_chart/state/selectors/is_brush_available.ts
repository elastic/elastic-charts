/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getComputedScalesSelector } from './get_computed_scales';
import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';

/**
 * The brush is available only for Ordinal xScales charts and
 * if we have configured an onBrushEnd listener
 * @internal
 */
export const isBrushAvailableSelector = createCustomCachedSelector(
  [getSettingsSpecSelector, getComputedScalesSelector],
  (settingsSpec, scales): boolean => scales.xScale.type !== ScaleType.Ordinal && Boolean(settingsSpec.onBrushEnd),
);
