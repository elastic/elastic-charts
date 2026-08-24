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
export const getHighlightedLegendPaths = (state: GlobalChartState): LegendPath[] =>
  state.interactions.highlightedLegendPaths;

/** @internal */
export function resolveHighlightedPaths(
  selectedTooltipItems: TooltipValue[],
  legendHoverPaths: LegendPath[],
): LegendPath[] {
  if (legendHoverPaths.length > 0) {
    return legendHoverPaths;
  }
  return selectedTooltipItems.flatMap(({ path }) => (path && path.length > 0 ? [path] : []));
}

/** @internal */
export const getHighlightedPaths = createCustomCachedSelector(
  [getTooltipSelectedItems, getHighlightedLegendPaths],
  (selectedTooltipItems: TooltipValue[], legendHoverPaths: LegendPath[]) =>
    resolveHighlightedPaths(selectedTooltipItems, legendHoverPaths),
);
