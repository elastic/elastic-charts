/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getLegendItemsSelector } from './get_legend_items';
import { getTooltipSelectedItems } from './get_tooltip_selected_items';
import type { LegendItem } from '../../common/legend';
import type { TooltipValue } from '../../specs';
import type { LegendPath } from '../actions/legend';
import type { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

const getLegendHoverPaths = (state: GlobalChartState): LegendPath[] => state.interactions.highlightedPaths;

/** @internal */
export function resolveHighlightedPaths(
  legendHoverPaths: LegendPath[],
  selectedTooltipItems: TooltipValue[],
  legendItems: ReadonlyArray<LegendItem>,
): LegendPath[] {
  if (legendHoverPaths.length > 0) {
    return legendHoverPaths;
  }
  if (selectedTooltipItems.length === 0) {
    return [];
  }

  const pathsFromTooltip = selectedTooltipItems.flatMap((item) => {
    if (item.path && item.path.length > 0) {
      return [item.path];
    }
    return legendItems
      .filter(({ seriesIdentifiers }) => seriesIdentifiers.some(({ key }) => key === item.seriesIdentifier.key))
      .map(({ path }) => path);
  });

  return pathsFromTooltip.length > 0 ? pathsFromTooltip : [];
}

/** @internal */
export const getHighlightedPaths = createCustomCachedSelector(
  [getLegendHoverPaths, getTooltipSelectedItems, getLegendItemsSelector],
  (legendHoverPaths: LegendPath[], selectedTooltipItems: TooltipValue[], legendItems: ReadonlyArray<LegendItem>) =>
    resolveHighlightedPaths(legendHoverPaths, selectedTooltipItems, legendItems),
);
