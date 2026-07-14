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
 * Covers: `buildTraceTooltipInfo` derived values, datum identity, State row;
 * `buildTraceEvent` shape and type-guard; `isTraceElementEvent`.
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
  active: [
    { start: 100, end: 200 }, // 100 ms
    { start: 500, end: 550 }, // 50 ms  → self time = 150 ms total
  ],
  meta,
};

const DOMAIN_MIN = 50; // domain starts before span so startOffset = 100 - 50 = 50 ms
const COLOR = '#7B61FF';

// ---------------------------------------------------------------------------
// buildTraceTooltipInfo
// ---------------------------------------------------------------------------

describe('buildTraceTooltipInfo', () => {
  const info = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'active', COLOR);

  it('has a null header', () => {
    expect(info.header).toBeNull();
  });

  it('contains exactly 5 rows', () => {
    expect(info.values).toHaveLength(5);
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

  it('Start offset row = span.start - domainMin', () => {
    const row = info.values[3]!;
    expect(row.label).toBe('Start');
    expect(row.value).toBe(50); // 100 - 50
    expect(row.formattedValue).toBe('+50.00 ms');
  });

  it('State row reflects the passed region', () => {
    expect(info.values[4]!.formattedValue).toBe('Active');

    const waitingInfo = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'waiting', COLOR);
    expect(waitingInfo.values[4]!.formattedValue).toBe('Waiting');

    const emptyInfo = buildTraceTooltipInfo(span, 0, DOMAIN_MIN, 'empty', COLOR);
    expect(emptyInfo.values[4]!.formattedValue).toBe('—');
  });

  it('each row carries the full NormalizedSpan as datum (no cast needed)', () => {
    for (const row of info.values) {
      expect(row.datum).toBe(span); // identity — same reference
    }
  });

  it('spans with no active segments report self time = 0', () => {
    const noActive: NormalizedSpan = { ...span, active: [] };
    const noActiveInfo = buildTraceTooltipInfo(noActive, 0, DOMAIN_MIN, 'waiting', COLOR);
    expect(noActiveInfo.values[2]!.value).toBe(0);
  });

  it('formats values >= 1000 ms as seconds', () => {
    const longSpan: NormalizedSpan = { ...span, start: 0, end: 2500, active: [] };
    const longInfo = buildTraceTooltipInfo(longSpan, 0, 0, 'empty', COLOR);
    expect(longInfo.values[1]!.formattedValue).toBe('2.50 s');
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
    expect(event.selfTime).toBe(150); // Σ active
  });

  it('datum is the original meta (TraceDatum | OtelSpan), not the NormalizedSpan', () => {
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
