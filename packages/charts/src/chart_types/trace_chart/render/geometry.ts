/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NormalizedSpan } from '../data/types';
import type { TraceGeometry, TraceStyle } from './types';
import type { Size } from '../../../utils/dimensions';

/**
 * Pure layout builder for the trace waterfall chart. Partitions the canvas and builds a linear
 * ms→px scale closure. No DOM access, no mutable external state.
 *
 * **Contract:** `spans` must already be sorted ascending by `start` (the caller's responsibility —
 * sorting is done once per data change in the pipeline cache, not on every rAF frame).
 * `domain` is the full data extent across all spans, also computed once by the pipeline.
 *
 * Contrast with Timeslip's zoom/pan, which reads mutable closure state at draw time; here every
 * value downstream needs is explicitly threaded through `TraceGeometry`.
 * @internal
 */
export function buildGeometry(
  spans: NormalizedSpan[],
  canvasSize: Size,
  focusDomain: { min: number; max: number },
  scrollOffset: number,
  style: TraceStyle,
  xScaleType: 'time' | 'linear',
  domain: { min: number; max: number },
  focusedLaneIndex: number | null = null,
): TraceGeometry {
  // spans is already start-sorted by the pipeline cache (O(N log N) once per data change, not per frame).
  // domain is pre-computed by normalize() and passed in; no per-frame reduce needed.

  const { width: canvasWidth, height: canvasHeight } = canvasSize;
  const { gutterWidth, timeBarHeight, laneHeight } = style;

  const plotLeft = gutterWidth;
  const plotTop = timeBarHeight;
  const plotWidth = Math.max(0, canvasWidth - gutterWidth);
  const plotHeight = Math.max(0, canvasHeight - timeBarHeight);

  const gutter = { top: 0, left: 0, width: gutterWidth, height: canvasHeight };
  const timeBar = { top: 0, left: plotLeft, width: plotWidth, height: timeBarHeight };
  const plot = { top: plotTop, left: plotLeft, width: plotWidth, height: plotHeight };

  // Linear ms→px scale closure. Guards a zero-width focus domain so callers never divide by zero.
  const focusSpan = focusDomain.max - focusDomain.min;
  const scale =
    focusSpan <= 0
      ? (_tMs: number) => plot.left
      : (tMs: number) => plot.left + ((tMs - focusDomain.min) / focusSpan) * plot.width;

  return {
    spans,
    gutter,
    timeBar,
    plot,
    laneHeight,
    domain,
    focusDomain,
    scrollOffset,
    xScaleType,
    focusedLaneIndex,
    scale,
  };
}
