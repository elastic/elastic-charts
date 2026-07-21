/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NormalizedSpan } from './types';
import { buildChildrenMap, mergeSegments } from './self_time';

/**
 * Returns the set of span IDs that have at least one direct child in the span array —
 * i.e. the spans that can display a disclosure caret.
 * @internal
 */
export function collapsibleParentIds(spans: NormalizedSpan[]): Set<string> {
  return new Set(buildChildrenMap(spans).keys());
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
export function collapseLanes(
  orderedSpans: NormalizedSpan[],
  collapsedSpanIds: ReadonlySet<string>,
): NormalizedSpan[] {
  if (collapsedSpanIds.size === 0) return orderedSpans;

  const childrenMap = buildChildrenMap(orderedSpans);

  // Spans hidden because they are descendants of a collapsed ancestor.
  const hiddenIds = new Set<string>();

  // Collect all descendants of `spanId` into `hiddenIds` and append their activeSegments to `out`.
  function collectDescendants(spanId: string, out: Array<{ start: number; end: number }>): void {
    for (const child of childrenMap.get(spanId) ?? []) {
      hiddenIds.add(child.id);
      out.push(...child.activeSegments);
      collectDescendants(child.id, out);
    }
  }

  // Pre-compute rolled-up activeSegments for each collapsed span that has children.
  // Childless spans in collapsedSpanIds are a no-op (no caret shown; UI prevents it, but be robust).
  const rollupBySpan = new Map<NormalizedSpan, NormalizedSpan['activeSegments']>();
  for (const span of orderedSpans) {
    if (!collapsedSpanIds.has(span.id)) continue;
    if (!childrenMap.has(span.id)) continue; // childless — pass through unchanged
    const subtree: Array<{ start: number; end: number }> = [...span.activeSegments];
    collectDescendants(span.id, subtree);
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

  const childrenMap = buildChildrenMap(pipelineSpans);

  function countDescendants(spanId: string): number {
    let n = 0;
    for (const child of childrenMap.get(spanId) ?? []) {
      n += 1 + countDescendants(child.id);
    }
    return n;
  }

  for (let i = 0; i < visibleSpans.length; i++) {
    const span = visibleSpans[i]!;
    if (!parentIds.has(span.id)) continue;
    const depth = depthById.get(span.id) ?? 0;
    const state: 'collapsed' | 'expanded' = effectiveCollapsed.has(span.id) ? 'collapsed' : 'expanded';
    const descendantCount = countDescendants(span.id);
    result.set(i, { state, depth, descendantCount });
  }

  return result;
}
