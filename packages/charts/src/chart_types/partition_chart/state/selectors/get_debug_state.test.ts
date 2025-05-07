/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from 'redux';

import { getDebugStateSelector } from './get_debug_state';
import { createOnElementClickCaller } from './on_element_click_caller';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import type {
  HeatmapElementEvent,
  LayerValue,
  PartitionElementEvent,
  WordCloudElementEvent,
  XYChartElementEvent,
} from '../../../../specs/settings';
import { onMouseDown, onMouseUp, onPointerMove } from '../../../../state/actions/mouse';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { DebugState, SinglePartitionDebugState } from '../../../../state/types';
import { noModifierKeysPressed } from '../../../../utils/keys';
import { PartitionLayout } from '../../layout/types/config_types';
import { isSunburst } from '../../layout/viewmodel/viewmodel';

describe.each([
  [PartitionLayout.sunburst, 9, 9],
  [PartitionLayout.treemap, 9, 6],
  [PartitionLayout.flame, 9, 6],
  [PartitionLayout.icicle, 9, 6],
  [PartitionLayout.mosaic, 9, 6],
])('Partition - debug state %s', (partitionLayout, numberOfElements, numberOfCalls) => {
  type TestDatum = { cat1: string; cat2: string; val: number };
  const specJSON = {
    config: {
      partitionLayout,
    },
    data: [
      { cat1: 'Asia', cat2: 'Japan', val: 1 },
      { cat1: 'Asia', cat2: 'China', val: 1 },
      { cat1: 'Europe', cat2: 'Germany', val: 1 },
      { cat1: 'Europe', cat2: 'Italy', val: 1 },
      { cat1: 'North America', cat2: 'United States', val: 1 },
      { cat1: 'North America', cat2: 'Canada', val: 1 },
    ],
    valueAccessor: (d: TestDatum) => d.val,
    layers: [
      {
        groupByRollup: (d: TestDatum) => d.cat1,
      },
      {
        groupByRollup: (d: TestDatum) => d.cat2,
      },
    ],
  };
  let store: Store<GlobalChartState>;
  let onClickListener: jest.Mock<
    undefined,
    Array<(XYChartElementEvent | PartitionElementEvent | HeatmapElementEvent | WordCloudElementEvent)[]>
  >;
  let debugState: DebugState;

  beforeEach(() => {
    onClickListener = jest.fn((): undefined => undefined);
    store = MockStore.default({ width: 500, height: 500, top: 0, left: 0 });
    const onElementClickCaller = createOnElementClickCaller();
    store.subscribe(() => {
      onElementClickCaller(store.getState());
    });
    MockStore.addSpecs(
      [
        MockSeriesSpec.sunburst(specJSON),
        MockGlobalSpec.settings({ debugState: true, onElementClick: onClickListener }),
      ],
      store,
    );
    debugState = getDebugStateSelector(store.getState());
  });

  it('can compute debug state', () => {
    // small multiple panels
    expect(debugState.partition).toHaveLength(1);
    // partition sectors
    expect(debugState.partition?.[0]?.partitions).toHaveLength(numberOfElements);
  });

  it('can click on every sector', () => {
    const { partitions } = debugState.partition![0]!;
    let counter = 0;
    for (let index = 0; index < partitions.length; index++) {
      const partition = partitions[index]!;
      if (!isSunburst(partitionLayout) && partition.depth < 2) {
        continue;
      }
      expectCorrectClickInfo(store, onClickListener, partition, counter);
      counter++;
    }
    expect(onClickListener).toHaveBeenCalledTimes(numberOfCalls);
  });
});

function expectCorrectClickInfo(
  store: Store<GlobalChartState>,
  onClickListener: jest.Mock<
    undefined,
    Array<(XYChartElementEvent | PartitionElementEvent | HeatmapElementEvent | WordCloudElementEvent)[]>
  >,
  partition: SinglePartitionDebugState,
  index: number,
) {
  const {
    depth,
    value,
    name,
    coords: [x, y],
  } = partition;

  store.dispatch(onPointerMove({ position: { x, y }, time: index * 3 }));
  store.dispatch(onMouseDown({ position: { x, y }, time: index * 3 + 1, keyPressed: noModifierKeysPressed }));
  store.dispatch(onMouseUp({ position: { x, y }, time: index * 3 + 2 }));

  expect(onClickListener).toHaveBeenCalledTimes(index + 1);
  const obj = onClickListener.mock.calls[index]![0]![0]![0] as LayerValue[];
  // pick the last element of the path
  expect(obj.at(-1)).toMatchObject({
    depth,
    groupByRollup: name,
    value,
  });
}
