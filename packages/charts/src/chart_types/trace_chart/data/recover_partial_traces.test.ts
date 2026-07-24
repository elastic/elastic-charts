/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Spec 26 — partial-trace recovery and orphan reparenting transform (`recoverPartialTraces`).
 *
 * Parity references (structures kept local; no Kibana helpers imported): Kibana APM `TraceWaterfall`
 * commits `c96a8839e018` (root fallback + per-orphan disclosure), `36c31d600a371` (reparenting +
 * clock-skew placement on clones), `3843218ee070` (ancestor-cycle guard for a future focus API).
 */

import { DIAGNOSTICS_EXAMPLE_CAP, TraceDiagnosticsCollector } from './diagnostics';
import { recoverPartialTraces } from './normalize';
import type { NormalizedSpan } from './types';
import { Logger } from '../../../utils/logger';
import type { TraceDatum } from '../trace_api';

function span(
  id: string,
  opts: { parentId?: string; traceId?: string; start?: number; end?: number } = {},
): NormalizedSpan {
  const start = opts.start ?? 0;
  const end = opts.end ?? 10;
  const datum: TraceDatum = { id, name: id, parentId: opts.parentId, traceId: opts.traceId, start, end };
  return {
    id,
    name: id,
    parentId: opts.parentId,
    traceId: opts.traceId,
    start,
    end,
    activeSegments: [],
    meta: datum,
  };
}

const ids = (spans: NormalizedSpan[]): string[] => spans.map((s) => s.id);

const kindsOf = (c: TraceDiagnosticsCollector): string[] => c.list().map((i) => i.kind);

