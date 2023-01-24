/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { computeSmallMultipleScalesSelector } from '../../../../state/selectors/compute_small_multiple_scales';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getAxesGeometries } from '../../utils/axis_utils';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getAxesStylesSelector } from './get_axis_styles';
import { axisSpecsLookupSelector } from './get_specs';
import { getVisibleTickSetsSelector } from './visible_ticks';

/** @internal */
export const computeAxesGeometriesSelector = createCustomCachedSelector(
  [
    computeChartDimensionsSelector,
    getChartThemeSelector,
    axisSpecsLookupSelector,
    getAxesStylesSelector,
    computeSmallMultipleScalesSelector,
    getVisibleTickSetsSelector,
  ],
  getAxesGeometries,
);
