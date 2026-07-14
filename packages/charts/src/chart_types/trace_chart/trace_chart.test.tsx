/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Spec 6 — Connected component smoke test.
 *
 * Strategy: mount a real `<Chart><Trace>` in jsdom and assert the chart mounts
 * without throwing and fires onChartRendered. The RAF loop early-returns when
 * getContext('2d') returns null (as it does in jsdom — see setup_tests.ts), so
 * this exercises:
 *   - mapStateToProps (traceSpec + theme wired from the redux store)
 *   - componentDidMount lifecycle wiring (no throw)
 *   - onChartRendered dispatched once on mount
 *   - componentWillUnmount (no throw)
 *
 * Interaction itself is exercised via the story (06_interactive), not unit-tested here
 * per the spec's own guidance.
 */

import { render } from '@testing-library/react';
import React from 'react';

import { Chart } from '../../components/chart';
import { Settings } from '../../specs';
import { Trace } from './trace_api';
import type { TraceDatum } from './trace_api';

/** Minimal fixture: root + one child, enough to exercise normalize → resolveActive. */
const FEW_SPANS: TraceDatum[] = [
  { id: 'root', name: 'HTTP GET /api', traceId: 't1', start: 0, end: 500 },
  { id: 'db', name: 'DB.query', parentId: 'root', traceId: 't1', start: 100, end: 450 },
];

describe('Trace chart — smoke mount', () => {
  it('mounts without throwing for format="simple" and xScaleType="linear"', () => {
    expect(() => {
      const { unmount } = render(
        <Chart size={[800, 200]}>
          <Trace id="trace1" data={FEW_SPANS} format="simple" xScaleType="linear" />
        </Chart>,
      );
      unmount();
    }).not.toThrow();
  });

  it('mounts without throwing for the default xScaleType ("time")', () => {
    expect(() => {
      const { unmount } = render(
        <Chart size={[800, 200]}>
          <Trace id="trace2" data={FEW_SPANS} format="simple" />
        </Chart>,
      );
      unmount();
    }).not.toThrow();
  });

  it('mounts without throwing with an empty data array', () => {
    expect(() => {
      const { unmount } = render(
        <Chart size={[800, 200]}>
          <Trace id="trace3" data={[]} format="simple" xScaleType="linear" />
        </Chart>,
      );
      unmount();
    }).not.toThrow();
  });

  it('fires onRenderChange(true) on mount', () => {
    const onRenderChange = jest.fn();
    const { unmount } = render(
      <Chart size={[800, 200]}>
        {/* Settings.onRenderChange is the observable API callback. The chart shell (ChartStatus)
            also calls it via rAF, so the total call count is chart-shell-internal and not
            something to over-specify here. What matters: it is called with true. */}
        <Settings onRenderChange={onRenderChange} />
        <Trace id="trace4" data={FEW_SPANS} format="simple" xScaleType="linear" />
      </Chart>,
    );
    expect(onRenderChange).toHaveBeenCalledWith(true);
    unmount();
  });

  it('re-renders cleanly when data prop changes', () => {
    const NEW_SPANS: TraceDatum[] = [
      { id: 'root2', name: 'POST /checkout', traceId: 't2', start: 0, end: 300 },
    ];

    const { rerender } = render(
      <Chart size={[800, 200]}>
        <Trace id="trace5" data={FEW_SPANS} format="simple" xScaleType="linear" />
      </Chart>,
    );
    expect(() => {
      rerender(
        <Chart size={[800, 200]}>
          <Trace id="trace5" data={NEW_SPANS} format="simple" xScaleType="linear" />
        </Chart>,
      );
    }).not.toThrow();
  });

  it('re-renders cleanly when xScaleType changes (view reset path)', () => {
    /**
     * Exercises the componentDidUpdate reset branch added in Round 6 (ADR 0004 Decision 2 addendum).
     * Switching xScaleType changes the reference-domain origin (linear=elapsed, time=wall-clock).
     * Without the reset, domainTween's extent-only metric strands the view ("updates only on hover").
     * In jsdom getContext('2d') returns null so the frame early-returns; we verify the lifecycle
     * wiring doesn't throw — visual correctness is confirmed in the story (06_interactive).
     */
    const { rerender } = render(
      <Chart size={[800, 200]}>
        <Trace id="trace6" data={FEW_SPANS} format="simple" xScaleType="linear" />
      </Chart>,
    );
    expect(() => {
      rerender(
        <Chart size={[800, 200]}>
          <Trace id="trace6" data={FEW_SPANS} format="simple" xScaleType="time" />
        </Chart>,
      );
    }).not.toThrow();
    // Switch back to confirm the reset path fires in both directions.
    expect(() => {
      rerender(
        <Chart size={[800, 200]}>
          <Trace id="trace6" data={FEW_SPANS} format="simple" xScaleType="linear" />
        </Chart>,
      );
    }).not.toThrow();
  });
});
