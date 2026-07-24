/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { orderLanes } from './order_lanes';
import type { NormalizedSpan } from './types';

/** Minimal NormalizedSpan factory for lane-ordering tests. */
function span(id: string, start: number, end: number, parentId?: string): NormalizedSpan {
  return {
    id,
    name: id,
    parentId,
    start,
    end,
    activeSegments: [],
    meta: {} as never,
  };
}

// ---------------------------------------------------------------------------
// chronological mode
// ---------------------------------------------------------------------------

describe('orderLanes — chronological', () => {
  it('produces ascending start order', () => {
    const spans = [span('c', 300, 400), span('a', 100, 200), span('b', 200, 300)];
    const { lanes } = orderLanes(spans, 'chronological');
    expect(lanes.map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the input array', () => {
    const spans = [span('b', 20, 30), span('a', 10, 20)];
    const copy = [...spans];
    orderLanes(spans, 'chronological');
    expect(spans).toEqual(copy);
  });

  it('single span → unchanged', () => {
    const spans = [span('a', 0, 100)];
    expect(orderLanes(spans, 'chronological').lanes.map((s) => s.id)).toEqual(['a']);
  });

  it('empty input → empty output', () => {
    expect(orderLanes([], 'chronological').lanes).toEqual([]);
  });

  it('depthBySpan is empty in chronological mode', () => {
    const spans = [span('a', 0, 100), span('b', 10, 50, 'a')];
    const { depthBySpan } = orderLanes(spans, 'chronological');
    expect(depthBySpan.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// tree mode — basic ordering
// ---------------------------------------------------------------------------

describe('orderLanes — tree (basic)', () => {
  it('single root with no children → single span', () => {
    const spans = [span('root', 0, 100)];
    expect(orderLanes(spans, 'tree').lanes.map((s) => s.id)).toEqual(['root']);
  });

  it('parent immediately followed by its child', () => {
    // root starts at 0; child starts at 50 — without tree order, start-sort would still put them
    // in the same relative order, but this test checks the tree rule explicitly.
    const spans = [span('child', 50, 100, 'root'), span('root', 0, 100)];
    expect(orderLanes(spans, 'tree').lanes.map((s) => s.id)).toEqual(['root', 'child']);
  });

  it('parent followed by all descendants (deep chain)', () => {
    const spans = [
      span('grandchild', 20, 30, 'child'),
      span('child', 10, 40, 'root'),
      span('root', 0, 50),
    ];
    expect(orderLanes(spans, 'tree').lanes.map((s) => s.id)).toEqual(['root', 'child', 'grandchild']);
  });

  it('does not mutate the input array', () => {
    const spans = [span('b', 20, 30, 'root'), span('root', 0, 100), span('a', 10, 20, 'root')];
    const copy = [...spans];
    orderLanes(spans, 'tree');
    expect(spans).toEqual(copy);
  });
});

// ---------------------------------------------------------------------------
// tree mode — sibling ordering
// ---------------------------------------------------------------------------

describe('orderLanes — tree (sibling sort)', () => {
  it('siblings ordered by start, not by input order', () => {
    // input: c(30), b(20), a(10) — all children of root
    const spans = [
      span('root', 0, 100),
      span('c', 30, 40, 'root'),
      span('b', 20, 30, 'root'),
      span('a', 10, 20, 'root'),
    ];
    expect(orderLanes(spans, 'tree').lanes.map((s) => s.id)).toEqual(['root', 'a', 'b', 'c']);
  });

  it('equal-start siblings preserve original data order (stable)', () => {
    // Both children start at the same time — data order is first-b, then-a.
    const spans = [
      span('root', 0, 100),
      span('b', 10, 20, 'root'), // appears first in data
      span('a', 10, 20, 'root'), // appears second in data
    ];
    expect(orderLanes(spans, 'tree').lanes.map((s) => s.id)).toEqual(['root', 'b', 'a']);
  });
});

// ---------------------------------------------------------------------------
// tree mode — multi-root (forest)
// ---------------------------------------------------------------------------

describe('orderLanes — tree (forest / multi-root)', () => {
  it('two independent roots → subtrees in root-start order', () => {
    const spans = [
      span('r2', 10, 50),
      span('r1', 0, 60),
      span('r1c', 5, 20, 'r1'),
      span('r2c', 15, 30, 'r2'),
    ];
    // r1 (start=0) before r2 (start=10); each subtree follows its root
    expect(orderLanes(spans, 'tree').lanes.map((s) => s.id)).toEqual(['r1', 'r1c', 'r2', 'r2c']);
  });

  it('orphan spans (unknown parentId) treated as roots', () => {
    const spans = [
      span('orphan', 5, 10, 'nonexistent'),
      span('root', 0, 20),
    ];
    // root (start=0) before orphan (start=5)
    expect(orderLanes(spans, 'tree').lanes.map((s) => s.id)).toEqual(['root', 'orphan']);
  });

  it('span without parentId is a root', () => {
    const spans = [span('b', 10, 20), span('a', 0, 10)];
    expect(orderLanes(spans, 'tree').lanes.map((s) => s.id)).toEqual(['a', 'b']);
  });
});

// ---------------------------------------------------------------------------
// tree mode — malformed / cycle safety
// ---------------------------------------------------------------------------

describe('orderLanes — tree (cycle safety)', () => {
  it('cycle terminates and drops nothing', () => {
    // a → b → a (cycle); root is separate
    const spans = [
      span('root', 0, 100),
      span('a', 5, 50, 'b'), // a's parent is b (backward)
      span('b', 10, 40, 'a'), // b's parent is a (backward)
    ];
    // 'root' is the only true root; 'a' and 'b' reference each other so one is an orphan root
    const { lanes } = orderLanes(spans, 'tree');
    // all three must be present
    expect(new Set(lanes.map((s) => s.id))).toEqual(new Set(['root', 'a', 'b']));
    expect(lanes).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// tree vs chronological equivalence on a flat (no-nesting) dataset
// ---------------------------------------------------------------------------

describe('orderLanes — tree == chronological for flat data', () => {
  it('flat spans (no parentId) produce start-ascending order in both modes', () => {
    const spans = [span('c', 30, 40), span('a', 10, 20), span('b', 20, 30)];
    const { lanes: treeLanes } = orderLanes(spans, 'tree');
    const { lanes: chronLanes } = orderLanes(spans, 'chronological');
    const tree = treeLanes.map((s) => s.id);
    const chron = chronLanes.map((s) => s.id);
    expect(tree).toEqual(chron);
    expect(tree).toEqual(['a', 'b', 'c']);
  });
});

// ---------------------------------------------------------------------------
// Regression: Kibana APM dataset tree order matches the reference screenshot
// ---------------------------------------------------------------------------

describe('orderLanes — Kibana APM regression', () => {
  /**
   * Tree derived from FRONTEND_WEB_OTLP_ENVELOPE (data.ts).
   * SpanIds shortened to the last 4 hex digits for readability.
   *
   *  0949 GET /products                  (frontend-web,            start=0ms)
   *    0947 GET /recommendations         (frontend-web,            start=0ms)
   *      0945 GET /recommendations       (product-recommendation,  start=0ms)
   *        0941 GET /products            (product-recommendation,  start=0ms)
   *          0935 GET /products          (inventory-service,       start=0ms)
   *            0931 GET /products/_search (inventory-service,      start=+5ms)
   *            0933 SELECT * FROM products (inventory-service,     start=+30ms)
   *        0943 GET /preferences         (product-recommendation,  start=0ms)
   *          0939 GET /preferences       (user-preference-service, start=0ms)
   *            0937 GET user:123         (user-preference-service, start=+5ms)
   */
  const BASE = 1784212100146; // ms epoch — arbitrary; re-zeroing is done by normalize(), here we just need relative order

  const kibanaNormalizedSpans: NormalizedSpan[] = [
    // frontend-web
    span('0949', BASE,      BASE + 200),
    span('0947', BASE,      BASE + 200, '0949'),
    // product-recommendation
    span('0945', BASE,      BASE + 150, '0947'),
    span('0941', BASE,      BASE + 150, '0945'),
    span('0943', BASE,      BASE + 75,  '0945'),
    // inventory-service
    span('0935', BASE,      BASE + 100, '0941'),
    span('0931', BASE + 5,  BASE + 25,  '0935'),
    span('0933', BASE + 30, BASE + 110, '0935'),
    // user-preference-service
    span('0939', BASE,      BASE + 25,  '0943'),
    span('0937', BASE + 5,  BASE + 20,  '0939'),
  ];

  it('tree order matches Kibana reference (DFS, siblings by start)', () => {
    const { lanes } = orderLanes(kibanaNormalizedSpans, 'tree');
    expect(lanes.map((s) => s.id)).toEqual([
      '0949', // root
      '0947', // child of 0949
      '0945', // child of 0947
      '0941', // child of 0945, start=0ms (before 0943)
      '0935', // child of 0941
      '0931', // child of 0935, start=+5ms
      '0933', // child of 0935, start=+30ms
      '0943', // child of 0945, start=0ms (after 0941 — same start, 0941 appears first in data)
      '0939', // child of 0943
      '0937', // child of 0939
    ]);
  });

  it('chronological order is different (interleaved by start)', () => {
    // All 0ms spans cluster at the top; only _search, SELECT, and user:123 stand apart
    const { lanes } = orderLanes(kibanaNormalizedSpans, 'chronological');
    // All BASE-start spans come first (7 of them, in data order for stable); then +5ms and +30ms
    const firstSeven = lanes.slice(0, 7);
    expect(firstSeven.map((s) => s.id)).not.toContain('0931'); // +5ms
    expect(firstSeven.map((s) => s.id)).not.toContain('0933'); // +30ms
    expect(firstSeven.map((s) => s.id)).not.toContain('0937'); // +5ms
  });
});

// ---------------------------------------------------------------------------
// Duplicate span id (robustness — untrusted OTel input)
// ---------------------------------------------------------------------------

describe('orderLanes — duplicate span id', () => {
  it('tree: both span objects are emitted when two spans share the same id', () => {
    // Two distinct NormalizedSpan objects with identical ids (can arrive from untrusted OTel data).
    const s1 = span('dup', 0, 100);
    const s2 = span('dup', 200, 300);
    const { lanes } = orderLanes([s1, s2], 'tree');
    expect(lanes).toHaveLength(2);
    expect(lanes).toContain(s1);
    expect(lanes).toContain(s2);
  });

  it('chronological: both span objects are emitted when two spans share the same id', () => {
    const s1 = span('dup', 0, 100);
    const s2 = span('dup', 200, 300);
    const { lanes } = orderLanes([s1, s2], 'chronological');
    expect(lanes).toHaveLength(2);
    expect(lanes).toContain(s1);
    expect(lanes).toContain(s2);
  });

  it('tree: duplicate-id spans are appended after the valid tree (safety path)', () => {
    // s1 is a valid root; s2 shares s1's id but is a different object.
    // Both must appear in output; lane count must match input count.
    const root = span('root', 0, 200);
    const child = span('child', 10, 50, 'root');
    const dup = span('root', 300, 400); // same id as root, different object
    const { lanes } = orderLanes([root, child, dup], 'tree');
    expect(lanes).toHaveLength(3);
    expect(lanes).toContain(root);
    expect(lanes).toContain(child);
    expect(lanes).toContain(dup);
  });
});

// ---------------------------------------------------------------------------
// depth — tree DFS emits correct depth per span
// ---------------------------------------------------------------------------

describe('orderLanes — tree depth', () => {
  it('single root has depth 0', () => {
    const root = span('root', 0, 100);
    const { depthBySpan } = orderLanes([root], 'tree');
    expect(depthBySpan.get(root)).toBe(0);
  });

  it('root=0, child=1, grandchild=2', () => {
    const root = span('root', 0, 100);
    const child = span('child', 10, 90, 'root');
    const grandchild = span('grandchild', 20, 80, 'child');
    const { depthBySpan } = orderLanes([root, child, grandchild], 'tree');
    expect(depthBySpan.get(root)).toBe(0);
    expect(depthBySpan.get(child)).toBe(1);
    expect(depthBySpan.get(grandchild)).toBe(2);
  });

  it('siblings share the same depth', () => {
    const root = span('root', 0, 100);
    const a = span('a', 10, 40, 'root');
    const b = span('b', 50, 80, 'root');
    const { depthBySpan } = orderLanes([root, a, b], 'tree');
    expect(depthBySpan.get(a)).toBe(1);
    expect(depthBySpan.get(b)).toBe(1);
  });

  it('forest: each root has depth 0', () => {
    const r1 = span('r1', 0, 50);
    const r2 = span('r2', 60, 100);
    const c = span('c', 5, 20, 'r1');
    const { depthBySpan } = orderLanes([r1, r2, c], 'tree');
    expect(depthBySpan.get(r1)).toBe(0);
    expect(depthBySpan.get(r2)).toBe(0);
    expect(depthBySpan.get(c)).toBe(1);
  });

  it('orphan spans (unknown parentId) get depth 0', () => {
    const orphan = span('orphan', 0, 50, 'nonexistent');
    const { depthBySpan } = orderLanes([orphan], 'tree');
    expect(depthBySpan.get(orphan)).toBe(0);
  });

  it('chronological mode: depthBySpan is empty (all depths treated as 0)', () => {
    const root = span('root', 0, 100);
    const child = span('child', 10, 50, 'root');
    const { depthBySpan } = orderLanes([root, child], 'chronological');
    expect(depthBySpan.size).toBe(0);
  });
});
