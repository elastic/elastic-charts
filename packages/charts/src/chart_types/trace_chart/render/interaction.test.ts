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

import { computeZoomMax, computeMaxScroll, hasViewKeyChanged, MIN_VISIBLE_EXTENT_MS } from './interaction';

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
});
