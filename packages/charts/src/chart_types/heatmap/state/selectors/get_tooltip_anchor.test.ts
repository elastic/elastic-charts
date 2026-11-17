/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from '@reduxjs/toolkit';

import { getTooltipAnchorSelector } from './get_tooltip_anchor';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { onPointerMove } from '../../../../state/actions/mouse';
import type { GlobalChartState } from '../../../../state/chart_state';

describe('Heatmap tooltip anchor', () => {
  let store: Store<GlobalChartState>;

  beforeEach(() => {
    store = MockStore.default({ width: 400, height: 300, top: 0, left: 0 }, 'chartId');
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          theme: {
            chartMargins: { left: 20, top: 20 },
            chartPaddings: { left: 20, top: 20 },
            heatmap: {
              xAxisLabel: { visible: true },
              yAxisLabel: { visible: true, width: 100 },
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
          ],
        }),
      ],
      store,
    );
  });

  it.each([
    [200, 80],
    [370, 180],
  ])('should anchor over the hovered cell at (%i, %i)', (x, y) => {
    store.dispatch(onPointerMove({ position: { x, y }, time: 0 }));
    const anchor = getTooltipAnchorSelector(store.getState());

    expect(anchor.width).toBeGreaterThan(0);
    expect(anchor.height).toBeGreaterThan(0);
    expect(x).toBeGreaterThanOrEqual(anchor.x);
    expect(x).toBeLessThan(anchor.x + anchor.width);
    expect(y).toBeGreaterThanOrEqual(anchor.y);
    expect(y).toBeLessThan(anchor.y + anchor.height);
  });
});
