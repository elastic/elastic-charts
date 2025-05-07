/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from 'redux';

import { createOnBrushEndCaller } from './on_brush_end_caller';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { onPointerMove, onMouseDown, onMouseUp } from '../../../../state/actions/mouse';
import type { GlobalChartState } from '../../../../state/chart_state';
import { noModifierKeysPressed } from '../../../../utils/keys';

describe('Heatmap picked cells', () => {
  let store: Store<GlobalChartState>;
  let onBrushEndMock = jest.fn();

  beforeEach(() => {
    store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
    onBrushEndMock = jest.fn();
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          onBrushEnd: onBrushEndMock,
          theme: {
            heatmap: {
              brushTool: { visible: true },
              xAxisLabel: {
                visible: true,
              },
              yAxisLabel: {
                visible: true,
              },
            },
          },
        }),
        MockSeriesSpec.heatmap({
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
        }),
      ],
      store,
    );
  });

  it('should pick cells', () => {
    const caller = createOnBrushEndCaller();
    store.dispatch(onPointerMove({ position: { x: 50, y: 50 }, time: 0 }));
    store.dispatch(onMouseDown({ position: { x: 50, y: 50 }, time: 100, keyPressed: noModifierKeysPressed }));
    store.dispatch(onPointerMove({ position: { x: 150, y: 250 }, time: 200 }));
    store.dispatch(onMouseUp({ position: { x: 150, y: 250 }, time: 300 }));
    caller(store.getState());
    const brushEvent = onBrushEndMock.mock.calls[0][0];
    expect(brushEvent.x.length).toBe(2);
  });
  it('should not include x values if only dragging along y-axis', () => {
    const caller = createOnBrushEndCaller();
    store.dispatch(onPointerMove({ position: { x: 0, y: 50 }, time: 0 }));
    store.dispatch(onMouseDown({ position: { x: 0, y: 50 }, time: 100, keyPressed: noModifierKeysPressed }));
    store.dispatch(onPointerMove({ position: { x: 0, y: 20 }, time: 200 }));
    store.dispatch(onMouseUp({ position: { x: 0, y: 20 }, time: 300 }));
    caller(store.getState());
    const brushEvent = onBrushEndMock.mock.calls[0][0];
    expect(brushEvent.x.length).toBe(0);
  });
});
