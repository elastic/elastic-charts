/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildGeometry } from './geometry';
import { TICK_LAYER_PADDING, TICK_LAYER_BOTTOM_INSET } from './time_bar';
import type { NormalizedSpan } from '../data/types';
import type { DisclosureEntry, TraceStyle } from './types';
import { CARET_GLYPH_PX, CARET_INDENT_STEP_PX, gutterPx } from './types';

const style: TraceStyle = {
  gutterWidth: 200,
  timeBarHeight: 32,
  timeAxisLayerCount: 2,
  laneHeight: 24,
  totalLineThickness: 2,
  totalLineColor: '#ccc',
  activeSegmentColor: '#007',
  gutterLabel: { fontFamily: 'monospace', fontSize: 11, color: '#333' },
  timeBarLabel: { fontFamily: 'monospace', fontSize: 11, color: '#333' },
  gridLineColor: '#eee',
  focusedLaneBackground: 'rgba(96,146,192,0.15)',
  selectedSegmentStroke: '#f00',
  selectedSegmentStrokeWidth: 2,
  criticalPathColor: '#C61E25',
  criticalPathThickness: 2,
  labelPosition: 'gutter',
};

function span(id: string, start: number, end: number): NormalizedSpan {
  return { id, name: id, start, end, activeSegments: [], meta: {} as never };
}

const canvasSize = { width: 1000, height: 600 };
// focusDomain = full domain for these tests
const focusDomain = { min: 0, max: 1000 };

describe('buildGeometry', () => {
  // Pre-sorted ascending by start — callers (the pipeline cache) own sorting.
  const spans = [span('a', 100, 400), span('c', 200, 300), span('b', 500, 800)];
  const domain = { min: 100, max: 800 }; // full extent of the spans above

  it('passes spans through unchanged (pre-sorted by caller)', () => {
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    const starts = geom.spans.map((s) => s.start);
    expect(starts).toEqual([100, 200, 500]);
  });

  it('does not mutate the input spans array', () => {
    const inputOrder = spans.map((s) => s.id);
    buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    expect(spans.map((s) => s.id)).toEqual(inputOrder);
  });

  it('gutter + plot widths partition the canvas width', () => {
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    expect(geom.gutter.width + geom.plot.width).toBe(canvasSize.width);
  });

  it('timeBar + plot heights partition the canvas height', () => {
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    expect(geom.timeBar.height + geom.plot.height).toBe(canvasSize.height);
  });

  it('gutter occupies the full left column', () => {
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    expect(geom.gutter).toEqual({ top: 0, left: 0, width: style.gutterWidth, height: canvasSize.height });
  });

  it('timeBar sits above the plot, right of the gutter', () => {
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    expect(geom.timeBar.top).toBe(0);
    expect(geom.timeBar.left).toBe(style.gutterWidth);
    expect(geom.timeBar.height).toBe(style.timeBarHeight);
  });

  it('plot is in the bottom-right quadrant', () => {
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    expect(geom.plot.top).toBe(style.timeBarHeight);
    expect(geom.plot.left).toBe(style.gutterWidth);
  });

  it('scale maps focusDomain.min → plot.left', () => {
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    expect(geom.scale(focusDomain.min)).toBeCloseTo(geom.plot.left);
  });

  it('scale maps focusDomain.max → plot.left + plot.width (right edge)', () => {
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    expect(geom.scale(focusDomain.max)).toBeCloseTo(geom.plot.left + geom.plot.width);
  });

  it('scale maps a midpoint linearly', () => {
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    const mid = (focusDomain.min + focusDomain.max) / 2;
    expect(geom.scale(mid)).toBeCloseTo(geom.plot.left + geom.plot.width / 2);
  });

  it('lane y = index * laneHeight - scrollOffset', () => {
    const scrollOffset = 50;
    const geom = buildGeometry(spans, canvasSize, focusDomain, scrollOffset, style, 'linear', domain);
    expect(geom.laneHeight).toBe(style.laneHeight);
    expect(geom.scrollOffset).toBe(scrollOffset);
    // Callers compute: y = plot.top + index * laneHeight - scrollOffset
    // Verify the fields are correct:
    expect(2 * geom.laneHeight - geom.scrollOffset).toBe(2 * 24 - 50);
  });

  it('domain is passed through unchanged from the pipeline', () => {
    // domain is pre-computed by normalize() and passed in; buildGeometry no longer reduces over spans.
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    expect(geom.domain).toEqual({ min: 100, max: 800 });
  });

  it('focusDomain is passed through unchanged', () => {
    const custom = { min: 200, max: 600 };
    const geom = buildGeometry(spans, canvasSize, custom, 0, style, 'linear', domain);
    expect(geom.focusDomain).toEqual(custom);
  });

  it('xScaleType is threaded through to the geometry', () => {
    const geomTime = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'time', domain);
    const geomLinear = buildGeometry(spans, canvasSize, focusDomain, 0, style, 'linear', domain);
    expect(geomTime.xScaleType).toBe('time');
    expect(geomLinear.xScaleType).toBe('linear');
  });

  it('gutterWidth=0: plot occupies the full canvas width and plot.left is 0', () => {
    // Spec 17 — gutterWidth=0 is the typical companion to labelPosition='inline'.
    // The Math.max(0, canvasWidth - gutterWidth) guard already handles this; verify it.
    const inlineStyle: TraceStyle = { ...style, gutterWidth: 0, labelPosition: 'inline' };
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, inlineStyle, 'linear', domain);
    expect(geom.plot.width).toBe(canvasSize.width);
    expect(geom.plot.left).toBe(0);
    expect(geom.gutter.width).toBe(0);
    // Hit-test invariant: scale maps focusDomain.min → 0 (= plot.left).
    expect(geom.scale(focusDomain.min)).toBeCloseTo(0);
    expect(geom.scale(focusDomain.max)).toBeCloseTo(canvasSize.width);
  });

  it('empty spans produce a zero domain and a valid (no-throw) scale', () => {
    const zeroDomain = { min: 0, max: 0 };
    const geom = buildGeometry([], canvasSize, focusDomain, 0, style, 'linear', zeroDomain);
    expect(geom.domain).toEqual({ min: 0, max: 0 });
    expect(() => geom.scale(500)).not.toThrow();
  });

  it('zero-width focusDomain guard → scale always returns plot.left without throwing', () => {
    const zeroFocus = { min: 500, max: 500 };
    const geom = buildGeometry(spans, canvasSize, zeroFocus, 0, style, 'linear', domain);
    expect(geom.scale(500)).toBe(geom.plot.left);
    expect(geom.scale(0)).toBe(geom.plot.left);
  });
});

