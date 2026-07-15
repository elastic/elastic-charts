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

import { buildTraceTooltipInfo, buildTraceEvent } from './tooltip';
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
    expect(event.datum).toBe(meta);    // same reference — no copy
    expect(event.datum).not.toBe(span); // not the internal NormalizedSpan
  });

  it('includes parentId when set', () => {
    const child: NormalizedSpan = { ...span, id: 'c1', parentId: 'span-1' };
    const childEvent = buildTraceEvent(child);
    expect(childEvent.parentId).toBe('span-1');
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
