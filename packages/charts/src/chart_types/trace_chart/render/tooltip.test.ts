/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Spec 7 — Tooltip mapping and event payload unit tests.
 *
 * Covers: `buildTraceTooltipInfo` derived values, datum identity, State row,
 * per-segment "Active segment" row; `buildTraceEvent` shape and type-guard;
 * `isTraceElementEvent`.
 */

import { buildTraceEvent, buildTraceSelectionDetail, buildTraceTooltipInfo, formatMs } from './tooltip';
import { isTraceElementEvent } from '../../../specs/settings';
import type { NormalizedSpan } from '../data/types';
import type { TraceDatum } from '../trace_api';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const meta: TraceDatum = {
  id: 'span-1',
  name: 'HTTP GET /checkout',
  traceId: 't1',
  start: 100,
  end: 600,
};

/** A realistic NormalizedSpan with two active segments (self-time = 150 ms). */
const span: NormalizedSpan = {
  id: 'span-1',
  name: 'HTTP GET /checkout',
  parentId: undefined,
  traceId: 't1',
  start: 100,
  end: 600,
  activeSegments: [
    { start: 100, end: 200 }, // 100 ms
    { start: 500, end: 550 }, // 50 ms  → self time = 150 ms total
  ],
  meta,
};

const DOMAIN_MIN = 50; // domain starts before span so startOffset = 100 - 50 = 50 ms
const COLOR = '#7B61FF';

// ---------------------------------------------------------------------------
// buildTraceTooltipInfo — hovering an active segment (segmentIndex ≥ 0)
// ---------------------------------------------------------------------------

describe('buildTraceTooltipInfo — active region with segmentIndex', () => {
  // segmentIndex=0: hovering the first active segment [100, 200] (100 ms)
  const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'active', COLOR, 0);

  it('has a null header', () => {
    expect(info.header).toBeNull();
  });

  it('contains exactly 7 rows when an active segment is hovered', () => {
    // Name, Duration, Self time, Active segment, Active segment offset, Start, State
    expect(info.values).toHaveLength(7);
  });

  it('Name row carries the span name', () => {
    const row = info.values[0]!;
    expect(row.label).toBe('Name');
    expect(row.formattedValue).toBe(span.name);
  });

  it('Duration row = end - start', () => {
    const row = info.values[1]!;
    expect(row.label).toBe('Duration');
    expect(row.value).toBe(500); // 600 - 100
    expect(row.formattedValue).toBe('500.00 ms');
  });

  it('Self time row = Σ active-segment durations', () => {
    const row = info.values[2]!;
    expect(row.label).toBe('Self time');
    expect(row.value).toBe(150); // 100 + 50
    expect(row.formattedValue).toBe('150.00 ms');
  });

  it('Active segment row shows the hovered segment duration with (i of n) ordinal when n > 1', () => {
    const row = info.values[3]!;
    // Span has 2 segments so the label includes the ordinal
    expect(row.label).toBe('Active segment (1 of 2)');
    expect(row.value).toBe(100); // segment 0: 200 - 100
    expect(row.formattedValue).toBe('100.00 ms');
  });

  it('Active segment row shows the second-segment duration when segmentIndex=1', () => {
    const info2 = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'active', COLOR, 1);
    const row = info2.values[3]!;
    expect(row.label).toBe('Active segment (2 of 2)');
    expect(row.value).toBe(50); // segment 1: 550 - 500
    expect(row.formattedValue).toBe('50.00 ms');
  });

  it('Active segment offset row = seg.start - domainMin (from trace start)', () => {
    const row = info.values[4]!;
    // seg 0 starts at 100; domainMin=50 → offset = 50
    expect(row.label).toBe('Active segment offset');
    expect(row.value).toBe(50); // 100 - 50
    expect(row.formattedValue).toBe('+50.00 ms');
  });

  it('Active segment offset row reflects the second segment when segmentIndex=1', () => {
    const info2 = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'active', COLOR, 1);
    const row = info2.values[4]!;
    // seg 1 starts at 500; domainMin=50 → offset = 450
    expect(row.label).toBe('Active segment offset');
    expect(row.value).toBe(450); // 500 - 50
    expect(row.formattedValue).toBe('+450.00 ms');
  });

  it('Start offset row = span.start - domainMin', () => {
    const row = info.values[5]!;
    expect(row.label).toBe('Start');
    expect(row.value).toBe(50); // 100 - 50
    expect(row.formattedValue).toBe('+50.00 ms');
  });

  it('State row reflects the passed region', () => {
    expect(info.values[6]!.formattedValue).toBe('Active');
  });

  it('each row carries the original TraceDatum as datum (not the NormalizedSpan)', () => {
    for (const row of info.values) {
      expect(row.datum).toBe(meta); // span.meta — not the internal span object
    }
  });
});

