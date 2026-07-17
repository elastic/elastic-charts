/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Spec 5 — Canvas2D renderer unit tests.
 *
 * Strategy: mock `drawTimeBar` so the renderer test focuses on its own draw loop.
 * The time bar is fully tested in `time_bar.test.ts`. A hand-rolled
 * CanvasRenderingContext2D stub captures every ctx method call so we can assert
 * draw-call counts without running real canvas operations.
 */

import { draw, pickLane, canvas2dRenderer } from './canvas2d_renderer';
import type { NormalizedSpan } from '../data/types';
import type { TraceGeometry, TraceStyle } from './types';
import type { TraceDatum } from '../trace_api';
import { makeCtx } from '../trace_test_helpers';

// ---------------------------------------------------------------------------
// Mocks: replace drawTimeBar so the renderer test is isolated from the time bar.
// `mockDrawTimeBar` starts with `mock` — jest's babel transform auto-hoists it
// above the jest.mock() call so it can be closed over in the factory.
// ---------------------------------------------------------------------------
const mockDrawTimeBar = jest.fn();
jest.mock('./time_bar', () => ({
  drawTimeBar: (ctx: unknown, geom: unknown, style: unknown) => mockDrawTimeBar(ctx, geom, style),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// makeCtx() is imported from '../trace_test_helpers' — shared with trace_chart.test.tsx so both
// files exercise the same canvas stub without drift.

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const style: TraceStyle = {
  gutterWidth: 200,
  timeBarHeight: 32,
  laneHeight: 24,
  totalLineThickness: 2,
  totalLineColor: '#aaa',
  activeSegmentColor: '#1f6feb',
  gutterLabel: { fontFamily: 'monospace', fontSize: 11, color: '#333' },
  timeBarLabel: { fontFamily: 'monospace', fontSize: 11, color: '#555' },
  gridLineColor: '#e8e8e8',
  focusedLaneBackground: 'rgba(96,146,192,0.15)',
  selectedSegmentStroke: '#f00',
  selectedSegmentStrokeWidth: 2,
  labelPosition: 'gutter',
};

// Canvas partition dimensions — must be consistent with the style above.
const PLOT_LEFT = 200; // = style.gutterWidth
const PLOT_TOP = 32; // = style.timeBarHeight
const PLOT_WIDTH = 700;
const PLOT_HEIGHT = 168;
const LANE_HEIGHT = 24; // = style.laneHeight

// Three spans: SpanA has 1 active segment, SpanB has 2, SpanC has none.
const spans: NormalizedSpan[] = [
  {
    id: 'a',
    name: 'SpanA',
    start: 0,
    end: 1000,
    activeSegments: [{ start: 0, end: 500 }],
    meta: { id: 'a', name: 'SpanA', traceId: 't1', start: 0, end: 1000 } satisfies TraceDatum,
  },
  {
    id: 'b',
    name: 'SpanB',
    start: 100,
    end: 900,
    activeSegments: [
      { start: 100, end: 400 },
      { start: 600, end: 900 },
    ],
    meta: { id: 'b', name: 'SpanB', traceId: 't1', start: 100, end: 900 } satisfies TraceDatum,
  },
  {
    id: 'c',
    name: 'SpanC',
    start: 200,
    end: 700,
    activeSegments: [],
    meta: { id: 'c', name: 'SpanC', traceId: 't1', start: 200, end: 700 } satisfies TraceDatum,
  },
];

// Linear ms→px scale: maps [0, 1000] onto [PLOT_LEFT, PLOT_LEFT + PLOT_WIDTH].
const defaultScale = (t: number) => PLOT_LEFT + (t / 1000) * PLOT_WIDTH;

function makeGeom(overrides: Partial<TraceGeometry> = {}): TraceGeometry {
  return {
    spans,
    // gutter spans the full canvas height (top=0 to canvas bottom).
    gutter: { top: 0, left: 0, width: PLOT_LEFT, height: PLOT_TOP + PLOT_HEIGHT },
    timeBar: { top: 0, left: PLOT_LEFT, width: PLOT_WIDTH, height: PLOT_TOP },
    plot: { top: PLOT_TOP, left: PLOT_LEFT, width: PLOT_WIDTH, height: PLOT_HEIGHT },
    laneHeight: LANE_HEIGHT,
    domain: { min: 0, max: 1000 },
    focusDomain: { min: 0, max: 1000 },
    scrollOffset: 0,
    xScaleType: 'linear',
    focusedLaneIndex: null,
    resolvedSelection: [],
    scale: defaultScale,
    emptyMessage: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockDrawTimeBar.mockClear();
});

// ---------------------------------------------------------------------------
// Tests: canvas cleared + drawTimeBar delegation
// ---------------------------------------------------------------------------

describe('draw — canvas cleared and time bar delegated', () => {
  it('clears the full canvas area once', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom(), style);
    // The transparent clear precedes all other drawing.
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(ctx.clearRect).toHaveBeenCalledWith(
      0,
      0,
      PLOT_LEFT + PLOT_WIDTH, // gutter.width + plot.width = full canvas width
      PLOT_TOP + PLOT_HEIGHT, // gutter.height = full canvas height
    );
  });

  it('delegates time bar rendering to drawTimeBar', () => {
    const ctx = makeCtx();
    const geom = makeGeom();
    draw(ctx, geom, style);
    expect(mockDrawTimeBar).toHaveBeenCalledTimes(1);
    expect(mockDrawTimeBar).toHaveBeenCalledWith(ctx, geom, style);
  });
});

// ---------------------------------------------------------------------------
// Tests: visible lanes (scrollOffset = 0, all 3 spans visible)
// ---------------------------------------------------------------------------

describe('draw — visible lanes (no scroll, all 3 spans visible)', () => {
  it('renders one gutter label per visible span', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom(), style);
    // renderText calls fillText once per span gutter label.
    expect(ctx.fillText).toHaveBeenCalledTimes(3);
  });

  it('renders one total-duration line per visible span', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom(), style);
    // renderMultiLine with 1 line per span → 1 moveTo + 1 lineTo per span.
    expect(ctx.moveTo).toHaveBeenCalledTimes(3);
    expect(ctx.lineTo).toHaveBeenCalledTimes(3);
  });

  it('renders one rect per active segment across all visible spans', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom(), style);
    // SpanA: 1 active, SpanB: 2 active, SpanC: 0 active → 3 segment rects.
    // +1 for the lane-area clip rect drawn once per draw() call.
    expect(ctx.rect).toHaveBeenCalledTimes(4);
  });
});

