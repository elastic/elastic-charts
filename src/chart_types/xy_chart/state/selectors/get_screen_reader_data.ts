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

import { ScreenReaderData } from '../../../../components/screen_reader_data_table/screen_reader_data_table';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getScreenReaderDataTableSettingsSelector } from '../../../../state/selectors/get_screen_reader_settings';
import { computeScreenReaderData } from '../utils/utils';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { getAxisSpecsSelector } from './get_specs';

/** @internal */
export const getScreenReaderDataSelector = createCachedSelector(
  [
    getScreenReaderDataTableSettingsSelector,
    computeSeriesDomainsSelector,
    computeSeriesGeometriesSelector,
    getAxisSpecsSelector,
  ],
  ({ showDefaultDescription }, seriesDomainsAndData, { scales }, axisSpecs): ScreenReaderData[] | [] => {
    if (!showDefaultDescription) {
      return [];
    }
    const { formattedDataSeries } = seriesDomainsAndData;
    return computeScreenReaderData(formattedDataSeries, scales, axisSpecs);
  },
)(getChartIdSelector);
