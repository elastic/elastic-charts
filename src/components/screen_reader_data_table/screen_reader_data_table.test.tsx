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

import { mount } from 'enzyme';
import React from 'react';

import { ScaleType } from '../../scales/constants';
import { Settings, BarSeries, LineSeries, AreaSeries } from '../../specs';
import { CurveType } from '../../utils/curves';
import { BARCHART_1Y0G } from '../../utils/data_samples/test_dataset';
import { Chart } from '../chart';
import { ScreenReaderDataTable, ScreenReaderDataTableComponent } from './screen_reader_data_table';

describe('Screen reader data table', () => {
  it('will render a table when showDataTable is true for bars charts', () => {
    const wrapper = mount(
      <Chart>
        <Settings dataTable={{ showDataTable: true }} />
        <BarSeries
          id="bar"
          name="bar chart"
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          data={BARCHART_1Y0G}
        />
      </Chart>,
    );
    const tableWrapper = wrapper.find(ScreenReaderDataTable);
    expect(tableWrapper.exists).toBeTruthy();
    // expect 1 series
    expect(tableWrapper.length).toEqual(1);
    // 4 x values 4 y values
    expect(tableWrapper.find('td')).toHaveLength(8);
  });
  it('will render a table when showData is true for line charts', () => {
    const wrapper = mount(
      <Chart>
        <Settings dataTable={{ showDataTable: true }} />
        <LineSeries
          id="line"
          name="line chart"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          data={[
            { x: 0, y: 0 },
            { x: 10, y: 10 },
          ]}
        />
      </Chart>,
    );
    const tableWrapper = wrapper.find(ScreenReaderDataTable);
    expect(tableWrapper.exists).toBeTruthy();
    // expect 1 series
    expect(tableWrapper.length).toEqual(1);
    // 2 x values 2 y values
    expect(tableWrapper.find('td')).toHaveLength(4);
  });
  it('will render a table when showData is true for area charts', () => {
    const wrapper = mount(
      <Chart>
        <Settings dataTable={{ showDataTable: true }} />
        <AreaSeries
          id="areas"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          curve={CurveType.CURVE_MONOTONE_X}
          data={[
            { x: 0, y: 2.5 },
            { x: 1, y: 7 },
            { x: 2, y: 3 },
            { x: 3, y: 6 },
          ]}
        />
      </Chart>,
    );
    const tableWrapper = wrapper.find(ScreenReaderDataTable);
    expect(tableWrapper.exists).toBeTruthy();
    // expect 1 series
    expect(tableWrapper.length).toEqual(1);
    expect(tableWrapper.find('td')).toHaveLength(8);
  });
  it('will render a data table with information for more than 1 series', () => {
    const wrapper = mount(
      <Chart className="story-chart">
        <Settings dataTable={{ showDataTable: true }} showLegend />
        <AreaSeries
          id="areas"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          curve={CurveType.CURVE_MONOTONE_X}
          data={[
            { x: 0, y: 2.5 },
            { x: 1, y: 7 },
            { x: 2, y: 3 },
            { x: 3, y: 6 },
          ]}
        />
        <LineSeries
          id="line"
          name="line chart"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          data={[
            { x: 0, y: 0 },
            { x: 1, y: 2 },
            { x: 3, y: 1 },
            { x: 4, y: 2 },
          ]}
        />
        <BarSeries
          id="bars"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          stackAccessors={['x']}
          data={[
            { x: 0, y: 2 },
            { x: 1, y: 7 },
            { x: 2, y: 3 },
            { x: 3, y: 6 },
          ]}
        />
      </Chart>,
    );
    const tableWrapper = wrapper.find(ScreenReaderDataTableComponent);
    expect(tableWrapper.exists).toBeTruthy();
    // from the renderText of the component
    expect(tableWrapper.html().includes(`This chart has a total of 3 series.`)).toBeTruthy();
  });
});
