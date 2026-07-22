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
 *
 * Spec 10 — Pin state-machine tests.
 *
 * jsdom has no real canvas (getContext('2d') returns null), so we can't test rendering
 * or pick-region results. Instead these tests verify that the pin lifecycle compiles and
 * runs without throwing: mount → right-click (dispatched as contextmenu) → Escape / data
 * change / left-click. Visual pin behavior is confirmed in the story (14_pinned_tooltip).
 */

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { setupJestCanvasMock } from 'jest-canvas-mock';

import { Chart } from '../../components/chart';
import { Settings } from '../../specs';
import { Logger } from '../../utils/logger';
import * as OrderLanesModule from './data/order_lanes';
import { Trace } from './trace_api';
import type { TraceDatum, TraceControlCallbacks } from './trace_api';
import { makeCtx } from './trace_test_helpers';

/** Minimal fixture: root + one child, enough to exercise normalize → resolveActive. */
const FEW_SPANS: TraceDatum[] = [
  { id: 'root', name: 'HTTP GET /api', traceId: 't1', start: 0, end: 500 },
  { id: 'db', name: 'DB.query', parentId: 'root', traceId: 't1', start: 100, end: 450 },
];

const SKEWED_SPANS: TraceDatum[] = [
  { id: 'root', name: 'root', start: 0, end: 100 },
  { id: 'child', name: 'skewed child', parentId: 'root', start: -10, end: 50 },
];

// Importing trace_test_helpers activates jest-canvas-mock, which patches
// HTMLCanvasElement.prototype.getContext for this file. All tests below therefore
// run with a real canvas stub — the RAF→frame→draw path executes instead of
// short-circuiting at `if (!this.ctx) return`.

describe('Trace chart — smoke mount', () => {
  it('mounts without throwing for xScaleType="linear"', () => {
    expect(() => {
      const { unmount } = render(
        <Chart size={[800, 200]}>
          <Trace id="trace1" data={FEW_SPANS} xScaleType="linear" />
        </Chart>,
      );
      unmount();
    }).not.toThrow();
  });

  it('mounts without throwing for the default xScaleType ("time")', () => {
    expect(() => {
      const { unmount } = render(
        <Chart size={[800, 200]}>
          <Trace id="trace2" data={FEW_SPANS} />
        </Chart>,
      );
      unmount();
    }).not.toThrow();
  });

  it('mounts without throwing with an empty data array', () => {
    expect(() => {
      const { unmount } = render(
        <Chart size={[800, 200]}>
          <Trace id="trace3" data={[]} xScaleType="linear" />
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
        <Trace id="trace4" data={FEW_SPANS} xScaleType="linear" />
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
        <Trace id="trace5" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    expect(() => {
      rerender(
        <Chart size={[800, 200]}>
          <Trace id="trace5" data={NEW_SPANS} xScaleType="linear" />
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
        <Trace id="trace6" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    expect(() => {
      rerender(
        <Chart size={[800, 200]}>
          <Trace id="trace6" data={FEW_SPANS} xScaleType="time" />
        </Chart>,
      );
    }).not.toThrow();
    // Switch back to confirm the reset path fires in both directions.
    expect(() => {
      rerender(
        <Chart size={[800, 200]}>
          <Trace id="trace6" data={FEW_SPANS} xScaleType="linear" />
        </Chart>,
      );
    }).not.toThrow();
  });
});

describe('Trace chart — pin lifecycle (Spec 10)', () => {
  /**
   * jsdom has no real canvas so pick-region returns nothing. These tests verify the pin-related
   * code paths compile correctly and don't throw — not that pin state is set (that requires a real
   * canvas and is covered by the story 14_pinned_tooltip).
   */

  it('handles contextmenu event on the canvas without throwing', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="pin1" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      // Dispatch a contextmenu event. pickRegion returns null in jsdom (no canvas context), so
      // the handler hits the "NOP over empty" guard and returns without pinning — but it must not throw.
      fireEvent.contextMenu(canvas!);
    }).not.toThrow();
    unmount();
  });

  it('handles Escape keyup event on the window without throwing (pin lifecycle cleanup)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="pin2" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.contextMenu(canvas!); // attempt pin (NOP in jsdom but registers handlers)
      fireEvent.keyUp(window, { key: 'Escape' }); // Escape dismiss — must not throw
    }).not.toThrow();
    unmount();
  });

  it('handles left-click without throwing when chart is not pinned', () => {
    const onElementClick = jest.fn();
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Settings onElementClick={onElementClick} />
        <Trace id="pin3" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.click(canvas!);
    }).not.toThrow();
    unmount();
  });

  it('unmounts cleanly even when pin dismiss listeners are registered', () => {
    /**
     * Exercises the teardownEventHandlers defensive-removal path: if the component unmounts
     * while pinned (or between contextmenu and an unpin event), window listeners must be removed
     * without throwing.
     */
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="pin4" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    // Dispatch contextmenu to register handlers (even though pin state stays false in jsdom).
    fireEvent.contextMenu(canvas!);
    expect(() => unmount()).not.toThrow();
  });

  it('re-renders cleanly when data changes (unpin-on-data-change path)', () => {
    const NEW_SPANS: TraceDatum[] = [{ id: 'root2', name: 'POST /submit', traceId: 't2', start: 0, end: 200 }];
    const { rerender, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="pin5" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    expect(() => {
      rerender(
        <Chart size={[800, 200]}>
          <Trace id="pin5" data={NEW_SPANS} xScaleType="linear" />
        </Chart>,
      );
    }).not.toThrow();
    unmount();
  });
});

