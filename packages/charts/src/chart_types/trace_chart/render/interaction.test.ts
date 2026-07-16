/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Pure interaction-math unit tests (TE1 from /review-claudio round).
 *
 * Strategy: each exported pure function is tested without any DOM or canvas dependency.
 * These cover the highest-churn logic in the RAF frame that cannot be exercised by the
 * jsdom smoke test (getContext('2d') returns null there, so frame() early-returns).
 */

import { computeZoomMax, computeMaxScroll, computeScrollTarget, hasViewKeyChanged, MIN_VISIBLE_EXTENT_MS, domainToZoomPan, pixelRangeToDomain } from './interaction';
import { getFocusDomain, initialZoomPan } from '../../timeslip/projections/zoom_pan';
import type { TraceGeometry } from './types';

// ---------------------------------------------------------------------------
// computeZoomMax
// ---------------------------------------------------------------------------

describe('computeZoomMax', () => {
  it('MIN_VISIBLE_EXTENT_MS is 1 (the coarsest raster bin)', () => {
    expect(MIN_VISIBLE_EXTENT_MS).toBe(1);
  });

  it('returns 0 when reference extent equals the minimum (fit-all is the deepest view)', () => {
    expect(computeZoomMax(1)).toBe(0);
  });

  it('returns 0 when reference extent is below the minimum', () => {
    expect(computeZoomMax(0.5)).toBe(0);
    expect(computeZoomMax(0)).toBe(0);
  });

  it('returns log2(referenceExtent / minExtent) for a 1000 ms trace with 1 ms floor', () => {
    // multiplierToZoom(1/1000) = log2(1000) ≈ 9.97
    const zoomMax = computeZoomMax(1000);
    expect(zoomMax).toBeCloseTo(Math.log2(1000), 5);
  });

  it('returns log2(referenceExtent / minExtent) for a 500 ms trace', () => {
    expect(computeZoomMax(500)).toBeCloseTo(Math.log2(500), 5);
  });

  it('accepts a custom minVisibleExtentMs', () => {
    // With minExtent = 10 ms and reference = 100 ms: log2(100/10) = log2(10) ≈ 3.32
    expect(computeZoomMax(100, 10)).toBeCloseTo(Math.log2(10), 5);
  });

  it('custom minExtent equal to reference → returns 0', () => {
    expect(computeZoomMax(50, 50)).toBe(0);
  });

  it('larger reference extent → larger zoom cap (deeper zoom allowed)', () => {
    expect(computeZoomMax(10000)).toBeGreaterThan(computeZoomMax(1000));
  });
});

// ---------------------------------------------------------------------------
// computeMaxScroll
// ---------------------------------------------------------------------------

