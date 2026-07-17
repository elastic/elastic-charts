/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NormalizedSpan } from '../data/types';
import { waitingSegments } from '../data/self_time';
import type { TraceGeometry, TraceStyle } from './types';
import { gutterPx } from './types';
import type { TraceSelection } from '../trace_api';
import type { Size } from '../../../utils/dimensions';

/**
 * Pure layout builder for the trace waterfall chart. Partitions the canvas and builds a linear
 * ms→px scale closure. No DOM access, no mutable external state.
 *
 * **Contract:** `spans` must already be in lane order (the caller's responsibility — `orderLanes`
 * is called once per data change in the pipeline cache, not on every rAF frame; see ADR 0018).
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
  selection: TraceSelection = [],
  spanIdToLane: ReadonlyMap<string, number> = new Map(),
  emptyMessage: string | null = null,
): TraceGeometry {
  // spans is already start-sorted by the pipeline cache (O(N log N) once per data change, not per frame).
  // domain is pre-computed by normalize() and passed in; no per-frame reduce needed.

  const { width: canvasWidth, height: canvasHeight } = canvasSize;
  const { timeBarHeight, laneHeight } = style;
  // gutterPx() collapses the gutter to 0 for 'inline' and 'none' label modes — the gutter region
  // has no content in those modes, so reserving space for it would waste plot area.
  const effectiveGutterWidth = gutterPx(style);

  const plotLeft = effectiveGutterWidth;
  const plotTop = timeBarHeight;
  const plotWidth = Math.max(0, canvasWidth - effectiveGutterWidth);
  const plotHeight = Math.max(0, canvasHeight - timeBarHeight);

  const gutter = { top: 0, left: 0, width: effectiveGutterWidth, height: canvasHeight };
  const timeBar = { top: 0, left: plotLeft, width: plotWidth, height: timeBarHeight };
  const plot = { top: plotTop, left: plotLeft, width: plotWidth, height: plotHeight };

  // Linear ms→px scale closure. Guards a zero-width focus domain so callers never divide by zero.
  const focusSpan = focusDomain.max - focusDomain.min;
  const scale =
    focusSpan <= 0
      ? (_tMs: number) => plot.left
      : (tMs: number) => plot.left + ((tMs - focusDomain.min) / focusSpan) * plot.width;

  // Resolve selection refs to lane indices, dropping dangling/out-of-range refs (defensive filter
  // only — authoritative prune happens in componentDidUpdate per ADR 0011 Decision 4 / plan D3).
  // Also dedup: drop segment entries geometrically subsumed by a same-span 'span' entry (D2).
  const spanIdsWithSpanRef = new Set<string>();
  for (const ref of selection) {
    if (ref.region === 'span') spanIdsWithSpanRef.add(ref.spanId);
  }

  const resolvedSelection: TraceGeometry['resolvedSelection'] = selection
    .map((ref) => {
      const laneIndex = spanIdToLane.get(ref.spanId);
      if (laneIndex === undefined) return null;
      const span = spans[laneIndex];
      if (!span) return null;
      if (ref.region === 'active' && ref.segmentIndex >= span.activeSegments.length) return null;
      if (ref.region === 'waiting' && ref.segmentIndex >= waitingSegments(span).length) return null;
      // Dedup (D2): drop segment entries subsumed by a same-span 'span' ref.
      if (ref.region !== 'span' && spanIdsWithSpanRef.has(ref.spanId)) return null;
      return { laneIndex, region: ref.region, segmentIndex: ref.segmentIndex };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

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
    resolvedSelection,
    scale,
    emptyMessage,
  };
}