// ---------------------------------------------------------------------------
// gutterPx — caret column extension (Spec 21)
// ---------------------------------------------------------------------------

describe('gutterPx', () => {
  const gutterStyle: TraceStyle = { ...style, labelPosition: 'gutter' };
  const inlineStyle: TraceStyle = { ...style, labelPosition: 'inline' };
  const noneStyle: TraceStyle = { ...style, labelPosition: 'none' };

  it('gutter mode, no parents → gutterWidth unchanged', () => {
    expect(gutterPx(gutterStyle)).toBe(style.gutterWidth);
    expect(gutterPx(gutterStyle, { hasParents: false })).toBe(style.gutterWidth);
  });

  it('inline mode, no parents → 0', () => {
    expect(gutterPx(inlineStyle)).toBe(0);
    expect(gutterPx(inlineStyle, { hasParents: false })).toBe(0);
  });

  it('none mode, no parents → 0', () => {
    expect(gutterPx(noneStyle)).toBe(0);
  });

  it('gutter mode, hasParents, maxDepth=0 → gutterWidth + CARET_GLYPH_PX', () => {
    expect(gutterPx(gutterStyle, { hasParents: true, maxDepth: 0 })).toBe(style.gutterWidth + CARET_GLYPH_PX);
  });

  it('gutter mode, hasParents, maxDepth=3 → gutterWidth + CARET_GLYPH_PX + 3×CARET_INDENT_STEP_PX', () => {
    expect(gutterPx(gutterStyle, { hasParents: true, maxDepth: 3 })).toBe(style.gutterWidth + CARET_GLYPH_PX + 3 * CARET_INDENT_STEP_PX);
  });

  it('inline mode, hasParents, maxDepth=0 → CARET_GLYPH_PX (no label gutter, but caret reserved)', () => {
    expect(gutterPx(inlineStyle, { hasParents: true, maxDepth: 0 })).toBe(CARET_GLYPH_PX);
  });

  it('none mode, hasParents, maxDepth=2 → CARET_GLYPH_PX + 2×CARET_INDENT_STEP_PX', () => {
    expect(gutterPx(noneStyle, { hasParents: true, maxDepth: 2 })).toBe(CARET_GLYPH_PX + 2 * CARET_INDENT_STEP_PX);
  });
});

