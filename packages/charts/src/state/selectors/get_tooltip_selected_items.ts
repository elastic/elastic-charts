/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SeriesIdentifier } from '../../common/series_id';
import { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export const getTooltipToggledItems = (state: GlobalChartState) => state.interactions.tooltip.selected;

/** @internal */
export const getTooltipStick = (state: GlobalChartState) => state.interactions.tooltip.stuck;

/** @internal */
export const getTooltipSelectedItems = createCustomCachedSelector(
  [getTooltipToggledItems, getTooltipStick],
  (toggledItems, tooltipStick): SeriesIdentifier[] => {
    if (!tooltipStick) {
      return [];
    }
    return toggledItems;
  },
);
