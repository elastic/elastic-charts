/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildChildrenMap, displayParentId, mergeSegments, traceScopedId } from './self_time';
import type { NormalizedSpan } from './types';

/**
 * Returns the set of span IDs that have at least one direct **display** child present in the same
 * trace group — i.e. the spans that can display a disclosure caret. Uses display topology so a
 * reparented orphan's synthetic parent (its elected root) is collapsible. See Spec 26 / ADR 0028.
 * @internal
 */
export function collapsibleParentIds(spans: NormalizedSpan[]): Set<string> {
  const idKeys = new Set(spans.map((s) => traceScopedId(s.traceId, s.id)));
  const result = new Set<string>();
  for (const span of spans) {
    const p = displayParentId(span);
    if (p !== undefined && idKeys.has(traceScopedId(span.traceId, p))) result.add(p);
  }
  return result;
}

/**
 * Filters `orderedSpans` (already in lane order from `orderLanes`) to the visible set after
 * applying the collapse state, and replaces each collapsed parent's `activeSegments` with the
 * **rolled-up active segments**: the merged union of every span in its subtree's active segments,
 * clamped to the parent's `[start, end]`.
 *
 * - Descendants of a collapsed parent are removed from the output.
 * - A collapsed span nested inside another collapsed span is absorbed — the outermost visible
 *   collapsed ancestor owns the rollup for the entire subtree.
 * - Collapsing a span with no children is a no-op (it remains in the output unchanged).
 * - Input array is not mutated.
 *
 * `collapsedSpanIds` is the effective set (controlled prop ?? local state). An empty set is a fast
 * path that returns `orderedSpans` without allocation. See ADR 0026 for the design rationale.
 * @internal
 */
export function collapseLanes(orderedSpans: NormalizedSpan[], collapsedSpanIds: ReadonlySet<string>): NormalizedSpan[] {
  if (collapsedSpanIds.size === 0) return orderedSpans;

  const childrenMap = buildChildrenMap(orderedSpans, displayParentId);

  // Spans hidden because they are descendants of a collapsed ancestor.
  const hiddenIds = new Set<string>();

  // Collect all display descendants of `parent` into `hiddenIds` and append their activeSegments.
  function collectDescendants(parent: NormalizedSpan, out: Array<{ start: number; end: number }>): void {
    for (const child of childrenMap.get(traceScopedId(parent.traceId, parent.id)) ?? []) {
      hiddenIds.add(child.id);
      out.push(...child.activeSegments);
      collectDescendants(child, out);
    }
  }

  // Pre-compute rolled-up activeSegments for each collapsed span that has children.
  // Childless spans in collapsedSpanIds are a no-op (no caret shown; UI prevents it, but be robust).
  const rollupBySpan = new Map<NormalizedSpan, NormalizedSpan['activeSegments']>();
  for (const span of orderedSpans) {
    if (!collapsedSpanIds.has(span.id)) continue;
    if (!childrenMap.has(traceScopedId(span.traceId, span.id))) continue; // childless — pass through unchanged
    const subtree: Array<{ start: number; end: number }> = [...span.activeSegments];
    collectDescendants(span, subtree);
    // Clamp each segment to span's [start, end] and drop zero-width intervals.
    const clamped = subtree
      .map(({ start, end, ...rest }) => ({ ...rest, start: Math.max(start, span.start), end: Math.min(end, span.end) }))
      .filter(({ start, end }) => start < end);
    rollupBySpan.set(span, mergeSegments(clamped));
  }

  // Build output: skip hidden spans; replace collapsed spans with their rollup clone.
  const result: NormalizedSpan[] = [];
  for (const span of orderedSpans) {
    if (hiddenIds.has(span.id)) continue;
    const rollup = rollupBySpan.get(span);
    result.push(rollup !== undefined ? { ...span, activeSegments: rollup } : span);
  }
  return result;
}

/**
 * Re-keys projected critical intervals onto the **visible owning span** after collapse, mirroring
 * the rolled-up active segments produced by `collapseLanes`. Each hidden descendant's intervals are
 * attributed to the outermost visible collapsed ancestor; the intervals are clamped to that
 * ancestor's `[start, end]` and `mergeSegments`-merged. Intervals belonging to already-visible
 * spans pass through unchanged.
 *
 * Empty-collapse-set fast path returns the input unchanged (no allocation). In `'chronological'`
 * mode, `collapsedSpanIds` is always empty so this is always the fast path.
 *
 * See ADR 0015 Decision 4 and ADR 0026.
 * @internal
 */
