/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Spec 29 — Annotation hit-testing unit tests for `pickAnnotation`.
 *
 * `pickAnnotation` implements the uniform thin-band hit model (ADR 0033): time-point = ~10px
 * min-width band, time-range = start/end edge rails only (the band interior stays interactive),
 * lane/hierarchy = rail-only (route-lane segments union for hierarchy). These tests build the
 * per-frame layout via `layoutAnnotations` so the pick geometry is exercised end-to-end.
 */

import { ANNOTATION_MIN_HIT_WIDTH, layoutAnnotations } from './annotation_layout';
import { pickAnnotation } from './canvas2d_renderer';
import type { ResolvedTraceAnnotation } from '../data/annotations';
import type { NormalizedSpan } from '../data/types';
import type { TraceGeometry, TraceStyle } from './types';
import { DEFAULT_TRACE_ANNOTATION_STYLE, DEFAULT_TRACE_BADGE_STYLE } from './types';
import type { TraceDatum } from '../trace_api';

const PLOT_LEFT = 200;
const PLOT_TOP = 32;
const PLOT_WIDTH = 700;
const PLOT_HEIGHT = 168;
const LANE_HEIGHT = 24;
const halfHit = ANNOTATION_MIN_HIT_WIDTH / 2;

const style: TraceStyle = {
  gutterWidth: 200,
  timeBarHeight: 32,
  timeAxisLayerCount: 2,
  laneHeight: 24,
  totalLineThickness: 2,
  totalLineColor: '#aaa',
  activeSegmentColor: '#1f6feb',
  gutterLabel: { fontFamily: 'monospace', fontSize: 11, color: '#333' },
  timeBarLabel: { fontFamily: 'monospace', fontSize: 11, color: '#555' },
  gridLineColor: '#e8e8e8',
  focusedLaneBackground: 'rgba(96,146,192,0.15)',
  selectedSegmentStroke: '#f00',
  selectedSegmentStrokeWidth: 2,
  criticalPathColor: '#C61E25',
  criticalPathThickness: 2,
  labelPosition: 'gutter',
  badge: DEFAULT_TRACE_BADGE_STYLE,
  annotation: DEFAULT_TRACE_ANNOTATION_STYLE,
};

const spans: NormalizedSpan[] = ['a', 'b', 'c'].map((id, i) => ({
  id,
  name: id.toUpperCase(),
  start: i * 100,
  end: 1000,
  activeSegments: [],
  meta: { id, name: id.toUpperCase(), traceId: 't1', start: i * 100, end: 1000 } satisfies TraceDatum,
}));

const scale = (t: number) => PLOT_LEFT + (t / 1000) * PLOT_WIDTH;

function makeGeom(annotations: ResolvedTraceAnnotation[]): TraceGeometry {
  const base: TraceGeometry = {
    spans,
    gutter: { top: 0, left: 0, width: PLOT_LEFT, height: PLOT_TOP + PLOT_HEIGHT },
    timeBar: { top: 0, left: PLOT_LEFT, width: PLOT_WIDTH, height: PLOT_TOP },
    plot: { top: PLOT_TOP, left: PLOT_LEFT, width: PLOT_WIDTH, height: PLOT_HEIGHT },
    laneHeight: LANE_HEIGHT,
    labelBandPx: 0,
    domain: { min: 0, max: 1000 },
    focusDomain: { min: 0, max: 1000 },
    scrollOffset: 0,
    xScaleType: 'linear',
    focusedLaneIndex: null,
    resolvedSelection: [],
    scale,
    emptyMessage: null,
    disclosureByLane: new Map(),
    criticalIntervalsByLane: new Map(),
    badgesByLane: new Map(),
    annotationsLayout: [],
  };
  return { ...base, annotationsLayout: layoutAnnotations(base, style, annotations) };
}

const timeAnnotation = (
  id: string,
  position: { time?: number; range?: [number, number] },
  placement: 'plot' | 'timebar' = 'plot',
): ResolvedTraceAnnotation => ({ id, kind: 'time', placement, datum: { id }, ariaLabel: id, ...position });

const spanAnnotation = (
  kind: 'lane' | 'hierarchy',
  id: string,
  spanId: string,
  routeSpanIds: string[],
): ResolvedTraceAnnotation => ({
  id,
  kind,
  datum: { id },
  ariaLabel: id,
  spanId,
  routeSpanIds,
  span: spans.find((s) => s.id === spanId)!,
});

