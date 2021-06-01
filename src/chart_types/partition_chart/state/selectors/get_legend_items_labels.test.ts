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

import { MockSeriesSpec, MockGlobalSpec } from '../../../../mocks/specs';
import { MockStore } from '../../../../mocks/store';
import { GlobalChartState } from '../../../../state/chart_state';
import { PrimitiveValue } from '../../layout/utils/group_by_rollup';
import { getLegendItemsLabels } from './get_legend_items_labels';

describe('Partition - Legend items labels', () => {
  type TestDatum = [string, string, string, number];
  const spec = MockSeriesSpec.sunburst({
    data: [
      ['aaa', 'aa', '1', 1],
      ['aaa', 'aa', '1', 2], // this should be filtered out
      ['aaa', 'aa', '3', 1],
      ['aaa', 'bb', '4', 1],
      ['aaa', 'bb', '5', 1],
      ['aaa', 'bb', '6', 1],
      ['bbb', 'aa', '7', 1],
      ['bbb', 'aa', '8', 1],
      ['bbb', 'bb', '9', 1],
      ['bbb', 'bb', '10', 1],
      ['bbb', 'cc', '11', 1],
      ['bbb', 'cc', '12', 1],
    ],
    valueAccessor: (d: TestDatum) => d[3],
    layers: [
      {
        groupByRollup: (datum: TestDatum) => datum[0],
        nodeLabel: (d: PrimitiveValue) => String(d),
      },
      {
        groupByRollup: (datum: TestDatum) => datum[1],
        nodeLabel: (d: PrimitiveValue) => String(d),
      },
      {
        groupByRollup: (datum: TestDatum) => datum[2],
        nodeLabel: (d: PrimitiveValue) => String(d),
      },
    ],
  });
  let store: Store<GlobalChartState>;

  beforeEach(() => {
    store = MockStore.default();
  });

  it('no filter for no legendMaxDepth + filter duplicates', () => {
    const settings = MockGlobalSpec.settings({ showLegend: true });
    MockStore.addSpecs([settings, spec], store);

    const labels = getLegendItemsLabels(store.getState());
    expect(labels).toEqual([
      {
        depth: 1,
        label: 'aaa',
        parentName: 'null',
        percentage: '54%',
        valueText: 7,
      },
      {
        depth: 2,
        label: 'aa',
        parentName: 'bbb',
        percentage: '15%',
        valueText: 2,
      },
      {
        depth: 3,
        label: '1',
        parentName: 'aa',
        percentage: '23%',
        valueText: 3,
      },
      {
        depth: 3,
        label: '3',
        parentName: 'aa',
        percentage: '8%',
        valueText: 1,
      },
      {
        depth: 2,
        label: 'bb',
        parentName: 'bbb',
        percentage: '15%',
        valueText: 2,
      },
      {
        depth: 3,
        label: '4',
        parentName: 'bb',
        percentage: '8%',
        valueText: 1,
      },
      {
        depth: 3,
        label: '5',
        parentName: 'bb',
        percentage: '8%',
        valueText: 1,
      },
      {
        depth: 3,
        label: '6',
        parentName: 'bb',
        percentage: '8%',
        valueText: 1,
      },
      {
        depth: 1,
        label: 'bbb',
        parentName: 'null',
        percentage: '46%',
        valueText: 6,
      },
      {
        depth: 3,
        label: '7',
        parentName: 'aa',
        percentage: '8%',
        valueText: 1,
      },
      {
        depth: 3,
        label: '8',
        parentName: 'aa',
        percentage: '8%',
        valueText: 1,
      },
      {
        depth: 3,
        label: '9',
        parentName: 'bb',
        percentage: '8%',
        valueText: 1,
      },
      {
        depth: 3,
        label: '10',
        parentName: 'bb',
        percentage: '8%',
        valueText: 1,
      },
      {
        depth: 2,
        label: 'cc',
        parentName: 'bbb',
        percentage: '15%',
        valueText: 2,
      },
      {
        depth: 3,
        label: '11',
        parentName: 'cc',
        percentage: '8%',
        valueText: 1,
      },
      {
        depth: 3,
        label: '12',
        parentName: 'cc',
        percentage: '8%',
        valueText: 1,
      },
    ]);
  });

  it('filters labels at the first layer', () => {
    const settings = MockGlobalSpec.settings({ showLegend: true, legendMaxDepth: 1 });
    MockStore.addSpecs([settings, spec], store);

    const labels = getLegendItemsLabels(store.getState());
    expect(labels).toEqual([
      {
        depth: 1,
        label: 'aaa',
        parentName: 'null',
        percentage: '54%',
        valueText: 7,
      },
      {
        depth: 1,
        label: 'bbb',
        parentName: 'null',
        percentage: '46%',
        valueText: 6,
      },
    ]);
  });

  it('filters labels at the second layer', () => {
    const settings = MockGlobalSpec.settings({ showLegend: true, legendMaxDepth: 2 });
    MockStore.addSpecs([settings, spec], store);

    const labels = getLegendItemsLabels(store.getState());
    expect(labels).toEqual([
      {
        depth: 1,
        label: 'aaa',
        parentName: 'null',
        percentage: '54%',
        valueText: 7,
      },
      {
        depth: 2,
        label: 'aa',
        parentName: 'bbb',
        percentage: '15%',
        valueText: 2,
      },
      {
        depth: 2,
        label: 'bb',
        parentName: 'bbb',
        percentage: '15%',
        valueText: 2,
      },
      {
        depth: 1,
        label: 'bbb',
        parentName: 'null',
        percentage: '46%',
        valueText: 6,
      },
      {
        depth: 2,
        label: 'cc',
        parentName: 'bbb',
        percentage: '15%',
        valueText: 2,
      },
    ]);
  });

  it('filters all labels is depth is 0', () => {
    const settings = MockGlobalSpec.settings({ showLegend: true, legendMaxDepth: 0 });
    MockStore.addSpecs([settings, spec], store);

    const labels = getLegendItemsLabels(store.getState());
    expect(labels).toEqual([]);
  });
  it('filters all labels is depth is NaN', () => {
    const settings = MockGlobalSpec.settings({ showLegend: true, legendMaxDepth: NaN });
    MockStore.addSpecs([settings, spec], store);

    const labels = getLegendItemsLabels(store.getState());
    expect(labels).toEqual([]);
  });
});
