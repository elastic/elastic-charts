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
 * Fills each span's empty `activeSegments` array with its self time: the span's `[start, end]`
 * interval minus the union of its direct children's `[start, end]` intervals (sorted-interval
 * subtraction). Spans that already carry a non-empty `activeSegments` (copied verbatim by the
 * normalization step) pass through unchanged. Input spans are not mutated. See ADR 0003.
 * @internal
 */
export function resolveActive(spans: NormalizedSpan[]): NormalizedSpan[] {
  // Build parentId → direct children map in a single pass.
  const childrenByParentId = new Map<string, NormalizedSpan[]>();
  for (const span of spans) {
    if (span.parentId !== undefined) {
      let siblings = childrenByParentId.get(span.parentId);
      if (!siblings) {
        siblings = [];
        childrenByParentId.set(span.parentId, siblings);
      }
      siblings.push(span);
    }
  }

  return spans.map((span) => {
    // Pass through spans that already carry explicit activeSegments.
    if (span.activeSegments.length > 0) return span;

    const children = childrenByParentId.get(span.id) ?? [];
    const activeSegments = selfTimeSegments(span.start, span.end, children);
    return { ...span, activeSegments };
  });
}

/**
 * Derives self-time segments for a span given its direct children. Clamps each child to the
 * parent's extent, merges overlapping children, then subtracts the merged union from
 * [parentStart, parentEnd]. O(n log n) on the number of children.
 */
function selfTimeSegments(parentStart: number, parentEnd: number, children: NormalizedSpan[]): Segment[] {
  if (parentStart >= parentEnd) return []; // zero- or negative-duration span: nothing to draw

  if (children.length === 0) {
    return [{ start: parentStart, end: parentEnd }];
  }

  // Clamp each child to parent's [start, end] and discard zero-width after clamping.
  const clamped: Segment[] = [];
  for (const child of children) {
    const start = Math.max(child.start, parentStart);
    const end = Math.min(child.end, parentEnd);
    if (start < end) clamped.push({ start, end });
  }

  if (clamped.length === 0) {
    // All children were outside the parent (clock skew / bad data).
    return [{ start: parentStart, end: parentEnd }];
  }

  // Sort by start, then merge overlapping/touching intervals.
  clamped.sort((a, b) => a.start - b.start);
  const merged: Segment[] = [{ ...clamped[0]! }];
  for (let i = 1; i < clamped.length; i++) {
    const curr = clamped[i]!;
    const last = merged[merged.length - 1]!;
    if (curr.start <= last.end) {
      last.end = Math.max(last.end, curr.end);
    } else {
      merged.push({ ...curr });
    }
  }

  // Subtract the merged union from [parentStart, parentEnd].
  const result: Segment[] = [];
  let cursor = parentStart;
  for (const covered of merged) {
    if (cursor < covered.start) {
      result.push({ start: cursor, end: covered.start });
    }
    cursor = Math.max(cursor, covered.end);
  }
  if (cursor < parentEnd) {
    result.push({ start: cursor, end: parentEnd });
  }

  return result;
}
