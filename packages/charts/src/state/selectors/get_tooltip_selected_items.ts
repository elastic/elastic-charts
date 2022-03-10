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
import { getInternalTooltipInfoSelector } from './get_internal_tooltip_info';

/** @internal */
export const getTooltipToggledItems = (state: GlobalChartState) => state.interactions.tooltipToggledItems;

/** @internal */
export const getTooltipStick = (state: GlobalChartState) => state.interactions.tooltipStick;

/** @internal */
export const getTooltipSelectedItems = createCustomCachedSelector(
  [getTooltipToggledItems, getInternalTooltipInfoSelector, getTooltipStick],
  (toggledItems, info, tooltipStick): Set<SeriesIdentifier> => {
    if (!tooltipStick) {
      return new Set();
    }
    const updatedValues = new Set([...toggledItems.values()]);
    (info?.values ?? [])
      .filter(({ isHighlighted }) => isHighlighted)
      .forEach(({ seriesIdentifier }) => {
        if (updatedValues.has(seriesIdentifier)) {
          updatedValues.delete(seriesIdentifier);
        } else {
          updatedValues.add(seriesIdentifier);
        }
      });

    return updatedValues;
  },
);