// ---------------------------------------------------------------------------
// buildTraceTooltipInfo — no active segment row (segmentIndex = -1 / non-active)
// ---------------------------------------------------------------------------

describe('buildTraceTooltipInfo — non-active region (5 rows)', () => {
  it('contains exactly 5 rows when hovering the waiting region (segmentIndex = -1)', () => {
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'waiting', COLOR, -1);
    expect(info.values).toHaveLength(5);
    const labels = info.values.map((r) => r.label);
    // No "Active segment" or offset rows
    expect(labels).not.toContain('Active segment');
    expect(labels).not.toContain('Active segment (1 of 2)');
    expect(labels).not.toContain('Active segment offset');
  });

  it('contains exactly 5 rows when region is "empty"', () => {
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'empty', COLOR, -1);
    expect(info.values).toHaveLength(5);
  });

  it('State row reflects region for waiting', () => {
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'waiting', COLOR, -1);
    expect(info.values[4]!.formattedValue).toBe('Waiting');
  });

  it('State row reflects region for empty', () => {
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'empty', COLOR, -1);
    expect(info.values[4]!.formattedValue).toBe('—');
  });

  it('each row carries the original TraceDatum as datum', () => {
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'waiting', COLOR, -1);
    for (const row of info.values) {
      expect(row.datum).toBe(meta);
    }
  });
});

// ---------------------------------------------------------------------------
// buildTraceTooltipInfo — single-segment span (no ordinal)
// ---------------------------------------------------------------------------

describe('buildTraceTooltipInfo — single active segment (no ordinal)', () => {
  const singleSegSpan: NormalizedSpan = {
    ...span,
    activeSegments: [{ start: 100, end: 300 }], // one segment only
  };

  it('Active segment label has no ordinal when n = 1', () => {
    const info = buildTraceTooltipInfo(singleSegSpan, 0, DOMAIN_MIN, 'active', COLOR, 0);
    const row = info.values[3]!;
    expect(row.label).toBe('Active segment'); // no "(1 of 1)"
    expect(row.value).toBe(200); // 300 - 100
  });

  it('Active segment offset row is present even for a single-segment span', () => {
    const info = buildTraceTooltipInfo(singleSegSpan, 0, DOMAIN_MIN, 'active', COLOR, 0);
    // 7 rows: Name, Duration, Self time, Active segment, Active segment offset, Start, State
    expect(info.values).toHaveLength(7);
    const row = info.values[4]!;
    expect(row.label).toBe('Active segment offset');
    expect(row.value).toBe(50); // seg.start(100) - domainMin(50)
    expect(row.formattedValue).toBe('+50.00 ms');
  });
});

// ---------------------------------------------------------------------------
// buildTraceTooltipInfo — edge cases
// ---------------------------------------------------------------------------

