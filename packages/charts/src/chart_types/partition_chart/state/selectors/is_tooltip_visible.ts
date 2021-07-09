/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTooltipType } from '../../../../specs';
import { TooltipType } from '../../../../specs/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getTooltipInfoSelector } from './tooltip';

/**
 * The brush is available only for Ordinal xScales charts and
 * if we have configured an onBrushEnd listener
 * @internal
 */
export const isTooltipVisibleSelector = createCustomCachedSelector(
  [getSettingsSpecSelector, getTooltipInfoSelector],
  (settingsSpec, tooltipInfo): boolean => {
    return getTooltipType(settingsSpec) !== TooltipType.None && tooltipInfo.values.length > 0;
  },
);
