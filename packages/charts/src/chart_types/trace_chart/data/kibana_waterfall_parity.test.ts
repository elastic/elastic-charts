/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Kibana APM `TraceWaterfall` reparenting parity (Spec 26 / ADR 0028).
 *
 * These cases are ported from Kibana's
 * `src/platform/packages/shared/kbn-apm-ui-shared/src/components/trace_waterfall/use_trace_watefall.test.ts`
 * (`getTraceWaterfall`, `getTraceParentChildrenMap`, `getRootItemOrFallback`) and re-expressed
 * against elastic-charts' recovery pipeline so the two implementations stay behaviorally aligned.
 *
 * Mapping between the two models:
 * - Kibana `TraceItem { timestampUs, duration, serviceName, parentId }` → our `NormalizedSpan`/
 *   `TraceDatum { start, end, name, parentId }` (units are irrelevant to topology; we use the same
 *   numbers as microsecond offsets for readability).
 * - Kibana reparents in `getTraceWaterfall`; we do it in the pure `recoverPartialTraces` stage.
 * - Kibana orders/depths in the same preorder pass; we own final order/depth in `orderLanes` (tree),
 *   which runs after recovery. Order/depth parity is therefore asserted through `normalize` +
 *   `orderLanes`, topology/provenance through `recoverPartialTraces`.
 * - Kibana's `isOrphan: true` + rewritten `parentId` → our disclosure-only `orphaned: true` +
 *   `reparentedToSpanId` (recorded `parentId` is preserved, never rewritten).
 *
 * Intentional divergences (documented, not bugs):
 * - Kibana invalidates the whole waterfall on any duplicate id (single-trace). We invalidate the
 *   affected `traceId` group; for a single (unknown) group that is the whole result — same outcome.
 * - Kibana's focused-trace `entryTransactionId` root selection (and its `hasPathToTarget` orphan-
 *   ancestor cycle guard) is a Spec 26 non-goal; our root is always parentless-in-group, so
 *   reparenting can never form a cycle. The corresponding Kibana cases are adapted below.
 * - Kibana's `isFiltered` fallback elects the earliest-timestamp root; we always elect the first
 *   orphan in input order (documented Spec 26 decision) and disclose it as the fallback root.
 */

import { normalize, recoverPartialTraces } from './normalize';
import { orderLanes } from './order_lanes';
import type { NormalizedSpan } from './types';
import { Logger } from '../../../utils/logger';
import type { TraceDatum } from '../trace_api';

interface ItemOpts {
  parentId?: string;
  traceId?: string;
  start?: number;
  duration?: number;
  name?: string;
}

/** TraceItem-equivalent factory (Kibana `timestampUs`/`duration` → our `start`/`end`). */
function datum(id: string, opts: ItemOpts = {}): TraceDatum {
  const start = opts.start ?? 0;
  return {
    id,
    name: opts.name ?? id,
    parentId: opts.parentId,
    traceId: opts.traceId ?? 't1',
    start,
    end: start + (opts.duration ?? 100),
  };
}

function nspan(id: string, opts: ItemOpts = {}): NormalizedSpan {
  const d = datum(id, opts);
  return { ...d, activeSegments: [], meta: d };
}

const laneIds = (data: TraceDatum[]): string[] => {
  const { spans } = normalize(data, 'time');
  return orderLanes(spans, 'tree').lanes.map((s) => s.id);
};

const laneDepths = (data: TraceDatum[]): number[] => {
  const { spans } = normalize(data, 'time');
  const { lanes, depthBySpan } = orderLanes(spans, 'tree');
  return lanes.map((s) => depthBySpan.get(s) ?? 0);
};

// Shared fixtures mirroring the Kibana test's root/child1/child2/grandchild tree (ids 1..4).
const root = datum('1', { name: 'root', start: 0, duration: 1000 });
const child1 = datum('2', { name: 'child1', parentId: '1', start: 500, duration: 400 });
const child2 = datum('3', { name: 'child2', parentId: '1', start: 800, duration: 100 });
const grandchild = datum('4', { name: 'grandchild', parentId: '2', start: 1000, duration: 50 });

