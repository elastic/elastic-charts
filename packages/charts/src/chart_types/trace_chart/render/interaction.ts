/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { multiplierToZoom } from '../../timeslip/projections/zoom_pan';
import type { Multitouch } from '../../timeslip/utils/multitouch';
import { clamp } from '../../../utils/common';
import type { TraceGeometry } from './types';

/**
 * The finest time window the trace chart allows via zoom-in for the `'time'` x-scale, in ms.
 * See ADR 0004 Decision 3.
 * @internal
 */
export const MIN_VISIBLE_EXTENT_MS = 1;

/**
 * The finest time window the trace chart allows via zoom-in for the `'linear'` x-scale, in ms.
 * Equals 1 ns. `normalize()` re-zeros all timestamps to `[0, totalDurationMs]`, so float64 can
 * represent nanosecond differences without precision loss at this base.
 * ZOOM_MAX=35 bound: reachable only for traces ≤ ~34 s (`referenceExtent / 2^35 ≈ 1 ns`).
 * See ADR 0010.
 * @internal
 */
export const MIN_VISIBLE_EXTENT_LINEAR_MS = 1e-6;

/**
 * Returns the scale-appropriate minimum visible extent floor.
 * `'linear'` → 1 ns (`MIN_VISIBLE_EXTENT_LINEAR_MS`); everything else → 1 ms (`MIN_VISIBLE_EXTENT_MS`).
 * @internal
 */
export function minVisibleExtentForScale(xScaleType: string): number {
  return xScaleType === 'linear' ? MIN_VISIBLE_EXTENT_LINEAR_MS : MIN_VISIBLE_EXTENT_MS;
}

/**
 * Returns the zoom exponent cap for the trace wheel handler: the zoom level at which the visible
 * extent would equal `minVisibleExtentMs`. Callers must clamp `focus.zoom` to this value after
 * `doZoomAroundPosition` to prevent the domain shrinking below the finest time-raster interval.
 *
 * When `referenceExtentMs <= minVisibleExtentMs` the trace is already at or below the minimum
 * visible extent, so fit-all (zoom = 0) is the deepest meaningful view and this function returns 0.
 *
 * Formula: `zoom = log2(referenceExtentMs / minVisibleExtentMs)` via `multiplierToZoom`.
 * @internal
 */
export function computeZoomMax(referenceExtentMs: number, minVisibleExtentMs: number = MIN_VISIBLE_EXTENT_MS): number {
  if (referenceExtentMs <= minVisibleExtentMs) return 0;
  return multiplierToZoom(minVisibleExtentMs / referenceExtentMs);
}

/**
 * Returns the maximum vertical scroll offset in pixels for a trace with `spanCount` lanes, given
 * `laneHeight` (px per lane) and `plotHeight` (visible plot area height in px). Returns 0 when all
 * lanes fit inside the plot — scroll is disabled.
 * @internal
 */
export function computeMaxScroll(spanCount: number, laneHeight: number, plotHeight: number): number {
  return Math.max(0, spanCount * laneHeight - plotHeight);
}

/**
 * Computes the vertical scroll target (in pixels) to bring lane `laneIndex` into view.
 *
 * Two alignment modes:
 * - **`'center'`** (used by Spec 14 `scrollToSpan`): center the lane in the visible plot.
 *   `target = laneIndex * laneHeight - (plotHeight - laneHeight) / 2`
 * - **`'nearest'`** (used by keyboard navigation ↑/↓/Home/End): scroll only if the lane is
 *   already fully visible (no-op), otherwise scroll just enough to bring it to the nearest edge.
 *
 * Both modes snap (no tween) per ADR 0004 vertical-1:1. Result is clamped to `[0, maxScroll]`.
 *
 * Reused by Spec 14 `scrollToSpan` — **do not remove this function**.
 * @internal
 */
export function computeScrollTarget(
  laneIndex: number,
  scrollOffset: number,
  plotHeight: number,
  laneHeight: number,
  maxScroll: number,
  align: 'center' | 'nearest',
): number {
  let target: number;
  if (align === 'center') {
    target = laneIndex * laneHeight - (plotHeight - laneHeight) / 2;
  } else {
    const top = laneIndex * laneHeight - scrollOffset;
    if (top >= 0 && top + laneHeight <= plotHeight) {
      return scrollOffset; // lane is fully visible — no-op
    }
    if (top < 0) {
      target = laneIndex * laneHeight;
    } else {
      target = laneIndex * laneHeight - plotHeight + laneHeight;
    }
  }
  return Math.max(0, Math.min(target, maxScroll));
}

