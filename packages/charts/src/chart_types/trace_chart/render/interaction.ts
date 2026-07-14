/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { multiplierToZoom } from '../../timeslip/projections/zoom_pan';

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
}

/**
 * Returns `true` when the reference-domain semantics have changed between `current` and `incoming`.
 * Used in `componentDidUpdate` to decide whether to call `resetView()`.
 *
 * A change means the domain origin shifted (`linear` re-zeroes; `time` keeps epoch-ms), so any
 * accumulated zoom exponent and tween state are meaningless and must be discarded.
 * @internal
 */
export function hasViewKeyChanged(current: ViewKey | null, incoming: ViewKey): boolean {
  if (!current) return true;
  return current.xScaleType !== incoming.xScaleType || current.format !== incoming.format;
}