export function rollupCriticalIntervals(
  orderedSpans: NormalizedSpan[],
  collapsedSpanIds: ReadonlySet<string>,
  criticalIntervals: ReadonlyArray<{ spanId: string; start: number; end: number }>,
): Array<{ spanId: string; start: number; end: number }> {
  if (collapsedSpanIds.size === 0 || criticalIntervals.length === 0)
    return criticalIntervals as Array<{ spanId: string; start: number; end: number }>;

  const childrenMap = buildChildrenMap(orderedSpans, displayParentId);

  // Map from each hidden span ID → the ID of its outermost visible collapsed ancestor.
  const hiddenToOwner = new Map<string, string>();

  function collectHidden(parent: NormalizedSpan, owningAncestorId: string): void {
    for (const child of childrenMap.get(traceScopedId(parent.traceId, parent.id)) ?? []) {
      hiddenToOwner.set(child.id, owningAncestorId);
      collectHidden(child, owningAncestorId);
    }
  }

  for (const span of orderedSpans) {
    if (!collapsedSpanIds.has(span.id)) continue;
    if (!childrenMap.has(traceScopedId(span.traceId, span.id))) continue; // childless — no rollup needed
    if (hiddenToOwner.has(span.id)) continue; // hidden by an outer collapse — outer ancestor owns
    collectHidden(span, span.id);
  }

  if (hiddenToOwner.size === 0) return criticalIntervals as Array<{ spanId: string; start: number; end: number }>;

  // Build a spanId→span lookup for clamping.
  const spanById = new Map(orderedSpans.map((s) => [s.id, s]));

  // Bucket intervals by their effective (possibly remapped) owner spanId.
  const buckets = new Map<string, Array<{ start: number; end: number }>>();
  const passThrough: Array<{ spanId: string; start: number; end: number }> = [];

  for (const interval of criticalIntervals) {
    const ownerId = hiddenToOwner.get(interval.spanId) ?? interval.spanId;
    if (ownerId !== interval.spanId) {
      // Remapped to a collapsed ancestor — clamp to that ancestor's extent.
      const owner = spanById.get(ownerId);
      if (owner === undefined) continue; // shouldn't happen but be robust
      const start = Math.max(interval.start, owner.start);
      const end = Math.min(interval.end, owner.end);
      if (start >= end) continue; // clamp produced a zero-width or inverted interval
      let bucket = buckets.get(ownerId);
      if (bucket === undefined) {
        bucket = [];
        buckets.set(ownerId, bucket);
      }
      bucket.push({ start, end });
    } else {
      passThrough.push(interval);
    }
  }

  // Merge each bucket and emit as rolled-up intervals keyed by the owner spanId.
  const result = [...passThrough];
  for (const [ownerId, raw] of buckets) {
    for (const merged of mergeSegments(raw)) {
      result.push({ spanId: ownerId, start: merged.start, end: merged.end });
    }
  }
  return result;
}

/**
 * Builds a lane-index → disclosure entry map for all visible parent spans. Each entry carries the
 * caret state, tree depth (for indent rendering), and the total descendant count in the original
 * (pre-collapse) tree (used for the "N descendants hidden" aria-live announcement).
 *
 * Must be called with the **post-collapse** `visibleSpans` (for correct lane indices) and the
 * **pre-collapse** `pipelineSpans` (for counting subtree sizes). Returns an empty Map when there
 * are no parent spans.
 * @internal
 */
export function buildDisclosureMap(
  pipelineSpans: NormalizedSpan[],
  visibleSpans: NormalizedSpan[],
  effectiveCollapsed: ReadonlySet<string>,
  depthBySpan: ReadonlyMap<NormalizedSpan, number>,
  parentIds: ReadonlySet<string>,
): Map<number, { state: 'collapsed' | 'expanded'; depth: number; descendantCount: number }> {
  const result = new Map<number, { state: 'collapsed' | 'expanded'; depth: number; descendantCount: number }>();
  if (parentIds.size === 0) return result;

  // Bridge to ID-keyed depth: handles the case where collapseLanes returns a spread-clone of the
  // collapsed parent (new object reference) that is not a key in depthBySpan.
  const depthById = new Map<string, number>();
  for (const span of pipelineSpans) {
    const d = depthBySpan.get(span);
    if (d !== undefined) depthById.set(span.id, d);
  }

  const childrenMap = buildChildrenMap(pipelineSpans, displayParentId);

  function countDescendants(parent: NormalizedSpan): number {
    let n = 0;
    for (const child of childrenMap.get(traceScopedId(parent.traceId, parent.id)) ?? []) {
      n += 1 + countDescendants(child);
    }
    return n;
  }

  for (let i = 0; i < visibleSpans.length; i++) {
    const span = visibleSpans[i]!;
    if (!parentIds.has(span.id)) continue;
    const depth = depthById.get(span.id) ?? 0;
    const state: 'collapsed' | 'expanded' = effectiveCollapsed.has(span.id) ? 'collapsed' : 'expanded';
    const descendantCount = countDescendants(span);
    result.set(i, { state, depth, descendantCount });
  }

  return result;
}
