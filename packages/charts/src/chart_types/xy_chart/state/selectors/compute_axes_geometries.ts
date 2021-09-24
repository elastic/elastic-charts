/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getAxesGeometries, AxisGeometry } from '../../utils/axis_utils';
import { computeAxisTicksDimensionsSelector } from './compute_axis_ticks_dimensions';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { computeSmallMultipleScalesSelector } from './compute_small_multiple_scales';
import { countBarsInClusterSelector } from './count_bars_in_cluster';
import { getAxesStylesSelector } from './get_axis_styles';
import { getBarPaddingsSelector } from './get_bar_paddings';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';

/** @internal */
export const computeAxesGeometriesSelector = createCustomCachedSelector(
  [
    computeChartDimensionsSelector,
    getChartThemeSelector,
    getSettingsSpecSelector,
    getAxisSpecsSelector,
    computeAxisTicksDimensionsSelector,
    getAxesStylesSelector,
    computeSeriesDomainsSelector,
    computeSmallMultipleScalesSelector,
    countBarsInClusterSelector,
    isHistogramModeEnabledSelector,
    getSeriesSpecsSelector,
    getBarPaddingsSelector,
  ],
  (
    chartDimensions,
    chartTheme,
    settingsSpec,
    axesSpecs,
    axesTicksDimensions,
    axesStyles,
    seriesDomainsAndData,
    smScales,
    totalBarsInCluster,
    isHistogramMode,
    seriesSpecs,
    barsPadding,
  ): AxisGeometry[] => {
    return getAxesGeometries(
      chartDimensions,
      chartTheme,
      settingsSpec,
      axesSpecs,
      axesTicksDimensions,
      axesStyles,
      seriesDomainsAndData,
      smScales,
      totalBarsInCluster,
      isHistogramMode,
      seriesSpecs,
      barsPadding,
    );
  },
);
