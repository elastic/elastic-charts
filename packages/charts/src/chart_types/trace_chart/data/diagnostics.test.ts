/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { resolveSpanBadges } from './badges';
import { DIAGNOSTICS_EXAMPLE_CAP, TraceDiagnosticsCollector } from './diagnostics';
import { normalize } from './normalize';
import type { NormalizedSpan } from './types';
import { Logger } from '../../../utils/logger';
import type { TraceDatum, TraceSpanBadge, TraceSpanBadgeAccessor } from '../trace_api';

// --- Fixtures -------------------------------------------------------------------------------------

const datum = (id: string): TraceDatum => ({ id, name: id, start: 0, end: 100, traceId: 't1' });

const span = (id: string): NormalizedSpan => {
  const d = datum(id);
  return { id, name: id, start: 0, end: 100, activeSegments: [], meta: d };
};

/** Builds an accessor that returns the given badges for span `a` and nothing for other spans. */
const accessorFor = (badges: readonly TraceSpanBadge[]): TraceSpanBadgeAccessor => {
  return (d: TraceDatum) => (d.id === 'a' ? badges : []);
};

const kinds = (c: TraceDiagnosticsCollector) => c.list().map((i) => i.kind);

// --- TraceDiagnosticsCollector -------------------------------------------------------------------

describe('TraceDiagnosticsCollector', () => {
  it('starts empty and reports a canonical flat issue list', () => {
    const c = new TraceDiagnosticsCollector();
    expect(c.isEmpty()).toBe(true);
    expect(c.list()).toEqual([]);
  });

  it('aggregates repeated occurrences of the same kind into one issue with an accurate count', () => {
    const c = new TraceDiagnosticsCollector();
    c.add('badge_empty', 'warning', 'badge', 'a/1');
    c.add('badge_empty', 'warning', 'badge', 'a/2');
    expect(c.list()).toHaveLength(1);
    expect(c.list()[0]).toMatchObject({ kind: 'badge_empty', severity: 'warning', scope: 'badge', count: 2 });
  });

  it('uses a library-defined example cap while still counting every occurrence', () => {
    const c = new TraceDiagnosticsCollector();
    const total = DIAGNOSTICS_EXAMPLE_CAP + 3;
    for (let i = 0; i < total; i++) c.add('badge_empty', 'warning', 'badge', `a/${i}`);
    const issue = c.list()[0]!;
    expect(issue.count).toBe(total);
    expect(issue.examples).toHaveLength(DIAGNOSTICS_EXAMPLE_CAP);
  });

  it('de-duplicates identical examples but still counts each occurrence', () => {
    const c = new TraceDiagnosticsCollector();
    c.add('badge_duplicate_id', 'warning', 'badge', 'a/dup');
    c.add('badge_duplicate_id', 'warning', 'badge', 'a/dup');
    const issue = c.list()[0]!;
    expect(issue.count).toBe(2);
    expect(issue.examples).toEqual(['a/dup']);
  });

  it('preserves first-occurrence order across kinds so the report is deterministic', () => {
    const c = new TraceDiagnosticsCollector();
    c.add('span_reparented', 'info', 'span', 's1');
    c.add('span_negative_duration', 'warning', 'span', 's2');
    c.add('span_reparented', 'info', 'span', 's3');
    expect(kinds(c)).toEqual(['span_reparented', 'span_negative_duration']);
  });
});

// --- report(): public issues-only shape (Spec 28) ------------------------------------------------

describe('TraceDiagnosticsCollector.report', () => {
  it('returns an issues-only report with an empty list for a clean collector', () => {
    const c = new TraceDiagnosticsCollector();
    expect(c.report()).toEqual({ issues: [] });
  });

  it('returns the canonical flat issue list under `issues`', () => {
    const c = new TraceDiagnosticsCollector();
    c.add('span_non_finite_dropped', 'warning', 'span', 'x');
    expect(c.report()).toEqual({ issues: c.list() });
    expect(c.report().issues[0]).toMatchObject({
      kind: 'span_non_finite_dropped',
      severity: 'warning',
      scope: 'span',
      count: 1,
      examples: ['x'],
    });
  });

  it('classifies severities across the core kinds (info / warning / error)', () => {
    const c = new TraceDiagnosticsCollector();
    c.add('span_reparented', 'info', 'span', 's');
    c.add('trace_spans_omitted', 'warning', 'trace', '"t1"');
    c.add('span_duplicate_id_cross_trace', 'error', 'chart', 'dup');
    const bySeverity = Object.fromEntries(c.list().map((i) => [i.kind, i.severity]));
    expect(bySeverity).toEqual({
      span_reparented: 'info',
      trace_spans_omitted: 'warning',
      span_duplicate_id_cross_trace: 'error',
    });
  });
});

// --- examples identity contract, driven through normalize (Spec 28 §1) ---------------------------

