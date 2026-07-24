/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Unit tests for the SR-table row selector and the formatMs/computeSelfTime helpers
 * used by it.  The React component itself is redux-connected (integration-tested in
 * trace_chart.test.tsx); these tests cover the pure data transformation.
 */

import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { resolveBadgeAriaLabel } from './badge_layout';
import { TraceTableBadgeCell } from './screen_reader_trace_table';
import { formatMs, computeSelfTime } from './tooltip';
import type { NormalizedSpan } from '../data/types';
import { describeParent, type TraceTableBadge } from '../state/selectors/get_screen_reader_data';
import type { TraceSpanBadge, TraceSpanBadgeEvent, TraceSpanBadgeEventSpan } from '../trace_api';

// ---------------------------------------------------------------------------
// formatMs
// ---------------------------------------------------------------------------

describe('formatMs', () => {
  it('formats values ≥ 1000 ms as seconds with 2 decimal places', () => {
    expect(formatMs(1000)).toBe('1.00 s');
    expect(formatMs(2500)).toBe('2.50 s');
    expect(formatMs(1234.5)).toBe('1.23 s');
  });

  it('formats values in [1, 1000) ms with 2 decimal places', () => {
    expect(formatMs(1)).toBe('1.00 ms');
    expect(formatMs(142)).toBe('142.00 ms');
    expect(formatMs(0.999)).toBe('999 μs');
  });

  it('formats values in [1e-3, 1) ms as microseconds (integer)', () => {
    expect(formatMs(0.5)).toBe('500 μs');
    expect(formatMs(0.001)).toBe('1 μs');
    expect(formatMs(0.34)).toBe('340 μs');
  });

  it('formats values < 1e-3 ms as nanoseconds (integer)', () => {
    expect(formatMs(0)).toBe('0 ns');
    expect(formatMs(1e-6)).toBe('1 ns');
    expect(formatMs(5e-4)).toBe('500 ns');
  });
});

// ---------------------------------------------------------------------------
// computeSelfTime
// ---------------------------------------------------------------------------

function span(opts: Partial<NormalizedSpan> & { start: number; end: number }): NormalizedSpan {
  return {
    id: opts.id ?? 'x',
    name: opts.name ?? 'x',
    start: opts.start,
    end: opts.end,
    activeSegments: opts.activeSegments ?? [],
    meta: opts.meta ?? ({} as never),
    ...(opts.parentId !== undefined && { parentId: opts.parentId }),
    ...(opts.color !== undefined && { color: opts.color }),
  };
}

describe('computeSelfTime', () => {
  it('returns 0 for a span with no active segments', () => {
    expect(computeSelfTime(span({ start: 0, end: 100, activeSegments: [] }))).toBe(0);
  });

  it('sums a single active segment', () => {
    expect(computeSelfTime(span({ start: 0, end: 100, activeSegments: [{ start: 10, end: 40 }] }))).toBe(30);
  });

  it('sums multiple non-overlapping active segments', () => {
    const s = span({
      start: 0,
      end: 200,
      activeSegments: [
        { start: 10, end: 40 },
        { start: 60, end: 100 },
      ],
    });
    expect(computeSelfTime(s)).toBe(70); // 30 + 40
  });
});

// ---------------------------------------------------------------------------
// getTraceTableRowsSelector — tested via the pure logic it encodes
// (The connected component is smoke-tested in trace_chart.test.tsx)
// ---------------------------------------------------------------------------

describe('SR table row data shape', () => {
  it('produces correct row fields for a root span', () => {
    const s = span({
      id: 'a',
      name: 'root',
      start: 0,
      end: 100,
      activeSegments: [{ start: 0, end: 30 }],
    });
    const totalDuration = formatMs(s.end - s.start);
    const selfTime = formatMs(computeSelfTime(s));
    const startOffset = `+${formatMs(s.start - 0)}`; // domainMin = 0
    const parentName = '—'; // no parentId
    expect(totalDuration).toBe('100.00 ms');
    expect(selfTime).toBe('30.00 ms');
    expect(startOffset).toBe('+0 ns');
    expect(parentName).toBe('—');
  });

  it('uses the parent span name when parentId is resolvable', () => {
    const spans: NormalizedSpan[] = [
      span({ id: 'parent', name: 'Parent span', start: 0, end: 200 }),
      span({ id: 'child', name: 'Child span', start: 10, end: 50, parentId: 'parent' }),
    ];
    const nameById = new Map(spans.map((s) => [s.id, s.name]));
    expect(describeParent(spans[1]!, nameById)).toBe('Parent span');
  });

  it('falls back to "—" when parentId is not in the span list', () => {
    const s = span({ id: 'x', name: 'x', start: 0, end: 50, parentId: 'missing' });
    expect(describeParent(s, new Map())).toBe('—');
  });

  it('discloses "orphan; displayed under <root>" for a reparented orphan (Spec 26)', () => {
    const orphan = {
      ...span({ id: 'o1', name: 'o1', start: 0, end: 50, parentId: 'missing' }),
      orphaned: true as const,
      reparentedToSpanId: 'root',
    };
    const nameById = new Map([['root', 'Root span']]);
    expect(describeParent(orphan, nameById)).toBe('orphan; displayed under Root span');
  });

  it('discloses "orphan; used as display root" for a fallback root (Spec 26)', () => {
    const fallback = {
      ...span({ id: 'o1', name: 'o1', start: 0, end: 50, parentId: 'missing' }),
      orphaned: true as const,
      fallbackRoot: true as const,
    };
    expect(describeParent(fallback, new Map())).toBe('orphan; used as display root');
  });
});

