/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Store } from 'redux';

import { getLegendItemsValues } from './get_legend_items_values';
import { MockSeriesSpec, MockGlobalSpec } from '../../../../mocks/specs';
import { MockStore } from '../../../../mocks/store';
import { GlobalChartState } from '../../../../state/chart_state';
import { PrimitiveValue } from '../../layout/utils/group_by_rollup';

describe('Partition - Legend item values', () => {
  type TestDatum = [string, string, string, number];
  const spec = MockSeriesSpec.sunburst({
    data: [
      ['aaa', 'aa', '1', 1],
      ['aaa', 'aa', '1', 2],
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

  it('should return all values in nested legend', () => {
    MockStore.addSpecs([spec], store);

    const values = getLegendItemsValues(store.getState());
    expect([...values.keys()]).toEqual([
      '0__0',
      '0__0__0',
      '0__0__0__0',
      '0__0__0__0__0',
      '0__0__0__0__1',
      '0__0__0__1',
      '0__0__0__1__0',
      '0__0__0__1__1',
      '0__0__0__1__2',
      '0__0__1',
      '0__0__1__0',
      '0__0__1__0__0',
      '0__0__1__0__1',
      '0__0__1__1',
      '0__0__1__1__0',
      '0__0__1__1__1',
      '0__0__1__2',
      '0__0__1__2__0',
      '0__0__1__2__1',
    ]);
    expect(values.values()).toMatchSnapshot();
  });

  it('should return values in nested legend within max depth of 1', () => {
    const settings = MockGlobalSpec.settings({ legendMaxDepth: 1 });
    MockStore.addSpecs([settings, spec], store);

    const values = getLegendItemsValues(store.getState());
    expect([...values.keys()]).toEqual(['0__0', '0__0__0', '0__0__1']);
    expect(values.values()).toMatchSnapshot();
  });

  it('should return values in nested legend within max depth of 2', () => {
    const settings = MockGlobalSpec.settings({ legendMaxDepth: 2 });
    MockStore.addSpecs([settings, spec], store);

    const values = getLegendItemsValues(store.getState());
    expect([...values.keys()]).toEqual([
      '0__0',
      '0__0__0',
      '0__0__0__0',
      '0__0__0__1',
      '0__0__1',
      '0__0__1__0',
      '0__0__1__1',
      '0__0__1__2',
    ]);
    expect(values.values()).toMatchSnapshot();
  });

  it('filters all values if depth is 0', () => {
    const settings = MockGlobalSpec.settings({ legendMaxDepth: 0 });
    MockStore.addSpecs([settings, spec], store);

    const values = getLegendItemsValues(store.getState());
    expect([...values.keys()]).toEqual([]);
  });

  it('filters all values if depth is NaN', () => {
    const settings = MockGlobalSpec.settings({ legendMaxDepth: NaN });
    MockStore.addSpecs([settings, spec], store);

    const values = getLegendItemsValues(store.getState());
    expect([...values.keys()]).toEqual([]);
  });
});