describe('trace data diagnostics examples identity (via normalize)', () => {
  it('identifies an unresolved critical-path reference by `criticalPath/<spanId>`', () => {
    const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const c = new TraceDiagnosticsCollector();
    const data: TraceDatum[] = [{ id: 'root', name: 'root', start: 0, end: 100 }];
    normalize(data, 'time', undefined, undefined, undefined, [{ spanId: 'ghost', start: 0, end: 10 }], c);
    expect(c.list().find((i) => i.kind === 'reference_unresolved_span')).toMatchObject({
      severity: 'warning',
      scope: 'reference',
      examples: ['criticalPath/ghost'],
    });
    warn.mockRestore();
  });

  it('identifies a dropped non-finite span by its spanId and keeps the developer warning', () => {
    const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const c = new TraceDiagnosticsCollector();
    const data: TraceDatum[] = [
      { id: 'root', name: 'root', start: 0, end: 100 },
      { id: 'bad', name: 'bad', start: NaN, end: 10 },
    ];
    normalize(data, 'time', undefined, undefined, undefined, [], c);
    expect(c.list().find((i) => i.kind === 'span_non_finite_dropped')).toMatchObject({ examples: ['bad'] });
    // Non-finite is a scenario-owned log kept alongside the diagnostic (Spec 28).
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('dropped 1 span'));
    warn.mockRestore();
  });

  it('identifies a clock-skew-corrected span by its spanId (info)', () => {
    const c = new TraceDiagnosticsCollector();
    const data: TraceDatum[] = [
      { id: 'root', name: 'root', start: 100, end: 300 },
      { id: 'child', name: 'child', parentId: 'root', start: 80, end: 180 },
    ];
    normalize(data, 'time', undefined, undefined, undefined, [], c);
    expect(c.list().find((i) => i.kind === 'span_clock_skew_corrected')).toMatchObject({
      severity: 'info',
      scope: 'span',
      examples: ['child'],
    });
  });
});

// --- resolveSpanBadges: attachment & purity ------------------------------------------------------

describe('resolveSpanBadges', () => {
  it('returns the input array unchanged when no accessor is supplied', () => {
    const spans = [span('a')];
    expect(resolveSpanBadges(spans, undefined)).toBe(spans);
  });

  it('attaches badges in accessor order and retains badge objects by reference', () => {
    const badges: TraceSpanBadge[] = [
      { id: '1', text: 'GET' },
      { id: '2', text: '200' },
    ];
    const [a] = resolveSpanBadges([span('a')], accessorFor(badges));
    expect(a!.badges).toHaveLength(2);
    expect(a!.badges![0]).toBe(badges[0]); // same reference, never cloned
    expect(a!.badges![1]).toBe(badges[1]);
  });

  it('derives span badges without changing the source datum or badge objects', () => {
    const badge: TraceSpanBadge = { id: '1', text: 'GET', meta: { foo: 1 } };
    const s = span('a');
    const before = JSON.stringify(s.meta);
    resolveSpanBadges([s], accessorFor([badge]));
    expect(JSON.stringify(s.meta)).toBe(before);
    expect(badge).toEqual({ id: '1', text: 'GET', meta: { foo: 1 } });
  });

  it('keeps the original span reference (no badges field) when a span has none', () => {
    const s = span('a');
    const [out] = resolveSpanBadges([s], accessorFor([]));
    expect(out).toBe(s);
    expect(out!.badges).toBeUndefined();
  });

  it('keeps the original span reference when every returned badge is dropped', () => {
    const s = span('a');
    const [out] = resolveSpanBadges([s], accessorFor([{ id: '1' }]));
    expect(out).toBe(s);
    expect(out!.badges).toBeUndefined();
  });

  it('works without a diagnostics collector (still drops empty badges)', () => {
    const [a] = resolveSpanBadges([span('a')], accessorFor([{ id: '1' }, { id: '2', text: 'ok' }]));
    expect(a!.badges).toHaveLength(1);
    expect(a!.badges![0]!.id).toBe('2');
  });
});

// --- resolveSpanBadges: structural diagnostics ---------------------------------------------------

