/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { chartSelectorsFactory } from './chart_selectors';
import { getTraceTableRowsSelector } from './state/selectors/get_screen_reader_data';
import { MockStore } from '../../mocks/store/store';
import { setTraceUncontrolledCollapsed } from '../../state/actions/trace';
import { InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { ChartType } from '..';
import { SpecType } from '../../specs/spec_type';
import type { TraceSpec } from './trace_api';

/** Build a minimal TraceSpec ready for upsert into the mock store. */
function makeTraceSpec(overrides: Partial<TraceSpec> = {}): TraceSpec {
  return {
    id: 'trace',
    chartType: ChartType.Trace,
    specType: SpecType.Series,
    data: [],
    xScaleType: 'time',
    ...overrides,
  } as TraceSpec;
}

describe('Trace chart_selectors', () => {
  const globalState = MockStore.default().getState();

  it('describes itself as a Trace chart', () => {
    const selectors = chartSelectorsFactory();
    expect(selectors.getChartTypeDescription(globalState)).toBe('Trace chart');
  });

  it('reports Initialized', () => {
    const selectors = chartSelectorsFactory();
    expect(selectors.isInitialized(globalState)).toBe(InitStatus.Initialized);
  });
});

// ---------------------------------------------------------------------------
// isChartEmpty — hybrid routing (Spec 18 / ADR 0019)
// ---------------------------------------------------------------------------

describe('isChartEmpty — hybrid routing', () => {
  const selectors = chartSelectorsFactory();

  function storeWithSpec(spec: TraceSpec) {
    const store = MockStore.default();
    MockStore.addSpecs(spec, store);
    return store.getState();
  }

  it('returns true when data is empty (no-data case → library overlay)', () => {
    const state = storeWithSpec(makeTraceSpec({ data: [] }));
    expect(selectors.isChartEmpty(state)).toBe(true);
  });

  it('returns true when no spec is registered', () => {
    // MockStore.default() has no Trace spec — isChartEmpty should return true.
    expect(selectors.isChartEmpty(MockStore.default().getState())).toBe(true);
  });

  it('returns false when data is present and no traceId is set (combined waterfall)', () => {
    const state = storeWithSpec(makeTraceSpec({
      data: [{ id: 'a', name: 'a', start: 0, end: 10, traceId: 't1' }],
    }));
    expect(selectors.isChartEmpty(state)).toBe(false);
  });

  it('returns false when data is present and traceId matches (normal render)', () => {
    const state = storeWithSpec(makeTraceSpec({
      data: [{ id: 'a', name: 'a', start: 0, end: 10, traceId: 't1' }],
      traceId: 't1',
    }));
    expect(selectors.isChartEmpty(state)).toBe(false);
  });

  it('returns false when data is present and traceId does NOT match (trace-not-found → canvas message, not overlay)', () => {
    const state = storeWithSpec(makeTraceSpec({
      data: [{ id: 'a', name: 'a', start: 0, end: 10, traceId: 't1' }],
      traceId: 'does-not-exist',
    }));
    // The canvas mounts; isChartEmpty must NOT return true here.
    expect(selectors.isChartEmpty(state)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Screen-reader table mirrors the visual collapse (ADR 0013 / redraw-a11y)
// ---------------------------------------------------------------------------

describe('getTraceTableRowsSelector — collapse parity', () => {
  const NESTED_DATA = [
    { id: 'p', name: 'parent', start: 0, end: 100, traceId: 't1' },
    { id: 'c', name: 'child', parentId: 'p', start: 10, end: 50, traceId: 't1' },
  ];

  it('reads uncontrolled collapse from redux so the SR table hides the same descendants as the canvas', () => {
    const store = MockStore.default();
    MockStore.addSpecs(makeTraceSpec({ data: NESTED_DATA, traceId: 't1', laneOrder: 'tree' }), store);

    // Expanded: both parent and child rows are present.
    expect(getTraceTableRowsSelector(store.getState()).map((r) => r.id)).toEqual(['p', 'c']);

    // The component publishes its uncontrolled collapse into redux; the SR table must follow.
    store.dispatch(setTraceUncontrolledCollapsed(['p']));
    const collapsed = getTraceTableRowsSelector(store.getState());
    expect(collapsed.map((r) => r.id)).toEqual(['p']);
    expect(collapsed[0]?.name).toContain('descendants hidden');
  });

  it('prefers the controlled collapsedSpanIds prop over the redux value when present', () => {
    const store = MockStore.default();
    // Controlled: prop says nothing collapsed, redux says collapse 'p' — the prop wins.
    MockStore.addSpecs(
      makeTraceSpec({ data: NESTED_DATA, traceId: 't1', laneOrder: 'tree', collapsedSpanIds: [] }),
      store,
    );
    store.dispatch(setTraceUncontrolledCollapsed(['p']));
    expect(getTraceTableRowsSelector(store.getState()).map((r) => r.id)).toEqual(['p', 'c']);
  });
});
