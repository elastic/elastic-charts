/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Store } from 'redux';

import { getHighlightedTooltipTooltipValuesSelector } from './get_tooltip_values_highlighted_geoms';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { onPointerMove } from '../../../../state/actions/mouse';
import { GlobalChartState } from '../../../../state/chart_state';

describe('Highlight points', () => {
  describe('On Ordinal area chart', () => {
    let store: Store<GlobalChartState>;
    beforeEach(() => {
      store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
      MockStore.addSpecs(
        [
          MockGlobalSpec.settingsNoMargins(),
          MockSeriesSpec.area({
            data: [
              { x: 0, y: 2 },
              { x: 1, y: 2 },
              { x: 2, y: 3 },
            ],
            xScaleType: ScaleType.Ordinal,
          }),
        ],
        store,
      );
    });
    it('On ordinal area chart, it should correctly highlight points', () => {
      store.dispatch(onPointerMove({ x: 50, y: 100 }, 0));
      const { highlightedGeometries } = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(highlightedGeometries).toHaveLength(1);
    });
    it('On ordinal area chart, it should not highlight points if not within the buffer', () => {
      store.dispatch(onPointerMove({ x: 5, y: 100 }, 0));
      const { highlightedGeometries } = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(highlightedGeometries).toHaveLength(0);
    });
  });
});
