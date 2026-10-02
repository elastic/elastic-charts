/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildChildrenMap, displayParentId, mergeSegments, traceScopedId } from './self_time';
import type { NormalizedSpan } from './types';
import type { TreeGuideEntry } from '../render/types';

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

  // Spans hidden because they are descendants of a collapsed ancestor. Keyed by trace-scoped id to
  // match `childrenMap` (both walk the display tree) so the hidden/visible partition can never be
  // mis-targeted by a same-id span in another trace group of a combined waterfall.
  const hiddenIds = new Set<string>();

  // Collect all display descendants of `parent` into `hiddenIds` and append their activeSegments.
  function collectDescendants(parent: NormalizedSpan, out: Array<{ start: number; end: number }>): void {
    for (const child of childrenMap.get(traceScopedId(parent.traceId, parent.id)) ?? []) {
      hiddenIds.add(traceScopedId(child.traceId, child.id));
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
    if (hiddenIds.has(traceScopedId(span.traceId, span.id))) continue;
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

  // Map from each hidden span ID → the ID of its outermost visible collapsed ancestor. Keyed by the
  // chart-global span id (ADR 0028) because it is looked up by the public `criticalPath[].spanId`
  // reference below; recovery guarantees these ids are unique, so no same-id ancestor can clobber it.
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

  // Build a spanId→span lookup for clamping. `orderedSpans` is post-recovery output, so span ids are
  // unique across it (duplicate-id groups/chart are invalidated upstream by ADR 0027/0028) and this
  // Map never silently shadows a colliding span.
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
 * Bridges from span-object-keyed `depthBySpan` to a span-id-keyed map. Needed because
 * `collapseLanes` spread-clones collapsed parents (new object reference not in `depthBySpan`).
 * Both `buildDisclosureMap` and `buildTreeGuideMap` have the same problem, so this is shared.
 */
function buildDepthById(
  pipelineSpans: NormalizedSpan[],
  depthBySpan: ReadonlyMap<NormalizedSpan, number>,
): Map<string, number> {
  const depthById = new Map<string, number>();
  for (const span of pipelineSpans) {
    const d = depthBySpan.get(span);
    if (d !== undefined) depthById.set(span.id, d);
  }
  return depthById;
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
): Map<number, { state: 'collapsed' | 'expanded'; depth: number; descendantCount: number; childCount: number }> {
  const result = new Map<
    number,
    { state: 'collapsed' | 'expanded'; depth: number; descendantCount: number; childCount: number }
  >();
  if (parentIds.size === 0) return result;

  // Bridge to ID-keyed depth: handles the case where collapseLanes returns a spread-clone of the
  // collapsed parent (new object reference) that is not a key in depthBySpan.
  const depthById = buildDepthById(pipelineSpans, depthBySpan);

  const childrenMap = buildChildrenMap(pipelineSpans, displayParentId);

  // Memoize per span: a parent's descendant count reuses its children's counts, turning the
  // otherwise O(N) per-node recursion (O(N²) across all parents in a deep tree) into O(N) overall.
  const descendantCountCache = new Map<NormalizedSpan, number>();
  function countDescendants(parent: NormalizedSpan): number {
    const cached = descendantCountCache.get(parent);
    if (cached !== undefined) return cached;
    let n = 0;
    for (const child of childrenMap.get(traceScopedId(parent.traceId, parent.id)) ?? []) {
      n += 1 + countDescendants(child);
    }
    descendantCountCache.set(parent, n);
    return n;
  }

  for (let i = 0; i < visibleSpans.length; i++) {
    const span = visibleSpans[i]!;
    if (!parentIds.has(span.id)) continue;
    const depth = depthById.get(span.id) ?? 0;
    const state: 'collapsed' | 'expanded' = effectiveCollapsed.has(span.id) ? 'collapsed' : 'expanded';
    const descendantCount = countDescendants(span);
    // Direct display-child count: from pipelineSpans (pre-collapse), so it is collapse-invariant.
    // childrenMap uses displayParentId, matching the display topology the spec requires (Spec 32).
    const childCount = (childrenMap.get(traceScopedId(span.traceId, span.id)) ?? []).length;
    result.set(i, { state, depth, descendantCount, childCount });
  }

  return result;
}

/**
 * Builds a lane-index → tree-guide entry map for all visible non-root lanes (Spec 33 / ADR 0039).
 * Each entry carries the lane's depth, whether it is the last visible display child of its parent,
 * and the parent's lane index. The draw pass uses `parentLane` to walk the ancestor chain upward and
 * draws passthrough verticals for every non-last ancestor.
 *
 * Must be called with the **post-collapse** `visibleSpans` (for correct lane indices) and the
 * **pre-collapse** `pipelineSpans` (for the depth bridge). Signature mirrors `buildDisclosureMap`.
 *
 * Returns an empty Map immediately when `depthBySpan.size === 0` (chronological mode / flat trace),
 * so the prop-off fast path allocates nothing beyond a single empty-map check.
 * @internal
 */
export function buildTreeGuideMap(
  pipelineSpans: NormalizedSpan[],
  visibleSpans: NormalizedSpan[],
  depthBySpan: ReadonlyMap<NormalizedSpan, number>,
): Map<number, TreeGuideEntry> {
  const result = new Map<number, TreeGuideEntry>();
  if (depthBySpan.size === 0) return result;

  // Bridge from span-object-keyed to span-id-keyed depth (same reason as buildDisclosureMap).
  const depthById = buildDepthById(pipelineSpans, depthBySpan);

  // parentLaneByDepth[d] tracks the most recently seen lane index at depth d.
  // Used to identify the parent (at d-1) and the previous sibling (at d, same parent).
  const parentLaneByDepth: number[] = [];

  for (let i = 0; i < visibleSpans.length; i++) {
    const span = visibleSpans[i]!;
    const d = depthById.get(span.id) ?? 0;
    if (d === 0) {
      // Root lane: no entry (no spine above a root). Record the slot so the next depth-1 child
      // knows its parent, and reset the slot so a new forest root doesn't inherit the prior group's.
      parentLaneByDepth[0] = i;
      continue;
    }
    const parentLane = parentLaneByDepth[d - 1];
    if (parentLane === undefined) {
      // Malformed display topology: a span at depth d with no visible ancestor at d-1.
      // depthBySpan sets unreachable spans to 0 (order_lanes.ts:92), so this should not occur for
      // valid data. Degrade gracefully: skip (no spine for this lane).
      parentLaneByDepth[d] = i;
      continue;
    }
    // Flip the previous sibling at this depth to isLastChild=false if it has the same parent.
    // This is the `tree(1)` forward-pass trick: each new sibling retroactively marks the prior one
    // as non-terminal. The parent-equality check ensures forest boundaries are respected without
    // clearing the depth slot (stale slots from a prior group have a different parentLane value).
    const prevSiblingLane = parentLaneByDepth[d];
    if (prevSiblingLane !== undefined) {
      const prevEntry = result.get(prevSiblingLane);
      if (prevEntry !== undefined && prevEntry.parentLane === parentLane) {
        prevEntry.isLastChild = false;
      }
    }
    result.set(i, { depth: d, isLastChild: true, parentLane });
    parentLaneByDepth[d] = i;
  }

  return result;
}

/**
 * Returns the set of distinct direct display-child counts across all parent spans in the
 * pre-collapse pipeline output. Used by `getChildCountReserve` in the pipeline to size the count
 * column: measuring every distinct string is necessary because proportional-figure fonts can make
 * a shorter digit string wider than the max integer (e.g. `width("88") > width("91")`).
 *
 * Returns an empty array when there are no parent spans.
 * @internal
 */
export function distinctChildCounts(pipelineSpans: NormalizedSpan[]): number[] {
  const childrenMap = buildChildrenMap(pipelineSpans, displayParentId);
  const seen = new Set<number>();
  for (const span of pipelineSpans) {
    const children = childrenMap.get(traceScopedId(span.traceId, span.id));
    if (children && children.length > 0) {
      seen.add(children.length);
    }
  }
  return Array.from(seen);
}
