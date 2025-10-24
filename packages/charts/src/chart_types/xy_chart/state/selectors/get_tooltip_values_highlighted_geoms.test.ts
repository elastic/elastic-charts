/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from 'redux';

import { getHighlightedTooltipTooltipValuesSelector } from './get_tooltip_values_highlighted_geoms';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { onPointerMove } from '../../../../state/actions/mouse';
import type { GlobalChartState } from '../../../../state/chart_state';

describe('Highlight points', () => {
  describe('On Ordinal area chart', () => {
    let store: Store<GlobalChartState>;
    beforeEach(() => {
      store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
      MockStore.addSpecs(
        [
          MockGlobalSpec.settingsNoMargins(),
          MockGlobalSpec.yAxis({ id: 'y', domain: { min: 0, max: NaN } }),
          MockSeriesSpec.area({
            id: 'area1',
            data: [
              { x: 0, y: 2 },
              { x: 1, y: 2 },
              { x: 2, y: 3 },
            ],
            xScaleType: ScaleType.Ordinal,
          }),
          MockSeriesSpec.area({
            id: 'area2',
            data: [
              { x: 1, y: 4 },
              { x: 2, y: -5 },
            ],
            xScaleType: ScaleType.Ordinal,
          }),
        ],
        store,
      );
    });
    it('On ordinal area chart, it should bucket highlight area points', () => {
      store.dispatch(onPointerMove({ position: { x: 50, y: 100 }, time: 0 }));
      const { highlightedPoints } = getHighlightedTooltipTooltipValuesSelector(store.getState());

      // Area points should be bucket highlighted when cursor is in their bucket
      expect(highlightedPoints).toHaveLength(1);
      expect(highlightedPoints[0]?.seriesIdentifier.specId).toBe('area1');
    });
    it('On ordinal area chart, it should highlight all area points within the hovered bucket from both series', () => {
      store.dispatch(onPointerMove({ position: { x: 150, y: 100 }, time: 0 }));
      const { highlightedPoints } = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(highlightedPoints).toHaveLength(2);
      const specIds = highlightedPoints.map((p) => p?.seriesIdentifier.specId);
      expect(specIds).toContain('area1');
      expect(specIds).toContain('area2');
    });
    it('On ordinal area chart, it should not highlight area points that are outside the panel bounds', () => {
      store.dispatch(onPointerMove({ position: { x: 250, y: 100 }, time: 0 }));
      const { highlightedPoints } = getHighlightedTooltipTooltipValuesSelector(store.getState());

      expect(highlightedPoints).toHaveLength(1);
      expect(highlightedPoints[0]?.seriesIdentifier.specId).toBe('area1');
    });
  });

  describe('On Mixed chart', () => {
    let store: Store<GlobalChartState>;
    beforeEach(() => {
      store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
      MockStore.addSpecs(
        [
          MockGlobalSpec.settingsNoMargins(),
          MockGlobalSpec.yAxis({ id: 'y', domain: { min: 0, max: NaN } }),
          MockSeriesSpec.bar({
            id: 'bar1',
            data: [
              { x: 0, y: 2 },
              { x: 1, y: 3 },
              { x: 2, y: 1 },
            ],
            xScaleType: ScaleType.Ordinal,
          }),
          MockSeriesSpec.area({
            id: 'area1',
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

    it('On mixed chart, hover should highlight the bar under pointer and bucket should highlight only the area point in the bucket', () => {
      // Move pointer to position that should be on the first bar
      store.dispatch(onPointerMove({ position: { x: 50, y: 200 }, time: 0 }));
      const { highlightedGeometries, highlightedPoints } = getHighlightedTooltipTooltipValuesSelector(store.getState());

      expect(highlightedGeometries).toHaveLength(1);
      expect(highlightedPoints).toHaveLength(1);
      expect(highlightedGeometries[0]?.seriesIdentifier.specId).toBe('bar1');
      expect(highlightedPoints[0]?.seriesIdentifier.specId).toBe('area1');
    });
  });
});
