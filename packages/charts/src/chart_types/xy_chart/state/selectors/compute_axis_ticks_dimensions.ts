/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { CanvasTextBBoxCalculator } from '../../../../utils/bbox/canvas_text_bbox_calculator';
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
    const bboxCalculator = new CanvasTextBBoxCalculator();
    const axesTicksDimensions: Map<AxisId, AxisViewModel> = new Map();
    axesSpecs.forEach((axisSpec) => {
      const { id } = axisSpec;
      const axisStyle = axesStyles.get(id) ?? chartTheme.axes;
      const dimensions = axisViewModel(
        axisSpec,
        xDomain,
        yDomains,
        totalBarsInCluster,
        bboxCalculator,
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
    bboxCalculator.destroy();
    return axesTicksDimensions;
  },
);
