/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getCursorBandPositionSelector } from './get_cursor_band';
import { createOnPointerUpdateCaller } from './on_pointer_update_caller';
import { getPickedGridCell } from './picked_shapes';
import { Predicate } from '../../../../common/predicate';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { PointerEventType, TooltipType } from '../../../../specs';
import type { Spec } from '../../../../specs/spec_type';
import { onPointerMove } from '../../../../state/actions/mouse';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { Datum } from '../../../../utils/common';
import { CursorBand } from '../../renderer/dom/cursor_band';

const ordinalData = [
  { x: 'a', y: 'ya', value: 1 },
  { x: 'b', y: 'ya', value: 2 },
  { x: 'c', y: 'ya', value: 3 },
  { x: 'a', y: 'yb', value: 4 },
  { x: 'b', y: 'yb', value: 5 },
  { x: 'c', y: 'yb', value: 6 },
];

function heatmapTheme(maxWidth?: number) {
  return {
    heatmap: {
      xAxisLabel: { visible: false },
      yAxisLabel: { visible: false },
      ...(maxWidth === undefined ? {} : { cell: { maxWidth } }),
    },
  };
}

function setupChart(partial?: {
  maxWidth?: number;
  tooltipType?: TooltipType;
  data?: Datum[];
  extraSpecs?: ReturnType<typeof MockGlobalSpec.smallMultiple>[];
  onPointerUpdate?: jest.Mock;
}) {
  const store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
  MockStore.addSpecs(
    [
      MockGlobalSpec.settingsNoMargins({
        theme: heatmapTheme(partial?.maxWidth),
        onPointerUpdate: partial?.onPointerUpdate,
      }),
      ...(partial?.tooltipType ? [MockGlobalSpec.tooltip({ type: partial.tooltipType })] : []),
      ...(partial?.extraSpecs ?? []),
      MockSeriesSpec.heatmap({
        xScale: { type: ScaleType.Ordinal },
        data: partial?.data ?? ordinalData,
      }),
    ],
    store,
  );
  return store;
}

function hover(store: Store<GlobalChartState>, x: number, y: number) {
  store.dispatch(onPointerMove({ position: { x, y }, time: 0 }));
}

describe('Heatmap cursor band', () => {
  it('highlights the full column under the pointer', () => {
    const store = setupChart();
    const { chartDimensions } = computeChartDimensionsSelector(store.getState());
    const bandwidth = chartDimensions.width / 3;
    hover(store, chartDimensions.left + bandwidth * 1.5, chartDimensions.top + chartDimensions.height / 2);

    const band = getCursorBandPositionSelector(store.getState());
    expect(band).toBeDefined();
    expect(band?.x).toBeCloseTo(chartDimensions.left + bandwidth);
    expect(band?.y).toBeCloseTo(chartDimensions.top);
    expect(band?.width).toBeCloseTo(bandwidth);
    expect(band?.height).toBeCloseTo(chartDimensions.height);
    expect(band?.fromExternalEvent).toBe(false);
  });

  it('centers the band on cells capped by a numeric maxWidth', () => {
    const maxWidth = 20;
    const store = setupChart({ maxWidth });
    const { chartDimensions } = computeChartDimensionsSelector(store.getState());
    const bandwidth = chartDimensions.width / 3;
    hover(store, chartDimensions.left + bandwidth / 2, chartDimensions.top + chartDimensions.height / 2);

    const band = getCursorBandPositionSelector(store.getState());
    expect(band).toBeDefined();
    expect(band?.width).toBeCloseTo(maxWidth);
    expect(band?.x).toBeCloseTo(chartDimensions.left + (bandwidth - maxWidth) / 2);
    expect(band?.height).toBeCloseTo(chartDimensions.height);
  });

  it('places the band on the hovered column of a right-hand small multiple', () => {
    const onPointerUpdate = jest.fn();
    const store = setupChart({
      onPointerUpdate,
      extraSpecs: [
        MockGlobalSpec.smallMultiple({ splitHorizontally: 'panel' }),
        MockGlobalSpec.groupBy({
          id: 'panel',
          by: (_spec: Spec, datum: { panel: string }) => datum.panel,
          sort: Predicate.AlphaAsc,
        }),
      ],
      data: [
        { x: 'a', y: 'y', value: 1, panel: 'left' },
        { x: 'b', y: 'y', value: 2, panel: 'left' },
        { x: 'a', y: 'y', value: 3, panel: 'right' },
        { x: 'b', y: 'y', value: 4, panel: 'right' },
      ],
    });
    const { chartDimensions } = computeChartDimensionsSelector(store.getState());
    const panelWidth = chartDimensions.width / 2;
    const cellBandwidth = panelWidth / 2;
    hover(
      store,
      chartDimensions.left + panelWidth + cellBandwidth / 2,
      chartDimensions.top + chartDimensions.height / 2,
    );

    const picked = getPickedGridCell(store.getState());
    expect(picked).toEqual({
      x: 'a',
      y: 'y',
      smHorizontalAccessorValue: 'right',
    });

    const band = getCursorBandPositionSelector(store.getState());
    expect(band).toBeDefined();
    expect(band?.x).toBeCloseTo(chartDimensions.left + panelWidth);
    expect(band?.x).toBeGreaterThanOrEqual(chartDimensions.left + panelWidth);
    expect(band?.width).toBeCloseTo(cellBandwidth);
    expect(band?.height).toBeCloseTo(chartDimensions.height);

    createOnPointerUpdateCaller()(store.getState());
    MockStore.flush(store);
    expect(onPointerUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PointerEventType.Over,
        x: 'a',
        smHorizontalValue: 'right',
      }),
    );
  });

  describe('CursorBand rendering', () => {
    function renderBand(tooltipType: TooltipType) {
      const store = setupChart({ tooltipType });
      const { chartDimensions } = computeChartDimensionsSelector(store.getState());
      hover(store, chartDimensions.left + chartDimensions.width / 2, chartDimensions.top + chartDimensions.height / 2);
      return render(
        <Provider store={store}>
          <CursorBand />
        </Provider>,
      );
    }

    it('renders the column band when the tooltip follows the pointer', () => {
      const { container } = renderBand(TooltipType.Follow);
      expect(container.querySelector('.echCrosshair__cursor rect')).not.toBeNull();
    });

    it('does not render the column band when tooltips are hidden', () => {
      const { container } = renderBand(TooltipType.None);
      expect(container.querySelector('.echCrosshair__cursor rect')).toBeNull();
    });
  });
});
