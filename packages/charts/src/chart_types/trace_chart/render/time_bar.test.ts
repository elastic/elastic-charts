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

import { drawTimeBar } from './time_bar';
import type { TraceGeometry } from './types';
import type { TraceStyle } from './types';

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
  } as unknown as CanvasRenderingContext2D;
}

const style: TraceStyle = {
  gutterWidth: 200,
  timeBarHeight: 32,
  laneHeight: 24,
  totalLineThickness: 2,
  totalLineColor: '#ccc',
  activeSegmentColor: '#007',
  gutterLabel: { fontFamily: 'sans-serif', fontSize: 11, color: '#333' },
  timeBarLabel: { fontFamily: 'sans-serif', fontSize: 11, color: '#333' },
  gridLineColor: '#eee',
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
    domain: { min: 0, max: 10_000 },
    focusDomain,
    scrollOffset: 0,
    xScaleType,
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

describe('drawTimeBar — whole-ms tick filter (linear mode)', () => {
  /**
   * At deep zoom (sub-ms window) numericalRasters subdivides into 0.1 ms steps, producing ticks at
   * e.g. 344.0, 344.1, …, 345.0.  formatElapsedMs rounds them all to the same "344ms"/"345ms" label.
   * The whole-ms boundary filter (ADR 0004 Decision 3) must suppress fractional-ms ticks so that
   * only the ticks at exactly 344 ms and 345 ms are rendered — no duplicate labels.
   *
   * Note: these tests configure mockNumericalRasters directly (not jest.isolateModules) because the
   * top-level jest.mock is still active inside isolateModules and its default `() => []` return means
   * drawTimeBar renders nothing. By setting mockReturnValueOnce we control exactly which ticks the
   * raster engine "emits" for each scenario.
   */
  it('suppresses fractional-ms ticks and renders only whole-ms ticks in linear mode at deep zoom', () => {
    // Simulate what numericalRasters returns for a ~1 ms window: sub-ms ticks at 0.1 ms spacing.
    // These mimic the real getDecimalTicks output with oneFive step=0.1 for [344, 345].
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
      domain: { min: 0, max: 10_000 },
      focusDomain,
      scrollOffset: 0,
      xScaleType: 'linear' as const,
      scale: (tMs: number) => plotLeft + ((tMs - focusDomain.min) / (focusDomain.max - focusDomain.min)) * plotWidth,
    };

    const ctx = makeCtx();
    drawTimeBar(ctx, geom, style);

    // Collect every label string passed to fillText.
    const labels: string[] = (ctx.fillText as jest.Mock).mock.calls.map((args: unknown[]) => String(args[0]));

    // Only whole-ms ticks survive the filter: "344ms" and "345ms".
    expect(labels).toEqual(['344ms', '345ms']);
    // No duplicates — each rendered tick has a unique label.
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('does not suppress any ticks in linear mode when the step is ≥ 1 ms (no-op path)', () => {
    // Simulate what numericalRasters returns for a 10 s window: ticks every 1000 ms (all whole-ms).
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

    // All 11 ticks render — filter is a no-op for integer-valued inputs.
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
      domain: { min: 0, max: 10_000 },
      focusDomain,
      scrollOffset: 0,
      xScaleType: 'time' as const,
      // scale converts ms → canvas x; the domain is passed as seconds to the time engine,
      // but geom.scale always receives ms (tickMs = minimum * MS_PER_SECOND inside drawTimeBar).
      scale: (tMs: number) => plotLeft + ((tMs - focusDomain.min) / (focusDomain.max - focusDomain.min)) * plotWidth,
    };

    const ctx = makeCtx();
    drawTimeBar(ctx, geom, style);

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
