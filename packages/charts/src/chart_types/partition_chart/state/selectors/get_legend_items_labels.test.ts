/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from 'redux';

import { getLegendItemsLabels } from './get_legend_items_labels';
import { MockSeriesSpec, MockGlobalSpec } from '../../../../mocks/specs';
import { MockStore } from '../../../../mocks/store';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { PrimitiveValue } from '../../layout/utils/group_by_rollup';

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
      },
      {
        depth: 2,
        label: 'aa',
      },
      {
        depth: 3,
        label: '1',
      },
      {
        depth: 3,
        label: '3',
      },
      {
        depth: 2,
        label: 'bb',
      },
      {
        depth: 3,
        label: '4',
      },
      {
        depth: 3,
        label: '5',
      },
      {
        depth: 3,
        label: '6',
      },
      {
        depth: 1,
        label: 'bbb',
      },
      {
        depth: 2,
        label: 'aa',
      },
      {
        depth: 3,
        label: '7',
      },
      {
        depth: 3,
        label: '8',
      },
      {
        depth: 2,
        label: 'bb',
      },
      {
        depth: 3,
        label: '9',
      },
      {
        depth: 3,
        label: '10',
      },
      {
        depth: 2,
        label: 'cc',
      },
      {
        depth: 3,
        label: '11',
      },
      {
        depth: 3,
        label: '12',
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
      },
      {
        depth: 1,
        label: 'bbb',
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
      },
      {
        depth: 2,
        label: 'aa',
      },
      {
        depth: 2,
        label: 'bb',
      },
      {
        depth: 1,
        label: 'bbb',
      },
      {
        depth: 2,
        label: 'aa',
      },
      {
        depth: 2,
        label: 'bb',
      },
      {
        depth: 2,
        label: 'cc',
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
