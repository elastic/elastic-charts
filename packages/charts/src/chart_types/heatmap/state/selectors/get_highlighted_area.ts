/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getPerPanelHeatmapGeometries } from './get_per_panel_heatmap_geometries';
import { isBrushingSelector } from './is_brushing';

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
    // TODO: fix this call
    return geoms.pickHighlightedArea(spec.highlightedData.x, spec.highlightedData.y, null, null);
  },
);
