/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalChartStateSelector } from './get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from './get_internal_is_intialized';
import { getSettingsSpecSelector } from './get_settings_spec';
import { ChartType } from '../../chart_types';
import { MockSeriesSpec } from '../../mocks/specs';
import { MockStore } from '../../mocks/store';
import { ScaleType } from '../../scales/constants';
import type { Spec } from '../../specs/spec_type';
import { onMouseDown, onMouseUp, onPointerMove } from '../actions/mouse';
import { removeSpec, specParsed } from '../actions/specs';
import { selectorMemos } from '../create_selector';

const bars = MockSeriesSpec.bar({
  id: 'series',
  xScaleType: ScaleType.Linear,
  data: [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
  ],
});

/** A chart with a brush end listener, that calls back as a mounted chart does: on every change, once initialized */
const chart = () => {
  const store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 });
  const onBrushEnd = jest.fn();
  const settings = { ...getSettingsSpecSelector(store.getState()), onBrushEnd };
  const chartSelectors = () => getInternalChartStateSelector(store.getState());
  store.subscribe(() => {
    const ofChartType = chartSelectors();
    if (getInternalIsInitializedSelector(store.getState()) !== InitStatus.Initialized) return;
    ofChartType?.eventCallbacks(store.getState());
  });
  const become = (series?: Spec) => {
    store.dispatch(removeSpec('series'));
    if (series) MockStore.addSpecs([series, settings], store);
    else store.dispatch(specParsed());
  };
  /** a brush from left to right that starts at a time */
  const brush = (time: number) => {
    store.dispatch(onMouseDown({ position: { x: 10, y: 10 }, time }));
    store.dispatch(onPointerMove({ position: { x: 60, y: 10 }, time: time + 200 }));
    store.dispatch(onMouseUp({ position: { x: 60, y: 10 }, time: time + 300 }));
  };
  return { store, onBrushEnd, chartSelectors, become, brush };
};

describe('the chart selectors of a chart type', () => {
  it('are the ones the chart had, when it loses its series and gets them back', () => {
    const { store, chartSelectors, become } = chart();
    become(bars);
    const ofXY = chartSelectors();
    expect(ofXY).not.toBeNull();

    become();
    expect(store.getState().chartType).toBeNull();
    expect(chartSelectors()).toBeNull();

    become(bars);
    expect(chartSelectors()).toBe(ofXY);
  });

  it('are the ones the chart had, when it comes back from another chart type', () => {
    const { store, chartSelectors, become } = chart();
    become(bars);
    const ofXY = chartSelectors();
    become(MockSeriesSpec.sunburst({ id: 'series' }));
    expect(store.getState().chartType).toBe(ChartType.Partition);
    const ofPartition = chartSelectors();
    expect(ofPartition).not.toBe(ofXY);

    become(bars);
    expect(chartSelectors()).toBe(ofXY);
    become(MockSeriesSpec.sunburst({ id: 'series' }));
    expect(chartSelectors()).toBe(ofPartition);
  });

  it('do not call back again for a brush that ended before the chart lost its series', () => {
    const { onBrushEnd, become, brush } = chart();
    become(bars);
    brush(0);
    expect(onBrushEnd).toHaveBeenCalledTimes(1);

    for (let i = 0; i < 3; i++) {
      become();
      become(bars);
    }
    expect(onBrushEnd).toHaveBeenCalledTimes(1);
  });

  it('do not call back again for a brush that ended before the chart was two other chart types', () => {
    // three chart types in turn: one more than the two computations that a selector used to keep
    const { store, onBrushEnd, become, brush } = chart();
    become(bars);
    brush(0);
    expect(onBrushEnd).toHaveBeenCalledTimes(1);

    become(MockSeriesSpec.sunburst({ id: 'series' }));
    expect(store.getState().chartType).toBe(ChartType.Partition);
    become(MockSeriesSpec.heatmap({ id: 'series' }));
    expect(store.getState().chartType).toBe(ChartType.Heatmap);
    // a chart that becomes a heatmap reports the old brush once more, as on main: what counts here is the way back
    const calls = onBrushEnd.mock.calls.length;
    become(bars);
    expect(onBrushEnd).toHaveBeenCalledTimes(calls);
    // not for want of calling back at all: a brush that ends now is reported, once
    brush(1000);
    expect(onBrushEnd).toHaveBeenCalledTimes(calls + 1);
  });

  it('add no memos to the chart, however often it leaves the chart type and comes back', () => {
    const { store, become } = chart();
    const memos = () => selectorMemos.chartMemos(store.getState()).memos.size;
    become(bars);
    become();
    become(bars);
    const afterOneRoundTrip = memos();
    for (let i = 0; i < 5; i++) {
      become();
      become(bars);
    }
    expect(memos()).toBe(afterOneRoundTrip);
  });
});