describe('computeMaxScroll', () => {
  it('returns 0 when all lanes fit in the plot height', () => {
    // 3 lanes × 24 px = 72 px; plot = 200 px → no scroll
    expect(computeMaxScroll(3, 24, 200)).toBe(0);
  });

  it('returns 0 when content height exactly equals plot height', () => {
    expect(computeMaxScroll(5, 20, 100)).toBe(0);
  });

  it('returns the overflow amount when content taller than plot', () => {
    // 10 lanes × 24 px = 240 px; plot = 200 px → 40 px of scroll
    expect(computeMaxScroll(10, 24, 200)).toBe(40);
  });

  it('returns 0 for an empty span list', () => {
    expect(computeMaxScroll(0, 24, 200)).toBe(0);
  });

  it('scales linearly with span count', () => {
    // 20 lanes × 24 px = 480 px; plot = 200 px → 280 px
    expect(computeMaxScroll(20, 24, 200)).toBe(280);
  });

  it('returns 0 when plot height is larger than content (negative overflow clamped)', () => {
    expect(computeMaxScroll(1, 24, 1000)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// hasViewKeyChanged
// ---------------------------------------------------------------------------

describe('hasViewKeyChanged', () => {
  const key = { xScaleType: 'linear', format: 'simple' };

  it('returns true when current is null (first mount)', () => {
    expect(hasViewKeyChanged(null, key)).toBe(true);
  });

  it('returns false when both keys are identical', () => {
    expect(hasViewKeyChanged(key, key)).toBe(false);
    expect(hasViewKeyChanged({ xScaleType: 'linear', format: 'simple' }, key)).toBe(false);
  });

  it('returns true when xScaleType changes (linear → time)', () => {
    expect(hasViewKeyChanged({ xScaleType: 'linear', format: 'simple' }, { xScaleType: 'time', format: 'simple' })).toBe(
      true,
    );
  });

  it('returns true when format changes (simple → otel)', () => {
    expect(hasViewKeyChanged({ xScaleType: 'linear', format: 'simple' }, { xScaleType: 'linear', format: 'otel' })).toBe(
      true,
    );
  });

  it('returns true when both fields change simultaneously', () => {
    expect(hasViewKeyChanged({ xScaleType: 'linear', format: 'simple' }, { xScaleType: 'time', format: 'otel' })).toBe(
      true,
    );
  });

  it('returns false when switching back to the same key', () => {
    const timeOtel = { xScaleType: 'time', format: 'otel' };
    expect(hasViewKeyChanged(timeOtel, timeOtel)).toBe(false);
  });

  it('returns true when traceId changes (t1 → t2)', () => {
    expect(
      hasViewKeyChanged({ xScaleType: 'linear', format: 'simple', traceId: 't1' }, { xScaleType: 'linear', format: 'simple', traceId: 't2' }),
    ).toBe(true);
  });

  it('returns true when traceId is set for the first time (undefined → t1)', () => {
    expect(
      hasViewKeyChanged({ xScaleType: 'linear', format: 'simple' }, { xScaleType: 'linear', format: 'simple', traceId: 't1' }),
    ).toBe(true);
  });

  it('returns true when traceId is cleared (t1 → undefined)', () => {
    expect(
      hasViewKeyChanged({ xScaleType: 'linear', format: 'simple', traceId: 't1' }, { xScaleType: 'linear', format: 'simple' }),
    ).toBe(true);
  });

  it('returns false when traceId is the same in both keys', () => {
    expect(
      hasViewKeyChanged({ xScaleType: 'linear', format: 'simple', traceId: 't1' }, { xScaleType: 'linear', format: 'simple', traceId: 't1' }),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// domainToZoomPan
// ---------------------------------------------------------------------------

describe('domainToZoomPan', () => {
  it('round-trips through getFocusDomain: zoom+pan → focus domain matches the input range', () => {
    const refFrom = 0;
    const refTo = 1000;
    const domainFrom = 200;
    const domainTo = 600;
    const focus = domainToZoomPan([domainFrom, domainTo], [refFrom, refTo]);
    // Wrap into a minimal ZoomPan so getFocusDomain can consume it.
    const zp = { ...initialZoomPan(), focus };
    const { domainFrom: outFrom, domainTo: outTo } = getFocusDomain(zp, refFrom, refTo);
    expect(outFrom).toBeCloseTo(domainFrom, 6);
    expect(outTo).toBeCloseTo(domainTo, 6);
  });

  it('degenerate: refFrom === refTo → returns { zoom: 0, pan: 0 } (no divide-by-zero)', () => {
    expect(domainToZoomPan([0, 0], [500, 500])).toEqual({ zoom: 0, pan: 0 });
  });

  it('full domain: domainFrom/To equals refFrom/To → zoom = 0 (fit-all)', () => {
    const focus = domainToZoomPan([0, 1000], [0, 1000]);
    // zoom = multiplierToZoom(1) = log2(1) = 0
    expect(focus.zoom).toBeCloseTo(0, 6);
  });

  it('half domain centered: pan should be ~0.5', () => {
    // Visible window [250, 750] in ref [0, 1000]: leeway = 500, panOffset = 250, pan = 250/500 = 0.5
    const focus = domainToZoomPan([250, 750], [0, 1000]);
    expect(focus.pan).toBeCloseTo(0.5, 6);
  });

  it('left-aligned half domain: pan = 0', () => {
    // [0, 500] in [0, 1000]: leeway = 500, panOffset = 0, pan = 0
    const focus = domainToZoomPan([0, 500], [0, 1000]);
    expect(focus.pan).toBeCloseTo(0, 6);
  });

  it('right-aligned half domain: pan = 1', () => {
    // [500, 1000] in [0, 1000]: leeway = 500, panOffset = 500, pan = 1
    const focus = domainToZoomPan([500, 1000], [0, 1000]);
    expect(focus.pan).toBeCloseTo(1, 6);
  });
});

// ---------------------------------------------------------------------------
// pixelRangeToDomain
// ---------------------------------------------------------------------------

/** Minimal geometry fixture: plot from x=50 to x=450 (400 px wide), focusDomain [100, 500] ms */
const GEOM: Pick<TraceGeometry, 'plot' | 'focusDomain'> = {
  plot: { left: 50, top: 30, width: 400, height: 200 },
  focusDomain: { min: 100, max: 500 },
};

describe('pixelRangeToDomain', () => {
  it('converts known pixel range to expected ms range', () => {
    // plot.left=50, plot.width=400, focusDomain [100,500] ms → span 400ms over 400px (1ms/px)
    // x=50 → 100ms, x=450 → 500ms
    const [from, to] = pixelRangeToDomain(50, 450, GEOM as TraceGeometry);
    expect(from).toBeCloseTo(100, 6);
    expect(to).toBeCloseTo(500, 6);
  });

  it('returns values in ascending order when x0 > x1 (reversed drag)', () => {
    const [from, to] = pixelRangeToDomain(350, 150, GEOM as TraceGeometry);
    expect(from).toBeLessThan(to);
  });

  it('clamps x values below plot.left to plot.left', () => {
    // x=0 is left of plot.left=50 → clamps to 50 → 100ms
    const [from] = pixelRangeToDomain(0, 450, GEOM as TraceGeometry);
    expect(from).toBeCloseTo(100, 6);
  });

  it('clamps x values beyond plot right to plot right', () => {
    // x=600 exceeds plot.left+width=450 → clamps to 450 → 500ms
    const [, to] = pixelRangeToDomain(50, 600, GEOM as TraceGeometry);
    expect(to).toBeCloseTo(500, 6);
  });

  it('midpoint pixel maps to midpoint domain value', () => {
    // x=250 (midpoint of 50..450) → 300ms (midpoint of 100..500)
    const [from, to] = pixelRangeToDomain(50, 250, GEOM as TraceGeometry);
    expect(to).toBeCloseTo(300, 6);
    expect(from).toBeCloseTo(100, 6);
  });

  it('degenerate: plot.width = 0 → returns full focusDomain unchanged', () => {
    const zeroWidthGeom = { ...GEOM, plot: { ...GEOM.plot, width: 0 } } as TraceGeometry;
    const [from, to] = pixelRangeToDomain(50, 100, zeroWidthGeom);
    expect(from).toBe(100);
    expect(to).toBe(500);
  });

  it('degenerate: focusDomain.min === focusDomain.max → returns full focusDomain unchanged', () => {
    const pointGeom = { ...GEOM, focusDomain: { min: 300, max: 300 } } as TraceGeometry;
    const [from, to] = pixelRangeToDomain(50, 450, pointGeom);
    expect(from).toBe(300);
    expect(to).toBe(300);
  });
});

// ---------------------------------------------------------------------------
// computeScrollTarget
// ---------------------------------------------------------------------------

describe('computeScrollTarget', () => {
  const laneHeight = 30;
  const plotHeight = 200;
  const maxScroll = 1000;

  describe('align: center', () => {
    it('spec example: lane 5 → target = 5*30 - (200-30)/2 = 65', () => {
      // target = 150 - 85 = 65
      expect(computeScrollTarget(5, 0, plotHeight, laneHeight, maxScroll, 'center')).toBe(65);
    });

    it('clamps to 0 when target is negative', () => {
      // lane 0: target = 0 - 85 = -85 → clamped to 0
      expect(computeScrollTarget(0, 0, plotHeight, laneHeight, maxScroll, 'center')).toBe(0);
    });

    it('clamps to maxScroll when target exceeds it', () => {
      // lane 40: target = 40*30 - 85 = 1115 → clamped to 1000
      expect(computeScrollTarget(40, 0, plotHeight, laneHeight, maxScroll, 'center')).toBe(maxScroll);
    });
  });

  describe('align: nearest', () => {
    it('returns scrollOffset unchanged when lane is fully visible', () => {
      // scrollOffset=0, lane 2: top = 2*30 - 0 = 60; 60+30 = 90 ≤ 200 → in view
      expect(computeScrollTarget(2, 0, plotHeight, laneHeight, maxScroll, 'nearest')).toBe(0);
    });

    it('scrolls up when lane is above view', () => {
      // scrollOffset=100, lane 2: top = 2*30 - 100 = -40 → above view
      // target = laneIndex * laneHeight = 2*30 = 60
      expect(computeScrollTarget(2, 100, plotHeight, laneHeight, maxScroll, 'nearest')).toBe(60);
    });

    it('scrolls down when lane is below view', () => {
      // scrollOffset=0, lane 8: top = 8*30 - 0 = 240 → 240+30 = 270 > 200 → below view
      // target = 8*30 - 200 + 30 = 70
      expect(computeScrollTarget(8, 0, plotHeight, laneHeight, maxScroll, 'nearest')).toBe(70);
    });

    it('clamps to 0 when nearest target would be negative', () => {
      expect(computeScrollTarget(0, 50, plotHeight, laneHeight, maxScroll, 'nearest')).toBe(0);
    });

    it('clamps to maxScroll when nearest target exceeds it', () => {
      // scrollOffset=0, lane 100: target = 100*30 - 200 + 30 = 2830 → clamped to 1000
      expect(computeScrollTarget(100, 0, plotHeight, laneHeight, maxScroll, 'nearest')).toBe(maxScroll);
    });
  });
});
