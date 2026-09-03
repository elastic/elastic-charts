/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTooltipSelectedItems } from './get_tooltip_selected_items';
import type { TooltipValue } from '../../specs';
import type { LegendPath } from '../actions/legend';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export const getHighlightedLegendPath = (state: GlobalChartState): LegendPath | null =>
  state.interactions.highlightedLegendPath;

/** @internal */
export function resolveHighlightedPaths(
  selectedTooltipItems: TooltipValue[],
  legendHoverPath: LegendPath | null,
): LegendPath[] {
  if (legendHoverPath) {
    return [legendHoverPath];
  }
  return selectedTooltipItems.flatMap(({ path }) => (path && path.length > 0 ? [path] : []));
}

/** @internal */
export const getHighlightedPaths = createCustomCachedSelector(
  [getTooltipSelectedItems, getHighlightedLegendPath],
  (selectedTooltipItems: TooltipValue[], legendHoverPath) =>
    resolveHighlightedPaths(selectedTooltipItems, legendHoverPath),
);
