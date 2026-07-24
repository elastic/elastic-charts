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

import { ANNOTATION_MIN_HIT_WIDTH, layoutAnnotations, resolveAnnotationColors } from './annotation_layout';
import {
  draw,
  drawAnnotations,
  drawBadges,
  pickBadge,
  pickDisclosure,
  pickLane,
  pickRegion,
  resolveBadgeColors,
  canvas2dRenderer,
} from './canvas2d_renderer';
import type { ResolvedTraceAnnotation } from '../data/annotations';
import type { NormalizedSpan } from '../data/types';
import type { BadgeLayoutItem, LaneBadgeLayout, TraceGeometry, TraceStyle } from './types';
import { DEFAULT_TRACE_ANNOTATION_STYLE, DEFAULT_TRACE_BADGE_STYLE } from './types';
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
  timeAxisLayerCount: 2,
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
  criticalPathColor: '#C61E25',
  criticalPathThickness: 2,
  labelPosition: 'gutter',
  badge: DEFAULT_TRACE_BADGE_STYLE,
  annotation: DEFAULT_TRACE_ANNOTATION_STYLE,
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
    labelBandPx: 0,
    domain: { min: 0, max: 1000 },
    focusDomain: { min: 0, max: 1000 },
    scrollOffset: 0,
    xScaleType: 'linear',
    focusedLaneIndex: null,
    resolvedSelection: [],
    scale: defaultScale,
    emptyMessage: null,
    disclosureByLane: new Map(),
    criticalIntervalsByLane: new Map(),
    badgesByLane: new Map(),
    annotationsLayout: [],
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

  it("clears the full canvas width when a 'none'-mode badge gutter shifts plot.left past gutter.width", () => {
    // In 'none' mode the badge-only gutter (Spec 27) widens the fixed left region: plot.left moves
    // right of gutter.width. The clear must cover `plot.left + plot.width` (the true canvas width),
    // not `gutter.width + plot.width`, or the rightmost badge-gutter-wide strip is never cleared and
    // time-bar gridlines accumulate there across zoom/pan.
    const BADGE_GUTTER = 40;
    const ctx = makeCtx();
    const geom = makeGeom({
      gutter: { top: 0, left: 0, width: PLOT_LEFT - BADGE_GUTTER, height: PLOT_TOP + PLOT_HEIGHT },
    });
    draw(ctx, geom, style);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, PLOT_LEFT + PLOT_WIDTH, PLOT_TOP + PLOT_HEIGHT);
    // Guard against the regression: the narrower width must not be used.
    expect(ctx.clearRect).not.toHaveBeenCalledWith(
      0,
      0,
      PLOT_LEFT - BADGE_GUTTER + PLOT_WIDTH,
      PLOT_TOP + PLOT_HEIGHT,
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
          { start: 500, end: 1000 }, // no color → span fallback
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

// ---------------------------------------------------------------------------
// Tests: pickDisclosure — caret zone hit test (Spec 21)
// ---------------------------------------------------------------------------

describe('pickDisclosure', () => {
  // Geometry: gutter [0,200], plot starts at x=200, y=[32,200]
  // disclosureByLane: lane 0 at depth 0, lane 1 at depth 1
  const CARET_GLYPH_PX = 28;
  const CARET_INDENT_STEP_PX = 8;

  const geomWithCarets = makeGeom({
    disclosureByLane: new Map([
      [0, { state: 'expanded' as const, depth: 0, descendantCount: 2 }],
      [1, { state: 'collapsed' as const, depth: 1, descendantCount: 1 }],
    ]),
  });

  it('returns -1 when disclosureByLane is empty', () => {
    expect(pickDisclosure(5, 40, makeGeom())).toBe(-1);
  });

  it('returns -1 when x is in the plot area (not the gutter)', () => {
    // x=200 is plot.left → not in gutter
    expect(pickDisclosure(200, 40, geomWithCarets)).toBe(-1);
    expect(pickDisclosure(300, 40, geomWithCarets)).toBe(-1);
  });

  it('returns -1 when y is above the plot top', () => {
    expect(pickDisclosure(5, 0, geomWithCarets)).toBe(-1);
    expect(pickDisclosure(5, 31, geomWithCarets)).toBe(-1);
  });

  it('returns -1 for a lane without a caret (leaf lane)', () => {
    // Lane 2 (y=32+48=80) has no disclosure entry
    expect(pickDisclosure(5, 80, geomWithCarets)).toBe(-1);
  });

  it('returns lane 0 when x is within the depth-0 caret zone [0, CARET_GLYPH_PX)', () => {
    // lane 0 → y = 32..55; caret zone for depth 0 → x in [0, 28)
    expect(pickDisclosure(0, 40, geomWithCarets)).toBe(0);
    expect(pickDisclosure(27, 40, geomWithCarets)).toBe(0);
  });

  it('returns -1 when x is at the right edge of the depth-0 caret zone (exclusive)', () => {
    expect(pickDisclosure(CARET_GLYPH_PX, 40, geomWithCarets)).toBe(-1);
  });

  it('returns lane 1 when x is within the depth-1 caret zone', () => {
    // lane 1 → y = 56..79; depth-1 caret zone → x in [INDENT, INDENT + CARET_GLYPH_PX)
    const left = 1 * CARET_INDENT_STEP_PX; // = 8
    const right = left + CARET_GLYPH_PX; // = 28
    expect(pickDisclosure(left, 60, geomWithCarets)).toBe(1);
    expect(pickDisclosure(right - 1, 60, geomWithCarets)).toBe(1);
  });

  it('returns -1 when x is left of the depth-1 indent', () => {
    // x < 8 is not in the depth-1 caret zone
    expect(pickDisclosure(7, 60, geomWithCarets)).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// Tests: pickRegion — collapsed lane returns 'span' (Spec 21)
// ---------------------------------------------------------------------------

describe('pickRegion — collapsed lane', () => {
  // Geometry: gutter [0,200], plot starts at x=200, y=[32,200]
  // spans[0]: a span with activeSegments at [200, 400] in data coords
  // spans[0] is a collapsed parent (disclosureByLane says 'collapsed')

  function makeCollapsedGeom() {
    const collapsedSpan: NormalizedSpan = {
      id: 'parent',
      name: 'Parent',
      start: 0,
      end: 1000,
      // Rolled-up active segments (as produced by collapseLanes)
      activeSegments: [
        { start: 0, end: 500 },
        { start: 700, end: 1000 },
      ],
      meta: {} as never,
    };
    return makeGeom({
      spans: [collapsedSpan],
      disclosureByLane: new Map([[0, { state: 'collapsed' as const, depth: 0, descendantCount: 3 }]]),
    });
  }

  it('returns null outside the plot area', () => {
    expect(pickRegion(200, 0, makeCollapsedGeom())).toBeNull();
  });

  it('returns region "span" when pointer is within a collapsed bar extent', () => {
    // focusDomain [0,1000] → x=200 maps to t≈0 (plot.left = PLOT_LEFT = 200 in makeGeom)
    // x=500 → t=(500-200)/700 * 1000 ≈ 428ms — inside [0, 1000]
    const result = pickRegion(500, 40, makeCollapsedGeom());
    expect(result).not.toBeNull();
    expect(result!.region).toBe('span');
    expect(result!.segmentIndex).toBe(-1);
  });

  it('returns region "empty" when pointer is outside the collapsed bar extent', () => {
    // Scale: t = (x - 200) / 700 * 1000. For t > 1000: x > 200 + 700 = 900.
    // focusDomain.max = 1000 → x = 200 + 700 = 900 → t = 1000 = span.end (edge case)
    // x=910 → t > 1000 > span.end → empty
    const result = pickRegion(910, 40, makeCollapsedGeom());
    expect(result).not.toBeNull();
    expect(result!.region).toBe('empty');
  });

  it('returns active/waiting (not span) for a non-collapsed parent lane', () => {
    const expandedSpan: NormalizedSpan = {
      id: 'parent2',
      name: 'Parent2',
      start: 0,
      end: 1000,
      activeSegments: [{ start: 0, end: 500 }],
      meta: {} as never,
    };
    const geomExpanded = makeGeom({
      spans: [expandedSpan],
      disclosureByLane: new Map([[0, { state: 'expanded' as const, depth: 0, descendantCount: 1 }]]),
    });
    // x=300 → t = (300-200)/700*1000 ≈ 143ms — inside [0,500] active segment
    const result = pickRegion(300, 40, geomExpanded);
    expect(result).not.toBeNull();
    expect(result!.region).toBe('active');
  });
});

// ---------------------------------------------------------------------------
// Tests: critical-path draw pass (Spec 22)
// ---------------------------------------------------------------------------

describe('draw — critical-path pass', () => {
  // LANE_PADDING mirrors the renderer constant (canvas2d_renderer.ts:23); not exported.
  const LANE_PADDING = 3;

  it('draws no critical-path lines when criticalIntervalsByLane is empty (default)', () => {
    const ctx = makeCtx();
    draw(ctx, makeGeom(), style);
    // 3 spans → 3 total-duration renderMultiLine calls; no critical-path calls.
    expect(ctx.moveTo).toHaveBeenCalledTimes(3);
    expect(ctx.lineTo).toHaveBeenCalledTimes(3);
  });

  it('adds one renderMultiLine call per visible critical interval', () => {
    const ctx = makeCtx();
    const criticalIntervalsByLane = new Map([[0, [{ start: 200, end: 700 }]]]);
    draw(ctx, makeGeom({ criticalIntervalsByLane }), style);
    // 3 total-duration lines + 1 critical-path line = 4
    expect(ctx.moveTo).toHaveBeenCalledTimes(4);
    expect(ctx.lineTo).toHaveBeenCalledTimes(4);
  });

  it('draws critical-path line at y = laneTop + laneHeight - LANE_PADDING for lane 0 (gutter mode)', () => {
    const ctx = makeCtx();
    const criticalIntervalsByLane = new Map([[0, [{ start: 0, end: 1000 }]]]);
    draw(ctx, makeGeom({ criticalIntervalsByLane }), style);
    // Lane 0, scrollOffset=0: cpLaneTop = PLOT_TOP + 0*LANE_HEIGHT - 0 = 32
    // labelBandPx = 0 (gutter mode) → y = 32 + 24 - 3 - 0 = 53
    const expectedY = PLOT_TOP + 0 * LANE_HEIGHT + LANE_HEIGHT - LANE_PADDING;
    const moveToYValues = (ctx.moveTo as jest.Mock).mock.calls.map(([, y]: [number, number]) => y);
    expect(moveToYValues).toContain(expectedY);
  });

  it('draws critical-path line at the bar bottom edge (above the label band) in inline mode', () => {
    // In inline mode: labelBandPx = gutterLabel.fontSize + LANE_PADDING = 11 + 3 = 14
    // Lane 0, laneHeight=40: cpLaneTop = PLOT_TOP = 32
    // y = 32 + 40 - 3 - 14 = 55  (= barBottom, above the 14 px label band)
    const LABEL_BAND_PX = style.gutterLabel.fontSize + LANE_PADDING; // 11 + 3 = 14
    const INLINE_LANE_HEIGHT = 40;
    const styleInline: TraceStyle = {
      ...style,
      labelPosition: 'inline',
      gutterWidth: 0,
      laneHeight: INLINE_LANE_HEIGHT,
    };
    const scaleInline = (t: number) => (t / 1000) * PLOT_WIDTH;
    const criticalIntervalsByLane = new Map([[0, [{ start: 0, end: 1000 }]]]);
    const ctx = makeCtx();
    draw(
      ctx,
      makeGeom({
        spans: [spans[0]!],
        gutter: { top: 0, left: 0, width: 0, height: PLOT_TOP + PLOT_HEIGHT },
        plot: { top: PLOT_TOP, left: 0, width: PLOT_WIDTH, height: PLOT_HEIGHT },
        laneHeight: INLINE_LANE_HEIGHT,
        labelBandPx: LABEL_BAND_PX,
        scale: scaleInline,
        criticalIntervalsByLane,
      }),
      styleInline,
    );
    const expectedY = PLOT_TOP + INLINE_LANE_HEIGHT - LANE_PADDING - LABEL_BAND_PX; // 55
    const moveToYValues = (ctx.moveTo as jest.Mock).mock.calls.map(([, y]: [number, number]) => y);
    expect(moveToYValues).toContain(expectedY);
    // Confirm the inline y (55) is strictly above the lane bottom (32+40-3=69) and above the gutter y (53).
    expect(expectedY).toBeLessThan(PLOT_TOP + INLINE_LANE_HEIGHT - LANE_PADDING);
  });

  it('culls critical intervals on lanes outside the scroll viewport', () => {
    const ctx = makeCtx();
    // scrollOffset=48 → firstLane=floor(48/24)=2, lastLane=2 → only SpanC (lane 2) is visible.
    // Critical intervals are on lanes 0 and 1 — both culled.
    const criticalIntervalsByLane = new Map([
      [0, [{ start: 0, end: 500 }]],
      [1, [{ start: 100, end: 600 }]],
    ]);
    draw(ctx, makeGeom({ scrollOffset: 48, criticalIntervalsByLane }), style);
    // Only SpanC's total-duration line (1 moveTo); no critical-path moveTo added.
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.lineTo).toHaveBeenCalledTimes(1);
  });

  it('sub-interval draws narrower (smaller x span) than a full-span interval', () => {
    // Use a single span (SpanA) so moveTo[1]/lineTo[1] is always the critical-path line.
    const spanA = spans[0]!;

    const ctxFull = makeCtx();
    draw(
      ctxFull,
      makeGeom({ spans: [spanA], criticalIntervalsByLane: new Map([[0, [{ start: 0, end: 1000 }]]]) }),
      style,
    );
    // moveTo[0]/lineTo[0] = total-duration; moveTo[1]/lineTo[1] = critical-path.
    const fullX1 = ((ctxFull.moveTo as jest.Mock).mock.calls[1] as [number, number])[0];
    const fullX2 = ((ctxFull.lineTo as jest.Mock).mock.calls[1] as [number, number])[0];

    const ctxSub = makeCtx();
    draw(
      ctxSub,
      makeGeom({ spans: [spanA], criticalIntervalsByLane: new Map([[0, [{ start: 200, end: 700 }]]]) }),
      style,
    );
    const subX1 = ((ctxSub.moveTo as jest.Mock).mock.calls[1] as [number, number])[0];
    const subX2 = ((ctxSub.lineTo as jest.Mock).mock.calls[1] as [number, number])[0];

    // Full interval [0,1000]: x1=scale(0)=200, x2=scale(1000)=900 → width=700
    // Sub interval [200,700]: x1=scale(200)=340, x2=scale(700)=690 → width=350
    expect(fullX2 - fullX1).toBeGreaterThan(subX2 - subX1);
    // Sub-interval starts further right (deeper into the span).
    expect(subX1).toBeGreaterThan(fullX1);
    // Sub-interval ends further left (before the span end).
    expect(subX2).toBeLessThan(fullX2);
  });
});

// ---------------------------------------------------------------------------
// Tests: Span badges (Spec 27) — palette resolution + draw pass
// ---------------------------------------------------------------------------

describe('resolveBadgeColors', () => {
  const palette = DEFAULT_TRACE_BADGE_STYLE.palette;

  it('uses the default token when no color is given', () => {
    expect(resolveBadgeColors(undefined, palette)).toBe(palette.default);
  });

  it('maps a named token to its palette entry', () => {
    expect(resolveBadgeColors('success', palette)).toBe(palette.success);
  });

  it('treats a custom Color as the background with auto-contrasting text', () => {
    expect(resolveBadgeColors('#000000', palette)).toEqual({ background: '#000000', text: '#ffffff' });
    expect(resolveBadgeColors('#ffffff', palette)).toEqual({ background: '#ffffff', text: '#1a1c21' });
  });
});

describe('drawBadges', () => {
  const badgeItem = (overrides: Partial<BadgeLayoutItem> = {}): BadgeLayoutItem => ({
    badge: { id: 'b', text: 'GET' },
    x: 210,
    y: 40,
    width: 40,
    height: 20,
    text: 'GET',
    textX: 216,
    fontSize: 12,
    ariaLabel: 'GET',
    ...overrides,
  });

  const geomWithBadges = (items: BadgeLayoutItem[]): TraceGeometry =>
    makeGeom({ badgesByLane: new Map<number, LaneBadgeLayout>([[0, { items }]]) });

  it('is a no-op when no badges are laid out', () => {
    const ctx = makeCtx();
    drawBadges(ctx, makeGeom(), style, () => undefined);
    expect(ctx.drawImage).not.toHaveBeenCalled();
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('draws the (already-truncated) badge text', () => {
    const ctx = makeCtx();
    drawBadges(ctx, geomWithBadges([badgeItem({ text: 'GE…' })]), style, () => undefined);
    expect(ctx.fillText).toHaveBeenCalledWith('GE…', expect.any(Number), expect.any(Number));
  });

  it('draws a decoded image when the resolver returns one', () => {
    const ctx = makeCtx();
    // A real canvas is a valid CanvasImageSource (jest-canvas-mock rejects plain objects).
    const fakeImage = document.createElement('canvas') as CanvasImageSource;
    const item = badgeItem({
      text: undefined,
      image: { src: 'i.svg', crossOrigin: 'anonymous', x: 214, y: 44, size: 12 },
    });
    drawBadges(ctx, geomWithBadges([item]), style, () => fakeImage);
    expect(ctx.drawImage).toHaveBeenCalledWith(fakeImage, 214, 44, 12, 12);
  });

  it('draws a placeholder (no drawImage) while the image is unresolved', () => {
    const ctx = makeCtx();
    const item = badgeItem({
      text: undefined,
      image: { src: 'i.svg', crossOrigin: 'anonymous', x: 214, y: 44, size: 12 },
    });
    drawBadges(ctx, geomWithBadges([item]), style, () => undefined);
    expect(ctx.drawImage).not.toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled(); // placeholder box filled via renderRect
  });

  it('skips the pill fill for a transparent (hollow) treatment but strokes a border', () => {
    const ctx = makeCtx();
    drawBadges(
      ctx,
      geomWithBadges([badgeItem({ badge: { id: 'b', text: 'x', color: 'hollow' } })]),
      style,
      () => undefined,
    );
    expect(ctx.stroke).toHaveBeenCalled(); // border stroked
  });

  it('badge media inherits badge size', () => {
    const ctx = makeCtx();
    const img = document.createElement('canvas') as CanvasImageSource;
    // The image box is a square driven by the shared badge size (here 16), independent of the
    // image's intrinsic dimensions — so the media scales with the badge, not vice versa.
    const item = badgeItem({
      text: undefined,
      image: { src: 'i.svg', crossOrigin: 'anonymous', x: 214, y: 42, size: 16 },
    });
    drawBadges(ctx, geomWithBadges([item]), style, () => img);
    const [, , , w, h] = (ctx.drawImage as jest.Mock).mock.calls[0]!;
    expect(w).toBe(16);
    expect(h).toBe(16); // square box = the badge-size media box
  });

  it('badges render without interaction handlers', () => {
    const ctx = makeCtx();
    // drawBadges takes only geometry, style, and an image resolver — never interaction handlers —
    // so badges are drawn as pure adornments regardless of whether onBadge* handlers are supplied.
    drawBadges(ctx, geomWithBadges([badgeItem()]), style, () => undefined);
    expect(ctx.fillText).toHaveBeenCalledWith('GET', expect.any(Number), expect.any(Number));
  });

  it('badge visibility is independent of label drawing', () => {
    const ctx = makeCtx();
    // Even with labels omitted (`labelPosition: 'none'`), laid-out badges still draw: badge
    // visibility is decided during layout, not gated on whether span labels are rendered.
    const noneStyle = { ...style, labelPosition: 'none' as const };
    drawBadges(ctx, geomWithBadges([badgeItem()]), noneStyle, () => undefined);
    expect(ctx.fillText).toHaveBeenCalledWith('GET', expect.any(Number), expect.any(Number));
  });
});

describe('pickBadge', () => {
  const item = (id: string, x: number): BadgeLayoutItem => ({
    badge: { id, text: id },
    x,
    y: 40,
    width: 30,
    height: 20,
    text: id,
    textX: x + 6,
    fontSize: 12,
    ariaLabel: id,
  });

  const geomWith = (map: Map<number, LaneBadgeLayout>): TraceGeometry => makeGeom({ badgesByLane: map });

  it('returns null when there are no badges', () => {
    expect(pickBadge(10, 45, makeGeom())).toBeNull();
  });

  it('returns the badge whose rect contains the point', () => {
    const hit = pickBadge(220, 45, geomWith(new Map([[0, { items: [item('a', 210), item('b', 250)] }]])));
    expect(hit?.item.badge.id).toBe('a');
    expect(hit?.laneIndex).toBe(0);
  });

  it('returns null when the point is between badges', () => {
    expect(pickBadge(245, 45, geomWith(new Map([[0, { items: [item('a', 210), item('b', 250)] }]])))).toBeNull();
  });

  it('resolves duplicate-id badges to the first match (accessor order)', () => {
    // Two overlapping badges with the same id → first wins for deterministic interaction.
    const dup: BadgeLayoutItem[] = [item('same', 210), { ...item('same', 210), badge: { id: 'same', text: 'second' } }];
    const hit = pickBadge(215, 45, geomWith(new Map([[0, { items: dup }]])));
    expect(hit?.item.badge.text).toBe('same');
  });
});

// ---------------------------------------------------------------------------
// Tests: layoutAnnotations (Spec 29)
// ---------------------------------------------------------------------------

const timeResolved = (
  id: string,
  position: { time?: number; range?: [number, number] },
  color?: ResolvedTraceAnnotation['color'],
  placement: 'plot' | 'timebar' = 'plot',
): ResolvedTraceAnnotation => ({ id, kind: 'time', placement, datum: { id }, ariaLabel: id, color, ...position });

const spanResolved = (
  kind: 'lane' | 'hierarchy',
  id: string,
  spanId: string,
  routeSpanIds: string[],
): ResolvedTraceAnnotation => ({
  id,
  kind,
  datum: { id },
  ariaLabel: id,
  spanId,
  routeSpanIds,
  span: spans.find((s) => s.id === spanId) ?? spans[0]!,
});

describe('layoutAnnotations', () => {
  it('returns [] when there are no annotations', () => {
    expect(layoutAnnotations(makeGeom(), style, [])).toEqual([]);
  });

  it('lays out a time-point marker spanning the full plot height with a min-width hit band', () => {
    const [item] = layoutAnnotations(makeGeom(), style, [timeResolved('t', { time: 500 })]);
    expect(item!.lines).toEqual([{ x1: 550, y1: PLOT_TOP, x2: 550, y2: PLOT_TOP + PLOT_HEIGHT }]);
    expect(item!.hitRects).toEqual([
      { x: 550 - ANNOTATION_MIN_HIT_WIDTH / 2, y: PLOT_TOP, width: ANNOTATION_MIN_HIT_WIDTH, height: PLOT_HEIGHT },
    ]);
    expect(item!.band).toBeUndefined();
  });

  it('culls a time-point annotation outside the focus domain', () => {
    const geom = makeGeom({ focusDomain: { min: 0, max: 400 } });
    expect(layoutAnnotations(geom, style, [timeResolved('t', { time: 800 })])).toEqual([]);
  });

  it('lays out a time-range band with an edge rail on each visible edge', () => {
    const [item] = layoutAnnotations(makeGeom(), style, [timeResolved('r', { range: [200, 600] })]);
    expect(item!.band).toEqual({ x: 340, y: PLOT_TOP, width: 280, height: PLOT_HEIGHT });
    expect(item!.lines).toHaveLength(2);
    expect(item!.hitRects).toHaveLength(2);
  });

  it('clips a partially-visible range and drops the off-screen edge rail (edges-only)', () => {
    // Range starts before the visible domain (min 300): only the end edge (600) is a rail/hit target.
    // A focus-domain-honoring scale maps [300,1000] onto the plot, so scale(100) falls left of plot.left.
    const scale = (t: number) => PLOT_LEFT + ((t - 300) / (1000 - 300)) * PLOT_WIDTH;
    const geom = makeGeom({ focusDomain: { min: 300, max: 1000 }, scale });
    const [item] = layoutAnnotations(geom, style, [timeResolved('r', { range: [100, 600] })]);
    expect(item!.band!.x).toBe(PLOT_LEFT); // clipped to plot left
    expect(item!.lines).toHaveLength(1);
    expect(item!.hitRects).toHaveLength(1);
  });

  it('lays out a lane annotation as a boundary rail at plot.left on the target lane', () => {
    const [item] = layoutAnnotations(makeGeom(), style, [spanResolved('lane', 'l', 'b', ['b'])]);
    const laneTop = PLOT_TOP + 1 * LANE_HEIGHT; // lane index 1 (span 'b')
    expect(item!.lines).toEqual([{ x1: PLOT_LEFT, y1: laneTop, x2: PLOT_LEFT, y2: laneTop + LANE_HEIGHT }]);
    expect(item!.hitRects[0]).toMatchObject({ x: PLOT_LEFT - ANNOTATION_MIN_HIT_WIDTH / 2, y: laneTop });
  });

  it('omits a lane annotation whose target span is not visible (collapse-hidden)', () => {
    expect(layoutAnnotations(makeGeom(), style, [spanResolved('lane', 'l', 'ghost', ['ghost'])])).toEqual([]);
  });

  it('lays out a hierarchy annotation as segmented rails, skipping route lanes not visible', () => {
    // Route a→x→c; 'x' is not in the visible spans, so only lanes 0 (a) and 2 (c) get a segment.
    const [item] = layoutAnnotations(makeGeom(), style, [spanResolved('hierarchy', 'h', 'c', ['a', 'x', 'c'])]);
    expect(item!.lines).toHaveLength(2);
    const ys = item!.lines.map((l) => l.y1);
    expect(ys).toEqual([PLOT_TOP + 0 * LANE_HEIGHT, PLOT_TOP + 2 * LANE_HEIGHT]);
  });

  describe('time-bar placement (Spec 29)', () => {
    // Time bar spans y=[0, PLOT_TOP]; 'timebar' marks occupy its lower half only (over the ticks).
    const TICK_TOP = PLOT_TOP / 2; // 16
    const TICK_HEIGHT = PLOT_TOP - TICK_TOP; // 16

    it('lays out a time-bar point as a lower-half tick and a marker head, with a lower-half hit and no plot rail', () => {
      const [item] = layoutAnnotations(makeGeom(), style, [timeResolved('t', { time: 500 }, undefined, 'timebar')]);
      // Tick lives in the lower half of the time bar (tick top → plot.top); no full-plot rail, no guide.
      expect(item!.lines).toEqual([{ x1: 550, y1: TICK_TOP, x2: 550, y2: PLOT_TOP }]);
      // Marker head sits at the gutter/plot boundary.
      expect(item!.markers).toEqual([{ x: 550, y: PLOT_TOP }]);
      // Hit band covers only the lower-half tick region (time bar), never the plot.
      expect(item!.hitRects).toEqual([
        { x: 550 - ANNOTATION_MIN_HIT_WIDTH / 2, y: TICK_TOP, width: ANNOTATION_MIN_HIT_WIDTH, height: TICK_HEIGHT },
      ]);
      expect(item!.band).toBeUndefined();
    });

    it('lays out a time-bar range as a lower-half band with edge ticks and lower-half edges-only hits', () => {
      const [item] = layoutAnnotations(makeGeom(), style, [timeResolved('r', { range: [200, 600] }, undefined, 'timebar')]);
      // Band is tinted across the lower half of the time bar only (not the plot).
      expect(item!.timeBarBand).toEqual({ x: 340, y: TICK_TOP, width: 280, height: TICK_HEIGHT });
      expect(item!.band).toBeUndefined();
      // Edge ticks in the lower half; no plot guides.
      expect(item!.lines).toHaveLength(2);
      // Edges-only, lower-half hit bands.
      expect(item!.hitRects).toHaveLength(2);
      expect(item!.hitRects[0]).toMatchObject({ y: TICK_TOP, height: TICK_HEIGHT });
    });

    it('clips a partially-visible time-bar range and drops the off-screen edge (edges-only)', () => {
      const scale = (t: number) => PLOT_LEFT + ((t - 300) / (1000 - 300)) * PLOT_WIDTH;
      const geom = makeGeom({ focusDomain: { min: 300, max: 1000 }, scale });
      const [item] = layoutAnnotations(geom, style, [timeResolved('r', { range: [100, 600] }, undefined, 'timebar')]);
      expect(item!.timeBarBand!.x).toBe(PLOT_LEFT); // clipped to plot left
      expect(item!.lines).toHaveLength(1);
      expect(item!.hitRects).toHaveLength(1);
    });
  });
});

describe('resolveAnnotationColors', () => {
  const palette = DEFAULT_TRACE_ANNOTATION_STYLE.palette;

  it('uses the default token when no color is given', () => {
    expect(resolveAnnotationColors(undefined, palette)).toBe(palette.default);
  });

  it('maps a named token to its palette entry', () => {
    expect(resolveAnnotationColors('danger', palette)).toBe(palette.danger);
  });

  it('uses a custom Color for both stroke and fill', () => {
    expect(resolveAnnotationColors('#123456', palette)).toEqual({ stroke: '#123456', fill: '#123456' });
  });
});

describe('drawAnnotations', () => {
  const geomWithAnnotations = (annotations: ResolvedTraceAnnotation[]): TraceGeometry => {
    const base = makeGeom();
    return { ...base, annotationsLayout: layoutAnnotations(base, style, annotations) };
  };

  it('is a no-op when nothing is laid out', () => {
    const ctx = makeCtx();
    drawAnnotations(ctx, makeGeom(), style);
    expect(ctx.moveTo).not.toHaveBeenCalled();
    expect(ctx.fill).not.toHaveBeenCalled();
  });

  it('strokes a rail for a time-point annotation', () => {
    const ctx = makeCtx();
    drawAnnotations(ctx, geomWithAnnotations([timeResolved('t', { time: 500 })]), style);
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('fills the range band for a time-range annotation', () => {
    const ctx = makeCtx();
    drawAnnotations(ctx, geomWithAnnotations([timeResolved('r', { range: [200, 600] })]), style);
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('renders without any interaction handlers (annotations are pure adornments)', () => {
    const ctx = makeCtx();
    drawAnnotations(ctx, geomWithAnnotations([spanResolved('lane', 'l', 'b', ['b'])]), style);
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('draws a triangular marker head and strokes the lower-half tick for a time-bar point', () => {
    const ctx = makeCtx();
    drawAnnotations(ctx, geomWithAnnotations([timeResolved('t', { time: 500 }, undefined, 'timebar')]), style);
    // Filled triangle marker head.
    expect(ctx.fill).toHaveBeenCalled();
    // Lower-half tick stroke.
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('fills the time-bar band for a time-bar range', () => {
    const ctx = makeCtx();
    drawAnnotations(ctx, geomWithAnnotations([timeResolved('r', { range: [200, 600] }, undefined, 'timebar')]), style);
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
