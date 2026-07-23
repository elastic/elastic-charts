/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NormalizedSpan } from './types';

type Segment = { start: number; end: number };

/**
 * The canonical **display parent** accessor: an orphan's synthetic `reparentedToSpanId` when
 * present, otherwise the recorded `parentId`. Display-topology consumers (lane ordering/depth,
 * collapse rollups, clock-skew placement, SR indentation) resolve parentage through this so a
 * partial-trace repair never leaks into recorded source identity. Self-time derivation keeps using
 * recorded `parentId` directly. See Spec 26 / ADR 0028.
 * @internal
 */
export function displayParentId(span: NormalizedSpan): string | undefined {
  return span.reparentedToSpanId ?? span.parentId;
}

/**
 * Fills each span's empty `activeSegments` array with its self time: the span's `[start, end]`
 * interval minus the union of its direct children's `[start, end]` intervals (sorted-interval
 * subtraction). Spans that already carry a non-empty `activeSegments` (copied verbatim by the
 * normalization step) pass through unchanged. Input spans are not mutated. See ADR 0003.
 * @internal
 */
/** Resolves the parent reference used to build a children map. @internal */
export type ParentIdAccessor = (span: NormalizedSpan) => string | undefined;

const GROUP_SEP = '\u0000';

/**
 * Trace-scoped identity key `${traceId}\u0000${id}`. All structural parent lookups key on this so a
 * span ID present only in another `traceId` group never satisfies a parent reference or forms an
 * edge (the `undefined` traceId is its own single group). See Spec 26 / ADR 0028.
 * @internal
 */
export function traceScopedId(traceId: string | undefined, id: string): string {
  return `${traceId ?? ''}${GROUP_SEP}${id}`;
}

/**
 * Builds a trace-local `parent → direct children` map from the span array in a single pass, keyed by
 * {@link traceScopedId} of the parent. `parentOf` selects the parent reference: the default reads the
 * recorded `parentId` (source topology, used by self-time derivation); pass {@link displayParentId}
 * for display topology (lane ordering, collapse, clock-skew placement). Look up a parent's children
 * with `map.get(traceScopedId(parent.traceId, parent.id))`.
 * Exported so `orderLanes`/`collapse`/`correctClockSkew` share one parentage definition.
 * @internal
 */
export function buildChildrenMap(
  spans: NormalizedSpan[],
  parentOf: ParentIdAccessor = (s) => s.parentId,
): Map<string, NormalizedSpan[]> {
  const map = new Map<string, NormalizedSpan[]>();
  for (const span of spans) {
    const parentId = parentOf(span);
    if (parentId !== undefined) {
      const key = traceScopedId(span.traceId, parentId);
      let siblings = map.get(key);
      if (!siblings) {
        siblings = [];
        map.set(key, siblings);
      }
      siblings.push(span);
    }
  }
  return map;
}

/** @internal */
export function resolveActive(spans: NormalizedSpan[]): NormalizedSpan[] {
  // Build recorded-parentId → direct children map in a single pass. Self time uses recorded source
  // topology (never synthetic display parentage) and is trace-local, so a synthetic child or a
  // cross-trace parent reference never reduces a span's measured self time. See Spec 26 / ADR 0028.
  const childrenByParentId = buildChildrenMap(spans);

  return spans.map((span) => {
    // Pass through spans that already carry explicit activeSegments.
    if (span.activeSegments.length > 0) return span;

    const children = childrenByParentId.get(traceScopedId(span.traceId, span.id)) ?? [];
    const activeSegments = gapSegments(span.start, span.end, children);
    return { ...span, activeSegments };
  });
}

/**
 * Per-span memoization for `waitingSegments`. Keyed on the `NormalizedSpan` object reference,
 * which is stable for the lifetime of a pipeline cache entry (a new `normalize` run produces new
 * span objects, so entries are automatically evicted when the component's `pipelineCache` drops
 * its reference — WeakMap keys are GC-eligible as soon as the span object is unreachable).
 *
 * Without this cache, `waitingSegments` (O(n log n) via `gapSegments`) is recomputed at ~4 call
 * sites per hover event: canvas2d draw pass, geometry resolveSelection, tooltip builder, pickRegion.
 */
const waitingSegmentsCache = new WeakMap<NormalizedSpan, Segment[]>();

/**
 * Returns the waiting (non-active) segments of a span: the complement of `span.activeSegments`
 * within `[span.start, span.end]`. Used by `pickRegion` and the selection-highlight pass to
 * address waiting gaps by index (symmetric with active segments). See ADR 0011 Decision 5.
 *
 * Result is memoized per span object reference (see `waitingSegmentsCache` above).
 * @public
 */
export function waitingSegments(span: NormalizedSpan): Segment[] {
  const cached = waitingSegmentsCache.get(span);
  if (cached !== undefined) return cached;
  const result = gapSegments(span.start, span.end, span.activeSegments);
  waitingSegmentsCache.set(span, result);
  return result;
}

/**
 * Sorts and merges overlapping or touching intervals into a minimal non-overlapping set.
 * Input is not mutated. O(n log n).
 * Used by `gapSegments` (self-time / waiting) and `collapseLanes` (rolled-up active segments).
 * @internal
 */
export function mergeSegments(intervals: readonly Segment[]): Segment[] {
  if (intervals.length === 0) return [];
  const sorted = intervals.slice().sort((a, b) => a.start - b.start);
  const merged: Segment[] = [{ ...sorted[0]! }];
  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i]!;
    const last = merged.at(-1)!;
    if (curr.start <= last.end) {
      last.end = Math.max(last.end, curr.end);
    } else {
      merged.push({ ...curr });
    }
  }
  return merged;
}

/**
 * Subtracts the union of `intervals` from `[parentStart, parentEnd]`, returning the gaps.
 * Clamps each interval to the parent extent, merges overlapping intervals, then yields the
 * uncovered sub-intervals. O(n log n). Used by both `resolveActive` (self-time) and
 * `waitingSegments` (waiting gaps).
 */
function gapSegments(
  parentStart: number,
  parentEnd: number,
  intervals: readonly { start: number; end: number }[],
): Segment[] {
  if (parentStart >= parentEnd) return []; // zero- or negative-duration span: nothing to draw

  if (intervals.length === 0) {
    return [{ start: parentStart, end: parentEnd }];
  }

  // Clamp each interval to parent's [start, end] and discard zero-width after clamping.
  const clamped: Segment[] = [];
  for (const interval of intervals) {
    const start = Math.max(interval.start, parentStart);
    const end = Math.min(interval.end, parentEnd);
    if (start < end) clamped.push({ start, end });
  }

  if (clamped.length === 0) {
    // All intervals remain outside the parent after upstream skew correction (right-side overhang
    // or malformed data).
    return [{ start: parentStart, end: parentEnd }];
  }

  const merged = mergeSegments(clamped);

  // Subtract the merged union from [parentStart, parentEnd].
  const result: Segment[] = [];
  let cursor = parentStart;
  for (const seg of merged) {
    if (cursor < seg.start) result.push({ start: cursor, end: seg.start });
    cursor = Math.max(cursor, seg.end);
  }
  if (cursor < parentEnd) result.push({ start: cursor, end: parentEnd });

  return result;
}
