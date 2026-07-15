/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { multiplierToZoom } from '../../timeslip/projections/zoom_pan';
import { clamp } from '../../../utils/common';
import type { TraceGeometry } from './types';

/**
 * The finest time window the trace chart allows via zoom-in, in ms.
 * See ADR 0004 Decision 3.
 * @internal
 */
export const MIN_VISIBLE_EXTENT_MS = 1;

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
