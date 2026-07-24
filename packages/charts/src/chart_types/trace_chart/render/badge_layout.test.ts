/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeBadgeGutterWidth, layoutBadges, resolveBadgeAriaLabel } from './badge_layout';
import type { BadgeTextMeasurer } from './badge_layout';
import { DEFAULT_TRACE_BADGE_STYLE, LANE_PADDING } from './types';
import type { TraceGeometry, TraceStyle } from './types';
import type { NormalizedSpan } from '../data/types';
import type { TraceDatum, TraceSpanBadge } from '../trace_api';

// Deterministic measurer: width proportional to length × font size (no real canvas).
const measure: BadgeTextMeasurer = (text, fontSize) => text.length * fontSize * 0.6;

const baseStyle = (labelPosition: TraceStyle['labelPosition']): TraceStyle =>
  ({
    gutterWidth: 200,
    timeBarHeight: 32,
    timeAxisLayerCount: 2,
    laneHeight: 24,
    totalLineThickness: 2,
    totalLineColor: '#000',
    activeSegmentColor: '#000',
    gutterLabel: { fontFamily: 'x', fontSize: 10, color: '#000' },
    labelPosition,
    timeBarLabel: { fontFamily: 'x', fontSize: 10, color: '#000' },
    gridLineColor: '#000',
    focusedLaneBackground: '#000',
    selectedSegmentStroke: '#000',
    selectedSegmentStrokeWidth: 2,
    criticalPathColor: '#000',
    criticalPathThickness: 2,
    badge: DEFAULT_TRACE_BADGE_STYLE,
  }) as TraceStyle;

const span = (id: string, badges: TraceSpanBadge[], name = id, start = 0, end = 100): NormalizedSpan => {
  const meta = { id, name, start, end } as TraceDatum;
  return { id, name, start, end, activeSegments: [], badges, meta };
};

/**
 * Builds a geometry with the plot right edge at x=800, one lane, and a caller-supplied scale.
 * `plotOverride` narrows the plot to force overflow in the truncation test.
 */
const geom = (
  spans: NormalizedSpan[],
  scale: (t: number) => number,
  labelPosition: TraceStyle['labelPosition'],
  plotOverride?: { left: number; width: number },
): TraceGeometry =>
  ({
    spans,
    gutter: { top: 0, left: 0, width: labelPosition === 'gutter' ? 200 : 0, height: 300 },
    timeBar: { top: 0, left: 200, width: 600, height: 32 },
    plot: {
      top: 32,
      left: plotOverride?.left ?? (labelPosition === 'none' ? 260 : 200),
      width: plotOverride?.width ?? (labelPosition === 'none' ? 540 : 600),
      height: 268,
    },
    laneHeight: 24,
    // Mirrors buildGeometry: inline grows the label row to the taller of the label font (10) and the
    // active 'm' badge (20); gutter/none have no label band. Inline tests here all use the 'm' size.
    labelBandPx: labelPosition === 'inline' ? Math.max(10, DEFAULT_TRACE_BADGE_STYLE.m.height) + LANE_PADDING : 0,
    domain: { min: 0, max: 100 },
    focusDomain: { min: 0, max: 100 },
    scrollOffset: 0,
    xScaleType: 'linear',
    focusedLaneIndex: null,
    resolvedSelection: [],
    scale,
    emptyMessage: null,
    disclosureByLane: new Map(),
    criticalIntervalsByLane: new Map(),
    badgesByLane: new Map(),
  }) as TraceGeometry;

describe('resolveBadgeAriaLabel', () => {
  it('prefers an explicit ariaLabel', () => {
    expect(resolveBadgeAriaLabel({ id: '1', text: 'GET', ariaLabel: 'HTTP method' }, 0)).toBe('HTTP method');
  });
  it('falls back to visible (trimmed) text', () => {
    expect(resolveBadgeAriaLabel({ id: '1', text: '  200 ' }, 0)).toBe('200');
  });
  it('generates a name for an image-only badge', () => {
    expect(resolveBadgeAriaLabel({ id: '1', image: { src: 'i.svg' } }, 2)).toBe('Badge 3');
  });
});