describe('Kibana waterfall parity — getTraceWaterfall (reparenting + preorder)', () => {
  it('returns a flattened waterfall with correct preorder and depth', () => {
    // Kibana: expect(result.map(i => i.id)).toEqual(['1','2','4','3']) with depths [0,1,2,1].
    const data = [root, child1, child2, grandchild];
    expect(laneIds(data)).toEqual(['1', '2', '4', '3']);
    expect(laneDepths(data)).toEqual([0, 1, 2, 1]);
  });

  it('returns only the root if there are no children', () => {
    expect(laneIds([root])).toEqual(['1']);
    expect(laneDepths([root])).toEqual([0]);
  });

  it('sorts children by start (timestamp)', () => {
    // Kibana feeds children in reverse; output is still ['1','2','4','3'].
    const data = [root, child2, child1, grandchild];
    expect(laneIds(data)).toEqual(['1', '2', '4', '3']);
  });

  it('reparents an orphan span under the elected root', () => {
    // Kibana: getTraceWaterfall({ rootItem: root, parentChildMap: {}, orphans: [grandchild] })
    // yields [root, grandchild] at depths [0, 1]. Here grandchild's recorded parent ('2') is absent.
    const recovered = recoverPartialTraces([nspan('1', { start: 0, duration: 1000 }), nspan('4', { parentId: '2' })]);
    expect(recovered.map((s) => s.id)).toEqual(['1', '4']);
    expect(recovered[1]).toMatchObject({ id: '4', orphaned: true, reparentedToSpanId: '1' });
    expect(recovered[1]!.parentId).toBe('2'); // recorded parent preserved (not rewritten)

    const data = [root, datum('4', { name: 'grandchild', parentId: '2', start: 1000, duration: 50 })];
    expect(laneIds(data)).toEqual(['1', '4']);
    expect(laneDepths(data)).toEqual([0, 1]);
  });

  it('keeps stable preorder output for deeper trees', () => {
    // Ported verbatim from Kibana's deep-tree case (12-deep chain + early/late siblings of the root).
    const deepStart = 0;
    const deepRoot = datum('root-deep', { name: 'root-deep', start: deepStart, duration: 5_000_000 });
    const deepChildren = Array.from({ length: 12 }, (_, index) => {
      const id = `deep-${index + 1}`;
      return datum(id, {
        parentId: index === 0 ? 'root-deep' : `deep-${index}`,
        start: deepStart + (index + 1) * 1000,
        duration: 1000 - index,
      });
    });
    const siblingEarly = datum('sibling-early', { parentId: 'root-deep', start: deepStart + 500, duration: 20 });
    const siblingLate = datum('sibling-late', { parentId: 'root-deep', start: deepStart + 2000, duration: 30 });
    const data = [deepRoot, ...deepChildren, siblingEarly, siblingLate];

    expect(laneIds(data)).toEqual([
      'root-deep',
      'sibling-early',
      'deep-1',
      'deep-2',
      'deep-3',
      'deep-4',
      'deep-5',
      'deep-6',
      'deep-7',
      'deep-8',
      'deep-9',
      'deep-10',
      'deep-11',
      'deep-12',
      'sibling-late',
    ]);
    expect(laneDepths(data)).toEqual([0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1]);
  });

  it('invalidates the trace when it encounters a duplicate span id (Kibana throws → we drop)', () => {
    // Kibana: a span id that is both a root and a child throws "Duplicate span id detected", which the
    // hook maps to TraceDataState.Invalid + empty waterfall. Our single-group equivalent invalidates
    // that group → no visible spans (blank plot), and logs one recovery warning.
    const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const spans = [
      nspan('b5', { start: 0, duration: 22750 }), // root (no parent)
      nspan('d8', { parentId: 'b5', start: 100, duration: 140000 }),
      nspan('9d', { parentId: 'd8', start: 200, duration: 54000 }),
      nspan('b5', { parentId: 'd8', start: 300, duration: 24000 }), // duplicate id, reachable
    ];
    expect(recoverPartialTraces(spans)).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe('Kibana waterfall parity — getTraceParentChildrenMap (root election)', () => {
  it('handles multiple roots by electing the last one', () => {
    // Kibana: getTraceParentChildrenMap keeps only the last root; the first root's subtree is omitted.
    const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const recovered = recoverPartialTraces([
      nspan('1', { name: 'root1', duration: 100 }),
      nspan('2', { name: 'root2', duration: 100 }),
    ]);
    expect(recovered.map((s) => s.id)).toEqual(['2']); // last root elected, first omitted
    warn.mockRestore();
  });

  it('elects the first orphan in input order as the fallback root (not the earliest start)', () => {
    // Divergence note: Kibana's isFiltered path elects the earliest-timestamp root; we always take
    // the first orphan in input order and disclose it as the fallback root (Spec 26 decision).
    const recovered = recoverPartialTraces([
      nspan('1', { parentId: '0', name: 'span1', start: 100, duration: 100 }),
      nspan('2', { parentId: '1', name: 'span2', start: 0, duration: 100 }), // earliest start
    ]);
    const fallback = recovered.find((s) => s.id === '1')!;
    expect(fallback).toMatchObject({ orphaned: true, fallbackRoot: true });
    expect(fallback.reparentedToSpanId).toBeUndefined();
    expect(recovered.find((s) => s.id === '2')!.orphaned).toBeUndefined(); // real child of the fallback
  });
});

describe('Kibana waterfall parity — getRootItemOrFallback (trace states)', () => {
  it('FULL: a complete trace is returned unchanged (no orphan provenance, same reference)', () => {
    const spans = [
      nspan('1', { duration: 1000 }),
      nspan('2', { parentId: '1' }),
      nspan('3', { parentId: '1' }),
      nspan('4', { parentId: '2' }),
    ];
    const recovered = recoverPartialTraces(spans);
    expect(recovered).toBe(spans); // byte-identical, no replacement allocations
    expect(recovered.some((s) => s.orphaned)).toBe(false);
  });

  it('EMPTY: an empty trace yields no spans', () => {
    expect(recoverPartialTraces([])).toEqual([]);
  });

  it('PARTIAL (no root span): the first orphan becomes the fallback root, its child nests under it', () => {
    // Kibana traceData = [child1, grandchild]; child1 (parent absent) is the fallback, grandchild is
    // its real child. → rootItem child1, orphans [].
    const spans = [nspan('2', { parentId: '1', start: 500 }), nspan('4', { parentId: '2', start: 1000 })];
    const recovered = recoverPartialTraces(spans);
    expect(recovered.map((s) => s.id)).toEqual(['2', '4']);
    expect(recovered.find((s) => s.id === '2')).toMatchObject({ orphaned: true, fallbackRoot: true });
    expect(recovered.find((s) => s.id === '4')!.orphaned).toBeUndefined();
  });

  it('PARTIAL (orphan child spans): a genuine orphan is reparented under the recorded root', () => {
    // Kibana traceData = [root, child2, grandchild]; grandchild (parent '2' absent) is the orphan.
    const spans = [nspan('1', { duration: 1000 }), nspan('3', { parentId: '1' }), nspan('4', { parentId: '2' })];
    const recovered = recoverPartialTraces(spans);
    expect(recovered.find((s) => s.id === '4')).toMatchObject({ orphaned: true, reparentedToSpanId: '1' });
    expect(recovered.find((s) => s.id === '3')!.orphaned).toBeUndefined();
  });
});

describe('Kibana waterfall parity — focused-trace scenarios (adapted; entryTransactionId is a non-goal)', () => {
  it('an orphan ancestor becomes the fallback root instead of being dropped as a cycle', () => {
    // Kibana with entryTransactionId='entry-transaction' hides the orphan ancestor via hasPathToTarget.
    // We have no focused-root selection, so the orphan ancestor (`service-parent`) is simply the
    // fallback root and the whole chain remains visible — no cycle is possible by construction.
    const spans = [
      nspan('service-parent', { parentId: 'upstream-root', start: 0, duration: 1000 }),
      nspan('entry-transaction', { parentId: 'service-parent', start: 100, duration: 500 }),
      nspan('entry-child-span', { parentId: 'entry-transaction', start: 150, duration: 100 }),
    ];
    const recovered = recoverPartialTraces(spans);
    expect(recovered.map((s) => s.id)).toEqual(['service-parent', 'entry-transaction', 'entry-child-span']);
    expect(recovered.find((s) => s.id === 'service-parent')).toMatchObject({ orphaned: true, fallbackRoot: true });
    expect(recovered.find((s) => s.id === 'entry-transaction')!.orphaned).toBeUndefined();
  });

  it('reparents a non-ancestor genuine orphan under the elected root', () => {
    // Kibana reparents `genuine-orphan` below the selected transaction. Without a focused root, our
    // elected root is the fallback ancestor and the genuine orphan is reparented beneath it.
    const spans = [
      nspan('entry-transaction', { parentId: 'service-parent', start: 100, duration: 500 }),
      nspan('entry-child-span', { parentId: 'entry-transaction', start: 150, duration: 100 }),
      nspan('genuine-orphan', { parentId: 'missing-parent', start: 200, duration: 50 }),
    ];
    const recovered = recoverPartialTraces(spans);
    // entry-transaction is the first orphan → fallback root; genuine-orphan reparents to it.
    expect(recovered.find((s) => s.id === 'entry-transaction')).toMatchObject({ orphaned: true, fallbackRoot: true });
    expect(recovered.find((s) => s.id === 'genuine-orphan')).toMatchObject({
      orphaned: true,
      reparentedToSpanId: 'entry-transaction',
    });
    expect(recovered.find((s) => s.id === 'entry-child-span')!.orphaned).toBeUndefined();
  });
});
