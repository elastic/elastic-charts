/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { configureStore } from '@reduxjs/toolkit';
import { Store } from 'redux';

import { getHighlightedTooltipTooltipValuesSelector } from './selectors/get_tooltip_values_highlighted_geoms';
import { MockSeriesSpec, MockGlobalSpec } from '../../../mocks/specs';
import { TooltipType } from '../../../specs/constants';
import { updateParentDimensions } from '../../../state/actions/chart_settings';
import { onPointerMove } from '../../../state/actions/mouse';
import { upsertSpec, specParsed } from '../../../state/actions/specs';
import { chartSlice } from '../../../state/chart_state';
import { GlobalChartState } from '../../../state/chart_state';

describe('XYChart - State tooltips', () => {
  let store: Store<GlobalChartState>;
  beforeEach(() => {
    store = configureStore({
      reducer: chartSlice.reducer,
    });
    store.dispatch(
      upsertSpec(
        MockSeriesSpec.bar({
          data: [
            { x: 1, y: 10 },
            { x: 2, y: 5 },
          ],
        }),
      ),
    );
    store.dispatch(upsertSpec(MockGlobalSpec.settings()));
    store.dispatch(specParsed());
    store.dispatch(updateParentDimensions({ width: 100, height: 100, top: 0, left: 0 }));
  });

  describe('should compute tooltip values depending on tooltip type', () => {
    it.each<[TooltipType, number, boolean, number]>([
      [TooltipType.None, 0, true, 0],
      [TooltipType.Follow, 1, false, 1],
      [TooltipType.VerticalCursor, 1, false, 1],
      [TooltipType.Crosshairs, 1, false, 1],
    ])('tooltip type %s', (tooltipType, expectedHgeomsLength, expectHeader, expectedTooltipValuesLength) => {
      store.dispatch(onPointerMove({ position: { x: 25, y: 50 }, time: 0 }));
      store.dispatch(
        upsertSpec(
          MockGlobalSpec.tooltip({
            type: tooltipType,
          }),
        ),
      );
      store.dispatch(
        upsertSpec(
          MockSeriesSpec.bar({
            data: [
              { x: 1, y: 10 },
              { x: 2, y: 5 },
            ],
          }),
        ),
      );
      store.dispatch(specParsed());
      const state = store.getState();
      const tooltipValues = getHighlightedTooltipTooltipValuesSelector(state);
      expect(tooltipValues.tooltip.values).toHaveLength(expectedTooltipValuesLength);
      expect(tooltipValues.tooltip.header === null).toBe(expectHeader);
      expect(tooltipValues.highlightedGeometries).toHaveLength(expectedHgeomsLength);
    });
  });
});