// ---------------------------------------------------------------------------
// buildGeometry — disclosureByLane (Spec 21)
// ---------------------------------------------------------------------------

describe('buildGeometry — disclosureByLane', () => {
  const s = [span('a', 0, 100)];
  const d = { min: 0, max: 100 };

  it('passes empty Map through when no disclosureByLane supplied', () => {
    const geom = buildGeometry(s, canvasSize, focusDomain, 0, style, 'linear', d);
    expect(geom.disclosureByLane.size).toBe(0);
  });

  it('threads disclosureByLane through to the geometry unchanged', () => {
    const entry: DisclosureEntry = { state: 'expanded', depth: 0, descendantCount: 2 };
    const disclosure = new Map<number, DisclosureEntry>([[0, entry]]);
    const geom = buildGeometry(s, canvasSize, focusDomain, 0, style, 'linear', d, null, [], new Map(), null, disclosure);
    expect(geom.disclosureByLane).toBe(disclosure);
    expect(geom.disclosureByLane.get(0)).toEqual({ state: 'expanded', depth: 0, descendantCount: 2 });
  });

  it('disclosureByLane entry with state=collapsed reflects collapsed parent', () => {
    const entry: DisclosureEntry = { state: 'collapsed', depth: 1, descendantCount: 5 };
    const disclosure = new Map<number, DisclosureEntry>([[0, entry]]);
    const geom = buildGeometry(s, canvasSize, focusDomain, 0, style, 'linear', d, null, [], new Map(), null, disclosure);
    expect(geom.disclosureByLane.get(0)?.state).toBe('collapsed');
    expect(geom.disclosureByLane.get(0)?.descendantCount).toBe(5);
  });
});

describe('buildGeometry — gutterPx with hasParents/maxDepth', () => {
  const s = [span('a', 100, 400)];
  const d = { min: 100, max: 400 };

  it('with hasParents=true, maxDepth=0: gutter width includes caret column', () => {
    const geom = buildGeometry(s, canvasSize, focusDomain, 0, style, 'linear', d, null, [], new Map(), null, new Map(), true, 0);
    expect(geom.gutter.width).toBe(style.gutterWidth + CARET_GLYPH_PX);
    expect(geom.plot.left).toBe(style.gutterWidth + CARET_GLYPH_PX);
  });

  it('with hasParents=true, maxDepth=2: gutter width includes caret + indent', () => {
    const geom = buildGeometry(s, canvasSize, focusDomain, 0, style, 'linear', d, null, [], new Map(), null, new Map(), true, 2);
    const expected = style.gutterWidth + CARET_GLYPH_PX + 2 * CARET_INDENT_STEP_PX;
    expect(geom.gutter.width).toBe(expected);
    expect(geom.plot.left).toBe(expected);
    expect(geom.gutter.width + geom.plot.width).toBe(canvasSize.width);
  });

  it('inline mode, hasParents=true, maxDepth=0: reserves only the caret column', () => {
    const inlineStyle: TraceStyle = { ...style, labelPosition: 'inline' };
    const geom = buildGeometry(s, canvasSize, focusDomain, 0, inlineStyle, 'linear', d, null, [], new Map(), null, new Map(), true, 0);
    expect(geom.gutter.width).toBe(CARET_GLYPH_PX);
    expect(geom.plot.left).toBe(CARET_GLYPH_PX);
  });
});

// ---------------------------------------------------------------------------
// buildGeometry — criticalIntervalsByLane
// ---------------------------------------------------------------------------

