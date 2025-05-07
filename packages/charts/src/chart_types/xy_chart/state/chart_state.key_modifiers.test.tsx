/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from 'redux';

import { createOnBrushEndCaller } from './selectors/on_brush_end_caller';
import { createOnClickCaller } from './selectors/on_click_caller';
import { ChartType } from '../..';
import { simulateBrushSequence, simulateClickSequence } from '../../../mocks/interactions';
import { MockGlobalSpec, MockSeriesSpec } from '../../../mocks/specs/specs';
import { createMockBrushEndListener, MockStore } from '../../../mocks/store';
import { ScaleType } from '../../../scales/constants';
import { SpecType } from '../../../specs/spec_type';
import type { GlobalChartState } from '../../../state/chart_state';
import { getModifierKeys, type KeyPressed, noModifierKeysPressed } from '../../../utils/keys';
import { SeriesType } from '../utils/specs';

const metaKeyPressed = getModifierKeys({ metaKey: true });

const linearBarSeries = MockSeriesSpec.bar({
  chartType: ChartType.XYAxis,
  specType: SpecType.Series,
  seriesType: SeriesType.Bar,
  data: [
    [0, 1],
    [1, 1],
    [2, 2],
    [3, 3],
  ],
  xAccessor: 0,
  yAccessors: [1],
  xScaleType: ScaleType.Linear,
  yScaleType: ScaleType.Linear,
});

const barSeries = MockSeriesSpec.bar({
  xAccessor: 0,
  yAccessors: [1],
  data: [
    [0, 10],
    [1, -10],
    [2, 10],
  ],
});

describe('Key Modifiers on BrushEnd', () => {
  let store: Store<GlobalChartState>;
  let mockBrushEndListener: ReturnType<typeof createMockBrushEndListener>;

  beforeEach(() => {
    store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
    mockBrushEndListener = createMockBrushEndListener();
    const mockSettingsSpec = MockGlobalSpec.settingsNoMargins({ onBrushEnd: mockBrushEndListener });
    MockStore.addSpecs([mockSettingsSpec, linearBarSeries], store);

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
    MockStore.addSpecs([mockSettingsSpec, barSeries], store);

    const onElementClickCaller = createOnClickCaller();
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
