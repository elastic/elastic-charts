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
import { getScreenReaderDataTableSettings } from '../../../../state/selectors/get_screen_reader_settings';
import { computeSeriesDomainsSelector } from './compute_series_domains';

/** @internal */
export const getScreenReaderDataSelector = createCachedSelector(
  [getScreenReaderDataTableSettings, computeSeriesDomainsSelector],
  ({ showDataTable }, seriesDomainsAndData): ScreenReaderData[] | [] => {
    if (!showDataTable) {
      return [];
    }
    const { formattedDataSeries } = seriesDomainsAndData;
    const dataForScreenReader = [];

    dataForScreenReader.push(computeScreenReaderData(formattedDataSeries));
  },
)(getChartIdSelector);

function computeScreenReaderData(data: any): ScreenReaderData[] {
  getChartIdSelector(chartId);
  return dataForScreenReader;
}
