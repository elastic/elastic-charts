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

import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { Dimensions } from '../../../../utils/dimensions';
import { computeChartDimensions } from '../../utils/dimensions';
import { computeAxisTicksDimensionsSelector } from './compute_axis_ticks_dimensions';
import { getAxisSpecsSelector } from './get_specs';

/** @internal */
export const computeChartDimensionsSelector = createCachedSelector(
  [
    getChartContainerDimensionsSelector,
    getChartThemeSelector,
    computeAxisTicksDimensionsSelector,
    getAxisSpecsSelector,
  ],
  (
    chartContainerDimensions,
    chartTheme,
    axesTicksDimensions,
    axesSpecs,
  ): {
    chartDimensions: Dimensions;
    leftMargin: number;
  } => computeChartDimensions(chartContainerDimensions, chartTheme, axesTicksDimensions, axesSpecs),
)(getChartIdSelector);