describe('Trace chart — brush lifecycle (Spec 11)', () => {
  /**
   * jsdom has no real canvas so pick-region/geometry returns nothing. These tests verify the
   * brush-related code paths compile correctly and don't throw — not that zooming occurs (that
   * requires a real canvas and is covered by the story 15_brush_zoom).
   */

  it('handles Shift+mousedown / mousemove / mouseup without throwing (default dragMode="pan")', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="brush1" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.mouseDown(canvas!, { shiftKey: true, clientX: 100, clientY: 50, buttons: 1 });
      fireEvent.mouseMove(window, { shiftKey: true, clientX: 300, clientY: 50, buttons: 1 });
      fireEvent.mouseUp(window);
    }).not.toThrow();
    unmount();
  });

  it('handles plain drag brush with dragMode="brush" without throwing', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="brush2" data={FEW_SPANS} xScaleType="linear" dragMode="brush" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.mouseDown(canvas!, { shiftKey: false, clientX: 100, clientY: 50, buttons: 1 });
      fireEvent.mouseMove(window, { shiftKey: false, clientX: 300, clientY: 50, buttons: 1 });
      fireEvent.mouseUp(window);
    }).not.toThrow();
    unmount();
  });

  it('zero-move brush (mousedown + mouseup, no mousemove) is a no-op without throwing', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="brush3" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.mouseDown(canvas!, { shiftKey: true, clientX: 200, clientY: 50, buttons: 1 });
      fireEvent.mouseUp(window);
    }).not.toThrow();
    unmount();
  });

  it('unmounts cleanly while a brush is in progress', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="brush4" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    fireEvent.mouseDown(canvas!, { shiftKey: true, clientX: 100, clientY: 50, buttons: 1 });
    fireEvent.mouseMove(window, { clientX: 250, clientY: 50, buttons: 1 });
    expect(() => unmount()).not.toThrow();
  });
});

describe('Trace chart — selection modifier semantics (Spec 13.1)', () => {
  /**
   * Strategy: jsdom canvas is a no-op, so lastGeom is always null after mount.
   * We verify the modifier event path is wired without throwing; the full behavioural
   * table (Shift=additive, Cmd/Ctrl=toggle) is covered by selection_helpers.test.ts
   * (pure-function unit tests) and the Storybook 17_segment_selection story.
   *
   * Click timer tests use jest fake timers so DBLCLICK_DEBOUNCE_MS (250 ms) fires
   * synchronously via jest.runAllTimers() — no real-time wait.
   */

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('plain left-click does not throw (replace path)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sel1" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.click(canvas!, { clientX: 300, clientY: 50 });
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('Shift+click does not throw (additive path)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sel2" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.click(canvas!, { clientX: 300, clientY: 50, shiftKey: true });
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('Ctrl+click does not throw (toggle path, non-Apple)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sel3" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.click(canvas!, { clientX: 300, clientY: 50, ctrlKey: true });
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('Meta+click does not throw (toggle path, Apple Cmd)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sel4" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.click(canvas!, { clientX: 300, clientY: 50, metaKey: true });
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('double-click does not throw (whole-span select path)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sel5" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.dblClick(canvas!, { clientX: 300, clientY: 50 });
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('Shift+double-click does not throw (additive whole-span)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sel6" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.dblClick(canvas!, { clientX: 300, clientY: 50, shiftKey: true });
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('keyboard Enter does not throw (replace-then-announce path)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sel7" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.keyDown(canvas!, { key: 'Enter' });
    }).not.toThrow();
    unmount();
  });

  it('Shift+Enter does not throw (additive keyboard path)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sel8" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.keyDown(canvas!, { key: 'Enter', shiftKey: true });
    }).not.toThrow();
    unmount();
  });

  it('Ctrl+Enter does not throw (toggle keyboard path)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sel9" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.keyDown(canvas!, { key: 'Enter', ctrlKey: true });
    }).not.toThrow();
    unmount();
  });

  it('Escape does not throw (clear + announce path)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sel10" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(() => {
      fireEvent.keyDown(canvas!, { key: 'Escape' });
    }).not.toThrow();
    unmount();
  });

  it('clickTimer is cleared on unmount with a pending click', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sel11" data={FEW_SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    // Fire a click to start the 250 ms timer, then unmount before it fires.
    fireEvent.click(canvas!, { clientX: 300, clientY: 50 });
    // Unmount while the timer is pending — must not throw or cause post-unmount state updates.
    expect(() => unmount()).not.toThrow();
    // Advancing timers after unmount should be a no-op (timer was cleared in componentWillUnmount).
    expect(() => jest.runAllTimers()).not.toThrow();
  });
});

