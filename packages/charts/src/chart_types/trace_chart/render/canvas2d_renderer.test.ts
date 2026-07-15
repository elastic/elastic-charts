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

/**
 * Hand-rolled CanvasRenderingContext2D stub with jest.fn() spies on every method
 * the renderer's draw primitives touch. Extend this when additional ctx methods
 * are needed by future draw calls.
 */
function makeCtx(): CanvasRenderingContext2D {
  return {
    save: jest.fn(),
    restore: jest.fn(),
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    rect: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    setLineDash: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    fillRect: jest.fn(),
    // measureText must return a TextMetrics-like object. Length-proportional width
    // (7 px/char) keeps truncation behaviour deterministic in tests.
    measureText: jest.fn((text: string) => ({ width: text.length * 7 })),
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    // Settable properties — primitives assign to these directly.
    fillStyle: '' as CanvasRenderingContext2D['fillStyle'],
    strokeStyle: '' as CanvasRenderingContext2D['strokeStyle'],
    lineWidth: 0,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    lineJoin: 'miter' as CanvasLineJoin,
    lineCap: 'butt' as CanvasLineCap,
    direction: 'ltr' as CanvasDirection,
  } as unknown as CanvasRenderingContext2D;
}

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
    active: [{ start: 0, end: 500 }],
    meta: { id: 'a', name: 'SpanA', traceId: 't1', start: 0, end: 1000 } satisfies TraceDatum,
  },
  {
    id: 'b',
    name: 'SpanB',
    start: 100,
    end: 900,
    active: [
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
    active: [],
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
    scale: defaultScale,
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
    // SpanA: 1 active, SpanB: 2 active, SpanC: 0 active → 3 rects total.
    expect(ctx.rect).toHaveBeenCalledTimes(3);
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
    // SpanC has no active segments.
    expect(ctx.rect).not.toHaveBeenCalled();
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
    expect(ctx.rect).not.toHaveBeenCalled();
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
      active: [{ start: 0, end: 500 }],
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
        active: [
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
    expect(ctx.rect).toHaveBeenCalledTimes(1);
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
        active: [],
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
        active: [],
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
        active: [{ start: 0, end: 500 }],
        color: '#ff0000',
        meta: { id: 'col', name: 'Colored', traceId: 't1', start: 0, end: 500 } satisfies TraceDatum,
      },
    ];
    expect(() => draw(ctx, makeGeom({ spans: coloredSpans }), style)).not.toThrow();
    expect(ctx.rect).toHaveBeenCalledTimes(1);
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
