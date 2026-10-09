/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from '@reduxjs/toolkit';

import { getHighlightedTooltipTooltipValuesSelector } from './selectors/get_tooltip_values_highlighted_geoms';
import { MockSeriesSpec, MockGlobalSpec } from '../../../mocks/specs';
import { ScaleType } from '../../../scales/constants';
import { TooltipType } from '../../../specs/constants';
import { updateParentDimensions } from '../../../state/actions/chart_settings';
import { onPointerMove } from '../../../state/actions/mouse';
import { upsertSpec, specParsed } from '../../../state/actions/specs';
import { createChartStore, type GlobalChartState } from '../../../state/chart_state';
import { chartSelectorsRegistry } from '../../../state/selectors/get_internal_chart_state';
import { chartTypeSelectors } from '../../chart_type_selectors';

describe('XYChart - State tooltips', () => {
  let store: Store<GlobalChartState>;
  beforeEach(() => {
    chartSelectorsRegistry.setChartSelectors(chartTypeSelectors);
    store = createChartStore('chartId');
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

  describe('null values of bar series at the hovered x', () => {
    const hoveredRows = (stacked: boolean, showNullValues: boolean) => {
      const chartStore = createChartStore('chartId');
      const barSpec = (id: string, data: Array<{ x: number; y: number | null }>) =>
        MockSeriesSpec.bar({ id, xScaleType: ScaleType.Ordinal, data, ...(stacked && { stackAccessors: ['x'] }) });
      chartStore.dispatch(
        upsertSpec(
          barSpec('value', [
            { x: 0, y: 1 },
            { x: 1, y: 5 },
            { x: 2, y: 1 },
          ]),
        ),
      );
      chartStore.dispatch(
        upsertSpec(
          barSpec('explicitNull', [
            { x: 0, y: 1 },
            { x: 1, y: null },
            { x: 2, y: 1 },
          ]),
        ),
      );
      chartStore.dispatch(
        upsertSpec(
          barSpec('gap', [
            { x: 0, y: 1 },
            { x: 2, y: 1 },
          ]),
        ),
      );
      chartStore.dispatch(upsertSpec(MockGlobalSpec.settingsNoMargins()));
      chartStore.dispatch(upsertSpec(MockGlobalSpec.tooltip({ type: TooltipType.VerticalCursor, showNullValues })));
      chartStore.dispatch(specParsed());
      chartStore.dispatch(updateParentDimensions({ width: 300, height: 100, top: 0, left: 0 }));
      chartStore.dispatch(onPointerMove({ position: { x: 150, y: 50 }, time: 0 }));
      const { tooltip } = getHighlightedTooltipTooltipValuesSelector(chartStore.getState());
      return {
        header: tooltip.header?.value,
        rows: tooltip.values.map(({ seriesIdentifier, value }) => [seriesIdentifier.specId, value]),
      };
    };

    it.each([false, true])('hides both a gap and an explicit null by default (stacked: %s)', (stacked) => {
      expect(hoveredRows(stacked, false)).toEqual({ header: 1, rows: [['value', 5]] });
    });

    it.each([false, true])('shows an explicit null but not a gap with showNullValues (stacked: %s)', (stacked) => {
      expect(hoveredRows(stacked, true)).toEqual({
        header: 1,
        rows: [
          ['value', 5],
          ['explicitNull', null],
        ],
      });
    });
  });
});
