/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from 'redux';

import { createOnBrushEndCaller } from './on_brush_end_caller';
import { createOnElementClickCaller } from './on_element_click_caller';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { createMockBrushEndListener, MockStore } from '../../../../mocks/store';
import { ScaleType } from '../../../../scales/constants';
import { onMouseDown, onMouseUp, onPointerMove } from '../../../../state/actions/mouse';
import type { GlobalChartState } from '../../../../state/chart_state';
import { getModifierKeys, type KeyPressed, noModifierKeysPressed } from '../../../../utils/keys';

type BrushEventTestCase = {
  description: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  /**
   * An array of three timestamps representing:
   * - The time when the brush started.
   * - The time during the brush movement.
   * - The time when the brush ended.
   */
  time: [number, number, number];
  /**
   * An array of four `KeyPressed` states representing:
   * - The key state when the brush started.
   * - The key state during the brush movement.
   * - The key state when the brush ended.
   * - The expected key state passed to the listener.
   *
   * We should only consider the modifier keys that were pressed during the mouseDown event,
   * which marks the start of the sequence. Any changes to the keyPressed state that occur
   * during the sequence (e.g., during pointerMove or mouseUp) should be ignored.
   */
  keys: [KeyPressed, KeyPressed, KeyPressed, KeyPressed];
};

const metaKeyPressed = getModifierKeys({ metaKey: true });

const hearmapSeriesSpec = MockSeriesSpec.heatmap({
  xScale: { type: ScaleType.Ordinal },
  data: [
    { x: 'a', y: 'ya', value: 1 },
    { x: 'b', y: 'ya', value: 2 },
    { x: 'c', y: 'ya', value: 3 },
    { x: 'a', y: 'yb', value: 4 },
    { x: 'b', y: 'yb', value: 5 },
    { x: 'c', y: 'yb', value: 6 },
    { x: 'a', y: 'yc', value: 7 },
    { x: 'b', y: 'yc', value: 8 },
    { x: 'c', y: 'yc', value: 9 },
  ],
});

const POSITION = { x: 50, y: 75 };

const START_POSITION_1 = { x: 0, y: 0 };
const END_POSITION_1 = { x: 75, y: 0 };

const START_POSITION_2 = { x: 75, y: 0 };
const END_POSITION_2 = { x: 100, y: 0 };

describe('Key Modifiers on BrushEnd', () => {
  let store: Store<GlobalChartState>;
  let mockBrushEndListener: ReturnType<typeof createMockBrushEndListener>;

  beforeEach(() => {
    store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
    mockBrushEndListener = createMockBrushEndListener();
    const mockSettingsSpec = MockGlobalSpec.settingsNoMargins({ onBrushEnd: mockBrushEndListener });
    MockStore.addSpecs([mockSettingsSpec, hearmapSeriesSpec], store);

    const onBrushCaller = createOnBrushEndCaller();
    store.subscribe(() => {
      onBrushCaller(store.getState());
    });
  });

  const testCases = [
    {
      description: 'no modifier key pressed during the entire brush sequence',
      start: START_POSITION_1,
      end: END_POSITION_1,
      time: [0, 200, 300],
      keys: [noModifierKeysPressed, noModifierKeysPressed, noModifierKeysPressed, noModifierKeysPressed],
    },
    {
      description: 'modifier key released mid-brush',
      start: START_POSITION_2,
      end: END_POSITION_2,
      time: [400, 500, 600],
      keys: [metaKeyPressed, noModifierKeysPressed, noModifierKeysPressed, metaKeyPressed],
    },
    {
      description: 'modifier key pressed at the end of the brush event',
      start: { x: 75, y: 0 },
      end: { x: 2500, y: 0 },
      time: [700, 800, 900],
      keys: [noModifierKeysPressed, noModifierKeysPressed, metaKeyPressed, noModifierKeysPressed],
    },
    {
      description: 'modifier key pressed mid-brush',
      start: { x: 25, y: 0 },
      end: { x: -20, y: 0 },
      time: [1000, 1100, 1200],
      keys: [noModifierKeysPressed, metaKeyPressed, noModifierKeysPressed, noModifierKeysPressed],
    },
    {
      description: 'modifier key pressed during the entire brush sequence',
      start: { x: 75, y: 0 },
      end: { x: 2500, y: 0 },
      time: [1300, 1400, 1500],
      keys: [metaKeyPressed, metaKeyPressed, metaKeyPressed, metaKeyPressed],
    },
  ] satisfies BrushEventTestCase[];

  test.each(testCases)('should handle $description', ({ start, end, time, keys }) => {
    store.dispatch(onMouseDown({ position: start, time: time[0], keyPressed: keys[0] }));
    store.dispatch(onPointerMove({ position: end, time: time[1], keyPressed: keys[1] }));
    store.dispatch(onMouseUp({ position: end, time: time[2], keyPressed: keys[2] }));

    expect(mockBrushEndListener).toHaveBeenCalledTimes(1);
    expect(mockBrushEndListener).toHaveBeenCalledWith(expect.anything(), { keyPressed: keys[3] });
  });
});

describe('Key Modifiers on ElementClick', () => {
  let store: Store<GlobalChartState>;
  let mockOnElementClick: jest.Mock<void, any[]>;

  beforeEach(() => {
    store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
    mockOnElementClick = jest.fn<void, any[]>((): void => undefined);
    const mockSettingsSpec = MockGlobalSpec.settingsNoMargins({ onElementClick: mockOnElementClick });
    MockStore.addSpecs([mockSettingsSpec, hearmapSeriesSpec], store);

    const onElementClickCaller = createOnElementClickCaller();
    store.subscribe(() => {
      onElementClickCaller(store.getState());
    });
  });

  test('should handle multiple brush sequences with different modifier keys', () => {
    store.dispatch(onPointerMove({ position: POSITION, time: 0, keyPressed: noModifierKeysPressed }));
    store.dispatch(onMouseDown({ position: POSITION, time: 100, keyPressed: metaKeyPressed }));
    store.dispatch(onMouseUp({ position: POSITION, time: 200, keyPressed: noModifierKeysPressed }));

    expect(mockOnElementClick).toHaveBeenCalledTimes(1);
    expect(mockOnElementClick).toHaveBeenNthCalledWith(1, expect.anything(), { keyPressed: metaKeyPressed });

    store.dispatch(onPointerMove({ position: POSITION, time: 300, keyPressed: noModifierKeysPressed }));
    store.dispatch(onMouseDown({ position: POSITION, time: 400, keyPressed: noModifierKeysPressed }));
    store.dispatch(onMouseUp({ position: POSITION, time: 500, keyPressed: noModifierKeysPressed }));

    expect(mockOnElementClick).toHaveBeenCalledTimes(2);
    expect(mockOnElementClick).toHaveBeenNthCalledWith(2, expect.anything(), { keyPressed: noModifierKeysPressed });
  });
});