describe('buildGeometry — criticalIntervalsByLane', () => {
  const spans = [span('a', 100, 400), span('b', 500, 800), span('c', 200, 300)];
  const domain = { min: 100, max: 800 };
  const spanIdToLane = new Map([['a', 0], ['b', 1], ['c', 2]]);

  it('groups projected critical intervals by lane index via spanIdToLane', () => {
    const criticalIntervals = [
      { spanId: 'a', start: 100, end: 200 },
      { spanId: 'b', start: 500, end: 700 },
    ];
    const geom = buildGeometry(
      spans, canvasSize, focusDomain, 0, style, 'linear', domain,
      null, [], spanIdToLane, null, new Map(), false, 0,
      criticalIntervals,
    );
    expect(geom.criticalIntervalsByLane.get(0)).toEqual([{ start: 100, end: 200 }]);
    expect(geom.criticalIntervalsByLane.get(1)).toEqual([{ start: 500, end: 700 }]);
    expect(geom.criticalIntervalsByLane.get(2)).toBeUndefined();
  });

  it('returns an empty map when no criticalIntervals are supplied', () => {
    const geom = buildGeometry(
      spans, canvasSize, focusDomain, 0, style, 'linear', domain,
    );
    expect(geom.criticalIntervalsByLane.size).toBe(0);
  });

  it('returns an empty map for an empty criticalIntervals array', () => {
    const geom = buildGeometry(
      spans, canvasSize, focusDomain, 0, style, 'linear', domain,
      null, [], spanIdToLane, null, new Map(), false, 0, [],
    );
    expect(geom.criticalIntervalsByLane.size).toBe(0);
  });

  it('silently skips intervals whose spanId is not in spanIdToLane', () => {
    const geom = buildGeometry(
      spans, canvasSize, focusDomain, 0, style, 'linear', domain,
      null, [], spanIdToLane, null, new Map(), false, 0,
      [{ spanId: 'unknown', start: 100, end: 200 }],
    );
    expect(geom.criticalIntervalsByLane.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// buildGeometry — multi-level time bar effective height (Spec 25 / ADR 0024)
// ---------------------------------------------------------------------------

describe('buildGeometry — multi-level time bar height', () => {
  const spans = [span('a', 100, 400), span('b', 500, 800)];
  const domain = { min: 100, max: 800 };
  // tickLayerHeight per ADR 0024: timeBarLabel.fontSize + TICK_LAYER_PADDING (11 + 6 = 17).
  const tickLayerHeight = style.timeBarLabel.fontSize + TICK_LAYER_PADDING;

  it('time mode, timeAxisLayerCount = 2: reserves max(timeBarHeight, 2 × tickLayerHeight + inset)', () => {
    const s: TraceStyle = { ...style, timeAxisLayerCount: 2 };
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, s, 'time', domain);
    const expected = Math.max(s.timeBarHeight, 2 * tickLayerHeight + TICK_LAYER_BOTTOM_INSET); // max(32, 40) = 40
    expect(geom.timeBar.height).toBe(expected);
    expect(geom.plot.top).toBe(expected);
    // Height still partitions the canvas (no lost pixels).
    expect(geom.timeBar.height + geom.plot.height).toBe(canvasSize.height);
  });

  it('time mode, timeAxisLayerCount = 3: expands the bar to fit three rows', () => {
    const s: TraceStyle = { ...style, timeAxisLayerCount: 3 };
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, s, 'time', domain);
    const expected = Math.max(s.timeBarHeight, 3 * tickLayerHeight + TICK_LAYER_BOTTOM_INSET); // max(32, 57) = 57
    expect(geom.timeBar.height).toBe(expected);
    expect(geom.plot.top).toBe(expected);
  });

  it('time mode, timeAxisLayerCount = 0: equals the base timeBarHeight (legacy single row)', () => {
    const s: TraceStyle = { ...style, timeAxisLayerCount: 0 };
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, s, 'time', domain);
    expect(geom.timeBar.height).toBe(s.timeBarHeight);
    expect(geom.plot.top).toBe(s.timeBarHeight);
  });

  it('linear mode: token is ignored — height always equals timeBarHeight', () => {
    const s: TraceStyle = { ...style, timeAxisLayerCount: 3 };
    const geom = buildGeometry(spans, canvasSize, focusDomain, 0, s, 'linear', domain);
    expect(geom.timeBar.height).toBe(s.timeBarHeight);
    expect(geom.plot.top).toBe(s.timeBarHeight);
  });

  it('plot does not reflow across zoom: same count → same height for different focus domains', () => {
    const s: TraceStyle = { ...style, timeAxisLayerCount: 2 };
    const zoomedOut = buildGeometry(spans, canvasSize, { min: 100, max: 800 }, 0, s, 'time', domain);
    const zoomedIn = buildGeometry(spans, canvasSize, { min: 300, max: 350 }, 0, s, 'time', domain);
    expect(zoomedIn.timeBar.height).toBe(zoomedOut.timeBar.height);
    expect(zoomedIn.plot.top).toBe(zoomedOut.plot.top);
  });
});
