/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NormalizedSpan } from '../data/types';
import { waitingSegments } from '../data/self_time';
import { TICK_LAYER_PADDING, TICK_LAYER_BOTTOM_INSET } from './time_bar';
import type { DisclosureEntry, LaneBadgeLayout, TraceGeometry, TraceStyle } from './types';
import { gutterPx, LANE_PADDING } from './types';
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
  disclosureByLane: Map<number, DisclosureEntry> = new Map(),
  hasParents = false,
  maxDepth = 0,
  criticalIntervals: ReadonlyArray<{ spanId: string; start: number; end: number }> = [],
  /**
   * Width (px) of the compact badge-only gutter reserved in `'none'` Label position when spans have
   * badges visible in `'none'` (Spec 27). Added to the plot's left offset so the fixed, lane-aligned
   * badge column sits between the disclosure gutter and the scrollable plot. `0` (no reservation) in
   * every other case, so charts without `'none'`-visible badges keep their full plot width.
   */
  badgeGutterWidth = 0,
  /**
   * Height (px) of the active Span badge in `'inline'` mode, or `0` when the trace has no inline
   * badges (Spec 27). The inline label/badge row is sized to the taller of the label text and this,
   * so badges never overflow into the bar band. Ignored in `'gutter'`/`'none'`.
   */
  badgeRowHeight = 0,
): TraceGeometry {
  // spans is already start-sorted by the pipeline cache (O(N log N) once per data change, not per frame).
  // domain is pre-computed by normalize() and passed in; no per-frame reduce needed.

  const { width: canvasWidth, height: canvasHeight } = canvasSize;
  const { timeBarHeight, laneHeight } = style;
  // gutterPx() reserves space for the label gutter and (when hasParents) the disclosure-caret
  // column. In 'inline'/'none' modes the label portion collapses to 0 but the caret column is
  // still reserved when the trace has parent spans (ADR 0026).
  const effectiveGutterWidth = gutterPx(style, { hasParents, maxDepth });

  // In 'time' mode the time bar may render stacked tick-label rows (ADR 0024). Reserve a fixed
  // height for the configured `timeAxisLayerCount` so the plot (and every lane's y-position) never
  // reflows as zoom crosses a density threshold. 'linear' mode keeps the single-row height.
  const tickLayerHeight = style.timeBarLabel.fontSize + TICK_LAYER_PADDING;
  const effectiveTimeBarHeight =
    xScaleType === 'time'
      ? Math.max(timeBarHeight, style.timeAxisLayerCount * tickLayerHeight + TICK_LAYER_BOTTOM_INSET)
      : timeBarHeight;

  // The badge-only gutter (Spec 27) widens the fixed left region in 'none' mode. It shifts the plot
  // right (and shrinks its width) but is not part of the disclosure `gutter` region — laid-out badge
  // items carry their own absolute x within [effectiveGutterWidth, effectiveGutterWidth + badgeGutter].
  const leftReserved = effectiveGutterWidth + Math.max(0, badgeGutterWidth);
  const plotLeft = leftReserved;
  const plotTop = effectiveTimeBarHeight;
  const plotWidth = Math.max(0, canvasWidth - leftReserved);
  const plotHeight = Math.max(0, canvasHeight - effectiveTimeBarHeight);

  const gutter = { top: 0, left: 0, width: effectiveGutterWidth, height: canvasHeight };
  const timeBar = { top: 0, left: plotLeft, width: plotWidth, height: effectiveTimeBarHeight };
  const plot = { top: plotTop, left: plotLeft, width: plotWidth, height: plotHeight };

  // Inline mode splits each lane into a bar band (top) and a label/badge row (bottom). Size the row
  // to the taller of the label text and the active badge (Spec 27) so inline badges never spill into
  // the bar band. Zero in 'gutter'/'none'. Both the renderer's band split and the badge-layout pass
  // read `geom.labelBandPx` so they cannot disagree.
  const labelBandPx =
    style.labelPosition === 'inline' ? Math.max(style.gutterLabel.fontSize, badgeRowHeight) + LANE_PADDING : 0;

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

  // Group projected critical intervals by lane index using the same spanIdToLane map as selection.
  // Empty input → empty map (fast path — no allocation for charts without criticalPath).
  const criticalIntervalsByLane: Map<number, Array<{ start: number; end: number }>> = new Map();
  for (const { spanId, start, end } of criticalIntervals) {
    const laneIndex = spanIdToLane.get(spanId);
    if (laneIndex === undefined) continue;
    let bucket = criticalIntervalsByLane.get(laneIndex);
    if (bucket === undefined) {
      bucket = [];
      criticalIntervalsByLane.set(laneIndex, bucket);
    }
    bucket.push({ start, end });
  }

  return {
    spans,
    gutter,
    timeBar,
    plot,
    laneHeight,
    labelBandPx,
    domain,
    focusDomain,
    scrollOffset,
    xScaleType,
    focusedLaneIndex,
    resolvedSelection,
    scale,
    emptyMessage,
    disclosureByLane,
    criticalIntervalsByLane,
    // Populated by the badge-layout pass (layoutBadges) after partitioning; empty here so buildGeometry
    // stays pure (no text measurement). The chart frame replaces this with the measured layout.
    badgesByLane: EMPTY_BADGES,
  };
}

const EMPTY_BADGES: ReadonlyMap<number, LaneBadgeLayout> = new Map();
