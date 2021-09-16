/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Scale } from '../../../../scales';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { AnnotationId, AxisId, GroupId } from '../../../../utils/ids';
import { AnnotationDimensions } from '../../annotations/types';
import { computeAnnotationDimensions } from '../../annotations/utils';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { computeSmallMultipleScalesSelector } from './compute_small_multiple_scales';
import { getAxesStylesSelector } from './get_axis_styles';
import { getAxisSpecsSelector, getAnnotationSpecsSelector } from './get_specs';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';

/** @internal */
export const computeAnnotationDimensionsSelector = createCustomCachedSelector(
  [
    getAnnotationSpecsSelector,
    getSettingsSpecSelector,
    computeSeriesGeometriesSelector,
    getAxisSpecsSelector,
    isHistogramModeEnabledSelector,
    computeSmallMultipleScalesSelector,
    getAxesStylesSelector,
    getChartThemeSelector,
  ],
  (
    annotationSpecs,
    settingsSpec,
    { scales: { yScales, xScale } },
    axesSpecs,
    isHistogramMode,
    smallMultipleScales,
    axisStyles,
    { axes },
  ): Map<AnnotationId, AnnotationDimensions> => {
    const getAxisStyle = (id: AxisId = '') => axisStyles.get(id) ?? axes;
    return computeAnnotationDimensions(
      annotationSpecs,
      settingsSpec.rotation,
      yScales as Map<GroupId, Scale<number>>,
      xScale as Scale<string | number>,
      axesSpecs,
      isHistogramMode,
      smallMultipleScales,
      getAxisStyle,
    );
  },
);
