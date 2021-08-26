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
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { AxisId } from '../../../../utils/ids';
import { axisViewModel, AxisViewModel, hasDuplicateAxis, defaultTickFormatter } from '../../utils/axis_utils';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { countBarsInClusterSelector } from './count_bars_in_cluster';
import { getAxesStylesSelector } from './get_axis_styles';
import { getBarPaddingsSelector } from './get_bar_paddings';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';

/** @internal */
export const computeAxisTicksDimensionsSelector = createCustomCachedSelector(
  [
    getBarPaddingsSelector,
    isHistogramModeEnabledSelector,
    getAxisSpecsSelector,
    getChartThemeSelector,
    getSettingsSpecSelector,
    computeSeriesDomainsSelector,
    countBarsInClusterSelector,
    getSeriesSpecsSelector,
    getAxesStylesSelector,
  ],
  (
    barsPadding,
    isHistogramMode,
    axesSpecs,
    chartTheme,
    settingsSpec,
    seriesDomainsAndData,
    totalBarsInCluster,
    seriesSpecs,
    axesStyles,
  ): Map<AxisId, AxisViewModel> => {
    const { xDomain, yDomains } = seriesDomainsAndData;
    const fallBackTickFormatter = seriesSpecs.find(({ tickFormat }) => tickFormat)?.tickFormat ?? defaultTickFormatter;
    return withTextMeasure((textMeasure) => {
      const axesTicksDimensions: Map<AxisId, AxisViewModel> = new Map();
      axesSpecs.forEach((axisSpec) => {
        const { id } = axisSpec;
        const axisStyle = axesStyles.get(id) ?? chartTheme.axes;
        const dimensions = axisViewModel(
          axisSpec,
          xDomain,
          yDomains,
          totalBarsInCluster,
          textMeasure,
          settingsSpec.rotation,
          axisStyle,
          fallBackTickFormatter,
          barsPadding,
          isHistogramMode,
        );
        if (
          dimensions &&
          (!settingsSpec.hideDuplicateAxes || !hasDuplicateAxis(axisSpec, dimensions, axesTicksDimensions, axesSpecs))
        ) {
          axesTicksDimensions.set(id, dimensions);
        }
      });
      return axesTicksDimensions;
    });
  },
);