describe('resolveSpanBadges diagnostics', () => {
  it('reports empty span badges and omits them from layout', () => {
    const c = new TraceDiagnosticsCollector();
    const [a] = resolveSpanBadges([span('a')], accessorFor([{ id: '1' }, { id: '2', text: 'ok' }]), c);
    expect(a!.badges).toHaveLength(1);
    expect(kinds(c)).toContain('badge_empty');
    expect(c.list().find((i) => i.kind === 'badge_empty')).toMatchObject({ scope: 'badge', examples: ['a/1'] });
  });

  it('treats whitespace-only badge text as empty when there is no image', () => {
    const c = new TraceDiagnosticsCollector();
    const [a] = resolveSpanBadges([span('a')], accessorFor([{ id: '1', text: '   ' }]), c);
    expect(a!.badges).toBeUndefined();
    expect(kinds(c)).toEqual(['badge_empty']);
  });

  it('keeps a whitespace-text badge that has an image (image-only)', () => {
    const c = new TraceDiagnosticsCollector();
    const badge: TraceSpanBadge = { id: '1', text: '  ', image: { src: 'icon.svg' }, ariaLabel: 'lang' };
    const [a] = resolveSpanBadges([span('a')], accessorFor([badge]), c);
    expect(a!.badges).toEqual([badge]);
    expect(c.isEmpty()).toBe(true);
  });

  it('reports non-string badge text and drops the badge when it has no image', () => {
    const c = new TraceDiagnosticsCollector();
    const badge = { id: '1', text: 42 } as unknown as TraceSpanBadge;
    const [a] = resolveSpanBadges([span('a')], accessorFor([badge]), c);
    expect(a!.badges).toBeUndefined();
    expect(kinds(c)).toEqual(expect.arrayContaining(['badge_non_string_text', 'badge_empty']));
  });

  it('reports non-string badge text but keeps the badge when it has an image', () => {
    const c = new TraceDiagnosticsCollector();
    const badge = { id: '1', text: 42, image: { src: 'icon.svg' }, ariaLabel: 'x' } as unknown as TraceSpanBadge;
    const [a] = resolveSpanBadges([span('a')], accessorFor([badge]), c);
    expect(a!.badges).toEqual([badge]);
    expect(kinds(c)).toEqual(['badge_non_string_text']);
  });

  it('reports duplicate span badge ids and keeps both for deterministic hit testing', () => {
    const c = new TraceDiagnosticsCollector();
    const badges: TraceSpanBadge[] = [
      { id: 'dup', text: 'first' },
      { id: 'dup', text: 'second' },
    ];
    const [a] = resolveSpanBadges([span('a')], accessorFor(badges), c);
    expect(a!.badges).toHaveLength(2);
    expect(c.list().find((i) => i.kind === 'badge_duplicate_id')).toMatchObject({ count: 1, examples: ['a/dup'] });
  });

  it('reports invalid visibility values but keeps the badge', () => {
    const c = new TraceDiagnosticsCollector();
    const badge = { id: '1', text: 'ok', visibleIn: ['inline', 'nope'] } as unknown as TraceSpanBadge;
    const [a] = resolveSpanBadges([span('a')], accessorFor([badge]), c);
    expect(a!.badges).toEqual([badge]);
    expect(kinds(c)).toEqual(['badge_invalid_visibility']);
  });

  it('reports an image-only badge without an ariaLabel and keeps it', () => {
    const c = new TraceDiagnosticsCollector();
    const badge: TraceSpanBadge = { id: '1', image: { src: 'icon.svg' } };
    const [a] = resolveSpanBadges([span('a')], accessorFor([badge]), c);
    expect(a!.badges).toEqual([badge]);
    expect(kinds(c)).toEqual(['badge_missing_aria_label']);
  });

  it('does not report an image-only badge that supplies an ariaLabel', () => {
    const c = new TraceDiagnosticsCollector();
    const badge: TraceSpanBadge = { id: '1', image: { src: 'icon.svg' }, ariaLabel: 'JavaScript' };
    resolveSpanBadges([span('a')], accessorFor([badge]), c);
    expect(c.isEmpty()).toBe(true);
  });

  it('does not report a badge that has both text and image', () => {
    const c = new TraceDiagnosticsCollector();
    const badge: TraceSpanBadge = { id: '1', text: 'ok', image: { src: 'icon.svg' } };
    resolveSpanBadges([span('a')], accessorFor([badge]), c);
    expect(c.isEmpty()).toBe(true);
  });

  it('includes badge issues in the trace diagnostics report', () => {
    // Badge structural problems flow into the unified diagnostics report (Spec 28), each aggregated
    // under the `badge` scope — not a separate badge-specific channel.
    const c = new TraceDiagnosticsCollector();
    const badges = [
      { id: 'empty' }, // no text/image → badge_empty
      { id: 'ok', text: 42 } as unknown as TraceSpanBadge, // non-string text, no image → non_string + empty
      { id: 'img', image: { src: 'icon.svg' } }, // image-only, no ariaLabel → badge_missing_aria_label
    ] as TraceSpanBadge[];
    resolveSpanBadges([span('a')], accessorFor(badges), c);

    const report = c.list();
    expect(report.length).toBeGreaterThan(0);
    expect(report.every((i) => i.scope === 'badge')).toBe(true);
    expect(kinds(c)).toEqual(expect.arrayContaining(['badge_empty', 'badge_non_string_text', 'badge_missing_aria_label']));
  });
});
