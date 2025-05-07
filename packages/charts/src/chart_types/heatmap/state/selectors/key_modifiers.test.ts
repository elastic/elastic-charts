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
import { simulateBrushSequence, simulateClickSequence } from '../../../../mocks/interactions';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { createMockBrushEndListener, MockStore } from '../../../../mocks/store';
import { ScaleType } from '../../../../scales/constants';
import type { GlobalChartState } from '../../../../state/chart_state';
import { getModifierKeys, type KeyPressed, noModifierKeysPressed } from '../../../../utils/keys';

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

  it('should call the brush end listener with no modifier keys pressed when keyPressed is not explicitly passed', () => {
    simulateBrushSequence({ store });
    verifyListenerCall(mockBrushEndListener, noModifierKeysPressed);
  });

  it('should call the brush end listener with the correct modifier keys', () => {
    simulateBrushSequence({ store, keysOnMouseDown: metaKeyPressed });
    verifyListenerCall(mockBrushEndListener, metaKeyPressed);

    simulateBrushSequence({ store, time: [300, 400, 500], keysOnMouseDown: noModifierKeysPressed });
    verifyListenerCall(mockBrushEndListener, noModifierKeysPressed, 2);
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

  it('should call the element click listener with no modifier keys pressed when keyPressed is not explicitly passed', () => {
    simulateClickSequence({ store });
    verifyListenerCall(mockOnElementClick, noModifierKeysPressed);
  });

  it('should call the element click listener with the correct modifier keys', () => {
    simulateClickSequence({ store, keysOnMouseDown: metaKeyPressed });
    verifyListenerCall(mockOnElementClick, metaKeyPressed);

    simulateClickSequence({ store, time: [300, 400, 500], keysOnMouseDown: metaKeyPressed });
    verifyListenerCall(mockOnElementClick, metaKeyPressed, 2);
  });
});

function verifyListenerCall(mockListener: jest.Mock, expectedKeyPressed: KeyPressed, numberOfCalls: number = 1) {
  expect(mockListener).toHaveBeenCalledTimes(numberOfCalls);
  expect(mockListener).toHaveBeenNthCalledWith(numberOfCalls, expect.anything(), { keyPressed: expectedKeyPressed });
}
