/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DateTime } from 'luxon';
import { Store } from 'redux';

import { createOnBrushEndCaller } from './on_brush_end_caller';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { onMouseDown, onMouseUp, onPointerMove } from '../../../../state/actions/mouse';
import { GlobalChartState } from '../../../../state/chart_state';

describe('Categorical heatmap brush', () => {
  let store: Store<GlobalChartState>;
  const onBrushEndMock = jest.fn();

  beforeEach(() => {
    store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          theme: {
            heatmap: {
              xAxisLabel: {
                visible: false,
              },
              yAxisLabel: {
                visible: false,
              },
            },
          },
          onBrushEnd: onBrushEndMock,
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

  it('should brush on categorical scale', () => {
    const caller = createOnBrushEndCaller();
    store.dispatch(onPointerMove({ x: 50, y: 50 }, 0));
    store.dispatch(onMouseDown({ x: 50, y: 50 }, 100));
    store.dispatch(onPointerMove({ x: 150, y: 250 }, 200));
    store.dispatch(onMouseUp({ x: 150, y: 250 }, 300));
    caller(store.getState());
    expect(onBrushEndMock).toHaveBeenCalledTimes(1);
    const brushEvent = onBrushEndMock.mock.calls[0][0];
    expect(brushEvent.cells).toHaveLength(6);
    expect(brushEvent.x).toEqual(['a', 'b']);
    expect(brushEvent.y).toEqual(['ya', 'yb', 'yc']);
  });
});
describe('Temporal heatmap brush', () => {
  let store: Store<GlobalChartState>;
  let onBrushEndMock = jest.fn();
  const start = DateTime.fromISO('2021-07-01T00:00:00', { zone: 'Europe/Rome' });
  beforeEach(() => {
    store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
    onBrushEndMock = jest.fn();
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          theme: {
            heatmap: {
              xAxisLabel: {
                visible: false,
              },
              yAxisLabel: {
                visible: false,
              },
            },
          },
          onBrushEnd: onBrushEndMock,
        }),
        MockSeriesSpec.heatmap({
          xScale: { type: ScaleType.Time, interval: { type: 'fixed', unit: 'h', value: 24 } },
          data: [
            { x: start.toMillis(), y: 'ya', value: 1 },
            { x: start.plus({ days: 1 }).toMillis(), y: 'ya', value: 2 },
            { x: start.plus({ days: 2 }).toMillis(), y: 'ya', value: 3 },
            { x: start.toMillis(), y: 'yb', value: 4 },
            { x: start.plus({ days: 1 }).toMillis(), y: 'yb', value: 5 },
            { x: start.plus({ days: 2 }).toMillis(), y: 'yb', value: 6 },
            { x: start.toMillis(), y: 'yc', value: 7 },
            { x: start.plus({ days: 1 }).toMillis(), y: 'yc', value: 8 },
            { x: start.plus({ days: 2 }).toMillis(), y: 'yc', value: 9 },
          ],
          timeZone: 'Europe/Rome',
        }),
      ],
      store,
    );
  });

  it('should brush above every cell', () => {
    const caller = createOnBrushEndCaller();
    store.dispatch(onPointerMove({ x: 50, y: 50 }, 0));
    store.dispatch(onMouseDown({ x: 50, y: 50 }, 100));
    store.dispatch(onPointerMove({ x: 250, y: 250 }, 200));
    store.dispatch(onMouseUp({ x: 250, y: 250 }, 300));
    caller(store.getState());
    expect(onBrushEndMock).toHaveBeenCalledTimes(1);
    const brushEvent = onBrushEndMock.mock.calls[0][0];
    expect(brushEvent.cells).toHaveLength(9);
    // it covers from the beginning of the cell to the end of the next cell
    expect(brushEvent.x).toEqual([start.toMillis(), start.plus({ days: 3 }).toMillis()]);
    expect(brushEvent.y).toEqual(['ya', 'yb', 'yc']);
  });
  it('should brush on the x scale + minInterval on a single cell', () => {
    const caller = createOnBrushEndCaller();
    store.dispatch(onPointerMove({ x: 50, y: 50 }, 0));
    store.dispatch(onMouseDown({ x: 50, y: 50 }, 100));
    store.dispatch(onPointerMove({ x: 60, y: 60 }, 200));
    store.dispatch(onMouseUp({ x: 60, y: 60 }, 300));
    caller(store.getState());
    expect(onBrushEndMock).toHaveBeenCalledTimes(1);
    const brushEvent = onBrushEndMock.mock.calls[0][0];
    expect(brushEvent.cells).toHaveLength(1);
    // it covers from the beginning of the cell to the end of the next cell
    expect(brushEvent.x).toEqual([start.toMillis(), start.plus({ days: 1 }).toMillis()]);
    expect(brushEvent.y).toEqual(['ya']);
  });
});