describe('recoverPartialTraces', () => {
  describe('complete trace fast path', () => {
    it('returns the input array reference and allocates no replacement spans', () => {
      const spans = [span('root'), span('child', { parentId: 'root' })];
      const result = recoverPartialTraces(spans);
      expect(result).toBe(spans);
      expect(result[0]).toBe(spans[0]);
      expect(result[1]).toBe(spans[1]);
    });

    it('treats each distinct traceId with its own single recorded root as complete', () => {
      const spans = [
        span('a-root', { traceId: 'A' }),
        span('a-child', { traceId: 'A', parentId: 'a-root' }),
        span('b-root', { traceId: 'B' }),
      ];
      expect(recoverPartialTraces(spans)).toBe(spans);
    });
  });

  describe('orphan reparenting beneath the recorded root', () => {
    it('reparents a single orphan under the recorded root and marks provenance', () => {
      const spans = [span('root'), span('orphan', { parentId: 'missing' })];
      const result = recoverPartialTraces(spans);
      expect(result[0]).toBe(spans[0]); // root untouched
      expect(result[1]).toMatchObject({ id: 'orphan', orphaned: true, reparentedToSpanId: 'root' });
      expect(result[1]!.parentId).toBe('missing'); // recorded parentId preserved
      expect(result[1]).not.toBe(spans[1]); // orphan cloned
    });

    it('reparents multiple orphans under the same recorded root', () => {
      const spans = [span('root'), span('o1', { parentId: 'm1' }), span('o2', { parentId: 'm2' })];
      const result = recoverPartialTraces(spans);
      expect(result[1]).toMatchObject({ reparentedToSpanId: 'root', orphaned: true });
      expect(result[2]).toMatchObject({ reparentedToSpanId: 'root', orphaned: true });
    });

    it('preserves a recorded descendant nested beneath a reparented orphan', () => {
      const spans = [span('root'), span('orphan', { parentId: 'missing' }), span('ochild', { parentId: 'orphan' })];
      const result = recoverPartialTraces(spans);
      expect(ids(result)).toEqual(['root', 'orphan', 'ochild']);
      expect(result[2]).toMatchObject({ id: 'ochild' });
      expect(result[2]!.orphaned).toBeUndefined(); // its recorded parent (orphan) is present
      expect(result[2]!.reparentedToSpanId).toBeUndefined();
    });

    it('never orphans a span whose recorded parent is present (running or completed)', () => {
      const spans = [span('root'), span('running', { parentId: 'root', end: 10 })];
      const result = recoverPartialTraces(spans);
      expect(result[1]!.orphaned).toBeUndefined();
    });
  });

  describe('fallback-root election', () => {
    it('elects the first orphan in normalized input order (not the earliest start) as the fallback root', () => {
      const spans = [
        span('first', { parentId: 'gone-1', start: 100, end: 200 }),
        span('second', { parentId: 'gone-2', start: 0, end: 80 }), // earliest start
        span('third', { parentId: 'gone-3', start: 50, end: 160 }),
      ];
      const result = recoverPartialTraces(spans);
      const first = result.find((s) => s.id === 'first')!;
      expect(first).toMatchObject({ orphaned: true, fallbackRoot: true });
      expect(first.reparentedToSpanId).toBeUndefined(); // fallback root has no synthetic parent
      expect(result.find((s) => s.id === 'second')).toMatchObject({ orphaned: true, reparentedToSpanId: 'first' });
      expect(result.find((s) => s.id === 'third')).toMatchObject({ orphaned: true, reparentedToSpanId: 'first' });
    });
  });

  describe('multiple recorded roots', () => {
    it('elects the last recorded root in input order and omits earlier roots plus their descendants', () => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const diagnostics = new TraceDiagnosticsCollector();
      const spans = [
        span('root-early'),
        span('early-child', { parentId: 'root-early' }),
        span('root-late'),
        span('late-child', { parentId: 'root-late' }),
        span('orphan', { parentId: 'missing' }),
      ];
      const result = recoverPartialTraces(spans, diagnostics);
      expect(ids(result)).toEqual(['root-late', 'late-child', 'orphan']);
      expect(result.find((s) => s.id === 'orphan')).toMatchObject({ reparentedToSpanId: 'root-late' });
      // Spec 28: the aggregated recovery warning is migrated to diagnostics (omitted earlier root + child).
      expect(warn).not.toHaveBeenCalled();
      expect(kindsOf(diagnostics)).toContain('trace_spans_omitted');
      warn.mockRestore();
    });

    it('applies last-root election independently per traceId group', () => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const spans = [
        span('a1', { traceId: 'A' }),
        span('a2', { traceId: 'A' }), // A: two roots → a2 elected
        span('b-root', { traceId: 'B' }),
        span('b-child', { traceId: 'B', parentId: 'b-root' }),
      ];
      const result = recoverPartialTraces(spans);
      expect(ids(result)).toEqual(['a2', 'b-root', 'b-child']); // a1 omitted, B intact
      warn.mockRestore();
    });
  });

  describe('per-traceId isolation', () => {
    it('does not resolve a parent reference across trace groups (identical parent IDs stay local)', () => {
      const spans = [
        span('r', { traceId: 'A' }),
        span('a-child', { traceId: 'A', parentId: 'r' }),
        span('b-root', { traceId: 'B' }),
        span('b-child', { traceId: 'B', parentId: 'r' }), // 'r' exists only in A → orphan in B
      ];
      const result = recoverPartialTraces(spans);
      expect(result.find((s) => s.id === 'a-child')!.orphaned).toBeUndefined();
      expect(result.find((s) => s.id === 'b-child')).toMatchObject({ orphaned: true, reparentedToSpanId: 'b-root' });
    });
  });

  describe('source identity immutability', () => {
    it('never mutates the input span or its datum, and the clone keeps the recorded parentId and meta', () => {
      const orphan = span('orphan', { parentId: 'missing' });
      const originalMeta = orphan.meta;
      const spans = [span('root'), orphan];
      const result = recoverPartialTraces(spans);
      // original object untouched
      expect(orphan.orphaned).toBeUndefined();
      expect(orphan.reparentedToSpanId).toBeUndefined();
      expect(orphan.parentId).toBe('missing');
      // clone preserves recorded identity
      const clone = result.find((s) => s.id === 'orphan')!;
      expect(clone.parentId).toBe('missing');
      expect(clone.meta).toBe(originalMeta);
    });
  });

  describe('reachability, cycles, and duplicates', () => {
    it('omits a disconnected cycle beside a valid elected tree and terminates', () => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const diagnostics = new TraceDiagnosticsCollector();
      const spans = [
        span('root'),
        span('child', { parentId: 'root' }),
        span('cycle-a', { parentId: 'cycle-b' }),
        span('cycle-b', { parentId: 'cycle-a' }),
      ];
      const result = recoverPartialTraces(spans, diagnostics);
      expect(ids(result)).toEqual(['root', 'child']);
      expect(warn).not.toHaveBeenCalled();
      expect(kindsOf(diagnostics)).toContain('trace_spans_omitted');
      warn.mockRestore();
    });

    it('renders no lanes for a rootless-only group (rootless cycle)', () => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const diagnostics = new TraceDiagnosticsCollector();
      const spans = [span('cycle-a', { parentId: 'cycle-b' }), span('cycle-b', { parentId: 'cycle-a' })];
      expect(recoverPartialTraces(spans, diagnostics)).toEqual([]);
      expect(warn).not.toHaveBeenCalled();
      expect(diagnostics.list().find((i) => i.kind === 'trace_group_rootless')).toMatchObject({
        severity: 'warning',
        scope: 'trace',
      });
      warn.mockRestore();
    });

    it('invalidates only the trace group whose reachable tree contains a duplicate ID', () => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const diagnostics = new TraceDiagnosticsCollector();
      const spans = [
        span('a-root', { traceId: 'A' }),
        span('a-child', { traceId: 'A', parentId: 'a-root' }),
        span('b-root', { traceId: 'B' }),
        span('dup', { traceId: 'B', parentId: 'b-root' }),
        span('dup', { traceId: 'B', parentId: 'b-root' }), // reachable same-group duplicate → B invalid
      ];
      const result = recoverPartialTraces(spans, diagnostics);
      expect(ids(result)).toEqual(['a-root', 'a-child']);
      expect(warn).not.toHaveBeenCalled();
      expect(diagnostics.list().find((i) => i.kind === 'trace_group_invalidated_duplicate_span_id')).toMatchObject({
        severity: 'error',
        scope: 'trace',
      });
      warn.mockRestore();
    });

    it('omits (does not invalidate) a same-group duplicate confined to an unreachable component', () => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const diagnostics = new TraceDiagnosticsCollector();
      const spans = [
        span('root'),
        span('child', { parentId: 'root' }),
        // Unreachable-from-root cycle that also carries a duplicate id — omitted, never invalidating.
        span('dupU', { parentId: 'cyc' }),
        span('cyc', { parentId: 'dupU' }),
        span('dupU', { parentId: 'cyc' }),
      ];
      const result = recoverPartialTraces(spans, diagnostics);
      expect(ids(result)).toEqual(['root', 'child']); // duplicate omitted, valid tree preserved
      expect(warn).not.toHaveBeenCalled();
      expect(kindsOf(diagnostics)).toContain('trace_spans_omitted');
      expect(kindsOf(diagnostics)).not.toContain('trace_group_invalidated_duplicate_span_id');
      warn.mockRestore();
    });

    it('invalidates the entire combined result for a cross-trace duplicate ID', () => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const diagnostics = new TraceDiagnosticsCollector();
      const spans = [
        span('a-root', { traceId: 'A' }),
        span('shared', { traceId: 'A', parentId: 'a-root' }),
        span('b-root', { traceId: 'B' }),
        span('shared', { traceId: 'B', parentId: 'b-root' }), // 'shared' spans two groups
      ];
      expect(recoverPartialTraces(spans, diagnostics)).toEqual([]);
      expect(warn).not.toHaveBeenCalled();
      expect(diagnostics.list().find((i) => i.kind === 'span_duplicate_id_cross_trace')).toMatchObject({
        severity: 'error',
        scope: 'chart',
        examples: ['shared'],
      });
      warn.mockRestore();
    });
  });

  describe('survivor order', () => {
    it('preserves normalized input order among survivors (does not leak DFS/traversal order)', () => {
      const spans = [
        span('root', { start: 0, end: 100 }),
        span('late', { parentId: 'root', start: 90, end: 95 }),
        span('early', { parentId: 'root', start: 10, end: 20 }),
      ];
      const result = recoverPartialTraces(spans);
      expect(ids(result)).toEqual(['root', 'late', 'early']); // orderLanes owns final ordering, not recovery
    });
  });

  describe('diagnostics behavior (Spec 28: developer warnings migrated to diagnostics)', () => {
    it('records no diagnostic and no warning for a complete trace', () => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const diagnostics = new TraceDiagnosticsCollector();
      recoverPartialTraces([span('root'), span('child', { parentId: 'root' })], diagnostics);
      expect(warn).not.toHaveBeenCalled();
      expect(diagnostics.isEmpty()).toBe(true);
      warn.mockRestore();
    });

    it('reports lossless orphan reparenting as an info diagnostic (previously silent) and never warns', () => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const diagnostics = new TraceDiagnosticsCollector();
      recoverPartialTraces([span('root'), span('orphan', { parentId: 'missing' })], diagnostics);
      expect(warn).not.toHaveBeenCalled();
      expect(diagnostics.list().find((i) => i.kind === 'span_reparented')).toMatchObject({
        severity: 'info',
        scope: 'span',
        examples: ['orphan'],
      });
      warn.mockRestore();
    });

    it('records both omission and duplicate-invalidation diagnostics without a single aggregated warning', () => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const diagnostics = new TraceDiagnosticsCollector();
      const spans = [
        // Group A: omission (two roots).
        span('a1', { traceId: 'A' }),
        span('a2', { traceId: 'A' }),
        // Group B: duplicate-id invalidation.
        span('b-root', { traceId: 'B' }),
        span('bx', { traceId: 'B', parentId: 'b-root' }),
        span('bx', { traceId: 'B', parentId: 'b-root' }),
      ];
      recoverPartialTraces(spans, diagnostics);
      expect(warn).not.toHaveBeenCalled();
      expect(kindsOf(diagnostics)).toEqual(
        expect.arrayContaining(['trace_spans_omitted', 'trace_group_invalidated_duplicate_span_id']),
      );
      warn.mockRestore();
    });

    it('bounds cross-trace duplicate examples to the example cap while counting every occurrence', () => {
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const diagnostics = new TraceDiagnosticsCollector();
      const spans: NormalizedSpan[] = [];
      for (let i = 0; i < 7; i++) {
        spans.push(span(`dup-${i}`, { traceId: 'A', parentId: i === 0 ? undefined : 'dup-0' }));
        spans.push(span(`dup-${i}`, { traceId: 'B', parentId: i === 0 ? undefined : 'dup-0' }));
      }
      recoverPartialTraces(spans, diagnostics);
      expect(warn).not.toHaveBeenCalled();
      const issue = diagnostics.list().find((i) => i.kind === 'span_duplicate_id_cross_trace')!;
      expect(issue.count).toBe(7); // seven ids appear in both groups
      expect(issue.examples).toHaveLength(DIAGNOSTICS_EXAMPLE_CAP);
      warn.mockRestore();
    });
  });
});
