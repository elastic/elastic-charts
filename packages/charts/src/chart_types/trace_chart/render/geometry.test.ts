/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildGeometry } from './geometry';
import type { NormalizedSpan } from '../data/types';
import type { TraceStyle } from './types';

const style: TraceStyle = {
  gutterWidth: 200,
  timeBarHeight: 32,
  laneHeight: 24,
  totalLineThickness: 2,
  totalLineColor: '#ccc',
  activeSegmentColor: '#007',
  gutterLabel: { fontFamily: 'monospace', fontSize: 11, color: '#333' },
  timeBarLabel: { fontFamily: 'monospace', fontSize: 11, color: '#333' },
  gridLineColor: '#eee',
};

function span(id: string, start: number, end: number): NormalizedSpan {
  return { id, name: id, start, end, active: [], meta: {} as never };
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
