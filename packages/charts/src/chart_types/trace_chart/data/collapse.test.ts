/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  buildDisclosureMap,
  buildTreeGuideMap,
  collapseLanes,
  collapsibleParentIds,
  rollupCriticalIntervals,
} from './collapse';
import { orderLanes } from './order_lanes';
import type { NormalizedSpan } from './types';

/** Minimal NormalizedSpan factory. `activeSegments` defaults to the full span extent (self-time). */
function span(
  id: string,
  start: number,
  end: number,
  parentId?: string,
  activeSegments?: NormalizedSpan['activeSegments'],
): NormalizedSpan {
  return {
    id,
    name: id,
    parentId,
    start,
    end,
    activeSegments: activeSegments ?? [{ start, end }],
    meta: { id, name: id, start, end },
  };
}

function ids(spans: NormalizedSpan[]): string[] {
  return spans.map((s) => s.id);
}

// ---------------------------------------------------------------------------
// collapsibleParentIds
// ---------------------------------------------------------------------------

describe('collapsibleParentIds', () => {
  it('returns empty set for flat spans (no parentId)', () => {
    const spans = [span('a', 0, 100), span('b', 0, 100)];
    expect(collapsibleParentIds(spans).size).toBe(0);
  });

  it('returns the id of spans that have children', () => {
    const spans = [span('root', 0, 100), span('child', 10, 50, 'root')];
    expect(collapsibleParentIds(spans)).toEqual(new Set(['root']));
  });

  it('does not include leaf spans (only parents)', () => {
    const spans = [span('root', 0, 100), span('child', 10, 50, 'root'), span('leaf', 15, 40, 'child')];
    const parents = collapsibleParentIds(spans);
    expect(parents.has('root')).toBe(true);
    expect(parents.has('child')).toBe(true);
    expect(parents.has('leaf')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// collapseLanes — fast path
// ---------------------------------------------------------------------------

describe('collapseLanes — fast path (empty collapsed set)', () => {
  it('returns the input array unchanged (same reference) when nothing is collapsed', () => {
    const spans = [span('a', 0, 100), span('b', 10, 50, 'a')];
    expect(collapseLanes(spans, new Set())).toBe(spans);
  });
});

// ---------------------------------------------------------------------------
// collapseLanes — basic pruning
// ---------------------------------------------------------------------------

describe('collapseLanes — pruning descendants', () => {
  it('removes direct children of a collapsed parent', () => {
    // root [0,100] → child [10,50]
    const root = span('root', 0, 100);
    const child = span('child', 10, 50, 'root');
    const result = collapseLanes([root, child], new Set(['root']));
    expect(ids(result)).toEqual(['root']);
  });

  it('removes grandchildren too', () => {
    const root = span('root', 0, 100);
    const child = span('child', 10, 80, 'root');
    const grandchild = span('grandchild', 20, 60, 'child');
    const result = collapseLanes([root, child, grandchild], new Set(['root']));
    expect(ids(result)).toEqual(['root']);
  });

  it('leaves siblings of a collapsed parent untouched', () => {
    const r1 = span('r1', 0, 100);
    const r1c = span('r1c', 10, 50, 'r1');
    const r2 = span('r2', 60, 200);
    const result = collapseLanes([r1, r1c, r2], new Set(['r1']));
    expect(ids(result)).toEqual(['r1', 'r2']);
  });

  it('output length equals visible lane count', () => {
    const root = span('root', 0, 100);
    const a = span('a', 5, 40, 'root');
    const b = span('b', 45, 90, 'root');
    const result = collapseLanes([root, a, b], new Set(['root']));
    expect(result).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// collapseLanes — rolled-up active segments
// ---------------------------------------------------------------------------

describe('collapseLanes — rolled-up active segments', () => {
  it('collapsed bar shows the union of own + child active segments', () => {
    // parent [0,100], self-time active: [0,10] and [80,100]
    // child [10,80], active: [10,80]
    const parent = span('parent', 0, 100, undefined, [
      { start: 0, end: 10 },
      { start: 80, end: 100 },
    ]);
    const child = span('child', 10, 80, 'parent', [{ start: 10, end: 80 }]);
    const [collapsed] = collapseLanes([parent, child], new Set(['parent']));
    // union: [0,10] ∪ [10,80] ∪ [80,100] → merged → [0,100]
    expect(collapsed!.activeSegments).toEqual([{ start: 0, end: 100 }]);
  });

  it('overlapping descendant segments are deduped (merged)', () => {
    // parent active: [0,10]; child A active: [20,50]; child B active: [30,70] (overlaps A)
    const parent = span('parent', 0, 100, undefined, [{ start: 0, end: 10 }]);
    const childA = span('childA', 20, 50, 'parent', [{ start: 20, end: 50 }]);
    const childB = span('childB', 30, 70, 'parent', [{ start: 30, end: 70 }]);
    const [collapsed] = collapseLanes([parent, childA, childB], new Set(['parent']));
    expect(collapsed!.activeSegments).toEqual([
      { start: 0, end: 10 },
      { start: 20, end: 70 }, // merged from [20,50] ∪ [30,70]
    ]);
  });

  it('descendant segments are clamped to the parent extent', () => {
    // child active extends beyond parent end (malformed/clock-skew data)
    const parent = span('parent', 0, 100, undefined, [{ start: 0, end: 20 }]);
    const child = span('child', 10, 150, 'parent', [{ start: 10, end: 150 }]);
    const [collapsed] = collapseLanes([parent, child], new Set(['parent']));
    // [0,20] ∪ clamp([10,150] → [10,100]) = [0,100]
    expect(collapsed!.activeSegments).toEqual([{ start: 0, end: 100 }]);
  });

  it('descendant segments entirely outside parent are dropped after clamping', () => {
    // child segment is outside parent's extent (clock skew — should never happen post-normalize, but robust)
    const parent = span('parent', 100, 200, undefined, [{ start: 100, end: 120 }]);
    const child = span('child', 110, 180, 'parent', [{ start: 200, end: 300 }]); // segment outside parent
    const [collapsed] = collapseLanes([parent, child], new Set(['parent']));
    // [100,120] ∪ clamp([200,300] → zero-width, dropped) = [100,120]
    expect(collapsed!.activeSegments).toEqual([{ start: 100, end: 120 }]);
  });

  it('includes grandchildren in the rollup', () => {
    const parent = span('parent', 0, 100, undefined, [{ start: 0, end: 5 }]);
    const child = span('child', 5, 90, 'parent', [{ start: 5, end: 30 }]);
    const grandchild = span('grandchild', 30, 90, 'child', [{ start: 30, end: 90 }]);
    const [collapsed] = collapseLanes([parent, child, grandchild], new Set(['parent']));
    // [0,5] ∪ [5,30] ∪ [30,90] → [0,90]
    expect(collapsed!.activeSegments).toEqual([{ start: 0, end: 90 }]);
  });
});

// ---------------------------------------------------------------------------
// collapseLanes — nested collapse (absorption)
// ---------------------------------------------------------------------------

describe('collapseLanes — nested collapse (absorption)', () => {
  it('collapsing an ancestor absorbs an inner collapsed span — only ancestor is visible', () => {
    const root = span('root', 0, 100);
    const mid = span('mid', 10, 80, 'root');
    const leaf = span('leaf', 20, 70, 'mid');
    // Both root and mid are in collapsedSpanIds; mid is hidden by root's collapse.
    const result = collapseLanes([root, mid, leaf], new Set(['root', 'mid']));
    expect(ids(result)).toEqual(['root']);
  });

  it('inner collapsed span subtree is included in the outer rollup', () => {
    // root [0,100] self-time: [0,10][80,100]; mid [10,80]: [10,40]; leaf [40,80]: [40,80]
    const root = span('root', 0, 100, undefined, [
      { start: 0, end: 10 },
      { start: 80, end: 100 },
    ]);
    const mid = span('mid', 10, 80, 'root', [{ start: 10, end: 40 }]);
    const leaf = span('leaf', 40, 80, 'mid', [{ start: 40, end: 80 }]);
    const [collapsed] = collapseLanes([root, mid, leaf], new Set(['root', 'mid']));
    // root rollup = [0,10] ∪ [10,40] ∪ [40,80] ∪ [80,100] → [0,100]
    expect(collapsed!.activeSegments).toEqual([{ start: 0, end: 100 }]);
  });

  it('collapsing only the inner span leaves the outer span visible and unrolled', () => {
    const root = span('root', 0, 100, undefined, [{ start: 0, end: 10 }]);
    const mid = span('mid', 10, 80, 'root', [{ start: 10, end: 40 }]);
    const leaf = span('leaf', 40, 80, 'mid', [{ start: 40, end: 80 }]);
    const result = collapseLanes([root, mid, leaf], new Set(['mid']));
    // root is not collapsed → unchanged; mid is collapsed → leaf hidden, mid gets rollup
    expect(ids(result)).toEqual(['root', 'mid']);
    const midRow = result[1]!;
    // mid rollup: [10,40] ∪ [40,80] → [10,80]
    expect(midRow.activeSegments).toEqual([{ start: 10, end: 80 }]);
  });
});

// ---------------------------------------------------------------------------
// collapseLanes — childless span
// ---------------------------------------------------------------------------

describe('collapseLanes — collapsing a childless span', () => {
  it('is a no-op: span appears unchanged in output', () => {
    const leaf = span('leaf', 0, 100);
    const result = collapseLanes([leaf], new Set(['leaf']));
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(leaf); // same reference — no clone needed for childless spans
  });
});

// ---------------------------------------------------------------------------
// collapseLanes — immutability
// ---------------------------------------------------------------------------

describe('collapseLanes — immutability', () => {
  it('does not mutate the input array', () => {
    const root = span('root', 0, 100);
    const child = span('child', 10, 50, 'root');
    const input = [root, child];
    const copy = [...input];
    collapseLanes(input, new Set(['root']));
    expect(input).toEqual(copy);
  });

  it('does not mutate the input spans', () => {
    const root = span('root', 0, 100, undefined, [{ start: 0, end: 100 }]);
    const child = span('child', 10, 50, 'root', [{ start: 10, end: 50 }]);
    const originalSegments = [...root.activeSegments];
    collapseLanes([root, child], new Set(['root']));
    expect(root.activeSegments).toEqual(originalSegments);
  });
});

// ---------------------------------------------------------------------------
// rollupCriticalIntervals
// ---------------------------------------------------------------------------

describe('rollupCriticalIntervals', () => {
  const root = span('root', 0, 100);
  const child = span('child', 20, 80, 'root');
  const grandchild = span('grandchild', 30, 60, 'child');
  const spans = [root, child, grandchild];

  it('returns input unchanged when no spans are collapsed (fast path)', () => {
    const intervals = [{ spanId: 'root', start: 10, end: 50 }];
    const result = rollupCriticalIntervals(spans, new Set(), intervals);
    expect(result).toBe(intervals); // same reference — no allocation
  });

  it('returns input unchanged when criticalIntervals is empty', () => {
    const empty: Array<{ spanId: string; start: number; end: number }> = [];
    const result = rollupCriticalIntervals(spans, new Set(['root']), empty);
    expect(result).toBe(empty);
  });

  it('re-keys a hidden descendant interval to the collapsed ancestor', () => {
    // Collapse root — child and grandchild are hidden.
    const result = rollupCriticalIntervals(spans, new Set(['root']), [{ spanId: 'child', start: 20, end: 60 }]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ spanId: 'root', start: 20, end: 60 });
  });

  it('clamps the rolled-up interval to the ancestor extent', () => {
    // Interval on grandchild goes 0–90 but ancestor root is [0,100]; clamp to [0,100] stays [0,90].
    // The grandchild itself is [30,60]; ancestor clamp is [0,100].
    const result = rollupCriticalIntervals(spans, new Set(['root']), [{ spanId: 'grandchild', start: 0, end: 90 }]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ spanId: 'root', start: 0, end: 90 });
  });

  it('drops a rolled-up interval that is fully outside the ancestor extent', () => {
    // Interval [200, 300] is outside ancestor root [0, 100].
    const result = rollupCriticalIntervals(spans, new Set(['root']), [{ spanId: 'child', start: 200, end: 300 }]);
    expect(result).toHaveLength(0);
  });

  it('merges overlapping rolled-up intervals from sibling descendants', () => {
    const mid1 = span('mid1', 10, 60, 'root');
    const mid2 = span('mid2', 40, 90, 'root');
    const twoChildren = [root, mid1, mid2];
    const result = rollupCriticalIntervals(twoChildren, new Set(['root']), [
      { spanId: 'mid1', start: 10, end: 60 },
      { spanId: 'mid2', start: 40, end: 90 },
    ]);
    // Overlapping [10,60] and [40,90] → merged to [10,90].
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ spanId: 'root', start: 10, end: 90 });
  });

  it('outermost visible collapsed ancestor owns under nested collapse', () => {
    // Both root and child are in collapsedSpanIds; grandchild is hidden by root (outermost wins).
    const result = rollupCriticalIntervals(spans, new Set(['root', 'child']), [
      { spanId: 'grandchild', start: 30, end: 60 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ spanId: 'root', start: 30, end: 60 });
  });

  it('passes through intervals for visible spans unchanged', () => {
    // Only child is collapsed; root interval stays on root (root is visible).
    const result = rollupCriticalIntervals(spans, new Set(['child']), [
      { spanId: 'root', start: 5, end: 20 },
      { spanId: 'grandchild', start: 30, end: 60 },
    ]);
    expect(result).toHaveLength(2);
    // Root interval unchanged.
    expect(result).toContainEqual({ spanId: 'root', start: 5, end: 20 });
    // Grandchild interval re-keyed to child (grandchild's collapsed ancestor).
    expect(result).toContainEqual({ spanId: 'child', start: 30, end: 60 });
  });
});

// ---------------------------------------------------------------------------
// buildDisclosureMap
// ---------------------------------------------------------------------------

describe('buildDisclosureMap', () => {
  // root(0-100) → child(10-90) → leaf(20-80): two collapsible parents, one leaf.
  const root = span('root', 0, 100);
  const child = span('child', 10, 90, 'root');
  const leaf = span('leaf', 20, 80, 'child');

  it('maps every visible parent lane to its state, depth, and pre-collapse descendant count', () => {
    const { lanes, depthBySpan } = orderLanes([root, child, leaf], 'tree');
    const parentIds = collapsibleParentIds(lanes);
    const collapsed = new Set<string>();
    const visible = collapseLanes(lanes, collapsed);

    const map = buildDisclosureMap(lanes, visible, collapsed, depthBySpan, parentIds);

    // root (lane 0) and child (lane 1) are parents; leaf (lane 2) is not in the map.
    expect(map.get(0)).toEqual({ state: 'expanded', depth: 0, descendantCount: 2, childCount: 1 });
    expect(map.get(1)).toEqual({ state: 'expanded', depth: 1, descendantCount: 1, childCount: 1 });
    expect(map.has(2)).toBe(false);
  });

  it('reports collapsed state and still counts descendants from the pre-collapse tree', () => {
    const { lanes, depthBySpan } = orderLanes([root, child, leaf], 'tree');
    const parentIds = collapsibleParentIds(lanes);
    const collapsed = new Set(['child']);
    // Post-collapse visible lanes: [root, child] (leaf hidden under the collapsed child).
    const visible = collapseLanes(lanes, collapsed);

    const map = buildDisclosureMap(lanes, visible, collapsed, depthBySpan, parentIds);

    expect(map.get(0)).toEqual({ state: 'expanded', depth: 0, descendantCount: 2, childCount: 1 });
    // descendantCount is counted from the pre-collapse tree (leaf), even though it is now hidden.
    // Exercises the id-bridge for collapseLanes's spread-cloned collapsed parent.
    expect(map.get(1)).toEqual({ state: 'collapsed', depth: 1, descendantCount: 1, childCount: 1 });
  });

  it('returns an empty map when there are no collapsible parents', () => {
    const flat = [span('a', 0, 10), span('b', 20, 30)];
    const { lanes, depthBySpan } = orderLanes(flat, 'tree');
    const parentIds = collapsibleParentIds(lanes);

    const map = buildDisclosureMap(lanes, lanes, new Set(), depthBySpan, parentIds);

    expect(map.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// buildDisclosureMap — display-child count (Spec 32)
// ---------------------------------------------------------------------------

describe('buildDisclosureMap — display-child count', () => {
  it('child count uses display parentage', () => {
    // root has two display children: one recorded child and one orphan reparented to root.
    // The recorded child count would be 1; the display child count must be 2.
    const root: NormalizedSpan = {
      id: 'root',
      name: 'root',
      start: 0,
      end: 100,
      activeSegments: [],
      meta: { id: 'root', name: 'root', start: 0, end: 100 },
    };
    const recorded: NormalizedSpan = {
      id: 'c',
      name: 'c',
      parentId: 'root',
      start: 10,
      end: 90,
      activeSegments: [],
      meta: { id: 'c', name: 'c', start: 10, end: 90 },
    };
    // Orphan: no parentId, but reparentedToSpanId points to root (display parent).
    const orphan: NormalizedSpan = {
      id: 'orphan',
      name: 'orphan',
      reparentedToSpanId: 'root',
      start: 20,
      end: 80,
      activeSegments: [],
      meta: { id: 'orphan', name: 'orphan', start: 20, end: 80 },
    };
    const pipelineSpans = [root, recorded, orphan];
    const { lanes, depthBySpan } = orderLanes(pipelineSpans, 'tree');
    const parentIds = collapsibleParentIds(lanes);
    const map = buildDisclosureMap(pipelineSpans, lanes, new Set(), depthBySpan, parentIds);

    // root is at lane 0 and has 2 display children (recorded + orphan).
    expect(map.get(0)?.childCount).toBe(2);
    // The recorded child and orphan are leaves — they have no childCount entry.
    expect(map.has(1)).toBe(false);
    expect(map.has(2)).toBe(false);
  });

  it('child count is unchanged by collapse state', () => {
    // r → c1, c2 (r has 2 direct display children)
    // Collapse r → c1 and c2 disappear from visibleSpans, but r's childCount must stay 2.
    const r = span('r', 0, 100);
    const c1 = span('c1', 10, 50, 'r');
    const c2 = span('c2', 60, 90, 'r');
    const pipelineSpans = [r, c1, c2];
    const { lanes, depthBySpan } = orderLanes(pipelineSpans, 'tree');
    const parentIds = collapsibleParentIds(lanes);

    const expandedVisible = collapseLanes(lanes, new Set());
    const expandedMap = buildDisclosureMap(pipelineSpans, expandedVisible, new Set(), depthBySpan, parentIds);

    const collapsed = new Set(['r']);
    const collapsedVisible = collapseLanes(lanes, collapsed);
    const collapsedMap = buildDisclosureMap(pipelineSpans, collapsedVisible, collapsed, depthBySpan, parentIds);

    expect(expandedMap.get(0)?.childCount).toBe(2);
    expect(collapsedMap.get(0)?.childCount).toBe(2);
  });

  it('child count ignores hidden lanes', () => {
    // parent → child, child → ca, child → cb
    // Collapsing 'child' hides ca and cb. parent's childCount = 1 (just child).
    // child's childCount = 2 (ca and cb), counted from pipelineSpans even though they are hidden.
    const parent = span('parent', 0, 100);
    const child = span('child', 10, 90, 'parent');
    const ca = span('ca', 20, 50, 'child');
    const cb = span('cb', 60, 80, 'child');
    const pipelineSpans = [parent, child, ca, cb];
    const { lanes, depthBySpan } = orderLanes(pipelineSpans, 'tree');
    const parentIds = collapsibleParentIds(lanes);

    // Collapse child — ca and cb vanish from visibleSpans.
    const collapsed = new Set(['child']);
    const visible = collapseLanes(lanes, collapsed);
    const map = buildDisclosureMap(pipelineSpans, visible, collapsed, depthBySpan, parentIds);

    // parent's direct display children: just child → childCount = 1
    expect(map.get(0)?.childCount).toBe(1);
    // child's direct display children: ca and cb → childCount = 2
    // (child is at lane 1 in the visible list since its parent is lane 0)
    expect(map.get(1)?.childCount).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// buildTreeGuideMap (Spec 33 / ADR 0039)
// ---------------------------------------------------------------------------

describe('buildTreeGuideMap', () => {
  it('isLastChild true only on the last sibling of each scope', () => {
    // root → a → a1, a2; root → b
    // Visible order (DFS): root, a, a1, a2, b
    const root = span('root', 0, 100);
    const a = span('a', 5, 90, 'root');
    const a1 = span('a1', 10, 40, 'a');
    const a2 = span('a2', 50, 80, 'a');
    const b = span('b', 91, 99, 'root');
    const pipelineSpans = [root, a, a1, a2, b];
    const { lanes, depthBySpan } = orderLanes(pipelineSpans, 'tree');
    const map = buildTreeGuideMap(pipelineSpans, lanes, depthBySpan);

    // a1 is not last child of a (a2 follows)
    const a1Entry = map.get(2);
    expect(a1Entry?.isLastChild).toBe(false);
    // a2 is last child of a
    const a2Entry = map.get(3);
    expect(a2Entry?.isLastChild).toBe(true);
    // b is last child of root
    const bEntry = map.get(4);
    expect(bEntry?.isLastChild).toBe(true);
    // a is not last child of root (b follows)
    const aEntry = map.get(1);
    expect(aEntry?.isLastChild).toBe(false);
  });

  it('parentLane points at the display parent visible-lane index', () => {
    const root = span('root', 0, 100);
    const child = span('child', 10, 90, 'root');
    const pipelineSpans = [root, child];
    const { lanes, depthBySpan } = orderLanes(pipelineSpans, 'tree');
    const map = buildTreeGuideMap(pipelineSpans, lanes, depthBySpan);

    // child is at lane 1; its parentLane must point to root at lane 0.
    expect(map.get(1)?.parentLane).toBe(0);
  });

  it('depth-0 lanes have no entry', () => {
    const root = span('root', 0, 100);
    const child = span('child', 10, 90, 'root');
    const pipelineSpans = [root, child];
    const { lanes, depthBySpan } = orderLanes(pipelineSpans, 'tree');
    const map = buildTreeGuideMap(pipelineSpans, lanes, depthBySpan);

    // root is at lane 0 with depth 0 — no entry.
    expect(map.has(0)).toBe(false);
    // child is at lane 1 with depth 1 — has an entry.
    expect(map.has(1)).toBe(true);
  });

  it('collapse-hidden children have no entry', () => {
    const root = span('root', 0, 100);
    const child = span('child', 10, 90, 'root');
    const grandchild = span('gc', 20, 80, 'child');
    const pipelineSpans = [root, child, grandchild];
    const { lanes, depthBySpan } = orderLanes(pipelineSpans, 'tree');
    const collapsed = new Set(['child']);
    const visible = collapseLanes(lanes, collapsed);
    const map = buildTreeGuideMap(pipelineSpans, visible, depthBySpan);

    // Only root and child are visible; grandchild is hidden.
    // root (depth 0) has no entry; child has an entry; grandchild has no entry.
    expect(map.size).toBe(1);
    expect(map.has(1)).toBe(true);
    expect(map.get(1)?.isLastChild).toBe(true);
  });

  it('forest roots have no entry and second group never references first', () => {
    // Two independent roots (forest): root1, root2.
    // root1 → c1; root2 → c2
    const root1 = span('root1', 0, 50);
    const c1 = span('c1', 5, 45, 'root1');
    const root2 = span('root2', 51, 100);
    const c2 = span('c2', 55, 95, 'root2');
    const pipelineSpans = [root1, c1, root2, c2];
    const { lanes, depthBySpan } = orderLanes(pipelineSpans, 'tree');
    const map = buildTreeGuideMap(pipelineSpans, lanes, depthBySpan);

    // root1 (lane 0) and root2 (lane 2) are depth-0 — no entry.
    expect(map.has(0)).toBe(false);
    expect(map.has(2)).toBe(false);
    // c1 (lane 1) and c2 (lane 3) each have entries.
    expect(map.has(1)).toBe(true);
    expect(map.has(3)).toBe(true);
    // c2's parentLane must reference root2 (lane 2), not root1 (lane 0).
    expect(map.get(3)?.parentLane).toBe(2);
  });
});