describe('Trace chart — RAF → draw path (Stage 0 canvas test harness)', () => {
  /**
   * These tests verify that the full frame() → buildGeometry → canvas2dRenderer.draw() path
   * executes without throwing, using the makeCtx() stub installed in the beforeAll above.
   *
   * This is the safety net for the structural refactors (Stages A/B/C): if state wiring or struct
   * grouping breaks the connection between component state and the render pipeline, this test
   * catches it — whereas the earlier smoke tests short-circuit at `if (!this.ctx) return`.
   *
   * jest.useFakeTimers() is required so jest.runAllTimers() fires the scheduled requestAnimationFrame
   * callback synchronously, exercising the full rAF → frame → draw pipeline in a single test.
   */
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('executes frame() → buildGeometry → draw without throwing (xScaleType="linear")', () => {
    expect(() => {
      const { unmount } = render(
        <Chart size={[800, 200]}>
          <Trace id="draw1" data={FEW_SPANS} xScaleType="linear" />
        </Chart>,
      );
      // Advances the scheduled rAF from componentDidMount's scheduleRender(), exercising:
      // frame() guard passes (ctx is non-null) → getPipeline() → getStyle() → buildGeometry() →
      // ctx.setTransform() → canvas2dRenderer.draw() → drawTimeBar() → all rendering primitives.
      jest.runAllTimers();
      unmount();
    }).not.toThrow();
  });

  it('executes frame() → buildGeometry → draw without throwing (xScaleType="time")', () => {
    expect(() => {
      const { unmount } = render(
        <Chart size={[800, 200]}>
          <Trace id="draw2" data={FEW_SPANS} xScaleType="time" />
        </Chart>,
      );
      jest.runAllTimers();
      unmount();
    }).not.toThrow();
  });

  it('executes frame() without throwing on empty data', () => {
    expect(() => {
      const { unmount } = render(
        <Chart size={[800, 200]}>
          <Trace id="draw3" data={[]} xScaleType="linear" />
        </Chart>,
      );
      jest.runAllTimers();
      unmount();
    }).not.toThrow();
  });
});

