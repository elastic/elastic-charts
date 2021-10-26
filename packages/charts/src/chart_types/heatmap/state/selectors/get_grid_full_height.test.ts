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

import { Store } from 'redux';

import { MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { HeatmapSpec } from '../../specs';
import { getGridHeightParamsSelector } from './get_grid_full_height';

const basicSpec: Pick<HeatmapSpec, 'id' | 'data'> &
  Partial<Omit<HeatmapSpec, 'chartType' | 'specType' | 'id' | 'data'>> = {
  id: 'heatmap_id',
  xScaleType: ScaleType.Ordinal,
  data: [
    { x: '1234', y: 'ya', value: 1 },
    { x: '2345', y: 'ya', value: 2 },
    { x: '3456', y: 'ya', value: 3 },
    { x: '1234', y: 'yb', value: 4 },
    { x: '2345', y: 'yb', value: 5 },
    { x: '3456', y: 'yb', value: 6 },
    { x: '2345', y: 'yc', value: 7 },
    { x: '1234', y: 'yc', value: 8 },
    { x: '2345', y: 'yc', value: 9 },
    { x: '2345', y: 'yd', value: 7 },
    { x: '1234', y: 'yd', value: 8 },
    { x: '2345', y: 'yd', value: 9 },
    { x: '2345', y: 'ye', value: 7 },
    { x: '1234', y: 'ye', value: 8 },
    { x: '2345', y: 'ye', value: 9 },
    { x: '2345', y: 'yf', value: 7 },
    { x: '1234', y: 'yf', value: 8 },
    { x: '2345', y: 'yf', value: 9 },
    { x: '2345', y: 'yg', value: 7 },
    { x: '1234', y: 'yg', value: 8 },
    { x: '2345', y: 'yg', value: 9 },
  ],
  xAccessor: (d: any) => d.x,
  yAccessor: (d: any) => d.y,
  valueAccessor: (d: any) => d.value,
  config: {
    grid: {
      cellHeight: { max: 'fill' },
    },
    xAxisLabel: {
      visible: true,
    },
    yAxisLabel: {
      visible: true,
    },
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  },
};
describe('Calculating Grid Height', () => {
  let store: Store<GlobalChartState>;

  beforeEach(() => {
    store = MockStore.default({ width: 300, height: 200, top: 0, left: 0 }, 'chartId');
  });

  it('should give rotated text enough space', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.heatmap({
          ...basicSpec,
          config: {
            xAxisLabel: {
              labelRotation: 90,
            },
          },
        }),
      ],
      store,
    );
    const result = getGridHeightParamsSelector(store.getState());
    expect(result.height).toBe(160);
  });
  it('should give not rotated text enough space', () => {
    MockStore.addSpecs(
      [
        MockSeriesSpec.heatmap({
          ...basicSpec,
          config: {
            xAxisLabel: {
              labelRotation: 0,
            },
          },
        }),
      ],
      store,
    );
    const result = getGridHeightParamsSelector(store.getState());
    expect(result.height).toBe(176);
  });
});
