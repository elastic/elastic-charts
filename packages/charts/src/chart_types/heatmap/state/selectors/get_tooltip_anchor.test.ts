/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from '@reduxjs/toolkit';

import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getTooltipAnchorSelector } from './get_tooltip_anchor';
import { getPickedShapes } from './picked_shapes';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { onPointerMove } from '../../../../state/actions/mouse';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { Cell } from '../../layout/types/viewmodel_types';

describe('Heatmap tooltip anchor', () => {
  let store: Store<GlobalChartState>;

  beforeEach(() => {
    store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          theme: {
            heatmap: {
              xAxisLabel: { visible: true },
              yAxisLabel: { visible: true },
            },
          },
        }),
        MockSeriesSpec.heatmap({
          xScale: { type: ScaleType.Ordinal },
          data: [
            { x: 'a', y: 'ya', value: 1 },
            { x: 'b', y: 'ya', value: 2 },
            { x: 'a', y: 'yb', value: 3 },
            { x: 'b', y: 'yb', value: 4 },
          ],
        }),
      ],
      store,
    );
  });

  it('should match the hovered cell when y axis labels are visible', () => {
    const { chartDimensions } = computeChartDimensionsSelector(store.getState());
    // the y axis labels take some horizontal space on the left
    expect(chartDimensions.left).toBeGreaterThan(0);

    store.dispatch(
      onPointerMove({
        position: { x: chartDimensions.left + 10, y: chartDimensions.top + 10 },
        time: 0,
      }),
    );

    const [cell] = getPickedShapes(store.getState()) as Cell[];
    expect(cell).toBeDefined();

    expect(getTooltipAnchorSelector(store.getState())).toEqual({
      x: chartDimensions.left + cell!.x,
      y: chartDimensions.top + cell!.y,
      width: cell!.width,
      height: cell!.height,
    });
  });
});
