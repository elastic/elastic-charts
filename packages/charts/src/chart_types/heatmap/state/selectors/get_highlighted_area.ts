/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getPerPanelHeatmapGeometries } from './get_per_panel_heatmap_geometries';
import { isBrushingSelector } from './is_brushing';
import { createCustomCachedSelector } from '../../../../state/create_selector';

/**
 * @internal
 */
export const getHighlightedDataSelector = createCustomCachedSelector(
  [getHeatmapSpecSelector, isBrushingSelector],
  (spec, isBrushing) => {
    if (!spec.highlightedData || isBrushing) {
      return null;
    }
    return spec.highlightedData;
  },
);

/**
 * Returns rect position of the highlighted selection.
 * @internal
 */
export const getHighlightedAreaSelector = createCustomCachedSelector(
  [getPerPanelHeatmapGeometries, getHeatmapSpecSelector, isBrushingSelector],
  (geoms, spec, isBrushing) => {
    if (!spec.highlightedData || isBrushing) {
      return null;
    }
    const { x, y, smHorizontalAccessorValue, smVerticalAccessorValue } = spec.highlightedData;
    return geoms.pickHighlightedArea(x, y, smHorizontalAccessorValue, smVerticalAccessorValue);
  },
);
