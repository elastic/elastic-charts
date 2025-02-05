/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TooltipValue } from '../../specs';
import { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export const getTooltipToggledItems = (state: GlobalChartState) => state.interactions.tooltip.selected;

/** @internal */
export const getTooltipPinned = (state: GlobalChartState) => state.interactions.tooltip.pinned;

/** @internal */
export const getTooltipSelectedItems = createCustomCachedSelector(
  [getTooltipToggledItems, getTooltipPinned],
  (toggledItems, tooltipStick): TooltipValue[] => {
    if (!tooltipStick) {
      return [];
    }
    return toggledItems;
  },
);
