/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeAxisTicksDimensionsSelector, getJoinedVisibleAxesData } from './compute_axis_ticks_dimensions';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { countBarsInClusterSelector } from './count_bars_in_cluster';
import { getScaleConfigsFromSpecsSelector } from './get_api_scale_configs';
import { getAxesStylesSelector } from './get_axis_styles';
import { getBarPaddingsSelector } from './get_bar_paddings';
import { getAxisSpecsSelector } from './get_specs';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalSmallMultiplesDomains } from '../../../../state/selectors/get_internal_sm_domains';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getSmallMultiplesSpec } from '../../../../state/selectors/get_small_multiples_spec';
import type { LayoutParameters } from '../../layout/cycle';
import { computeChartLayout } from '../../layout/cycle';

/** @internal */
export const computeChartLayoutSelector = createCustomCachedSelector(
  [
    getChartContainerDimensionsSelector,
    getChartThemeSelector,
    getSettingsSpecSelector,
    getScaleConfigsFromSpecsSelector,
    getAxisSpecsSelector,
    getAxesStylesSelector,
    getJoinedVisibleAxesData,
    computeSeriesDomainsSelector,
    getSmallMultiplesSpec,
    getInternalSmallMultiplesDomains,
    countBarsInClusterSelector,
    isHistogramModeEnabledSelector,
    getBarPaddingsSelector,
    computeAxisTicksDimensionsSelector,
  ],
  (
    container,
    theme,
    settings,
    scales,
    axes,
    styles,
    joined,
    domains,
    sm,
    smDomains,
    groups,
    enableHistogramMode,
    barPadding,
    bootstrapTickDimensions,
  ) => {
    const params: LayoutParameters = {
      container,
      theme,
      settings,
      scales: {
        configs: scales,
        domains,
      },
      axes: {
        specs: axes,
        styles,
        data: joined,
      },
      sm: {
        spec: sm,
        domains: smDomains,
      },
      bars: {
        groupsCount: groups,
        enableHistogramMode,
        padding: barPadding,
      },
      bootstrap: {
        tickDimensions: bootstrapTickDimensions,
      },
    };
    return computeChartLayout(params);
  },
);
