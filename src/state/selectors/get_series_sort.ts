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

import { ChartTypes } from '../../chart_types';
import { SeriesIdentifier } from '../../commons/series_id';
import { SpecTypes } from '../../specs/constants';
import { SeriesSortSpec } from '../../specs/series_sort';
import { SettingsSpec } from '../../specs/settings';
import { GlobalChartState, SpecList } from '../chart_state';
import { getSpecsFromStore } from '../utils';
import { getChartIdSelector } from './get_chart_id';
import { getSettingsSpecSelector } from './get_settings_specs';

const getSpecs = (state: GlobalChartState) => state.specs;

export type TooltipSortingFn = (a: SeriesIdentifier, b: SeriesIdentifier) => number;

/** @internal */
export const DEFAULT_SORTING_FN = () => {
  return 0;
};

/** @internal */
export const getRenderingSeriesSortSelector = createCachedSelector(
  [getSettingsSpecSelector, getSpecs],
  getRenderingSortingFn,
)(getChartIdSelector);

export const getLegendSeriesSortSelector = createCachedSelector(
  [getSettingsSpecSelector, getSpecs],
  getLegendSortingFn,
)(getChartIdSelector);

export const getTooltipSeriesSortSelector = createCachedSelector(
  [getSettingsSpecSelector, getSpecs],
  getTooltipSortingFn,
)(getChartIdSelector);

function getRenderingSortingFn(settings: SettingsSpec, specs: SpecList): TooltipSortingFn {
  const seriesSortId = settings.renderingSeriesSort;
  if (!seriesSortId) {
    return DEFAULT_SORTING_FN;
  }
  return getSeriesSort(seriesSortId, specs);
}

function getLegendSortingFn(settings: SettingsSpec, specs: SpecList): TooltipSortingFn {
  const seriesSortId = settings.legendSeriesSort;
  if (!seriesSortId) {
    return DEFAULT_SORTING_FN;
  }
  return getSeriesSort(seriesSortId, specs);
}

function getTooltipSortingFn(settings: SettingsSpec, specs: SpecList): TooltipSortingFn {
  if (typeof settings.tooltip !== 'object') {
    return DEFAULT_SORTING_FN;
  }
  const { seriesSort: seriesSortId } = settings.tooltip;
  if (!seriesSortId) {
    return DEFAULT_SORTING_FN;
  }
  return getSeriesSort(seriesSortId, specs);
}

function getSeriesSort(seriesSortId: string | undefined, specs: SpecList): TooltipSortingFn {
  if (!seriesSortId) {
    return DEFAULT_SORTING_FN;
  }
  const seriesSortSpecs = getSpecsFromStore<SeriesSortSpec>(specs, ChartTypes.Global, SpecTypes.IndexOrder);
  const tooltipSort = seriesSortSpecs.find(({ id }) => id === seriesSortId);
  if (!tooltipSort) {
    return DEFAULT_SORTING_FN;
  }
  return (a, b) => {
    return tooltipSort.fn(a, b);
  };
}
