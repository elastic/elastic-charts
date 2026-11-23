/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from '@reduxjs/toolkit';

import { getCursorBandPositionSelector } from './get_cursor_band';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { onExternalPointerEvent } from '../../../../state/actions/events';
import type { GlobalChartState } from '../../../../state/chart_state';

function getCursorBand(store: Store<GlobalChartState>, x: number) {
  store.dispatch(
    onExternalPointerEvent({
      chartId: 'otherChart',
      scale: ScaleType.Linear,
      type: 'Over',
      unit: undefined,
      x,
      y: [],
      smVerticalValue: null,
      smHorizontalValue: null,
    }),
  );
  return getCursorBandPositionSelector(store.getState());
}

describe('Linear raster heatmap cursor band', () => {
  let store: Store<GlobalChartState>;

  beforeEach(() => {
    store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          theme: {
            heatmap: {
              grid: { stroke: { width: 0 } },
              xAxisLabel: { visible: false },
              yAxisLabel: { visible: false },
            },
          },
        }),
        MockSeriesSpec.heatmap({
          xScale: { type: ScaleType.Linear, interval: 10 },
          data: [
            { x: 0, y: 'ya', value: 1 },
            { x: 20, y: 'ya', value: 2 },
          ],
        }),
      ],
      store,
    );
  });

  it('should highlight the bin containing the external pointer', () => {
    expect(getCursorBand(store, 15)).toMatchObject({ x: 100, width: 100 });
  });

  it('should highlight the bin starting at the external pointer', () => {
    expect(getCursorBand(store, 20)).toMatchObject({ x: 200, width: 100 });
  });

  it('should not highlight any bin when the external pointer is outside the bins', () => {
    expect(getCursorBand(store, -1)).toBeUndefined();
    expect(getCursorBand(store, 30)).toBeUndefined();
  });
});

describe('Decimal linear raster heatmap cursor band', () => {
  let store: Store<GlobalChartState>;

  beforeEach(() => {
    store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          theme: {
            heatmap: {
              grid: { stroke: { width: 0 } },
              xAxisLabel: { visible: false },
              yAxisLabel: { visible: false },
            },
          },
        }),
        MockSeriesSpec.heatmap({
          xScale: { type: ScaleType.Linear, interval: 0.1 },
          data: [
            { x: 0.1, y: 'ya', value: 1 },
            { x: 0.3, y: 'ya', value: 2 },
          ],
        }),
      ],
      store,
    );
  });

  it('should highlight the 0.3 bin for computed values with floating point errors', () => {
    expect(getCursorBand(store, 0.1 * 3)).toMatchObject({ x: 200, width: 100 });
    expect(getCursorBand(store, 0.7 - 0.4)).toMatchObject({ x: 200, width: 100 });
  });
});
