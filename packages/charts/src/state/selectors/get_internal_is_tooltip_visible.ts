/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalChartStateSelector } from './get_internal_chart_state';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';
import type { TooltipVisibility } from '../tooltip_visibility';

/** @internal */
export const getInternalIsTooltipVisibleSelector = createCustomCachedSelector(
  [(globalChartState: GlobalChartState) => globalChartState, getInternalChartStateSelector],
  (globalChartState, internalChartState): TooltipVisibility => {
    if (internalChartState) {
      return internalChartState.isTooltipVisible(globalChartState);
    }
    return { visible: false, isExternal: false, displayOnly: false, isPinnable: false };
  },
);
