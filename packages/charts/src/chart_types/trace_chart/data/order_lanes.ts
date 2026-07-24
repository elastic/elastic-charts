/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildChildrenMap, displayParentId, traceScopedId } from './self_time';
import type { NormalizedSpan } from './types';

/** Result of {@link orderLanes}. @internal */
export interface OrderedLanes {
  /** Spans in lane order (top → bottom). Lane index = position in this array. */
  lanes: NormalizedSpan[];
  /**
   * Tree depth of each span (root = 0). Populated only in `'tree'` mode; empty Map in
   * `'chronological'` mode (all depths treated as 0). Keyed by object identity so spans with
   * duplicate ids are each tracked separately.
   */
  depthBySpan: Map<NormalizedSpan, number>;
}

/**
 * Produces a flat array of spans in the order they should occupy lanes (top → bottom), plus a
 * per-span tree depth used for collapsible-nesting caret indentation.
 *
 * - `'chronological'` — ascending by `start` (Chrome DevTools Network panel style).
 * - `'tree'` — depth-first `parentId` nesting (Kibana APM style, **the default**): each parent
 *   is immediately followed by its descendants, recursively. Siblings and roots are ordered by
 *   `start` ascending, stable by original data order on ties. Works as a **forest** in multi-trace
 *   mode: orphans (no `parentId`, or whose `parentId` is not in the span set) become roots.
 *
 * `lanes` is a pre-ordered flat array. Lane index = position in this array. The downstream
 * contract (buildGeometry, canvas2d renderer, pickLane, scroll math) is order-agnostic; this
 * function is the single place that assigns lane indices. See ADR 0018.
 * @internal
 */
export function orderLanes(spans: NormalizedSpan[], mode: 'tree' | 'chronological'): OrderedLanes {
  if (mode === 'chronological') {
    return { lanes: spans.slice().sort((a, b) => a.start - b.start), depthBySpan: new Map() };
  }

  // tree: DFS forest over display topology (synthetic reparenting for partial traces; Spec 26).
  const childrenMap = buildChildrenMap(spans, displayParentId);
  const idKeys = new Set(spans.map((s) => traceScopedId(s.traceId, s.id)));

  // Roots: no display parent, or a display parent not present in the same trace group.
  // Sort roots by start, stable (Array.sort is stable in ES2019+).
  const roots = spans
    .filter((s) => {
      const p = displayParentId(s);
      return p === undefined || !idKeys.has(traceScopedId(s.traceId, p));
    })
    .sort((a, b) => a.start - b.start);

  const lanes: NormalizedSpan[] = [];
  const depthBySpan = new Map<NormalizedSpan, number>();
  // Track visited by object identity rather than id so that two distinct span objects that happen
  // to share the same id are both emitted (duplicate ids from untrusted input must not be lost).
  const visited = new Set<NormalizedSpan>();

  function dfs(span: NormalizedSpan, depth: number): void {
    if (visited.has(span)) return; // cycle guard by object identity
    visited.add(span);
    lanes.push(span);
    depthBySpan.set(span, depth);
    const children = childrenMap.get(traceScopedId(span.traceId, span.id));
    if (children) {
      // Sort children by start, stable — same rule as roots.
      children
        .slice()
        .sort((a, b) => a.start - b.start)
        .forEach((child) => dfs(child, depth + 1));
    }
  }

  roots.forEach((root) => dfs(root, 0));

  // Safety: append any spans not reached (e.g. in a cycle or with duplicate ids), sorted by start.
  if (lanes.length < spans.length) {
    spans
      .filter((s) => !visited.has(s))
      .sort((a, b) => a.start - b.start)
      .forEach((s) => {
        lanes.push(s);
        depthBySpan.set(s, 0);
      });
  }

  return { lanes, depthBySpan };
}
