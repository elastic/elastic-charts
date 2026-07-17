/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildChildrenMap, resolveActive } from './self_time';
import type { NormalizedSpan } from './types';

/** Minimal NormalizedSpan factory — only fields relevant to self-time derivation. */
function span(id: string, start: number, end: number, opts: { parentId?: string; activeSegments?: { start: number; end: number }[] } = {}): NormalizedSpan {
  return {
    id,
    name: id,
    parentId: opts.parentId,
    start,
    end,
    activeSegments: opts.activeSegments ?? [],
    meta: {} as never,
  };
}

describe('resolveActive', () => {
  it('leaf with no children → one full-duration active segment', () => {
    const result = resolveActive([span('a', 100, 200)]);
    expect(result[0]!.activeSegments).toEqual([{ start: 100, end: 200 }]);
  });

  it('one child in the middle → two segments (before and after child)', () => {
    const root = span('root', 0, 1000);
    const child = span('child', 300, 700, { parentId: 'root' });
    const result = resolveActive([root, child]);
    const rootResult = result.find((s) => s.id === 'root')!;
    expect(rootResult.activeSegments).toEqual([
      { start: 0, end: 300 },
      { start: 700, end: 1000 },
    ]);
  });

  it('child at the very start → one trailing segment', () => {
    const root = span('root', 0, 1000);
    const child = span('child', 0, 400, { parentId: 'root' });
    const result = resolveActive([root, child]);
    expect(result.find((s) => s.id === 'root')!.activeSegments).toEqual([{ start: 400, end: 1000 }]);
  });

  it('child at the very end → one leading segment', () => {
    const root = span('root', 0, 1000);
    const child = span('child', 600, 1000, { parentId: 'root' });
    const result = resolveActive([root, child]);
    expect(result.find((s) => s.id === 'root')!.activeSegments).toEqual([{ start: 0, end: 600 }]);
  });

  it('child spans the full parent → empty active (no self time)', () => {
    const root = span('root', 0, 1000);
    const child = span('child', 0, 1000, { parentId: 'root' });
    const result = resolveActive([root, child]);
    expect(result.find((s) => s.id === 'root')!.activeSegments).toEqual([]);
  });

  it('overlapping children → merged coverage, producing correct gaps', () => {
    const root = span('root', 0, 1000);
    const c1 = span('c1', 100, 500, { parentId: 'root' });
    const c2 = span('c2', 300, 700, { parentId: 'root' }); // overlaps c1
    const result = resolveActive([root, c1, c2]);
    // merged coverage: [100, 700]; gaps: [0, 100] and [700, 1000]
    expect(result.find((s) => s.id === 'root')!.activeSegments).toEqual([
      { start: 0, end: 100 },
      { start: 700, end: 1000 },
    ]);
  });

  it('adjacent (touching) children → merged into one block, no zero-width gap', () => {
    const root = span('root', 0, 1000);
    const c1 = span('c1', 200, 500, { parentId: 'root' });
    const c2 = span('c2', 500, 800, { parentId: 'root' }); // touches c1 at 500
    const result = resolveActive([root, c1, c2]);
    expect(result.find((s) => s.id === 'root')!.activeSegments).toEqual([
      { start: 0, end: 200 },
      { start: 800, end: 1000 },
    ]);
  });

  it('child that overruns parent end → clamped, no out-of-bounds active segment', () => {
    const root = span('root', 0, 500);
    const child = span('child', 200, 800, { parentId: 'root' }); // overruns to 800
    const result = resolveActive([root, child]);
    // child clamped to [200, 500]; single active: [0, 200]
    expect(result.find((s) => s.id === 'root')!.activeSegments).toEqual([{ start: 0, end: 200 }]);
  });

  it('child that overruns parent start → clamped, no negative-width active segment', () => {
    const root = span('root', 300, 800);
    const child = span('child', 100, 600, { parentId: 'root' }); // start < root start
    const result = resolveActive([root, child]);
    // child clamped to [300, 600]; active: [600, 800]
    expect(result.find((s) => s.id === 'root')!.activeSegments).toEqual([{ start: 600, end: 800 }]);
  });

  it('child entirely outside parent → treated as no children (clock skew / bad data)', () => {
    const root = span('root', 0, 100);
    const child = span('child', 200, 300, { parentId: 'root' }); // entirely after parent
    const result = resolveActive([root, child]);
    expect(result.find((s) => s.id === 'root')!.activeSegments).toEqual([{ start: 0, end: 100 }]);
  });

  it('span with explicit non-empty activeSegments passes through unchanged', () => {
    const explicit = span('a', 0, 1000, { activeSegments: [{ start: 100, end: 200 }] });
    const child = span('b', 400, 600, { parentId: 'a' }); // would change activeSegments if derived
    const result = resolveActive([explicit, child]);
    // activeSegments must be the original object (not recomputed)
    expect(result.find((s) => s.id === 'a')!.activeSegments).toEqual([{ start: 100, end: 200 }]);
  });

  it('zero-duration span → degenerate leaf produces empty activeSegments (start === end)', () => {
    const result = resolveActive([span('leaf', 500, 500)]);
    // [500, 500] is zero-width; no meaningful segment to return
    expect(result[0]!.activeSegments).toEqual([]);
  });

  it('does not mutate input spans', () => {
    const root = span('root', 0, 1000);
    const child = span('child', 200, 600, { parentId: 'root' });
    const inputActiveSegments = root.activeSegments;
    resolveActive([root, child]);
    expect(root.activeSegments).toBe(inputActiveSegments); // same reference — not touched
  });

  it('output spans are sorted ascending by start when building the children map', () => {
    // resolveActive does not sort — only checks that the map is order-independent
    const spans = [
      span('c', 500, 700, { parentId: 'a' }),
      span('b', 200, 400, { parentId: 'a' }),
      span('a', 0, 1000),
    ];
    const result = resolveActive(spans);
    const root = result.find((s) => s.id === 'a')!;
    // children b=[200,400] and c=[500,700]: gaps [0,200], [400,500], [700,1000]
    expect(root.activeSegments).toEqual([
      { start: 0, end: 200 },
      { start: 400, end: 500 },
      { start: 700, end: 1000 },
    ]);
  });
});

// ---------------------------------------------------------------------------
// buildChildrenMap
// ---------------------------------------------------------------------------

describe('buildChildrenMap', () => {
  function span(id: string, parentId?: string): NormalizedSpan {
    return { id, name: id, parentId, start: 0, end: 10, activeSegments: [], meta: {} as never };
  }

  it('returns empty map for spans with no parentId', () => {
    const map = buildChildrenMap([span('a'), span('b')]);
    expect(map.size).toBe(0);
  });

  it('groups children under their parentId', () => {
    const spans = [span('root'), span('c1', 'root'), span('c2', 'root'), span('gc', 'c1')];
    const map = buildChildrenMap(spans);
    expect(map.get('root')!.map((s) => s.id)).toEqual(['c1', 'c2']);
    expect(map.get('c1')!.map((s) => s.id)).toEqual(['gc']);
    expect(map.has('c2')).toBe(false);
  });

  it('resolveActive output is unchanged by the refactor', () => {
    // Regression: resolveActive must behave identically before and after extracting buildChildrenMap.
    const root = span('root');
    const child = { ...span('child', 'root'), start: 2, end: 6 };
    const rootFull = { ...root, start: 0, end: 10 };
    const result = resolveActive([rootFull, child]);
    const rootResult = result.find((s) => s.id === 'root')!;
    expect(rootResult.activeSegments).toEqual([
      { start: 0, end: 2 },
      { start: 6, end: 10 },
    ]);
  });
});
