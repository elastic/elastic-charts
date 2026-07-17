/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NormalizedSpan } from './types';
import { buildChildrenMap } from './self_time';

/**
 * Produces a flat array of spans in the order they should occupy lanes (top → bottom).
 *
 * - `'chronological'` — ascending by `start` (Chrome DevTools Network panel style).
 * - `'tree'` — depth-first `parentId` nesting (Kibana APM style, **the default**): each parent
 *   is immediately followed by its descendants, recursively. Siblings and roots are ordered by
 *   `start` ascending, stable by original data order on ties. Works as a **forest** in multi-trace
 *   mode: orphans (no `parentId`, or whose `parentId` is not in the span set) become roots.
 *
 * The result is a pre-ordered flat array. Lane index = position in this array. The downstream
 * contract (buildGeometry, canvas2d renderer, pickLane, scroll math) is order-agnostic; this
 * function is the single place that assigns lane indices. See ADR 0018.
 * @internal
 */
export function orderLanes(spans: NormalizedSpan[], mode: 'tree' | 'chronological'): NormalizedSpan[] {
  if (mode === 'chronological') {
    return spans.slice().sort((a, b) => a.start - b.start);
  }

  // tree: DFS forest — shared helper keeps parentage consistent with resolveActive.
  const childrenMap = buildChildrenMap(spans);
  const ids = new Set(spans.map((s) => s.id));

  // Roots: no parentId, or parentId not present in the span set (orphan spans).
  // Sort roots by start, stable (Array.sort is stable in ES2019+).
  const roots = spans.filter((s) => s.parentId === undefined || !ids.has(s.parentId)).sort((a, b) => a.start - b.start);

  const result: NormalizedSpan[] = [];
  const visited = new Set<string>();

  function dfs(span: NormalizedSpan): void {
    if (visited.has(span.id)) return; // cycle guard
    visited.add(span.id);
    result.push(span);
    const children = childrenMap.get(span.id);
    if (children) {
      // Sort children by start, stable — same rule as roots.
      children.slice().sort((a, b) => a.start - b.start).forEach(dfs);
    }
  }

  roots.forEach(dfs);

  // Safety: append any spans not reached (e.g. in a cycle), sorted by start.
  if (result.length < spans.length) {
    spans
      .filter((s) => !visited.has(s.id))
      .sort((a, b) => a.start - b.start)
      .forEach((s) => result.push(s));
  }

  return result;
}