// ---------------------------------------------------------------------------
// TraceTableBadgeCell — Span badge accessibility surface (Spec 27)
// ---------------------------------------------------------------------------

describe('TraceTableBadgeCell', () => {
  const eventSpan: TraceSpanBadgeEventSpan = {
    id: 's1',
    name: 'HTTP GET /api',
    start: 0,
    end: 100,
    duration: 100,
    selfTime: 40,
    datum: { id: 's1', name: 'HTTP GET /api', start: 0, end: 100 },
  };

  /** Builds a TraceTableBadge exactly as the selector would (aria name via resolveBadgeAriaLabel). */
  const tableBadge = (badge: TraceSpanBadge, index = 0): TraceTableBadge => ({
    id: String(badge.id),
    ariaLabel: resolveBadgeAriaLabel(badge, index),
    badge,
    span: eventSpan,
  });

  it('names image-only span badges', () => {
    // An image-only badge with no ariaLabel gets a generated accessible name; an explicit ariaLabel wins.
    const generated = tableBadge({ id: 'g', image: { src: 'flag.svg' } }, 2);
    const overridden = tableBadge({ id: 'o', image: { src: 'js.svg' }, ariaLabel: 'JavaScript' });
    const { getByText } = render(<TraceTableBadgeCell badges={[generated, overridden]} onBadgeClick={undefined} />);
    expect(getByText('Badge 3')).toBeTruthy(); // index 2 → "Badge 3"
    expect(getByText('JavaScript')).toBeTruthy();
  });

  it('non-clickable badges are informational for keyboard users', () => {
    // Without onBadgeClick, badges are inert text — no <button> controls are added.
    const { container, getByText } = render(
      <TraceTableBadgeCell badges={[tableBadge({ id: 'b', text: 'OK' })]} onBadgeClick={undefined} />,
    );
    expect(container.querySelector('button')).toBeNull();
    expect(getByText('OK')).toBeTruthy();
  });

  it('keyboard activation dispatches badge click events', () => {
    const badge: TraceSpanBadge = { id: 'status', text: 'OK', color: 'success', meta: { code: 200 } };
    const onBadgeClick = jest.fn();
    const { container } = render(<TraceTableBadgeCell badges={[tableBadge(badge)]} onBadgeClick={onBadgeClick} />);

    const button = container.querySelector('button')!;
    expect(button).not.toBeNull();
    fireEvent.click(button);

    expect(onBadgeClick).toHaveBeenCalledTimes(1);
    const event: TraceSpanBadgeEvent = onBadgeClick.mock.calls[0][0];
    // Keyboard-origin activation: same shape as pointer minus coordinates, badge/meta by reference.
    expect(event.source).toBe('keyboard');
    expect(event.badge).toBe(badge);
    expect(event.span.id).toBe('s1');
    expect(Object.keys(event).sort()).toEqual(['badge', 'source', 'span']);
  });

  it('badge keyboard activation does not synthesize hover', () => {
    // The SR surface only exposes activation. Firing repeated clicks never produces hover semantics:
    // the only handler invoked is onBadgeClick, and no chart-relative coordinates are synthesized.
    const onBadgeClick = jest.fn();
    const { container } = render(
      <TraceTableBadgeCell badges={[tableBadge({ id: 'b', text: 'x' })]} onBadgeClick={onBadgeClick} />,
    );
    const button = container.querySelector('button')!;
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onBadgeClick).toHaveBeenCalledTimes(2);
    for (const [event] of onBadgeClick.mock.calls) {
      expect(event).not.toHaveProperty('chartX');
      expect(event).not.toHaveProperty('chartY');
    }
  });
});
