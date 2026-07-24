/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Spec 4 — Time bar unit tests.
 *
 * Goal: verify that the correct raster factory is selected per `xScaleType` and that the
 * function does not throw on representative inputs. Visual correctness is verified via the
 * Storybook story (04_time_bar) per spec.
 */

import { drawTimeBar, pickElapsedUnit, formatElapsedMs } from './time_bar';
import type { TraceGeometry } from './types';
import type { TraceStyle } from './types';
import { DEFAULT_TRACE_ANNOTATION_STYLE, DEFAULT_TRACE_BADGE_STYLE } from './types';

// ---------------------------------------------------------------------------
// Mocks: intercept raster factory calls so we can assert which was selected.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockContinuousTimeRasters: jest.MockedFunction<(...args: any[]) => (...args: any[]) => any[]> = jest.fn(() => () => []);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockNumericalRasters: jest.MockedFunction<(...args: any[]) => (...args: any[]) => any[]> = jest.fn(() => () => []);

jest.mock('../../../chart_types/xy_chart/axes/timeslip/continuous_time_rasters', () => ({
  ...jest.requireActual('../../../chart_types/xy_chart/axes/timeslip/continuous_time_rasters'),
  continuousTimeRasters: (config: unknown, tz: unknown) => mockContinuousTimeRasters(config, tz),
}));

jest.mock('../../../chart_types/xy_chart/axes/timeslip/numerical_rasters', () => ({
  ...jest.requireActual('../../../chart_types/xy_chart/axes/timeslip/numerical_rasters'),
  numericalRasters: (config: unknown) => mockNumericalRasters(config),
}));

// ---------------------------------------------------------------------------
// Minimal stubs
// ---------------------------------------------------------------------------

/** Minimal CanvasRenderingContext2D stub — only the calls drawTimeBar makes. */
function makeCtx(): CanvasRenderingContext2D {
  return {
    clearRect: jest.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    fillText: jest.fn(),
    strokeText: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    direction: 'ltr' as CanvasDirection,
    lineJoin: 'miter' as CanvasLineJoin,
    setLineDash: jest.fn(),
    measureText: jest.fn((text: string) => ({ width: text.length * 6 }) as unknown as TextMetrics),
  } as unknown as CanvasRenderingContext2D;
}

const style: TraceStyle = {
  gutterWidth: 200,
  timeBarHeight: 32,
  timeAxisLayerCount: 2,
  laneHeight: 24,
  totalLineThickness: 2,
  totalLineColor: '#ccc',
  activeSegmentColor: '#007',
  gutterLabel: { fontFamily: 'sans-serif', fontSize: 11, color: '#333' },
  timeBarLabel: { fontFamily: 'sans-serif', fontSize: 11, color: '#333' },
  gridLineColor: '#eee',
  focusedLaneBackground: 'rgba(96,146,192,0.15)',
  selectedSegmentStroke: '#f00',
  selectedSegmentStrokeWidth: 2,
  criticalPathColor: '#C61E25',
  criticalPathThickness: 2,
  labelPosition: 'gutter',
  badge: DEFAULT_TRACE_BADGE_STYLE,
  annotation: DEFAULT_TRACE_ANNOTATION_STYLE,
};

function makeGeom(xScaleType: 'time' | 'linear'): TraceGeometry {
  const plotLeft = 200;
  const plotWidth = 800;
  const focusDomain = { min: 0, max: 10_000 }; // 10 s
  return {
    spans: [],
    gutter: { top: 0, left: 0, width: 200, height: 600 },
    timeBar: { top: 0, left: plotLeft, width: plotWidth, height: 32 },
    plot: { top: 32, left: plotLeft, width: plotWidth, height: 568 },
    laneHeight: 24,
    labelBandPx: 0,
    domain: { min: 0, max: 10_000 },
    focusDomain,
    scrollOffset: 0,
    xScaleType,
    focusedLaneIndex: null,
    resolvedSelection: [],
    emptyMessage: null,
    disclosureByLane: new Map(),
    criticalIntervalsByLane: new Map(),
    badgesByLane: new Map(),
    annotationsLayout: [],
    scale: (tMs: number) => plotLeft + (tMs / 10_000) * plotWidth,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockContinuousTimeRasters.mockClear();
  mockNumericalRasters.mockClear();
});

