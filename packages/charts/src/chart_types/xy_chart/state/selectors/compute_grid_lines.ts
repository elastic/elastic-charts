/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getGridLines, LinesGrid } from '../../utils/grid_lines';
import { computeAxesGeometriesSelector } from './compute_axes_geometries';
import { computeSmallMultipleScalesSelector } from './compute_small_multiple_scales';
import { getAxisSpecsSelector } from './get_specs';

/** @internal */
export const computePerPanelGridLinesSelector = createCustomCachedSelector(
  [getAxisSpecsSelector, getChartThemeSelector, computeAxesGeometriesSelector, computeSmallMultipleScalesSelector],
  (axesSpecs, chartTheme, axesGeoms, scales): Array<LinesGrid> => {
    return getGridLines(axesSpecs, axesGeoms, chartTheme.axes, scales);
  },
);