describe('buildTraceTooltipInfo — edge cases', () => {
  it('spans with no active segments report self time = 0', () => {
    const noActive: NormalizedSpan = { ...span, activeSegments: [] };
    const info = buildTraceTooltipInfo(noActive, 0, DOMAIN_MIN, 'waiting', COLOR, -1);
    expect(info.values[2]!.value).toBe(0);
  });

  it('formats values >= 1000 ms as seconds', () => {
    const longSpan: NormalizedSpan = { ...span, start: 0, end: 2500, activeSegments: [] };
    const info = buildTraceTooltipInfo(longSpan, 0, 0, 'empty', COLOR, -1);
    expect(info.values[1]!.formattedValue).toBe('2.50 s');
  });

  it('does not add segment rows when region is active but segmentIndex is out-of-range (-1)', () => {
    // region='active' but segmentIndex=-1 → no segment duration or offset row
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'active', COLOR, -1);
    expect(info.values).toHaveLength(5);
    const labels = info.values.map((r) => r.label);
    expect(labels).not.toContain('Active segment (1 of 2)');
    expect(labels).not.toContain('Active segment offset');
  });

  it('adds the exact clock-skew note only for a corrected span', () => {
    const corrected: NormalizedSpan = { ...span, skewCorrected: true };
    const info = buildTraceTooltipInfo(corrected, 0, DOMAIN_MIN, 'waiting', COLOR, -1);

    expect(info.values.find(({ label }) => label === 'Clock skew')).toMatchObject({
      value: 'Time adjusted for clock skew',
      formattedValue: 'Time adjusted for clock skew',
      datum: meta,
    });
    expect(buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'waiting', COLOR, -1).values).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ label: 'Clock skew' })]),
    );
  });
});

// ---------------------------------------------------------------------------
// buildTraceTooltipInfo — labeled active segments
// ---------------------------------------------------------------------------