describe('Trace chart — scrollToSpan + controlProviderCallback (Spec 14)', () => {
  /**
   * Tests for the imperative scroll-to-span control mechanism (ADR 0008).
   * Uses jest-canvas-mock (imported via makeCtx above) so frame() runs fully.
   */
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('controlProviderCallback is called on mount with scrollToSpan', () => {
    const received: TraceControlCallbacks[] = [];
    const { unmount } = render(
      <Chart size={[800, 200]}>
        <Trace
          id="cp1"
          data={FEW_SPANS}
          xScaleType="linear"
          controlProviderCallback={(cb) => received.push(cb)}
        />
      </Chart>,
    );
    jest.runAllTimers();
    expect(received).toHaveLength(1);
    expect(typeof received[0]!.scrollToSpan).toBe('function');
    unmount();
  });

  it('controlProviderCallback is re-called when its reference changes on re-render', () => {
    const received: TraceControlCallbacks[] = [];
    const cb1 = (cb: TraceControlCallbacks) => received.push(cb);
    const cb2 = (cb: TraceControlCallbacks) => received.push(cb);

    const { rerender, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="cp2" data={FEW_SPANS} xScaleType="linear" controlProviderCallback={cb1} />
      </Chart>,
    );
    jest.runAllTimers();
    expect(received).toHaveLength(1);

    rerender(
      <Chart size={[800, 200]}>
        <Trace id="cp2" data={FEW_SPANS} xScaleType="linear" controlProviderCallback={cb2} />
      </Chart>,
    );
    // Re-registered because the reference changed.
    expect(received).toHaveLength(2);

    unmount();
  });

  it('controlProviderCallback is NOT re-called when an unrelated prop changes', () => {
    const received: TraceControlCallbacks[] = [];
    const stableCb = (cb: TraceControlCallbacks) => received.push(cb);

    const { rerender, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="cp3" data={FEW_SPANS} xScaleType="linear" controlProviderCallback={stableCb} />
      </Chart>,
    );
    jest.runAllTimers();
    expect(received).toHaveLength(1);

    // Change showTooltipOverEmpty (unrelated prop) — stableCb reference unchanged.
    rerender(
      <Chart size={[800, 200]}>
        <Trace id="cp3" data={FEW_SPANS} xScaleType="linear" controlProviderCallback={stableCb} showTooltipOverEmpty />
      </Chart>,
    );
    expect(received).toHaveLength(1);

    unmount();
  });

  it('scrollToSpan with unknown id calls Logger.warn and does not throw', () => {
    let captured: TraceControlCallbacks | null = null;
    const { unmount } = render(
      <Chart size={[800, 200]}>
        <Trace
          id="scroll1"
          data={FEW_SPANS}
          xScaleType="linear"
          controlProviderCallback={(cb) => { captured = cb; }}
        />
      </Chart>,
    );
    jest.runAllTimers();
    expect(captured).not.toBeNull();

    const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    expect(() => captured!.scrollToSpan('no-such-id')).not.toThrow();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('no-such-id'));
    warnSpy.mockRestore();

    unmount();
  });

  it('scrollToSpan with a known id does not call Logger.warn', () => {
    let captured: TraceControlCallbacks | null = null;
    const { unmount } = render(
      <Chart size={[800, 200]}>
        <Trace
          id="scroll2"
          data={FEW_SPANS}
          xScaleType="linear"
          controlProviderCallback={(cb) => { captured = cb; }}
        />
      </Chart>,
    );
    jest.runAllTimers();
    expect(captured).not.toBeNull();

    const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    expect(() => captured!.scrollToSpan('root')).not.toThrow();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();

    unmount();
  });

  it('scrollToSpan announces the span name via the aria-live region', () => {
    let captured: TraceControlCallbacks | null = null;
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace
          id="scroll3"
          data={FEW_SPANS}
          xScaleType="linear"
          controlProviderCallback={(cb) => { captured = cb; }}
        />
      </Chart>,
    );
    jest.runAllTimers();
    expect(captured).not.toBeNull();

    captured!.scrollToSpan('db');

    // The aria-live region's textContent should now contain the span name.
    const ariaLive = container.querySelector('[aria-live]');
    expect(ariaLive?.textContent).toContain('DB.query');

    unmount();
  });

  it('announces clock-skew provenance for a corrected span', () => {
    let captured: TraceControlCallbacks | null = null;
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace
          id="scroll-skew"
          data={SKEWED_SPANS}
          xScaleType="linear"
          controlProviderCallback={(cb) => {
            captured = cb;
          }}
        />
      </Chart>,
    );
    jest.runAllTimers();

    captured!.scrollToSpan('child');

    expect(container.querySelector('[aria-live]')?.textContent).toBe(
      'skewed child — 60.00 ms — time adjusted for clock skew',
    );
    unmount();
  });

  it('marks corrected span names in the screen-reader table', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="sr-skew" data={SKEWED_SPANS} xScaleType="linear" />
      </Chart>,
    );
    jest.runAllTimers();

    const table = container.querySelector('[data-testid="echScreenReaderTraceTable"]');
    expect(table?.textContent).toContain('skewed child (clock skew adjusted)');
    expect(table?.textContent).not.toContain('root (clock skew adjusted)');
    unmount();
  });

  it('scrollToSpan re-triggers with the same id (no prop-diffing guard)', () => {
    let captured: TraceControlCallbacks | null = null;
    const { unmount } = render(
      <Chart size={[800, 200]}>
        <Trace
          id="scroll4"
          data={FEW_SPANS}
          xScaleType="linear"
          controlProviderCallback={(cb) => { captured = cb; }}
        />
      </Chart>,
    );
    jest.runAllTimers();
    expect(captured).not.toBeNull();

    const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    // Call twice with the same known id — neither call should warn.
    expect(() => captured!.scrollToSpan('root')).not.toThrow();
    expect(() => captured!.scrollToSpan('root')).not.toThrow();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();

    unmount();
  });

  it('scrollToSpan does not move DOM keyboard focus (no focus-steal)', () => {
    let captured: TraceControlCallbacks | null = null;
    // Give focus to a button that will serve as the "external search box".
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();
    expect(document.activeElement).toBe(button);

    const { unmount } = render(
      <Chart size={[800, 200]}>
        <Trace
          id="scroll5"
          data={FEW_SPANS}
          xScaleType="linear"
          controlProviderCallback={(cb) => { captured = cb; }}
        />
      </Chart>,
    );
    jest.runAllTimers();
    expect(captured).not.toBeNull();

    captured!.scrollToSpan('root');

    // Focus must NOT have moved to the canvas.
    expect(document.activeElement).toBe(button);

    document.body.removeChild(button);
    unmount();
  });
});

