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

import createCachedSelector from 're-reselect';

import { LegendItem } from '../../../../commons/legend';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getDeselectedSeriesSelector } from '../../../../state/selectors/get_deselected_data_series';
import { computeLegend } from '../../legend/legend';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { getSeriesColorsSelector } from './get_series_color_map';
import { getSeriesSpecsSelector, getAxisSpecsSelector } from './get_specs';

/** @internal */
export const computeLegendSelector = createCachedSelector(
  [
    getSeriesSpecsSelector,
    computeSeriesDomainsSelector,
    getChartThemeSelector,
    getSeriesColorsSelector,
    getAxisSpecsSelector,
    getDeselectedSeriesSelector,
  ],
  (seriesSpecs, seriesDomainsAndData, chartTheme, seriesColors, axesSpecs, deselectedDataSeries): LegendItem[] =>
    computeLegend(
      seriesDomainsAndData.seriesCollection,
      seriesColors,
      seriesSpecs,
      chartTheme.colors.defaultVizColor,
      axesSpecs,
      deselectedDataSeries,
    ),
)(getChartIdSelector);