// ---------------------------------------------------------------------------
// Tests: viewport culling
// ---------------------------------------------------------------------------

describe('draw — viewport culling', () => {
  it('draws only the visible lane when scrollOffset skips the first two lanes', () => {
    const ctx = makeCtx();
    // scrollOffset=48 → firstLane=floor(48/24)=2, lastLane=2 → only SpanC is visible.
    draw(ctx, makeGeom({ scrollOffset: 48 }), style);
    // SpanC has no active segments → no segment rects.
    // The lane-area clip rect is still drawn once (unconditional when spans exist).
    expect(ctx.rect).toHaveBeenCalledTimes(1);
    // SpanC's gutter label and total line are still drawn.
    expect(ctx.fillText).toHaveBeenCalledTimes(1);
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
  });

  it('draws nothing when scrollOffset pushes all lanes off-screen', () => {
    const ctx = makeCtx();
    // scrollOffset=200 (= plot.height) → firstLane=floor(200/24)=8 > lastLane=2 → loop is empty.
    draw(ctx, makeGeom({ scrollOffset: 200 }), style);
    expect(ctx.fillText).not.toHaveBeenCalled();
    expect(ctx.moveTo).not.toHaveBeenCalled();
    // Lane loop produces nothing, but the lane-area clip rect is still drawn once.
    expect(ctx.rect).toHaveBeenCalledTimes(1);
  });

  it('still clears the canvas and calls drawTimeBar when all lanes are culled', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom({ scrollOffset: 200 }), style);
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(mockDrawTimeBar).toHaveBeenCalledTimes(1);
  });

  it('draws nothing (except clear + timeBar) for an empty spans array', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom({ spans: [] }), style);
    expect(ctx.fillText).not.toHaveBeenCalled();
    expect(ctx.moveTo).not.toHaveBeenCalled();
    expect(ctx.rect).not.toHaveBeenCalled();
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(mockDrawTimeBar).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: vertical culling regression (large-N / performance gate, Spec 8)
// ---------------------------------------------------------------------------