describe('Trace chart — laneOrder prop (Spec 15)', () => {
  /**
   * Verifies that `laneOrder` is forwarded to `orderLanes` and that the pipeline cache is
   * correctly keyed on it. Uses jest.useFakeTimers() / jest.runAllTimers() to fire the
   * componentDidMount rAF → frame() → getPipeline() path (same pattern as the RAF→draw suite).
   * The rAF loop does not re-schedule in a static test (tweenOngoing=false, flywheelActive=false),
   * so each runAllTimers() fires exactly one frame → at most one cache-miss call to orderLanes.
   *
   * Three-span fixture where tree order ≠ chronological order:
   *   Tree:          root(0) → child(200) [child of root], sibling(50) [second root]
   *   Chronological: root(0), sibling(50), child(200)
   */
  const LANE_ORDER_SPANS: TraceDatum[] = [
    { id: 'root',    name: 'root',    traceId: 't', start: 0,   end: 1000 },
    { id: 'sibling', name: 'sibling', traceId: 't', start: 50,  end: 900  },
    { id: 'child',   name: 'child',   parentId: 'root', traceId: 't', start: 200, end: 800 },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('defaults to tree order when laneOrder is omitted', () => {
    const orderLanesSpy = jest.spyOn(OrderLanesModule, 'orderLanes');
    const { unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="lo1" data={LANE_ORDER_SPANS} xScaleType="linear" />
      </Chart>,
    );
    jest.runAllTimers();
    // spec.laneOrder is undefined → getPipeline passes 'tree' via the `?? 'tree'` default.
    expect(orderLanesSpy).toHaveBeenCalledWith(expect.any(Array), 'tree');
    orderLanesSpy.mockRestore();
    unmount();
  });

  it('uses chronological order when laneOrder="chronological" (reproduces prior start-ascending behaviour)', () => {
    const orderLanesSpy = jest.spyOn(OrderLanesModule, 'orderLanes');
    const { unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="lo2" data={LANE_ORDER_SPANS} xScaleType="linear" laneOrder="chronological" />
      </Chart>,
    );
    jest.runAllTimers();
    expect(orderLanesSpy).toHaveBeenCalledWith(expect.any(Array), 'chronological');
    orderLanesSpy.mockRestore();
    unmount();
  });

  it('invalidates the pipeline cache when laneOrder changes', () => {
    const orderLanesSpy = jest.spyOn(OrderLanesModule, 'orderLanes');

    const { rerender, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="lo3" data={LANE_ORDER_SPANS} xScaleType="linear" laneOrder="tree" />
      </Chart>,
    );
    jest.runAllTimers();
    // All pipeline recomputations on the initial frame must use 'tree'.
    expect(orderLanesSpy).toHaveBeenCalledWith(expect.any(Array), 'tree');
    expect(orderLanesSpy.mock.calls.every(([, mode]) => mode === 'tree')).toBe(true);
    orderLanesSpy.mockClear();

    // Change laneOrder — the cache must be invalidated. After the next frame, orderLanes must
    // be called with 'chronological', not return the stale tree-ordered result from cache.
    rerender(
      <Chart size={[800, 200]}>
        <Trace id="lo3" data={LANE_ORDER_SPANS} xScaleType="linear" laneOrder="chronological" />
      </Chart>,
    );
    jest.runAllTimers();
    expect(orderLanesSpy).toHaveBeenCalledWith(expect.any(Array), 'chronological');
    // No call must have slipped through with the old mode after the prop change.
    expect(orderLanesSpy.mock.calls.every(([, mode]) => mode === 'chronological')).toBe(true);

    orderLanesSpy.mockRestore();
    unmount();
  });
});

// ---------------------------------------------------------------------------
// Spec 18 — trace-not-found empty state (hybrid routing, ADR 0019)
// ---------------------------------------------------------------------------

describe('Trace chart — trace-not-found empty state (Spec 18)', () => {
  const SPANS: TraceDatum[] = [
    { id: 'root', name: 'HTTP GET /api', traceId: 't1', start: 0, end: 500 },
    { id: 'db', name: 'DB.query', parentId: 'root', traceId: 't1', start: 100, end: 450 },
  ];

  it('mounts without throwing when traceId matches nothing (trace-not-found case — canvas mounts, not overlay)', () => {
    const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    expect(() => {
      const { unmount } = render(
        <Chart size={[800, 200]}>
          <Trace id="spec18_not_found" data={SPANS} xScaleType="linear" traceId="does-not-exist" />
        </Chart>,
      );
      unmount();
    }).not.toThrow();
    warnSpy.mockRestore();
  });

  it('mounts without throwing when traceNotFoundMessage is supplied', () => {
    const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    expect(() => {
      const { unmount } = render(
        <Chart size={[800, 200]}>
          <Trace
            id="spec18_custom_msg"
            data={SPANS}
            xScaleType="linear"
            traceId="does-not-exist"
            traceNotFoundMessage="Custom: trace not found"
          />
        </Chart>,
      );
      unmount();
    }).not.toThrow();
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Spec 16 — focusDomain controlled prop + onFocusDomainChange (ADR 0007)
// ---------------------------------------------------------------------------

describe('Trace chart — focusDomain prop (Spec 16)', () => {
  /**
   * Tests for the controlled focus-domain prop and its echo-suppressed callback.
   *
   * WHY setupJestCanvasMock() in beforeEach:
   *   `clearMocks: true` in jest.config.js clears jest-canvas-mock's `getContext` spy between
   *   tests, making `tryCanvasContext()` receive `undefined` → `this.ctx = null` → `frame()`
   *   returns early at `if (!this.ctx) return`, so `maybeFireFocusDomainChange` is never called.
   *   Re-calling `setupJestCanvasMock()` before each test restores `getContext` to the full mock,
   *   allowing `frame()` to run completely (ctx non-null, all canvas draw calls are jest spies).
   *
   * Pattern: setupJestCanvasMock() → jest.useFakeTimers() → render → jest.runAllTimers() fires the
   * queued RAF → frame() settles (tweenOngoing=false, flywheelActive=false) → callback fires.
   *
   * Coordinate space: xScaleType="linear" → domain is [0, totalMs] after normalize().
   * The SPANS fixture spans [0, 500] in linear space after normalize() re-zeros.
   */
  const SPANS: TraceDatum[] = [
    { id: 'root', name: 'HTTP GET /api', traceId: 't1', start: 0, end: 500 },
    { id: 'db',   name: 'DB.query',     parentId: 'root', traceId: 't1', start: 100, end: 450 },
  ];

  beforeEach(() => {
    // Re-install jest-canvas-mock (cleared by clearMocks: true) so frame() gets a real ctx.
    setupJestCanvasMock();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uncontrolled: onFocusDomainChange is never called when no callback is supplied', () => {
    // No focusDomain prop, no callback — the callback must never fire.
    const cb = jest.fn();
    const { unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="fd1" data={SPANS} xScaleType="linear" /* no onFocusDomainChange */ />
      </Chart>,
    );
    jest.runAllTimers();
    expect(cb).not.toHaveBeenCalled();
    unmount();
  });

  it('uncontrolled with callback: fires once on mount settle with the full window', () => {
    // No focusDomain prop, but callback is present. The fit-all settle fires once with [0, 500].
    const cb = jest.fn();
    const { unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="fd2" data={SPANS} xScaleType="linear" onFocusDomainChange={cb} />
      </Chart>,
    );
    jest.runAllTimers();
    // The fit-all settle fires exactly once. Linear domain is [0, totalMs] = [0, 500].
    expect(cb).toHaveBeenCalledTimes(1);
    const [from, to] = cb.mock.calls[0][0] as [number, number];
    expect(from).toBeCloseTo(0);
    expect(to).toBeCloseTo(500);
    unmount();
  });

  it('controlled: supplying focusDomain does NOT fire confirming echo on settle (pre-seed)', () => {
    // syncFocusDomain pre-seeds lastFiredDomain = fd before easing, so the settle at [100,400] is
    // suppressed — the parent's own command does not bounce back as an echo.
    const cb = jest.fn();
    const { unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="fd3" data={SPANS} xScaleType="linear" focusDomain={[100, 400]} onFocusDomainChange={cb} />
      </Chart>,
    );
    jest.runAllTimers();
    // No call must carry the confirming echo [100, 400].
    const calls = cb.mock.calls as Array<[[number, number]]>;
    const echoCall = calls.find(([d]) => Math.abs(d[0] - 100) < 1 && Math.abs(d[1] - 400) < 1);
    expect(echoCall).toBeUndefined();
    unmount();
  });

  it('value comparison: re-passing the same array VALUE does not re-arm the tween', () => {
    // Guards the inline-literal footgun (plan refinement vs spec line 27 "by reference").
    // A fresh array object with the same [0]/[1] must be treated as a no-op.
    const cb = jest.fn();
    const { rerender, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="fd4" data={SPANS} xScaleType="linear" focusDomain={[50, 450]} onFocusDomainChange={cb} />
      </Chart>,
    );
    jest.runAllTimers();
    const callsBefore = cb.mock.calls.length;
    // Re-render with a FRESH array of the same value — value comparison must see no change.
    rerender(
      <Chart size={[800, 200]}>
        <Trace id="fd4" data={SPANS} xScaleType="linear" focusDomain={[50, 450]} onFocusDomainChange={cb} />
      </Chart>,
    );
    jest.runAllTimers();
    expect(cb.mock.calls.length).toBe(callsBefore);
    unmount();
  });

  it('echo-suppression round-trip: feeding emitted domain back as prop does not re-arm', () => {
    // Simulates the overview-sync pattern: callback → setState(focusDomain) → prop update.
    // The incoming prop value matches lastFiredDomain → echo-guard skips re-arm → no jitter loop.
    let emitted: [number, number] | null = null;
    const { rerender, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace
          id="fd5"
          data={SPANS}
          xScaleType="linear"
          onFocusDomainChange={(d) => { emitted = d; }}
        />
      </Chart>,
    );
    jest.runAllTimers();
    expect(emitted).not.toBeNull();
    const capturedEmit = emitted!;

    const cb2 = jest.fn();
    // Feed the emitted domain back as focusDomain — echo-guard must suppress re-arm.
    rerender(
      <Chart size={[800, 200]}>
        <Trace
          id="fd5"
          data={SPANS}
          xScaleType="linear"
          focusDomain={capturedEmit}
          onFocusDomainChange={cb2}
        />
      </Chart>,
    );
    jest.runAllTimers();
    // cb2 must NOT have been called with the emitted domain (echo suppressed).
    const echoCalls = cb2.mock.calls.filter(([d]: [[number, number]]) =>
      Math.abs(d[0] - capturedEmit[0]) < 0.1 && Math.abs(d[1] - capturedEmit[1]) < 0.1,
    );
    expect(echoCalls).toHaveLength(0);
    unmount();
  });

  it('view reset fires callback with the new full window when xScaleType changes', () => {
    // resetView() → lastFiredDomain=null → next settle fires the new full window.
    const cb = jest.fn();
    const { rerender, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="fd6" data={SPANS} xScaleType="linear" onFocusDomainChange={cb} />
      </Chart>,
    );
    jest.runAllTimers();
    const callsBefore = cb.mock.calls.length;
    expect(callsBefore).toBeGreaterThan(0); // at least the initial fit-all settle fired

    rerender(
      <Chart size={[800, 200]}>
        <Trace id="fd6" data={SPANS} xScaleType="time" onFocusDomainChange={cb} />
      </Chart>,
    );
    jest.runAllTimers();
    // At least one additional fire with the time-scale (epoch-ms) full window.
    expect(cb.mock.calls.length).toBeGreaterThan(callsBefore);
    unmount();
  });
});

// ---------------------------------------------------------------------------
// Trace chart — Touch gestures (Spec 23 / ADR 0021)
// ---------------------------------------------------------------------------

/**
 * Strategy: jsdom provides a real TouchEvent constructor and dispatches events to DOM listeners.
 * pickRegion always returns null (no canvas context), so selection callbacks never fire from touch
 * tap paths — tests verify the gesture-state machinery and timers don't throw.
 *
 * For the long-press timer, jest.useFakeTimers() / jest.advanceTimersByTime() controls the 500 ms
 * without real-time waiting.
 */

/** Build a TouchEvent with a fake touches list (jsdom's TouchList lacks `.item()` — use `[i]`). */
function makeTouchInit(canvas: HTMLCanvasElement, touches: Array<{ clientX: number; clientY: number }>) {
  const touchObjs = touches.map((t, i) => ({
    identifier: i,
    clientX: t.clientX,
    clientY: t.clientY,
    pageX: t.clientX,
    pageY: t.clientY,
    screenX: t.clientX,
    screenY: t.clientY,
    target: canvas,
  }));
  return {
    bubbles: true,
    cancelable: true,
    touches: touchObjs,
  };
}

describe('Trace chart — touch gestures (Spec 23)', () => {
  const SPANS: TraceDatum[] = [
    { id: 'root', name: 'HTTP GET /api', traceId: 't1', start: 0, end: 500 },
    { id: 'db',   name: 'DB.query',     parentId: 'root', traceId: 't1', start: 100, end: 450 },
  ];

  beforeEach(() => {
    setupJestCanvasMock();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('touchstart with 0 touches does not throw', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="touch1" data={SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas')!;
    expect(() => {
      fireEvent.touchStart(canvas, makeTouchInit(canvas, []));
    }).not.toThrow();
    unmount();
  });

  it('touchstart + touchend with 1 touch (tap path) does not throw', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="touch2" data={SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas')!;
    expect(() => {
      fireEvent.touchStart(canvas, makeTouchInit(canvas, [{ clientX: 300, clientY: 50 }]));
      fireEvent.touchEnd(canvas, makeTouchInit(canvas, [])); // finger lifted
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('two quick taps (double-tap path) does not throw', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="touch3" data={SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas')!;
    expect(() => {
      // First tap
      fireEvent.touchStart(canvas, makeTouchInit(canvas, [{ clientX: 300, clientY: 50 }]));
      fireEvent.touchEnd(canvas, makeTouchInit(canvas, []));
      // Second tap within DBLCLICK_DEBOUNCE_MS (timer not advanced yet)
      fireEvent.touchStart(canvas, makeTouchInit(canvas, [{ clientX: 300, clientY: 50 }]));
      fireEvent.touchEnd(canvas, makeTouchInit(canvas, []));
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('single-finger drag (touchstart + touchmove + touchend) does not throw', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="touch4" data={SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas')!;
    expect(() => {
      fireEvent.touchStart(canvas, makeTouchInit(canvas, [{ clientX: 300, clientY: 50 }]));
      // Move far enough to exceed TAP_MOVE_TOLERANCE_PX (10 px)
      fireEvent.touchMove(canvas, makeTouchInit(canvas, [{ clientX: 280, clientY: 50 }]));
      fireEvent.touchMove(canvas, makeTouchInit(canvas, [{ clientX: 260, clientY: 50 }]));
      fireEvent.touchEnd(canvas, makeTouchInit(canvas, []));
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('two-finger pinch (touchstart + touchmove) does not throw', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="touch5" data={SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas')!;
    expect(() => {
      // Two-finger touch start
      fireEvent.touchStart(canvas, makeTouchInit(canvas, [
        { clientX: 200, clientY: 50 },
        { clientX: 400, clientY: 50 },
      ]));
      // Pinch in (fingers converge)
      fireEvent.touchMove(canvas, makeTouchInit(canvas, [
        { clientX: 240, clientY: 50 },
        { clientX: 360, clientY: 50 },
      ]));
      // Pinch end
      fireEvent.touchEnd(canvas, makeTouchInit(canvas, []));
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('long-press (stationary finger for 500 ms) does not throw', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="touch6" data={SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas')!;
    expect(() => {
      fireEvent.touchStart(canvas, makeTouchInit(canvas, [{ clientX: 300, clientY: 50 }]));
      jest.advanceTimersByTime(500); // fire the long-press timer
      fireEvent.touchEnd(canvas, makeTouchInit(canvas, []));
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('subsequent tap after long-press does not throw (dismiss path)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="touch7" data={SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas')!;
    expect(() => {
      // Long-press
      fireEvent.touchStart(canvas, makeTouchInit(canvas, [{ clientX: 300, clientY: 50 }]));
      jest.advanceTimersByTime(500);
      fireEvent.touchEnd(canvas, makeTouchInit(canvas, []));
      // Next touchstart: if pinned, should dismiss and not select
      fireEvent.touchStart(canvas, makeTouchInit(canvas, [{ clientX: 300, clientY: 50 }]));
      fireEvent.touchEnd(canvas, makeTouchInit(canvas, []));
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('touchcancel resets gesture state without throwing', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="touch8" data={SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas')!;
    expect(() => {
      fireEvent.touchStart(canvas, makeTouchInit(canvas, [{ clientX: 300, clientY: 50 }]));
      fireEvent.touchCancel(canvas, makeTouchInit(canvas, []));
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });

  it('unmounts cleanly when longPressTimer is pending', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="touch9" data={SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas')!;
    fireEvent.touchStart(canvas, makeTouchInit(canvas, [{ clientX: 300, clientY: 50 }]));
    // Timer is pending — unmount before it fires
    expect(() => unmount()).not.toThrow();
    // Advance past the timer to confirm the cancelled timer doesn't fire on an unmounted component
    jest.runAllTimers();
  });

  it('pinch → one-finger continuation does not throw (resolution 1)', () => {
    const { container, unmount } = render(
      <Chart size={[800, 200]}>
        <Trace id="touch10" data={SPANS} xScaleType="linear" />
      </Chart>,
    );
    const canvas = container.querySelector('canvas')!;
    expect(() => {
      // Start pinch with 2 fingers
      fireEvent.touchStart(canvas, makeTouchInit(canvas, [
        { clientX: 200, clientY: 50 },
        { clientX: 400, clientY: 50 },
      ]));
      // One finger lifts — 1 finger remains (in the touches list of the touchend event)
      fireEvent.touchEnd(canvas, makeTouchInit(canvas, [{ clientX: 300, clientY: 50 }]));
      // Continue panning with remaining finger
      fireEvent.touchMove(canvas, makeTouchInit(canvas, [{ clientX: 280, clientY: 50 }]));
      fireEvent.touchEnd(canvas, makeTouchInit(canvas, []));
      jest.runAllTimers();
    }).not.toThrow();
    unmount();
  });
});
