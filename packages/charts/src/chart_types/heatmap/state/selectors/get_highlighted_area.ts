/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getHeatmapGeometries } from './geometries';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
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
  [getHeatmapGeometries, getHeatmapSpecSelector, isBrushingSelector],
  (geoms, spec, isBrushing) => {
    if (!spec.highlightedData || isBrushing) {
      return null;
    }
    return geoms.pickHighlightedArea(spec.highlightedData.x, spec.highlightedData.y);
  },
);