describe('pickAnnotation', () => {
  it('returns null when there are no annotations laid out', () => {
    expect(pickAnnotation(500, 100, makeGeom([]))).toBeNull();
  });

  it('time point annotations use a minimum hit target', () => {
    // A zero-width marker is widened to a ~10px band so it stays clickable at any zoom.
    const geom = makeGeom([timeAnnotation('t', { time: 500 })]);
    const markerX = scale(500);
    expect(pickAnnotation(markerX, 100, geom)?.id).toBe('t');
    expect(pickAnnotation(markerX + halfHit - 0.5, 100, geom)?.id).toBe('t');
    expect(pickAnnotation(markerX - halfHit + 0.5, 100, geom)?.id).toBe('t');
    expect(pickAnnotation(markerX + halfHit + 1, 100, geom)).toBeNull();
    expect(pickAnnotation(markerX - halfHit - 1, 100, geom)).toBeNull();
  });

  it('vertical annotations hit test around the boundary rail only', () => {
    // Lane/hierarchy rails hit only near the gutter↔plot boundary; the plot interior stays interactive.
    const geom = makeGeom([spanAnnotation('lane', 'l', 'b', ['b'])]);
    const laneMidY = PLOT_TOP + 1 * LANE_HEIGHT + LANE_HEIGHT / 2; // span 'b' is lane index 1
    expect(pickAnnotation(PLOT_LEFT, laneMidY, geom)?.id).toBe('l');
    expect(pickAnnotation(PLOT_LEFT + 100, laneMidY, geom)).toBeNull();
  });

  describe('time-point min hit target', () => {
    const geom = makeGeom([timeAnnotation('t', { time: 500 })]);
    const markerX = scale(500);

    it('hits within the min-width band centered on the marker', () => {
      expect(pickAnnotation(markerX, 100, geom)?.id).toBe('t');
      expect(pickAnnotation(markerX + halfHit - 0.5, 100, geom)?.id).toBe('t');
      expect(pickAnnotation(markerX - halfHit + 0.5, 100, geom)?.id).toBe('t');
    });

    it('misses just outside the min-width band', () => {
      expect(pickAnnotation(markerX + halfHit + 1, 100, geom)).toBeNull();
      expect(pickAnnotation(markerX - halfHit - 1, 100, geom)).toBeNull();
    });

    it('misses above and below the plot area', () => {
      expect(pickAnnotation(markerX, PLOT_TOP - 1, geom)).toBeNull();
      expect(pickAnnotation(markerX, PLOT_TOP + PLOT_HEIGHT + 1, geom)).toBeNull();
    });
  });

  describe('time-range edges-only hit target', () => {
    const geom = makeGeom([timeAnnotation('r', { range: [200, 600] })]);

    it('hits on the start and end edge rails', () => {
      expect(pickAnnotation(scale(200), 100, geom)?.id).toBe('r');
      expect(pickAnnotation(scale(600), 100, geom)?.id).toBe('r');
    });

    it('misses in the band interior (interior stays interactive)', () => {
      const mid = (scale(200) + scale(600)) / 2;
      expect(pickAnnotation(mid, 100, geom)).toBeNull();
    });
  });

  describe('rail-only hit target', () => {
    it('hits a lane annotation only near the gutter↔plot boundary rail', () => {
      const geom = makeGeom([spanAnnotation('lane', 'l', 'b', ['b'])]);
      const laneMidY = PLOT_TOP + 1 * LANE_HEIGHT + LANE_HEIGHT / 2; // span 'b' is lane index 1
      expect(pickAnnotation(PLOT_LEFT, laneMidY, geom)?.id).toBe('l');
      // Deep inside the plot, away from the rail → the underlying span stays interactive.
      expect(pickAnnotation(PLOT_LEFT + 100, laneMidY, geom)).toBeNull();
    });

    it('misses a lane annotation on a different lane', () => {
      const geom = makeGeom([spanAnnotation('lane', 'l', 'b', ['b'])]);
      const otherLaneY = PLOT_TOP + 2 * LANE_HEIGHT + LANE_HEIGHT / 2; // lane index 2 (span 'c')
      expect(pickAnnotation(PLOT_LEFT, otherLaneY, geom)).toBeNull();
    });
  });

  describe('time-bar placement marker hit target', () => {
    // A 'timebar' point marker is hoverable only in the lower half of the time bar (over the ticks);
    // nothing is drawn or hit in the plot, and the label half of the time bar stays clear.
    const geom = makeGeom([timeAnnotation('t', { time: 500 }, 'timebar')]);
    const markerX = scale(500);
    const tickTop = PLOT_TOP / 2; // lower half starts at the time-bar midpoint

    it('time-bar marker is hoverable in the axis (lower-half) region', () => {
      expect(pickAnnotation(markerX, tickTop + 4, geom)?.id).toBe('t');
    });

    it('is not hoverable in the plot (no guide runs through it)', () => {
      expect(pickAnnotation(markerX, PLOT_TOP + 100, geom)).toBeNull();
    });

    it('misses the label (upper) half of the time bar, above it, and below the plot', () => {
      expect(pickAnnotation(markerX, tickTop - 4, geom)).toBeNull();
      expect(pickAnnotation(markerX, -1, geom)).toBeNull();
      expect(pickAnnotation(markerX, PLOT_TOP + PLOT_HEIGHT + 1, geom)).toBeNull();
    });
  });

  describe('hierarchy route-lane segments union', () => {
    // Route a → c: rail segments on lanes 0 and 2, gap on the interleaved non-route lane 1.
    const geom = makeGeom([spanAnnotation('hierarchy', 'h', 'c', ['a', 'c'])]);

    it('resolves any route-lane segment to the same annotation id', () => {
      const lane0Y = PLOT_TOP + 0 * LANE_HEIGHT + LANE_HEIGHT / 2;
      const lane2Y = PLOT_TOP + 2 * LANE_HEIGHT + LANE_HEIGHT / 2;
      expect(pickAnnotation(PLOT_LEFT, lane0Y, geom)?.id).toBe('h');
      expect(pickAnnotation(PLOT_LEFT, lane2Y, geom)?.id).toBe('h');
    });

    it('misses on the interleaved non-route lane (segmented rail has a gap there)', () => {
      const lane1Y = PLOT_TOP + 1 * LANE_HEIGHT + LANE_HEIGHT / 2;
      expect(pickAnnotation(PLOT_LEFT, lane1Y, geom)).toBeNull();
    });
  });
});
