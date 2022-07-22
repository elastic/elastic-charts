/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { AxisId } from '../../../../utils/ids';
import { computeAnnotationDimensions } from '../../annotations/utils';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { computeSmallMultipleScalesSelector } from './compute_small_multiple_scales';
import { getAxesStylesSelector } from './get_axis_styles';
import { getAxisSpecsSelector, getAnnotationSpecsSelector } from './get_specs';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';

const getAxisStyleGetter = createCustomCachedSelector(
  [getAxesStylesSelector, getChartThemeSelector],
  (axisStyles, { axes }) =>
    (id: AxisId = '') =>
      axisStyles.get(id) ?? axes,
);

/** @internal */
export const computeAnnotationDimensionsSelector = createCustomCachedSelector(
  [
    getAnnotationSpecsSelector,
    getSettingsSpecSelector,
    computeSeriesGeometriesSelector,
    getAxisSpecsSelector,
    isHistogramModeEnabledSelector,
    computeSmallMultipleScalesSelector,
    getAxisStyleGetter,
  ],
  computeAnnotationDimensions,
);
