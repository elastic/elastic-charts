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
import { ComputedGeometries } from '../utils/types';
import { computeSeriesGeometries } from '../utils/utils';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { computeSmallMultipleScalesSelector } from './compute_small_multiple_scales';
import { getSeriesColorsSelector } from './get_series_color_map';
import { getSeriesSpecsSelector, getAxisSpecsSelector } from './get_specs';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';

/** @internal */
export const computeSeriesGeometriesSelector = createCustomCachedSelector(
  [
    getSettingsSpecSelector,
    getSeriesSpecsSelector,
    computeSeriesDomainsSelector,
    getSeriesColorsSelector,
    getChartThemeSelector,
    getAxisSpecsSelector,
    computeSmallMultipleScalesSelector,
    isHistogramModeEnabledSelector,
  ],
  (
    settingsSpec,
    seriesSpecs,
    seriesDomainsAndData,
    seriesColors,
    chartTheme,
    axesSpecs,
    smallMultiplesScales,
    isHistogramMode,
  ): ComputedGeometries => {
    return computeSeriesGeometries(
      seriesSpecs,
      seriesDomainsAndData,
      seriesColors,
      chartTheme,
      settingsSpec.rotation,
      axesSpecs,
      smallMultiplesScales,
      isHistogramMode,
    );
  },
);