describe('buildTraceTooltipInfo — labeled segments', () => {
  const labeledSpan: NormalizedSpan = {
    ...span,
    activeSegments: [
      { start: 100, end: 200, label: 'loading', color: 'red' },
      { start: 400, end: 500, label: 'process', color: 'green' },
      { start: 500, end: 550, label: 'final', color: 'blue' },
    ],
  };

  it('shows "Active segment: <label> (i of n)" when segment has a label and n > 1', () => {
    const info = buildTraceTooltipInfo(labeledSpan, 0, DOMAIN_MIN, 'active', COLOR, 0);
    expect(info.values[3]!.label).toBe('Active segment: loading (1 of 3)');
  });

  it('shows the correct label for the second segment', () => {
    const info = buildTraceTooltipInfo(labeledSpan, 0, DOMAIN_MIN, 'active', COLOR, 1);
    expect(info.values[3]!.label).toBe('Active segment: process (2 of 3)');
  });

  it('shows the correct label for the third segment', () => {
    const info = buildTraceTooltipInfo(labeledSpan, 0, DOMAIN_MIN, 'active', COLOR, 2);
    expect(info.values[3]!.label).toBe('Active segment: final (3 of 3)');
  });

  it('shows "Active segment: <label>" (no ordinal) when n = 1', () => {
    const singleLabeledSpan: NormalizedSpan = {
      ...span,
      activeSegments: [{ start: 100, end: 300, label: 'loading' }],
    };
    const info = buildTraceTooltipInfo(singleLabeledSpan, 0, DOMAIN_MIN, 'active', COLOR, 0);
    expect(info.values[3]!.label).toBe('Active segment: loading');
  });

  it('falls back to unlabeled format when segment has no label', () => {
    // Use original `span` fixture which has no labels — fallback must be unchanged.
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'active', COLOR, 0);
    expect(info.values[3]!.label).toBe('Active segment (1 of 2)');
  });

  it('still reports the correct segment duration and offset for a labeled segment', () => {
    const info = buildTraceTooltipInfo(labeledSpan, 0, DOMAIN_MIN, 'active', COLOR, 0);
    // segment [100, 200]: duration = 100 ms, offset from DOMAIN_MIN (50) = 50 ms
    expect(info.values[3]!.value).toBe(100);
    expect(info.values[4]!.label).toBe('Active segment offset');
    expect(info.values[4]!.value).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// buildTraceEvent
// ---------------------------------------------------------------------------

describe('buildTraceEvent', () => {
  const event = buildTraceEvent(span);

  it('has type: traceElementEvent', () => {
    expect(event.type).toBe('traceElementEvent');
  });

  it('carries the format-agnostic identity fields', () => {
    expect(event.id).toBe(span.id);
    expect(event.name).toBe(span.name);
    expect(event.traceId).toBe(span.traceId);
    expect(event.parentId).toBeUndefined(); // span.parentId is undefined
  });

  it('carries the timing fields', () => {
    expect(event.start).toBe(span.start);
    expect(event.end).toBe(span.end);
    expect(event.duration).toBe(500); // 600 - 100
    expect(event.selfTime).toBe(150); // Σ activeSegments
  });

  it('datum is the original TraceDatum (span.meta), not the NormalizedSpan', () => {
    expect(event.datum).toBe(meta); // same reference — no copy
    expect(event.datum).not.toBe(span); // not the internal NormalizedSpan
  });

  it('includes parentId when set', () => {
    const child: NormalizedSpan = { ...span, id: 'c1', parentId: 'span-1' };
    const childEvent = buildTraceEvent(child);
    expect(childEvent.parentId).toBe('span-1');
  });

  it('exposes skew provenance only for corrected spans', () => {
    expect(buildTraceEvent({ ...span, skewCorrected: true }).skewCorrected).toBe(true);
    expect(event).not.toHaveProperty('skewCorrected');
  });

  it('exposes orphan provenance (id only) while keeping the recorded parentId (Spec 26)', () => {
    const orphanEvent = buildTraceEvent({
      ...span,
      id: 'o1',
      parentId: 'missing',
      orphaned: true,
      reparentedToSpanId: 'root',
    });
    expect(orphanEvent.orphaned).toBe(true);
    expect(orphanEvent.reparentedToSpanId).toBe('root');
    expect(orphanEvent.parentId).toBe('missing'); // recorded (missing) parent, not the synthetic one
  });

  it('omits orphan provenance for a non-orphan span', () => {
    expect(event).not.toHaveProperty('orphaned');
    expect(event).not.toHaveProperty('reparentedToSpanId');
  });
});

describe('buildTraceSelectionDetail', () => {
  it('exposes skew provenance while keeping the original datum unchanged', () => {
    const detail = buildTraceSelectionDetail({ ...span, skewCorrected: true }, DOMAIN_MIN, 'span', -1);

    expect(detail.skewCorrected).toBe(true);
    expect(detail.datum).toBe(meta);
    expect(detail.datum).not.toHaveProperty('skewCorrected');
  });

  it('omits skew provenance for an uncorrected span', () => {
    expect(buildTraceSelectionDetail(span, DOMAIN_MIN, 'span', -1)).not.toHaveProperty('skewCorrected');
  });

  it('exposes orphan provenance and keeps the recorded parentId (Spec 26)', () => {
    const detail = buildTraceSelectionDetail(
      { ...span, id: 'o1', parentId: 'missing', orphaned: true, reparentedToSpanId: 'root' },
      DOMAIN_MIN,
      'span',
      -1,
    );
    expect(detail.orphaned).toBe(true);
    expect(detail.reparentedToSpanId).toBe('root');
    expect(detail.parentId).toBe('missing');
  });

  it('omits orphan provenance for a non-orphan span', () => {
    const detail = buildTraceSelectionDetail(span, DOMAIN_MIN, 'span', -1);
    expect(detail).not.toHaveProperty('orphaned');
    expect(detail).not.toHaveProperty('reparentedToSpanId');
  });
});

describe('buildTraceTooltipInfo — partial-trace disclosure (Spec 26)', () => {
  it('adds a Missing parent row and a Displayed under row (resolved name) for a reparented orphan', () => {
    const orphan: NormalizedSpan = {
      ...span,
      id: 'o1',
      parentId: 'missing',
      orphaned: true,
      reparentedToSpanId: 'root',
    };
    const info = buildTraceTooltipInfo(orphan, 0, DOMAIN_MIN, 'span', COLOR, -1, undefined, 'root span');
    expect(info.values.find(({ label }) => label === 'Trace context')).toMatchObject({ value: 'Missing parent' });
    expect(info.values.find(({ label }) => label === 'Displayed under')).toMatchObject({ value: 'root span' });
  });

  it('falls back to the reparent id when no display-parent name is supplied', () => {
    const orphan: NormalizedSpan = {
      ...span,
      id: 'o1',
      parentId: 'missing',
      orphaned: true,
      reparentedToSpanId: 'root',
    };
    const info = buildTraceTooltipInfo(orphan, 0, DOMAIN_MIN, 'span', COLOR, -1);
    expect(info.values.find(({ label }) => label === 'Displayed under')).toMatchObject({ value: 'root' });
  });

  it('adds a Display placement row for a fallback root and no Displayed under row', () => {
    const fallback: NormalizedSpan = { ...span, id: 'o1', parentId: 'missing', orphaned: true, fallbackRoot: true };
    const info = buildTraceTooltipInfo(fallback, 0, DOMAIN_MIN, 'span', COLOR, -1);
    expect(info.values.find(({ label }) => label === 'Trace context')).toMatchObject({ value: 'Missing parent' });
    expect(info.values.find(({ label }) => label === 'Display placement')).toMatchObject({
      value: 'Used as display root',
    });
    expect(info.values.find(({ label }) => label === 'Displayed under')).toBeUndefined();
  });

  it('adds no disclosure rows for a non-orphan span', () => {
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'span', COLOR, -1);
    expect(info.values.find(({ label }) => label === 'Trace context')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// isTraceElementEvent type-guard
// ---------------------------------------------------------------------------

describe('isTraceElementEvent', () => {
  it('returns true for a TraceElementEvent', () => {
    expect(isTraceElementEvent(buildTraceEvent(span))).toBe(true);
  });

  it('returns false for a FlameLayerValue', () => {
    expect(isTraceElementEvent({ vmIndex: 0 })).toBe(false);
  });

  it('returns false for a MetricElementEvent', () => {
    expect(isTraceElementEvent({ type: 'metricElementEvent', rowIndex: 0, columnIndex: 0 })).toBe(false);
  });

  it('returns false for an XYChartElementEvent (tuple)', () => {
    expect(isTraceElementEvent([{} as any, {} as any])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Spec 22 — Critical path row in tooltip
// ---------------------------------------------------------------------------

describe('buildTraceTooltipInfo — critical path row', () => {
  it('appends a "Critical path" row when criticalIntervals is non-empty', () => {
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'active', COLOR, 0, [
      { start: 100, end: 200 },
      { start: 300, end: 350 },
    ]);
    const labels = info.values.map((v) => v.label);
    expect(labels).toContain('Critical path');
    const cpRow = info.values.find((v) => v.label === 'Critical path')!;
    // 100 ms + 50 ms = 150 ms total coverage
    expect(cpRow.value).toBe(150);
    expect(cpRow.formattedValue).toBe('150.00 ms');
  });

  it('omits the "Critical path" row when criticalIntervals is empty', () => {
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'active', COLOR, 0, []);
    expect(info.values.map((v) => v.label)).not.toContain('Critical path');
  });

  it('omits the "Critical path" row when criticalIntervals is undefined (default)', () => {
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'active', COLOR, 0);
    expect(info.values.map((v) => v.label)).not.toContain('Critical path');
  });

  it('appends "Critical path" after the other rows (last row)', () => {
    const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'active', COLOR, 0, [{ start: 100, end: 300 }]);
    const labels = info.values.map((v) => v.label);
    expect(labels.at(-1)).toBe('Critical path');
  });
});

// ---------------------------------------------------------------------------
// Spec 19 — formatMs ns branch (ADR 0010)
// ---------------------------------------------------------------------------

describe('formatMs — nanosecond branch', () => {
  it('formats 1e-6 ms (1 ns) as "1 ns"', () => {
    expect(formatMs(1e-6)).toBe('1 ns');
  });

  it('formats 5e-6 ms (5 ns) as "5 ns"', () => {
    expect(formatMs(5e-6)).toBe('5 ns');
  });

  it('formats 5e-4 ms (500 ns) as "500 ns"', () => {
    // 5e-4 ms = 0.5 µs = 500 ns — below the 1e-3 ms µs threshold
    expect(formatMs(5e-4)).toBe('500 ns');
  });

  it('formats 1e-3 ms (1 µs) as "1 µs" (µs boundary)', () => {
    expect(formatMs(1e-3)).toBe('1 μs');
  });

  it('formats 1.5 ms as "1.50 ms" (unchanged)', () => {
    expect(formatMs(1.5)).toBe('1.50 ms');
  });

  it('formats 1500 ms as "1.50 s" (unchanged)', () => {
    expect(formatMs(1500)).toBe('1.50 s');
  });
});
