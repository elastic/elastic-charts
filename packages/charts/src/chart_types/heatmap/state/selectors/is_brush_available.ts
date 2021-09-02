/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getHeatmapSpecSelector } from './get_heatmap_spec';

/**
 * The brush is available only if a onBrushEnd listener is configured
 * @internal
 */
export const isBrushAvailableSelector = createCustomCachedSelector(
  [getHeatmapSpecSelector, getChartThemeSelector],
  ({ onBrushEnd }, { heatmap }): boolean => {
    return Boolean(onBrushEnd) && heatmap.brushTool.visible;
  },
);

/** @internal */
export const isBrushEndProvided = createCustomCachedSelector([getHeatmapSpecSelector], ({ onBrushEnd }): boolean => {
  return Boolean(onBrushEnd);
});