describe('drawTimeBar — raster factory selection', () => {
  it('uses continuousTimeRasters for xScaleType "time"', () => {
    drawTimeBar(makeCtx(), makeGeom('time'), style);
    expect(mockContinuousTimeRasters).toHaveBeenCalledTimes(1);
    expect(mockNumericalRasters).not.toHaveBeenCalled();
  });

  it('uses numericalRasters for xScaleType "linear"', () => {
    drawTimeBar(makeCtx(), makeGeom('linear'), style);
    expect(mockNumericalRasters).toHaveBeenCalledTimes(1);
    expect(mockContinuousTimeRasters).not.toHaveBeenCalled();
  });
});

describe('drawTimeBar — robustness', () => {
  it('does not throw for a zero-width time bar', () => {
    const geom = makeGeom('time');
    const narrow = { ...geom, timeBar: { ...geom.timeBar, width: 0 } };
    expect(() => drawTimeBar(makeCtx(), narrow, style)).not.toThrow();
  });

  it('does not throw for a zero-height time bar', () => {
    const geom = makeGeom('linear');
    const flat = { ...geom, timeBar: { ...geom.timeBar, height: 0 } };
    expect(() => drawTimeBar(makeCtx(), flat, style)).not.toThrow();
  });

  it('does not throw when layers are returned (real rasters, no mock)', () => {
    // Un-mock for this test to exercise the real raster path end-to-end.
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { drawTimeBar: real } = require('./time_bar');
      expect(() => real(makeCtx(), makeGeom('time'), style)).not.toThrow();
      expect(() => real(makeCtx(), makeGeom('linear'), style)).not.toThrow();
    });
  });
});