describe('layoutBadges — inline', () => {
  const inlineScale = (t: number) => 200 + t; // start=0 → x=200 (plot.left)

  it('places badges after the inline label, in accessor order, with no shift when they fit', () => {
    const badges: TraceSpanBadge[] = [
      { id: 'a', text: 'GET' },
      { id: 'b', text: '200' },
    ];
    const g = geom([span('s', badges, 'root', 0, 50)], inlineScale, 'inline');
    const out = layoutBadges(g, baseStyle('inline'), 'm', measure, measure, 0, 0);
    const lane = out.get(0)!;
    expect(lane).toBeDefined();
    expect(lane.labelX).toBeUndefined(); // no overflow → no shift
    expect(lane.items.map((i) => i.badge.id)).toEqual(['a', 'b']);
    expect(lane.items[0]!.x).toBeLessThan(lane.items[1]!.x); // left → right
    // First badge starts after the label text width + labelGap from the bar start (x=200).
    expect(lane.items[0]!.x).toBeGreaterThan(200);
  });

  it('shifts the label+badges group left when it would overflow the right edge', () => {
    const badges: TraceSpanBadge[] = [{ id: 'a', text: 'GETGETGET' }];
    // Bar starts near the right edge (x=770) so the group overflows plotRight (800).
    const g = geom([span('s', badges, 'root', 0, 10)], () => 770, 'inline');
    const out = layoutBadges(g, baseStyle('inline'), 'm', measure, measure, 0, 0);
    const lane = out.get(0)!;
    expect(lane.labelX).toBeDefined();
    expect(lane.labelX!).toBeLessThan(770); // pushed left of the bar start
    const last = lane.items.at(-1)!;
    expect(last.x + last.width).toBeLessThanOrEqual(800); // stays within the plot right edge
  });

  it('truncates then omits trailing badges that do not fit', () => {
    const badges: TraceSpanBadge[] = [
      { id: 'a', text: 'aaaaaaaaaa' },
      { id: 'b', text: 'bbbbbbbbbb' },
      { id: 'c', text: 'cccccccccc' },
    ];
    // Narrow plot ([200, 350]) so the three full badges cannot all fit even after a left shift.
    const g = geom([span('s', badges, 'root', 0, 10)], () => 200, 'inline', { left: 200, width: 150 });
    const out = layoutBadges(g, baseStyle('inline'), 'm', measure, measure, 0, 0);
    const lane = out.get(0)!;
    // Not all three can fit → fewer than 3 survive, and any truncated one ends with an ellipsis.
    expect(lane.items.length).toBeLessThan(3);
    for (const item of lane.items) {
      if (item.text && item.text.length < 10) expect(item.text.endsWith('…')).toBe(true);
    }
    // Every surviving badge stays within the plot right edge.
    for (const item of lane.items) expect(item.x + item.width).toBeLessThanOrEqual(350);
  });
});