describe('draw — vertical culling regression (large-N)', () => {
  /**
   * Builds a deterministic span list of the requested size. All spans span the full domain
   * so none are horizontally culled — every call into the loop body can only be avoided via
   * vertical (lane-window) culling.
   */
  function makeLargeNSpans(count: number): NormalizedSpan[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `s${i}`,
      name: `Span ${i}`,
      start: 0,
      end: 1000,
      activeSegments: [{ start: 0, end: 500 }],
      meta: { id: `s${i}`, name: `Span ${i}`, traceId: 't1', start: 0, end: 1000 } satisfies TraceDatum,
    }));
  }

  it('draw() is O(visible lanes), not O(N), for 5000 spans', () => {
    const ctx = makeCtx();
    const SPAN_COUNT = 5000;
    // Plot height = PLOT_HEIGHT (168 px), laneHeight = LANE_HEIGHT (24 px), scrollOffset = 0.
    // Renderer: firstLane = floor(0/24) = 0, lastLane = floor(168/24) = 7 → 8 lanes visited.
    const firstLane = Math.max(0, Math.floor(0 / LANE_HEIGHT));
    const lastLane = Math.min(SPAN_COUNT - 1, Math.floor(PLOT_HEIGHT / LANE_HEIGHT));
    const VISIBLE_LANES = lastLane - firstLane + 1; // 8, far fewer than 5000

    const geom = makeGeom({ spans: makeLargeNSpans(SPAN_COUNT) });
    draw(ctx, geom, style);

    // Each visible lane has exactly 1 fillText (gutter label) and 1 active rect.
    // Even with a generous margin (× 4) the total is tiny compared with SPAN_COUNT.
    expect(ctx.fillText).toHaveBeenCalledTimes(VISIBLE_LANES);
    expect((ctx.rect as jest.Mock).mock.calls.length).toBeLessThan(VISIBLE_LANES * 4);
    expect((ctx.rect as jest.Mock).mock.calls.length).toBeLessThan(SPAN_COUNT);
  });
});

// ---------------------------------------------------------------------------
// Tests: segment culling (out-of-plot-range x coordinates)
// ---------------------------------------------------------------------------

