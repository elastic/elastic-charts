/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { Y_SCALE_DEFAULT } from '../../specs/scale_defaults';
import type { ResolvedHeatmapScale } from '../utils/scales';
import { resolveHeatmapScale } from '../utils/scales';

/** @internal */
export interface HeatmapScales {
  x: ResolvedHeatmapScale;
  y: ResolvedHeatmapScale;
}

/** @internal */
export const getHeatmapScalesSelector = createCustomCachedSelector(
  [getHeatmapSpecSelector],
  ({ xScale, yScale, xSortPredicate, ySortPredicate }): HeatmapScales => ({
    x: resolveHeatmapScale(xScale, xSortPredicate),
    y: resolveHeatmapScale(yScale ?? Y_SCALE_DEFAULT, ySortPredicate),
  }),
);