describe('drawTimeBar — sub-ms ticks all render with distinct labels (linear mode, ADR 0010)', () => {
  /**
   * Before ADR 0010, a whole-ms boundary filter suppressed fractional-ms ticks (ADR 0004 Decision 3).
   * ADR 0010 removes that filter and instead uses a step-aware formatter with one unit per axis, so
   * every tick emitted by numericalRasters renders with a distinct label.
   *
   * Scenario: [344, 345] ms window, 0.1 ms step → 11 ticks.
   * One unit per axis: maxAbs≈345 ms → ms unit, step 0.1 ms → 1 decimal.
   * Expected labels: "344.0ms", "344.1ms", …, "345.0ms" — all 11 distinct.
   *
   * Note: these tests configure mockNumericalRasters directly so we control exactly which ticks
   * the raster engine "emits".
   */
  it('renders all sub-ms ticks with distinct step-precise labels in linear mode at deep zoom', () => {
    // Simulate what numericalRasters returns for a ~1 ms window: sub-ms ticks at 0.1 ms spacing.
    const subMsTicks = [344.0, 344.1, 344.2, 344.3, 344.4, 344.5, 344.6, 344.7, 344.8, 344.9, 345.0].map(
      (v, i, a) => ({ minimum: v, supremum: a[i + 1] ?? v + 0.1, labelSupremum: a[i + 1] ?? v + 0.1 }),
    );
    const subMsLayer = {
      unit: 'one',
      unitMultiplier: Infinity,
      labeled: true,
      minimumTickPixelDistance: 24,
      intervals: () => subMsTicks,
      detailedLabelFormat: String,
      minorTickLabelFormat: String,
    };
    // mockNumericalRasters(config) returns the rasterSelector function; the selector is called with
    // the notTooDense filter and should return the layer list. We ignore the filter to control output.
    mockNumericalRasters.mockReturnValueOnce(() => [subMsLayer]);

    const plotLeft = 200;
    const plotWidth = 800;
    const focusDomain = { min: 344, max: 345 };
    const geom: TraceGeometry = {
      spans: [],
      gutter: { top: 0, left: 0, width: 200, height: 600 },
      timeBar: { top: 0, left: plotLeft, width: plotWidth, height: 32 },
      plot: { top: 32, left: plotLeft, width: plotWidth, height: 568 },
      laneHeight: 24,
      labelBandPx: 0,
      domain: { min: 0, max: 10_000 },
      focusDomain,
      scrollOffset: 0,
      xScaleType: 'linear' as const,
      focusedLaneIndex: null,
      resolvedSelection: [],
      emptyMessage: null,
      disclosureByLane: new Map(),
      criticalIntervalsByLane: new Map(),
      badgesByLane: new Map(),
      annotationsLayout: [],
      scale: (tMs: number) => plotLeft + ((tMs - focusDomain.min) / (focusDomain.max - focusDomain.min)) * plotWidth,
    };

    const ctx = makeCtx();
    drawTimeBar(ctx, geom, style);

    // Collect every label string passed to fillText.
    const labels: string[] = (ctx.fillText as jest.Mock).mock.calls.map((args: unknown[]) => String(args[0]));

    // All 11 ticks render — no filter suppresses them.
    expect(labels.length).toBe(11);
    // One unit per axis: maxAbs≈345 → ms, step 0.1 ms → 1 decimal.
    expect(labels).toEqual(['344.0ms', '344.1ms', '344.2ms', '344.3ms', '344.4ms', '344.5ms', '344.6ms', '344.7ms', '344.8ms', '344.9ms', '345.0ms']);
    // No duplicates — each rendered tick has a unique label.
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('renders all ticks when the step is ≥ 1 ms (coarse zoom, integer labels)', () => {
    // Simulate what numericalRasters returns for a 10 s window: ticks every 1000 ms.
    const wideTicks = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000].map((v, i, a) => ({
      minimum: v,
      supremum: a[i + 1] ?? v + 1000,
      labelSupremum: a[i + 1] ?? v + 1000,
    }));
    const wideLayer = {
      unit: 'one',
      unitMultiplier: Infinity,
      labeled: true,
      minimumTickPixelDistance: 24,
      intervals: () => wideTicks,
      detailedLabelFormat: String,
      minorTickLabelFormat: String,
    };
    mockNumericalRasters.mockReturnValueOnce(() => [wideLayer]);

    const ctx = makeCtx();
    drawTimeBar(ctx, makeGeom('linear'), style);

    const labels: string[] = (ctx.fillText as jest.Mock).mock.calls.map((args: unknown[]) => String(args[0]));

    // All 11 ticks render.
    expect(labels.length).toBe(11);
    // No duplicates.
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('drawTimeBar — finest-labeled-layer selection (time mode)', () => {
  /**
   * continuousTimeRasters returns layers finest-first. The trace time bar must label the
   * finest labeled layer (layers[0] if labeled, or the first labeled layer found scanning forward)
   * so that ticks inside the visible window get labels. Picking the coarsest labeled layer instead
   * (the previous inverted scan) meant the coarse layer's boundary tick (e.g. Jan 1) was outside
   * the zoomed window and culled → no labels rendered at all in time mode.
   */
  it('labels the finest labeled layer (index 0) not the coarsest when time mode has multiple labeled layers', () => {
    // Simulate two labeled layers returned finest-first (as continuousTimeRasters does):
    //   [0] fine layer  — ms labels, tick at t=5 (within the focus window)
    //   [1] coarse layer — second labels, tick at t=0 (outside the focus window → culled)
    const fineMs = 5; // a tick value inside the window

    const fineLayer = {
      unit: 'millisecond' as const,
      unitMultiplier: 1,
      labeled: true,
      minimumTickPixelDistance: 24,
      intervals: () => [{ minimum: fineMs / 1000, supremum: (fineMs + 1) / 1000, labelSupremum: (fineMs + 1) / 1000 }],
      detailedLabelFormat: (d: number) => `${Math.round(d) % 1000}ms`,
      minorTickLabelFormat: (d: number) => `${Math.round(d) % 1000}ms`,
    };
    const coarseLayer = {
      unit: 'second' as const,
      unitMultiplier: 1,
      labeled: true,
      minimumTickPixelDistance: 24,
      // Tick at t=0 s — the epoch boundary; it will be outside the focus window [4ms, 6ms] and culled.
      intervals: () => [{ minimum: 0, supremum: 1, labelSupremum: 1 }],
      detailedLabelFormat: (_d: number) => `0s`,
      minorTickLabelFormat: (_d: number) => `0s`,
    };
    // Fine layer at index 0 (finest-first order), coarse at index 1.
    mockContinuousTimeRasters.mockReturnValueOnce(() => [fineLayer, coarseLayer]);

    // Focus window: [4ms, 6ms] — the fineLayer tick at 5ms is inside; the coarseLayer tick at 0s is outside.
    const plotLeft = 200;
    const plotWidth = 800;
    const focusDomain = { min: 4, max: 6 }; // ms
    const geom: TraceGeometry = {
      spans: [],
      gutter: { top: 0, left: 0, width: 200, height: 600 },
      timeBar: { top: 0, left: plotLeft, width: plotWidth, height: 32 },
      plot: { top: 32, left: plotLeft, width: plotWidth, height: 568 },
      laneHeight: 24,
      labelBandPx: 0,
      domain: { min: 0, max: 10_000 },
      focusDomain,
      scrollOffset: 0,
      xScaleType: 'time' as const,
      focusedLaneIndex: null,
      resolvedSelection: [],
      emptyMessage: null,
      disclosureByLane: new Map(),
      criticalIntervalsByLane: new Map(),
      badgesByLane: new Map(),
      annotationsLayout: [],
      // scale converts ms → canvas x; the domain is passed as seconds to the time engine,
      // but geom.scale always receives ms (tickMs = minimum * MS_PER_SECOND inside drawTimeBar).
      scale: (tMs: number) => plotLeft + ((tMs - focusDomain.min) / (focusDomain.max - focusDomain.min)) * plotWidth,
    };

    const ctx = makeCtx();
    // Single-row mode (timeAxisLayerCount: 0): this test targets the legacy finest-labeled-layer
    // selection. With the multi-level default (>= 1) the coarse layer's pinned leading label is also
    // drawn (covered separately in the Spec 25 suite below).
    drawTimeBar(ctx, geom, { ...style, timeAxisLayerCount: 0 });

    const labels: string[] = (ctx.fillText as jest.Mock).mock.calls.map((args: unknown[]) => String(args[0]));

    // At least one label rendered (the fine-layer tick at 5ms).
    expect(labels.length).toBeGreaterThanOrEqual(1);
    // Every rendered label must match the fine layer's ms format ("Xms"), NOT the coarse layer's ("0s").
    // If the coarsest layer had been picked, its tick (0s) would be outside the window → culled → 0 labels.
    labels.forEach((label) => {
      expect(label).toMatch(/^\d+ms$/);
    });
  });
});

// ---------------------------------------------------------------------------
// Spec 25 — multi-level (stacked) time bar (ADR 0024)
// ---------------------------------------------------------------------------

describe('drawTimeBar — multi-level time bar (Spec 25)', () => {
  // Plot spans x ∈ [200, 1000]; with focusDomain [0, 800] ms the scale is tickX = 200 + tickMs.
  function timeGeom(focusDomain: { min: number; max: number }): TraceGeometry {
    const plotLeft = 200;
    const plotWidth = 800;
    return {
      spans: [],
      gutter: { top: 0, left: 0, width: 200, height: 600 },
      timeBar: { top: 0, left: plotLeft, width: plotWidth, height: 34 },
      plot: { top: 34, left: plotLeft, width: plotWidth, height: 566 },
      laneHeight: 24,
      labelBandPx: 0,
      domain: { min: 0, max: 10_000 },
      focusDomain,
      scrollOffset: 0,
      xScaleType: 'time' as const,
      focusedLaneIndex: null,
      resolvedSelection: [],
      emptyMessage: null,
      disclosureByLane: new Map(),
      criticalIntervalsByLane: new Map(),
      badgesByLane: new Map(),
      annotationsLayout: [],
      scale: (tMs: number) => plotLeft + ((tMs - focusDomain.min) / (focusDomain.max - focusDomain.min)) * plotWidth,
    };
  }

  // Minimal AxisLayer stub. `ticksS` are tick minima in SECONDS (the time-engine unit); drawTimeBar
  // multiplies by 1000 before scaling. Formatters receive ms.
  function layer(opts: {
    unit: string;
    unitMultiplier?: number;
    ticksS: number[];
    minor: (d: number) => string;
    detailed: (d: number) => string;
  }) {
    return {
      unit: opts.unit,
      unitMultiplier: opts.unitMultiplier ?? 1,
      labeled: true,
      minimumTickPixelDistance: 24,
      intervals: () => opts.ticksS.map((m) => ({ minimum: m, supremum: m, labelSupremum: m })),
      minorTickLabelFormat: opts.minor,
      detailedLabelFormat: opts.detailed,
    };
  }

  const labelsOf = (ctx: CanvasRenderingContext2D): string[] =>
    (ctx.fillText as jest.Mock).mock.calls.map((args: unknown[]) => String(args[0]));
  const translateXsOf = (ctx: CanvasRenderingContext2D): number[] =>
    (ctx.translate as jest.Mock).mock.calls.map((args: unknown[]) => Number(args[0]));

  it('routes the coarsest shown layer to detailedLabelFormat and finer layers to minorTickLabelFormat', () => {
    const fine = layer({ unit: 'millisecond', ticksS: [0.005], minor: () => 'fine-min', detailed: () => 'fine-det' });
    const coarse = layer({ unit: 'second', ticksS: [0.003], minor: () => 'coarse-min', detailed: () => 'coarse-det' });
    mockContinuousTimeRasters.mockReturnValueOnce(() => [fine, coarse]);

    const ctx = makeCtx();
    drawTimeBar(ctx, timeGeom({ min: 0, max: 10 }), { ...style, timeAxisLayerCount: 2 });
    const labels = labelsOf(ctx);

    expect(labels).toContain('fine-min'); // finest layer → terse
    expect(labels).toContain('coarse-det'); // coarsest shown layer → verbose
    expect(labels).not.toContain('fine-det');
    expect(labels).not.toContain('coarse-min');
  });

  it('caps drawn label layers at timeAxisLayerCount (finest first), ignoring extra labeled layers', () => {
    const layers = [0, 1, 2, 3, 4].map((i) =>
      layer({
        unit: 'second',
        unitMultiplier: i + 1,
        ticksS: [0.005],
        minor: () => `L${i}min`,
        detailed: () => `L${i}det`,
      }),
    );
    mockContinuousTimeRasters.mockReturnValueOnce(() => layers);

    const ctx = makeCtx();
    drawTimeBar(ctx, timeGeom({ min: 0, max: 10 }), { ...style, timeAxisLayerCount: 2 });
    const labels = labelsOf(ctx);

    // Only the finest 2 labeled layers draw: L0 (minor) and L1 (coarsest shown → detailed).
    expect(labels.sort()).toEqual(['L0min', 'L1det']);
  });

  it('timeAxisLayerCount = 0 in time mode renders a single row (finest labeled layer only)', () => {
    const fine = layer({ unit: 'millisecond', ticksS: [0.005], minor: () => 'fine', detailed: () => 'fine-det' });
    const coarse = layer({ unit: 'second', ticksS: [0.003], minor: () => 'coarse', detailed: () => 'coarse-det' });
    mockContinuousTimeRasters.mockReturnValueOnce(() => [fine, coarse]);

    const ctx = makeCtx();
    drawTimeBar(ctx, timeGeom({ min: 0, max: 10 }), { ...style, timeAxisLayerCount: 0 });
    const labels = labelsOf(ctx);

    // Legacy single-row path: only the finest labeled layer, via minorTickLabelFormat.
    expect(labels).toEqual(['fine']);
  });

  it('linear mode ignores timeAxisLayerCount: only the finest labeled layer is labeled (single row)', () => {
    const layer0 = {
      ...layer({ unit: 'one', ticksS: [0, 5000, 10000], minor: String, detailed: String }),
      unitMultiplier: Infinity,
    };
    const layer1 = {
      ...layer({ unit: 'one', ticksS: [2500, 7500], minor: String, detailed: String }),
      unitMultiplier: Infinity,
    };
    mockNumericalRasters.mockReturnValueOnce(() => [layer0, layer1]);

    const ctx = makeCtx();
    drawTimeBar(ctx, makeGeom('linear'), { ...style, timeAxisLayerCount: 3 });
    const labels = labelsOf(ctx);

    // Only layer0 (the finest labeled layer) contributes its 3 in-window ticks; layer1 is not labeled.
    expect(labels.length).toBe(3);
  });

  it('pins the coarsest layer leading label to plot.left when its boundary is off-screen', () => {
    const fine = layer({ unit: 'millisecond', ticksS: [0.002], minor: () => 'fine', detailed: () => 'fine' });
    // Coarse boundary at t=0 s → tickMs 0 → tickX = 200 + (0 - 1) = 199 (< plot.left) → clamped to 200.
    const coarse = layer({ unit: 'second', ticksS: [0], minor: () => 'PINNED', detailed: () => 'PINNED' });
    mockContinuousTimeRasters.mockReturnValueOnce(() => [fine, coarse]);

    const ctx = makeCtx();
    drawTimeBar(ctx, timeGeom({ min: 1, max: 3 }), { ...style, timeAxisLayerCount: 2 });

    expect(labelsOf(ctx)).toContain('PINNED');
    // renderText translates to the label origin; the pinned label must sit exactly at plot.left (200).
    expect(translateXsOf(ctx)).toContain(200);
  });

  it('collapses many off-left coarse boundaries into a single pinned label (nearest containing interval)', () => {
    // Regression: the raster generators emit *every* boundary before the viewport. Previously each
    // off-left tick was treated as "pinned" and clamped to plot.left, stacking the whole history on
    // top of itself. Only the nearest off-left boundary (the containing interval) must be pinned.
    const fine = layer({ unit: 'millisecond', ticksS: [0.5], minor: () => 'fine', detailed: () => 'fine' });
    // focus [1, 3] s → scale maps t=1s to plot.left(200). Coarse boundaries at 0, 0.25, 0.5, 0.75 s are
    // ALL off-left; the nearest (0.75 s) is the containing interval. None are in-view (< 1 s).
    const coarse = layer({
      unit: 'second',
      unitMultiplier: 1,
      ticksS: [0, 0.25, 0.5, 0.75],
      minor: (d) => `c${Math.round(d)}`,
      detailed: (d) => `c${Math.round(d)}`, // ms values 0,250,500,750
    });
    mockContinuousTimeRasters.mockReturnValueOnce(() => [fine, coarse]);

    const ctx = makeCtx();
    drawTimeBar(ctx, timeGeom({ min: 1000, max: 3000 }), { ...style, timeAxisLayerCount: 2 });
    const labels = labelsOf(ctx);

    // Exactly one coarse label is drawn (the nearest off-left boundary, 750 ms), pinned at plot.left.
    const coarseLabels = labels.filter((l) => l.startsWith('c'));
    expect(coarseLabels).toEqual(['c750']);
    expect(translateXsOf(ctx)).toContain(200);
  });

  it('does not extend or clamp the finest layer: an off-left finest tick is skipped, not pinned', () => {
    // focus [5, 10] ms. Finest ticks: 2 ms (tickX = 200 + (2-5)/5*800 = -280, off-left) and 7 ms (in-view).
    const fine = layer({
      unit: 'millisecond',
      ticksS: [0.002, 0.007],
      minor: (d) => `${Math.round(d)}ms`,
      detailed: (d) => `${Math.round(d)}ms`,
    });
    mockContinuousTimeRasters.mockReturnValueOnce(() => [fine]);

    const ctx = makeCtx();
    drawTimeBar(ctx, timeGeom({ min: 5, max: 10 }), { ...style, timeAxisLayerCount: 2 });
    const labels = labelsOf(ctx);

    // Only the in-view 7 ms tick is drawn; the off-left 2 ms tick is hard-skipped (no pinning).
    expect(labels).toEqual(['7ms']);
    // No label was clamped to plot.left for the finest layer.
    expect(translateXsOf(ctx)).not.toContain(200);
  });

  it('suppresses a boundary label that would overlap the pinned leading label', () => {
    const fine = layer({ unit: 'millisecond', ticksS: [0.4], minor: () => 'fine', detailed: () => 'fine' }); // tickX = 600
    // Coarse: pinned boundary at t=-0.001 s (tickX 199 → clamp 200) and a near boundary at t=0.005 s (tickX 205).
    // measureText width for 'SAME' (4 chars) = 24; gap 205 - 200 = 5 < 24 + TICK_LABEL_MIN_GAP(4) → suppress.
    const coarse = layer({ unit: 'second', ticksS: [-0.001, 0.005], minor: () => 'SAME', detailed: () => 'SAME' });
    mockContinuousTimeRasters.mockReturnValueOnce(() => [fine, coarse]);

    const ctx = makeCtx();
    drawTimeBar(ctx, timeGeom({ min: 0, max: 800 }), { ...style, timeAxisLayerCount: 2 });
    const labels = labelsOf(ctx);

    // The pinned 'SAME' is drawn once; the overlapping boundary 'SAME' is suppressed.
    expect(labels.filter((l) => l === 'SAME').length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Spec 19 — pickElapsedUnit and formatElapsedMs (ADR 0010)
// ---------------------------------------------------------------------------

describe('pickElapsedUnit — unit selection by step magnitude', () => {
  it('selects ms for a 0.1ms step (sub-ms ms range)', () => {
    const unit = pickElapsedUnit(0.1);
    expect(unit.suffix).toBe('ms');
    expect(unit.decimals).toBe(1); // ceil(-log10(0.1)) = 1
  });

  it('selects ms for a whole-ms step (step 1ms)', () => {
    const unit = pickElapsedUnit(1);
    expect(unit.suffix).toBe('ms');
    expect(unit.decimals).toBe(0);
  });

  it('selects ms even when absolute position is large (key fix: step 0.1ms at any offset)', () => {
    // With the old value-magnitude approach, a window at 4999–5000ms would give s.
    // Step 0.1ms should give ms regardless of absolute position.
    const unit = pickElapsedUnit(0.1);
    expect(unit.suffix).toBe('ms');
  });

  it('selects ms for a 1µs step (step 1e-3ms, boundary)', () => {
    const unit = pickElapsedUnit(1e-3);
    expect(unit.suffix).toBe('ms');
    expect(unit.decimals).toBe(3); // ceil(-log10(0.001)) = 3
  });

  it('selects µs for a sub-µs step (step 1e-4ms)', () => {
    const unit = pickElapsedUnit(1e-4);
    expect(unit.suffix).toBe('µs');
  });

  it('selects ns for exactly a 1ns step (step 1e-6ms, lower ns boundary)', () => {
    // Boundary change: >= 1e-6 → µs was changed to > 1e-6 → µs so that a 1ns step
    // maps to integer-ns labels ("0ns", "1ns") rather than fractional µs ("0.001µs").
    const unit = pickElapsedUnit(1e-6);
    expect(unit.suffix).toBe('ns');
    expect(unit.decimals).toBe(0); // ns is always integer
  });

  it('selects ns for a sub-ns step (step 1e-7ms)', () => {
    const unit = pickElapsedUnit(1e-7);
    expect(unit.suffix).toBe('ns');
  });

  it('selects s for a second-range step (step 2000ms)', () => {
    const unit = pickElapsedUnit(2000);
    expect(unit.suffix).toBe('s');
    expect(unit.decimals).toBe(0); // step 2s in s unit = 2 → 0 decimals
  });

  it('selects s at the second threshold (step 1000ms)', () => {
    const unit = pickElapsedUnit(1000);
    expect(unit.suffix).toBe('s');
  });

  it('selects minutes compound for a minute-range step (step 60000ms)', () => {
    const unit = pickElapsedUnit(60_000);
    expect(unit.suffix).toBe('m');
  });

  it('guards step ≤ 0 → ms with 0 decimals', () => {
    const unit = pickElapsedUnit(0);
    expect(unit.suffix).toBe('ms');
    expect(unit.decimals).toBe(0);
  });
});

describe('formatElapsedMs — format with pickElapsedUnit result', () => {
  it('formats a whole-ms value with 0 decimals', () => {
    const unit = pickElapsedUnit(1);
    expect(formatElapsedMs(344, unit)).toBe('344ms');
  });

  it('formats a sub-ms step value with step-derived decimals in ms (large offset)', () => {
    const unit = pickElapsedUnit(0.1);
    expect(formatElapsedMs(344.2, unit)).toBe('344.2ms');
  });

  it('formats a large-offset ms tick correctly (key fix: 5000ms trace, step 0.1ms)', () => {
    // step 0.1ms → ms unit. tick at 4999.9ms should show "4999.9ms" not "5.0s".
    const unit = pickElapsedUnit(0.1);
    expect(formatElapsedMs(4999.9, unit)).toBe('4999.9ms');
  });

  it('formats a 1µs-step window in ms (3 decimals)', () => {
    // step 1e-3ms = 1µs → ms unit, 3 decimals
    const unit = pickElapsedUnit(1e-3);
    expect(unit.suffix).toBe('ms');
    expect(formatElapsedMs(344, unit)).toBe('344.000ms');
    expect(formatElapsedMs(344.001, unit)).toBe('344.001ms');
  });

  it('formats a µs-range value (step < 1µs → µs unit)', () => {
    const unit = pickElapsedUnit(1e-4); // step 1e-4ms = 0.1µs → µs unit, 1 decimal
    expect(unit.suffix).toBe('µs');
    // 5e-3 ms = 5 µs; step 0.1 µs → toFixed(1) → "5.0µs"
    expect(formatElapsedMs(5e-3, unit)).toBe('5.0µs');
  });

  it('formats a ns-range value (step ≤ 1ns → ns unit, always integer)', () => {
    const unit = pickElapsedUnit(1e-7); // step 0.1ns → ns unit, 0 decimals (integer ns)
    expect(unit.suffix).toBe('ns');
    expect(unit.decimals).toBe(0);
    expect(formatElapsedMs(5e-6, unit)).toBe('5ns'); // integer, no fractional ns
  });

  it('formats a seconds value with 0 decimals (step 2000ms)', () => {
    const unit = pickElapsedUnit(2000);
    expect(formatElapsedMs(4000, unit)).toBe('4s');
  });

  it('formats a minutes compound value', () => {
    const unit = pickElapsedUnit(60_000);
    expect(formatElapsedMs(150_000, unit)).toBe('2m 30s');
    expect(formatElapsedMs(60_000, unit)).toBe('1m');
  });

  it('produces distinct labels for a large-offset deep-zoom window (no duplicates)', () => {
    // step 0.01ms → ms, 2 decimals; ticks 344.00, 344.01, … 344.05
    const unit = pickElapsedUnit(0.01);
    const ticks = [344.00, 344.01, 344.02, 344.03, 344.04, 344.05];
    const labels = ticks.map((v) => formatElapsedMs(v, unit));
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels[0]).toBe('344.00ms');
    expect(labels[1]).toBe('344.01ms');
  });
});

describe('drawTimeBar — integer-ns filter for sub-ns steps (ADR 0010)', () => {
  /**
   * At the 1ns zoom floor, the raster packs ~20 sub-ns ticks into the window.
   * The integer-ns filter suppresses every tick that is not at an integer-ns boundary,
   * leaving at most one tick per nanosecond value.
   *
   * Scenario: 1ns window [0, 1e-6ms], step 5e-8ms (0.05ns) → 21 ticks.
   * Expected: only the two integer-ns positions (0ns and 1ns) render.
   */
  it('renders only integer-ns ticks when the step is sub-1ns', () => {
    const subNsTicks = Array.from({ length: 21 }, (_, i) => {
      const ms = i * 5e-8; // 0ns, 0.05ns, …, 1.0ns in ms
      return { minimum: ms, supremum: ms + 5e-8, labelSupremum: ms + 5e-8 };
    });
    const subNsLayer = {
      unit: 'one',
      unitMultiplier: Infinity,
      labeled: true,
      minimumTickPixelDistance: 24,
      intervals: () => subNsTicks,
      detailedLabelFormat: String,
      minorTickLabelFormat: String,
    };
    mockNumericalRasters.mockReturnValueOnce(() => [subNsLayer]);

    const plotLeft = 200;
    const plotWidth = 800;
    const focusDomain = { min: 0, max: 1e-6 }; // 1ns window
    const geom: TraceGeometry = {
      spans: [],
      gutter: { top: 0, left: 0, width: 200, height: 600 },
      timeBar: { top: 0, left: plotLeft, width: plotWidth, height: 32 },
      plot: { top: 32, left: plotLeft, width: plotWidth, height: 568 },
      laneHeight: 24,
      labelBandPx: 0,
      domain: { min: 0, max: 1e-6 },
      focusDomain,
      scrollOffset: 0,
      xScaleType: 'linear' as const,
      focusedLaneIndex: null,
      resolvedSelection: [],
      emptyMessage: null,
      disclosureByLane: new Map(),
      criticalIntervalsByLane: new Map(),
      badgesByLane: new Map(),
      annotationsLayout: [],
      scale: (tMs: number) => plotLeft + (tMs / 1e-6) * plotWidth,
    };

    const ctx = makeCtx();
    drawTimeBar(ctx, geom, style);

    const labels: string[] = (ctx.fillText as jest.Mock).mock.calls.map((args: unknown[]) => String(args[0]));

    // Only the two integer-ns boundaries pass the filter: "0ns" and "1ns".
    expect(labels).toEqual(['0ns', '1ns']);
  });
});
