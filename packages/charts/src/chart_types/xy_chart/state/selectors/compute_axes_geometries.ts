/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getJoinedVisibleAxesData } from './compute_baseline_axes';
import { computeChartLayoutSelector } from './compute_chart_layout';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { computeSmallMultipleScalesSelector } from '../../../../state/selectors/compute_small_multiple_scales';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getAxesGeometries } from '../../axes/geometry';

/** @internal */
export const computeAxesGeometriesSelector = createCustomCachedSelector(
  [getChartThemeSelector, getJoinedVisibleAxesData, computeSmallMultipleScalesSelector, computeChartLayoutSelector],
  (theme, joinedAxesData, smScales, chartLayout) =>
    getAxesGeometries(chartLayout.dimensions, theme, joinedAxesData, smScales, chartLayout.ticks),
);
