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

import { createStore, Store } from 'redux';

import { MockSeriesSpec } from '../../../mocks/specs';
import { MockStore } from '../../../mocks/store';
import { GlobalChartState, chartStoreReducer } from '../../../state/chart_state';
import { getLegendItemsSelector } from '../../../state/selectors/get_legend_items';

const data = [
  { x: 0, y: 10 },
  { x: 1, y: 10 },
];

describe('XYChart - specs ordering', () => {
  let store: Store<GlobalChartState>;
  beforeEach(() => {
    const storeReducer = chartStoreReducer('chartId');
    store = createStore(storeReducer);
  });

  it('the legend respect the insert [A, B, C] order', () => {
    MockStore.addSpecs([
      MockSeriesSpec.bar({ id: 'A', data }),
      MockSeriesSpec.bar({ id: 'B', data }),
      MockSeriesSpec.bar({ id: 'C', data }),
    ], store);

    const legendItems = getLegendItemsSelector(store.getState());
    const names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['A', 'B', 'C']);
  });
  it('the legend respect the insert order [B, A, C]', () => {
    MockStore.addSpecs([
      MockSeriesSpec.bar({ id: 'B', data }),
      MockSeriesSpec.bar({ id: 'A', data }),
      MockSeriesSpec.bar({ id: 'C', data }),
    ], store);
    const legendItems = getLegendItemsSelector(store.getState());
    const names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['B', 'A', 'C']);
  });
  it('the legend respect the order when changing properties of existing specs', () => {
    MockStore.addSpecs([
      MockSeriesSpec.bar({ id: 'A', data }),
      MockSeriesSpec.bar({ id: 'B', data }),
      MockSeriesSpec.bar({ id: 'C', data }),
    ], store);

    let legendItems = getLegendItemsSelector(store.getState());
    let names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['A', 'B', 'C']);

    MockStore.addSpecs([
      MockSeriesSpec.bar({ id: 'A', data }),
      MockSeriesSpec.bar({ id: 'B', name: 'B updated', data }),
      MockSeriesSpec.bar({ id: 'C', data }),
    ], store);

    legendItems = getLegendItemsSelector(store.getState());
    names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['A', 'B updated', 'C']);
  });
  it('the legend respect the order when changing the order of the specs', () => {
    MockStore.addSpecs([
      MockSeriesSpec.bar({ id: 'A', data }),
      MockSeriesSpec.bar({ id: 'B', data }),
      MockSeriesSpec.bar({ id: 'C', data }),
    ], store);
    let legendItems = getLegendItemsSelector(store.getState());
    let names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['A', 'B', 'C']);

    MockStore.addSpecs([
      MockSeriesSpec.bar({ id: 'B', data }),
      MockSeriesSpec.bar({ id: 'A', data }),
      MockSeriesSpec.bar({ id: 'C', data }),
    ], store);

    legendItems = getLegendItemsSelector(store.getState());
    names = [...legendItems.values()].map((item) => item.label);
    expect(names).toEqual(['B', 'A', 'C']);
  });
});