describe('layoutBadges — participation & modes', () => {
  it('only lays out badges whose visibleIn includes the current label position', () => {
    const badges: TraceSpanBadge[] = [
      { id: 'inl', text: 'inline-only', visibleIn: ['inline'] },
      { id: 'gut', text: 'gutter-only', visibleIn: ['gutter'] },
    ];
    const gutterGeom = geom([span('s', badges)], () => 200, 'gutter');
    const out = layoutBadges(gutterGeom, baseStyle('gutter'), 'm', measure, measure, 0, 0);
    const lane = out.get(0)!;
    expect(lane.items.map((i) => i.badge.id)).toEqual(['gut']);
  });

  it('lays out gutter badges beside the label, vertically centered and right-aligned', () => {
    const g = geom([span('s', [{ id: 'a', text: 'x' }])], () => 200, 'gutter');
    const out = layoutBadges(g, baseStyle('gutter'), 'm', measure, measure, 0, 0);
    const item = out.get(0)!.items[0]!;
    expect(item.x).toBeGreaterThanOrEqual(0);
    expect(item.x + item.width).toBeLessThanOrEqual(200); // inside the 200px gutter
    // Right-aligned against the gutter's inner right edge, leaving the left side for the label.
    expect(item.x + item.width).toBeGreaterThan(200 / 2);
    // Shares the label's mid-line (lane center), so it never spills into the row below.
    const laneCenter = 32 + 24 / 2; // plot.top + laneHeight/2
    expect(item.y + item.height / 2).toBeCloseTo(laneCenter);
  });

  it('lays out none-mode badges in the fixed badge-only gutter (scale-independent)', () => {
    const badges: TraceSpanBadge[] = [{ id: 'a', text: 'js', visibleIn: ['none'] }];
    const g = geom([span('s', badges)], () => 999, 'none'); // scale is irrelevant in none mode
    const out = layoutBadges(g, baseStyle('none'), 'm', measure, measure, 0, 0);
    const item = out.get(0)!.items[0]!;
    // Between the disclosure gutter (0) and the plot left (260).
    expect(item.x).toBeGreaterThanOrEqual(0);
    expect(item.x + item.width).toBeLessThanOrEqual(260);
  });

  it('skips lanes whose badges do not participate', () => {
    const badges: TraceSpanBadge[] = [{ id: 'a', text: 'x', visibleIn: ['gutter'] }];
    const g = geom([span('s', badges)], () => 200, 'inline');
    const out = layoutBadges(g, baseStyle('inline'), 'm', measure, measure, 0, 0);
    expect(out.has(0)).toBe(false);
  });
});

describe('layoutBadges — one badge size across lanes', () => {
  it('applies a single badge size to every lane and steps lanes down by laneHeight', () => {
    const spans = [
      span('s0', [{ id: 'a', text: 'x' }], 's0'),
      span('s1', [{ id: 'b', text: 'x' }], 's1'),
      span('s2', [{ id: 'c', text: 'x' }], 's2'),
    ];
    const g = geom(spans, () => 200, 'gutter');
    const out = layoutBadges(g, baseStyle('gutter'), 's', measure, measure, 0, 2);

    const items = [0, 1, 2].map((i) => out.get(i)!.items[0]!);
    // Every lane's badge shares the 's' metrics — one library-fixed size, no per-lane variation.
    const sMetrics = DEFAULT_TRACE_BADGE_STYLE.s;
    for (const item of items) {
      expect(item.height).toBe(sMetrics.height);
      expect(item.fontSize).toBe(sMetrics.fontSize);
    }
    // Lanes are stacked: each badge sits exactly laneHeight (24) below the previous.
    expect(items[1]!.y - items[0]!.y).toBe(24);
    expect(items[2]!.y - items[1]!.y).toBe(24);
  });
});

describe('computeBadgeGutterWidth', () => {
  it('is zero when label position is not none', () => {
    const spans = [span('s', [{ id: 'a', text: 'x', visibleIn: ['none'] }])];
    expect(computeBadgeGutterWidth(spans, baseStyle('gutter'), 'm', measure)).toBe(0);
  });

  it('is zero when no badge participates in none', () => {
    const spans = [span('s', [{ id: 'a', text: 'x', visibleIn: ['inline'] }])];
    expect(computeBadgeGutterWidth(spans, baseStyle('none'), 'm', measure)).toBe(0);
  });

  it('sizes to the widest none-participating cluster across all spans', () => {
    const spans = [
      span('s1', [{ id: 'a', text: 'x', visibleIn: ['none'] }]),
      span('s2', [{ id: 'b', text: 'a much wider badge label', visibleIn: ['none'] }]),
    ];
    const width = computeBadgeGutterWidth(spans, baseStyle('none'), 'm', measure);
    expect(width).toBeGreaterThan(0);
    expect(width).toBeLessThanOrEqual(240); // capped
  });
});