/**
 * Map a TouchEvent's active touches to canvas-relative x positions, sorted left-to-right.
 * `rectLeft` is `canvas.getBoundingClientRect().left`.
 *
 * Uses `clientX - rectLeft` which equals `offsetX` when the canvas has zero border/padding
 * (trace_chart.tsx inline style), matching the offsetX convention of the wheel/mouse paths.
 * @internal
 */
export function mapTouchesToCanvasX(e: TouchEvent, rectLeft: number): Multitouch {
  const result: Multitouch = [];
  for (let i = 0; i < e.touches.length; i++) {
    const t = e.touches[i];
    if (t) result.push({ id: t.identifier, position: t.clientX - rectLeft });
  }
  result.sort((a, b) => a.position - b.position);
  return result;
}

/**
 * Pinch ratio = previous finger spread / current finger spread.
 * A value > 1 means the fingers spread apart (zoom in); < 1 means they converged (zoom out).
 *
 * NOT the same as timeslip's getPinchRatio, which is buggy (see ADR 0021 Decision 3).
 * @internal
 */
export function pinchRatio(prev: Multitouch, next: Multitouch): number {
  // Caller guarantees exactly 2 touches in both arrays.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (prev[1]!.position - prev[0]!.position) / (next[1]!.position - next[0]!.position);
}

/**
 * Identifier for the horizontal reference-domain semantics in effect. A change in either field
 * means the domain origin has shifted (see ADR 0004 Decision 2 addendum), requiring a view reset.
 * @internal
 */
export interface ViewKey {
  xScaleType: string;
  format: string;
  traceId?: string;
}

/**
 * Returns `true` when the reference-domain semantics have changed between `current` and `incoming`.
 * Used in `componentDidUpdate` to decide whether to call `resetView()`.
 *
 * A change means the domain origin shifted (`linear` re-zeroes; `time` keeps epoch-ms), or the
 * selected trace switched (different `traceId` → different `[min, max]` domain). In both cases the
 * accumulated zoom exponent and tween state are meaningless and must be discarded.
 * @internal
 */
export function hasViewKeyChanged(current: ViewKey | null, incoming: ViewKey): boolean {
  if (!current) return true;
  return (
    current.xScaleType !== incoming.xScaleType ||
    current.format !== incoming.format ||
    current.traceId !== incoming.traceId
  );
}

/**
 * Closed-form inverse of `getFocusDomain`. Returns the `{zoom, pan}` focus to assign into
 * `zoomPan.focus` so that the visible window snaps to `[domainFrom, domainTo]` against reference
 * domain `[refFrom, refTo]`. Assigning into the live `zoomPan.focus` (not replacing the whole
 * ZoomPan) preserves drag/flywheel state.
 *
 * Guards `refExtent <= 0` (empty dataset) → `{ zoom: 0, pan: 0 }` (fit-all, no divide-by-zero).
 * @internal
 */
export function domainToZoomPan(
  [domainFrom, domainTo]: [number, number],
  [refFrom, refTo]: [number, number],
): { zoom: number; pan: number } {
  const refExtent = refTo - refFrom;
  if (refExtent <= 0) return { zoom: 0, pan: 0 };
  const focusExtent = domainTo - domainFrom;
  const zoom = multiplierToZoom(focusExtent / refExtent);
  const leeway = refExtent - focusExtent;
  const pan = leeway > 0 ? (domainFrom - refFrom) / leeway : 0;
  return { zoom, pan };
}

/**
 * Inverts `geometry.scale` for two canvas CSS x-pixel positions, returning `[min, max]` in
 * milliseconds. Both x values are clamped to the plot bounds before conversion.
 *
 * Guards `plot.width <= 0` and `focusSpan <= 0` (degenerate geometry) → returns the full
 * `[focusDomain.min, focusDomain.max]` range unchanged.
 * @internal
 */
export function pixelRangeToDomain(x0: number, x1: number, geometry: TraceGeometry): [number, number] {
  const { plot, focusDomain } = geometry;
  if (plot.width <= 0) return [focusDomain.min, focusDomain.max];
  const focusSpan = focusDomain.max - focusDomain.min;
  if (focusSpan <= 0) return [focusDomain.min, focusDomain.max];
  const plotRight = plot.left + plot.width;
  const toMs = (x: number) =>
    focusDomain.min + ((clamp(x, plot.left, plotRight) - plot.left) / plot.width) * focusSpan;
  const a = toMs(x0);
  const b = toMs(x1);
  return a <= b ? [a, b] : [b, a];
}