describe('draw — segment culling (x-range cull)', () => {
  it('skips segments to the left and right of the plot, draws only the visible one', () => {
    const ctx = makeCtx();
    const spansWithOob: NormalizedSpan[] = [
      {
        id: 'x',
        name: 'OOB',
        start: 0,
        end: 1000,
        activeSegments: [
          // scale(-500)=-150, scale(-100)=130 → segX2=130 < plot.left=200 → culled
          { start: -500, end: -100 },
          // scale(1500)=1250 > plotRight=900 → segX1>plotRight → culled
          { start: 1500, end: 2000 },
          // scale(200)=340, scale(400)=480 → visible
          { start: 200, end: 400 },
        ],
        meta: { id: 'x', name: 'OOB', traceId: 't1', start: 0, end: 1000 } satisfies TraceDatum,
      },
    ];
    draw(ctx, makeGeom({ spans: spansWithOob }), style);
    // 1 visible segment rect + 1 lane-area clip rect.
    expect(ctx.rect).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Tests: total-duration line clamping
// ---------------------------------------------------------------------------

describe('draw — total-duration line clamping', () => {
  it('clamps the total line start to plot.left when span.start is left of the visible window', () => {
    // Span runs from t=-500 to t=500; its raw scaled x1 falls to the left of plot.left=200.
    // scale(-500) = 200 + (-500/1000)*700 = 200 - 350 = -150  → left of plot.left
    // scale(500)  = 200 + (500/1000)*700  = 200 + 350 = 550   → inside plot
    const ctx = makeCtx();
    const oobSpan: NormalizedSpan[] = [
      {
        id: 'oob',
        name: 'OOB-start',
        start: -500,
        end: 500,
        activeSegments: [],
        meta: { id: 'oob', name: 'OOB-start', traceId: 't1', start: -500, end: 500 } satisfies TraceDatum,
      },
    ];
    draw(ctx, makeGeom({ spans: oobSpan }), style);
    // The total line must be drawn (span is partially visible).
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    // moveTo(x, y) — x must equal plot.left (200), not the raw -150.
    const [movedX] = (ctx.moveTo as jest.Mock).mock.calls[0] as [number, number];
    expect(movedX).toBe(PLOT_LEFT);
  });

  it('clamps the total line end to plotRight when span.end is right of the visible window', () => {
    // Span runs from t=0 to t=1500; its raw x2 falls right of plotRight=900.
    // scale(0)    = 200   → inside plot
    // scale(1500) = 200 + (1500/1000)*700 = 1250 → right of plotRight=900
    const ctx = makeCtx();
    const oobSpan: NormalizedSpan[] = [
      {
        id: 'oob',
        name: 'OOB-end',
        start: 0,
        end: 1500,
        activeSegments: [],
        meta: { id: 'oob', name: 'OOB-end', traceId: 't1', start: 0, end: 1500 } satisfies TraceDatum,
      },
    ];
    draw(ctx, makeGeom({ spans: oobSpan }), style);
    expect(ctx.lineTo).toHaveBeenCalledTimes(1);
    // lineTo(x, y) — x must equal plotRight (PLOT_LEFT + PLOT_WIDTH = 900), not 1250.
    const [lineX] = (ctx.lineTo as jest.Mock).mock.calls[0] as [number, number];
    expect(lineX).toBe(PLOT_LEFT + PLOT_WIDTH);
  });
});

// ---------------------------------------------------------------------------
// Tests: per-span color override
// ---------------------------------------------------------------------------

describe('draw — per-span color override', () => {
  it('does not throw when span.color is set and renders one active segment rect', () => {
    const ctx = makeCtx();
    const coloredSpans: NormalizedSpan[] = [
      {
        id: 'col',
        name: 'Colored',
        start: 0,
        end: 500,
        activeSegments: [{ start: 0, end: 500 }],
        color: '#ff0000',
        meta: { id: 'col', name: 'Colored', traceId: 't1', start: 0, end: 500 } satisfies TraceDatum,
      },
    ];
    expect(() => draw(ctx, makeGeom({ spans: coloredSpans }), style)).not.toThrow();
    // 1 active segment rect + 1 lane-area clip rect.
    expect(ctx.rect).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Tests: per-segment color (phase labels)
// ---------------------------------------------------------------------------

describe('draw — per-segment color override', () => {
  it('does not throw when segments carry distinct colors and renders the correct rect count', () => {
    const ctx = makeCtx();
    const phasedSpans: NormalizedSpan[] = [
      {
        id: 'phased',
        name: 'Phased',
        start: 0,
        end: 900,
        // Three labeled segments each with a resolved color (as produced by the pipeline).
        activeSegments: [
          { start: 0, end: 300, label: 'loading', color: '#ff0000' },
          { start: 300, end: 700, label: 'process', color: '#00ff00' },
          { start: 700, end: 900, label: 'final', color: '#0000ff' },
        ],
        meta: { id: 'phased', name: 'Phased', traceId: 't1', start: 0, end: 900 } satisfies TraceDatum,
      },
    ];
    expect(() => draw(ctx, makeGeom({ spans: phasedSpans }), style)).not.toThrow();
    // One rect per segment (3) + 1 lane-area clip rect.
    expect(ctx.rect).toHaveBeenCalledTimes(4);
  });

  it('falls back to the span-level activeFill for segments without a color', () => {
    // Mix: first segment has an explicit color, second does not. Both must render (no throw, 2 rects).
    const ctx = makeCtx();
    const mixedSpans: NormalizedSpan[] = [
      {
        id: 'mixed',
        name: 'Mixed',
        start: 0,
        end: 1000,
        activeSegments: [
          { start: 0, end: 500, color: '#ff0000' }, // explicit color
          { start: 500, end: 1000 },                 // no color → span fallback
        ],
        meta: { id: 'mixed', name: 'Mixed', traceId: 't1', start: 0, end: 1000 } satisfies TraceDatum,
      },
    ];
    expect(() => draw(ctx, makeGeom({ spans: mixedSpans }), style)).not.toThrow();
    // 2 segment rects + 1 lane-area clip rect.
    expect(ctx.rect).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// Tests: pickLane — boundary math
// ---------------------------------------------------------------------------

describe('pickLane — boundary math', () => {
  const geom = makeGeom(); // plot.top=32, laneHeight=24, scrollOffset=0, 3 spans

  describe('out-of-range y', () => {
    it('returns -1 for y above the plot top', () => {
      expect(pickLane(0, 0, geom)).toBe(-1);
      expect(pickLane(0, 31, geom)).toBe(-1);
    });

    it('returns -1 for y below the plot bottom', () => {
      // plot.top + plot.height = 32 + 168 = 200
      expect(pickLane(0, 201, geom)).toBe(-1);
    });
  });

  describe('lane index calculation', () => {
    it('returns 0 for the first lane', () => {
      expect(pickLane(0, 32, geom)).toBe(0); // exactly plot.top
      expect(pickLane(0, 55, geom)).toBe(0); // 55 - 32 = 23 < laneHeight=24
    });

    it('returns 1 for the second lane', () => {
      expect(pickLane(0, 56, geom)).toBe(1); // 56 - 32 = 24 → lane 1
      expect(pickLane(0, 79, geom)).toBe(1); // 79 - 32 = 47 < 48
    });

    it('returns 2 for the third lane', () => {
      expect(pickLane(0, 80, geom)).toBe(2); // 80 - 32 = 48 → lane 2
    });
  });

  describe('scrollOffset applied', () => {
    it('shifts the lane index by the scroll amount', () => {
      const scrolled = makeGeom({ scrollOffset: 24 }); // offset by 1 lane
      // floor((32 - 32 + 24) / 24) = 1
      expect(pickLane(0, 32, scrolled)).toBe(1);
      // floor((55 - 32 + 24) / 24) = floor(47/24) = 1
      expect(pickLane(0, 55, scrolled)).toBe(1);
      // floor((56 - 32 + 24) / 24) = floor(48/24) = 2
      expect(pickLane(0, 56, scrolled)).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('returns -1 for empty spans regardless of y', () => {
      const emptyGeom = makeGeom({ spans: [] });
      expect(pickLane(0, 50, emptyGeom)).toBe(-1);
    });

    it('is x-position-agnostic (y-only spec)', () => {
      expect(pickLane(0, 50, geom)).toBe(pickLane(999, 50, geom));
    });
  });
});

// ---------------------------------------------------------------------------
// Tests: canvas2dRenderer object
// ---------------------------------------------------------------------------

describe('canvas2dRenderer', () => {
  it('exposes draw and pickLane as functions', () => {
    expect(typeof canvas2dRenderer.draw).toBe('function');
    expect(typeof canvas2dRenderer.pickLane).toBe('function');
  });

  it('canvas2dRenderer.draw delegates to the module-level draw function', () => {
    const ctx = makeCtx();
    const geom = makeGeom();
    canvas2dRenderer.draw(ctx, geom, style);
    expect(mockDrawTimeBar).toHaveBeenCalledTimes(1);
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
  });

  it('canvas2dRenderer.pickLane delegates to the module-level pickLane function', () => {
    const geom = makeGeom();
    expect(canvas2dRenderer.pickLane(0, 32, geom)).toBe(0);
    expect(canvas2dRenderer.pickLane(0, 0, geom)).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// Tests: emptyMessage (trace-not-found canvas draw)
// ---------------------------------------------------------------------------

describe('draw — emptyMessage (trace-not-found empty state)', () => {
  it('draws a centered fillText when spans is empty and emptyMessage is set', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom({ spans: [], emptyMessage: 'No spans found for trace "x"' }), style);
    // renderText calls fillText once with the message.
    expect(ctx.fillText).toHaveBeenCalledTimes(1);
    const [text] = (ctx.fillText as jest.Mock).mock.calls[0] as [string, number, number];
    expect(text).toBe('No spans found for trace "x"');
  });

  it('still calls drawTimeBar before drawing the message (time bar must remain visible)', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom({ spans: [], emptyMessage: 'trace not found' }), style);
    expect(mockDrawTimeBar).toHaveBeenCalledTimes(1);
  });

  it('draws no fillText when spans is empty and emptyMessage is null', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom({ spans: [], emptyMessage: null }), style);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('draws no fillText when spans is non-empty and emptyMessage is set (message only for empty spans)', () => {
    const ctx = makeCtx();
    // emptyMessage is ignored when there are spans to render.
    draw(ctx, makeGeom({ emptyMessage: 'should not show' }), style);
    // fillText IS called but for gutter labels (3 spans), not the empty message.
    // The key assertion is that the message string never appears.
    const calls = (ctx.fillText as jest.Mock).mock.calls as [string, number, number][];
    expect(calls.every(([t]) => t !== 'should not show')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: labelPosition — Spec 17 responsive labels
// ---------------------------------------------------------------------------

describe("draw — labelPosition: 'none'", () => {
  const styleNone: TraceStyle = { ...style, labelPosition: 'none' };

  it('draws no span-name labels (zero fillText calls)', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom(), styleNone);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('still draws total-duration lines and active-segment rects', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom(), styleNone);
    // 3 spans → 3 total lines
    expect(ctx.moveTo).toHaveBeenCalledTimes(3);
    // SpanA=1 + SpanB=2 + SpanC=0 = 3 active rects + 1 lane-area clip rect.
    expect(ctx.rect).toHaveBeenCalledTimes(4);
  });
});

describe("draw — labelPosition: 'inline'", () => {
  // laneHeight=40 to accommodate bar band + label band (Spec 17 inline geometry).
  const styleInline: TraceStyle = {
    ...style,
    gutterWidth: 0,
    laneHeight: 40,
    labelPosition: 'inline',
  };
  // With gutterWidth=0, plot.left=0 and PLOT_LEFT_INLINE=0; adjust scale accordingly.
  const scaleInline = (t: number) => (t / 1000) * PLOT_WIDTH;
  const geomInline = () =>
    makeGeom({
      gutter: { top: 0, left: 0, width: 0, height: PLOT_TOP + PLOT_HEIGHT },
      plot: { top: PLOT_TOP, left: 0, width: PLOT_WIDTH, height: PLOT_HEIGHT },
      laneHeight: 40,
      scale: scaleInline,
    });

  it('draws one full-name label per visible span', () => {
    const ctx = makeCtx();
    draw(ctx, geomInline(), styleInline);
    // Three spans, all on-screen → 3 fillText calls.
    expect(ctx.fillText).toHaveBeenCalledTimes(3);
    const names = (ctx.fillText as jest.Mock).mock.calls.map(([t]: [string]) => t);
    // Labels are full names (no ellipsis truncation in inline mode).
    expect(names).toContain('SpanA');
    expect(names).toContain('SpanB');
    expect(names).toContain('SpanC');
  });

  it('clips all lane content to the plot rect via a single lane-area ctx.clip()', () => {
    const ctx = makeCtx();
    draw(ctx, geomInline(), styleInline);
    // The per-label clip has been removed; a single ctx.save()/ctx.clip()/ctx.restore() now
    // wraps all lane content (including inline labels), preventing time-bar overpaint.
    expect(ctx.clip).toHaveBeenCalledTimes(1);
  });

  it('draws no label for a span whose bar is entirely off-screen left', () => {
    // A span with start=-200, end=-100; scaled: x1=(−200/1000)*700=−140, x2=(−100/1000)*700=−70.
    // Both rawX1 and rawX2 are < plot.left=0 → bar is fully off-screen left → label is culled.
    const offScreenSpan: NormalizedSpan[] = [
      {
        id: 'oob',
        name: 'OffScreen',
        start: -200,
        end: -100,
        activeSegments: [],
        meta: { id: 'oob', name: 'OffScreen', traceId: 't1', start: -200, end: -100 } satisfies TraceDatum,
      },
    ];
    const ctx = makeCtx();
    draw(ctx, { ...geomInline(), spans: offScreenSpan }, styleInline);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('label is drawn when span starts off-screen left but is partially visible (sticky-left)', () => {
    // Span starts off-screen (scale(-500)=−350 < plot.left=0) but ends on-screen (scale(500)=350).
    // The label is NOT culled: rawX2=350 >= plot.left=0, so it draws with barStartX clamped to 0.
    const partialSpan: NormalizedSpan[] = [
      {
        id: 'partial',
        name: 'PartiallyVisible',
        start: -500,
        end: 500,
        activeSegments: [],
        meta: { id: 'partial', name: 'PartiallyVisible', traceId: 't1', start: -500, end: 500 } satisfies TraceDatum,
      },
    ];
    const ctx = makeCtx();
    draw(ctx, { ...geomInline(), spans: partialSpan }, styleInline);
    expect(ctx.fillText).toHaveBeenCalledTimes(1);
    const [text] = (ctx.fillText as jest.Mock).mock.calls[0] as [string];
    expect(text).toBe('PartiallyVisible');
  });
});
