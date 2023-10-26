/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createStore, Store } from 'redux';

import { partitionMultiGeometries } from './geometries';
import { createOnElementClickCaller } from './on_element_click_caller';
import { GOLDEN_RATIO } from '../../../../common/constants';
import { Predicate } from '../../../../common/predicate';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs';
import { SettingsSpec, GroupBySpec, SmallMultiplesSpec } from '../../../../specs';
import { updateParentDimensions } from '../../../../state/actions/chart_settings';
import { onMouseDown, onMouseUp, onPointerMove } from '../../../../state/actions/mouse';
import { upsertSpec, specParsed } from '../../../../state/actions/specs';
import { chartStoreReducer, GlobalChartState } from '../../../../state/chart_state';
import { Datum } from '../../../../utils/common';
import { HIERARCHY_ROOT_KEY, NULL_SMALL_MULTIPLES_KEY } from '../../layout/utils/group_by_rollup';
import { PartitionSpec } from '../../specs';

function initStore() {
  const storeReducer = chartStoreReducer('chartId');
  return createStore(storeReducer);
}

describe('Picked shapes selector', () => {
  function addSeries(store: Store<GlobalChartState>, spec: PartitionSpec, settings?: Partial<SettingsSpec>) {
    // @ts-ignore - nesting limitation
    store.dispatch(upsertSpec(MockGlobalSpec.settings(settings)));
    store.dispatch(upsertSpec(spec));
    store.dispatch(specParsed());
    store.dispatch(updateParentDimensions({ width: 300, height: 300, top: 0, left: 0 }));
  }

  function addSmallMultiplesSeries(
    store: Store<GlobalChartState>,
    groupBy: Partial<GroupBySpec>,
    sm: Partial<SmallMultiplesSpec>,
    spec: PartitionSpec,
    settings?: Partial<SettingsSpec>,
  ) {
    store.dispatch(upsertSpec(MockGlobalSpec.settings(settings)));
    store.dispatch(upsertSpec(MockGlobalSpec.groupBy(groupBy)));
    store.dispatch(upsertSpec(MockGlobalSpec.smallMultiple(sm)));
    store.dispatch(upsertSpec(spec));
    store.dispatch(specParsed());
    store.dispatch(updateParentDimensions({ width: 300, height: 300, top: 0, left: 0 }));
  }

  let store: Store<GlobalChartState>;
  let treemapSpec: PartitionSpec;
  let sunburstSpec: PartitionSpec;
  beforeEach(() => {
    store = initStore();
    const common = {
      valueAccessor: (d: { v: number }) => d.v,
      data: [
        { g1: 'a', g2: 'a', v: 1 },
        { g1: 'a', g2: 'b', v: 1 },
        { g1: 'b', g2: 'a', v: 1 },
        { g1: 'b', g2: 'b', v: 1 },
      ],
      layers: [
        {
          groupByRollup: (datum: { g1: string }) => datum.g1,
        },
        {
          groupByRollup: (datum: { g2: string }) => datum.g2,
        },
      ],
    };
    treemapSpec = MockSeriesSpec.treemap(common);
    sunburstSpec = MockSeriesSpec.sunburst(common);
  });
  test('check initial geoms', () => {
    addSeries(store, treemapSpec);
    const treemapGeometries = partitionMultiGeometries(store.getState())[0];
    expect(treemapGeometries?.quadViewModel).toHaveLength(6);

    addSeries(store, sunburstSpec);
    const sunburstGeometries = partitionMultiGeometries(store.getState())[0];
    expect(sunburstGeometries?.quadViewModel).toHaveLength(6);
  });
  test('treemap check picked geometries', () => {
    const onClickListener = jest.fn();
    addSeries(store, treemapSpec, {
      onElementClick: onClickListener,
    });
    const geometries = partitionMultiGeometries(store.getState())[0];
    expect(geometries?.quadViewModel).toHaveLength(6);

    const onElementClickCaller = createOnElementClickCaller();
    store.subscribe(() => {
      onElementClickCaller(store.getState());
    });
    store.dispatch(onPointerMove({ x: 200, y: 200 }, 0));
    store.dispatch(onMouseDown({ x: 200, y: 200 }, 1));
    store.dispatch(onMouseUp({ x: 200, y: 200 }, 2));
    expect(onClickListener).toHaveBeenCalled();
    expect(onClickListener).toHaveBeenCalledWith([
      [
        [
          {
            smAccessorValue: '',
            groupByRollup: 'b',
            value: 2,
            depth: 1,
            sortIndex: 1,
            path: [
              { index: 0, value: NULL_SMALL_MULTIPLES_KEY },
              { index: 0, value: HIERARCHY_ROOT_KEY },
              { index: 1, value: 'b' },
            ],
          },
          {
            smAccessorValue: '',
            groupByRollup: 'b',
            value: 1,
            depth: 2,
            sortIndex: 1,
            path: [
              { index: 0, value: NULL_SMALL_MULTIPLES_KEY },
              { index: 0, value: HIERARCHY_ROOT_KEY },
              { index: 1, value: 'b' },
              { index: 1, value: 'b' },
            ],
          },
        ],
        {
          specId: treemapSpec.id,
          key: `spec{${treemapSpec.id}}`,
        },
      ],
    ]);
  });
  test('small multiples pie chart check picked geometries', () => {
    const onClickListener = jest.fn();
    addSmallMultiplesSeries(
      store,
      {
        id: 'splitGB',
        by: (_, d: Datum) => d.g1,
        sort: Predicate.AlphaAsc,
        format: (d: Datum) => String(d),
      },
      { id: 'sm', splitHorizontally: 'splitGB' },
      MockSeriesSpec.sunburst({
        smallMultiples: 'sm',
        valueAccessor: (d: { v: number }) => d.v,
        data: [
          { g1: 'a', g2: 'a', v: 1 },
          { g1: 'a', g2: 'b', v: 1 },
          { g1: 'b', g2: 'a', v: 1 },
          { g1: 'b', g2: 'b', v: 1 },
        ],
        layers: [
          {
            groupByRollup: (datum: { g2: string }) => datum.g2,
          },
        ],
      }),
      {
        onElementClick: onClickListener,
      },
    );
    const geometries = partitionMultiGeometries(store.getState())[0];
    expect(geometries?.quadViewModel).toHaveLength(2);

    const onElementClickCaller = createOnElementClickCaller();
    store.subscribe(() => {
      onElementClickCaller(store.getState());
    });
    const x = 50;
    const y = 150;
    store.dispatch(onPointerMove({ x, y }, 0));
    store.dispatch(onMouseDown({ x, y }, 1));
    store.dispatch(onMouseUp({ x, y }, 2));
    expect(onClickListener).toHaveBeenCalled();
    expect(onClickListener).toHaveBeenCalledWith([
      [
        [
          {
            smAccessorValue: 'a',
            groupByRollup: 'a',
            value: 1,
            depth: 1,
            sortIndex: 0,
            path: [
              { index: 0, value: 'a' },
              { index: 0, value: HIERARCHY_ROOT_KEY },
              { index: 0, value: 'a' },
            ],
          },
        ],
        {
          specId: sunburstSpec.id,
          key: `spec{${sunburstSpec.id}}`,
        },
      ],
    ]);
  });
  test('sunburst check picked geometries', () => {
    const onClickListener = jest.fn();
    addSeries(store, sunburstSpec, {
      onElementClick: onClickListener,
      theme: {
        partition: {
          outerSizeRatio: 1 / GOLDEN_RATIO,
        },
      },
    });
    const geometries = partitionMultiGeometries(store.getState())[0];
    expect(geometries?.quadViewModel).toHaveLength(6);

    const onElementClickCaller = createOnElementClickCaller();
    store.subscribe(() => {
      onElementClickCaller(store.getState());
    });
    store.dispatch(onPointerMove({ x: 200, y: 200 }, 0));
    store.dispatch(onMouseDown({ x: 200, y: 200 }, 1));
    store.dispatch(onMouseUp({ x: 200, y: 200 }, 2));
    expect(onClickListener).toHaveBeenCalled();
    expect(onClickListener).toHaveBeenCalledWith([
      [
        [
          {
            smAccessorValue: '',
            groupByRollup: 'b',
            value: 2,
            depth: 1,
            sortIndex: 1,
            path: [
              { index: 0, value: NULL_SMALL_MULTIPLES_KEY },
              { index: 0, value: HIERARCHY_ROOT_KEY },
              { index: 1, value: 'b' },
            ],
          },
          {
            smAccessorValue: '',
            groupByRollup: 'b',
            value: 1,
            depth: 2,
            sortIndex: 1,
            path: [
              { index: 0, value: NULL_SMALL_MULTIPLES_KEY },
              { index: 0, value: HIERARCHY_ROOT_KEY },
              { index: 1, value: 'b' },
              { index: 1, value: 'b' },
            ],
          },
        ],
        {
          specId: sunburstSpec.id,
          key: `spec{${sunburstSpec.id}}`,
        },
      ],
    ]);
  });
});
