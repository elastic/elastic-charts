/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba } from '../../../common/color_library_wrappers';
import type { ResolvedTraceAnnotation } from '../data/annotations';
import type { TraceAnnotationColor } from '../trace_api';
import type { AnnotationLayoutItem, AnnotationLine, AnnotationRect, TraceAnnotationColorStyle, TraceGeometry, TraceStyle } from './types';

/**
 * Minimum interactive width (px) of an annotation hit band (Spec 29 / ADR 0033). Deliberately a
 * private renderer constant, not a theme token: it is a fixed usability floor, not a design knob.
 * @internal
 */
export const ANNOTATION_MIN_HIT_WIDTH = 10;

/**
 * Resolves a Trace annotation's `color` intent (Spec 29) to concrete stroke/fill values. Named tokens
 * map to `style.trace.annotation.palette`; a custom `Color` becomes both stroke and fill (the fill is
 * tinted by `fillOpacity` at draw time). `undefined` uses the `default` token. Mirrors
 * `resolveBadgeColors`.
 * @internal
 */
export function resolveAnnotationColors(
  color: TraceAnnotationColor | undefined,
  palette: TraceStyle['annotation']['palette'],
): TraceAnnotationColorStyle {
  if (color === undefined) return palette.default;
  if (typeof color === 'string' && color in palette) return palette[color as keyof typeof palette];
  // Custom Color: use it verbatim for both stroke and fill (validated by colorToRgba for safety).
  const resolved = color as string;
  colorToRgba(resolved);
  return { stroke: resolved, fill: resolved };
}

/**
 * Lays out the resolved Trace annotations (Spec 29) for one frame. Per-frame, this:
 * - culls out-of-domain time annotations and clips partially-visible ranges to the plot viewport
 *   (interaction events still report the caller's authored range/time);
 * - resolves lane/hierarchy targets to their **current** (post-collapse) visible lane index and omits
 *   collapse-hidden targets silently (never a diagnostic);
 * - emits axis-aligned hit bands using the uniform thin-band model (point min-width, range edges-only,
 *   rail-only), so `pickAnnotation` never makes an underlying span/badge non-interactive.
 *
 * Draw geometry:
 * - time point → one vertical marker over the full plot height;
 * - time range → a filled band between the (clipped) edges plus an edge rail per **visible** edge;
 * - lane → one boundary-rail segment at the gutter↔plot boundary on the target lane;
 * - hierarchy → a **segmented** boundary rail: one segment per visible route lane (root, ancestors,
 *   target), with gaps on interleaved non-route lanes.
 * @internal
 */
export function layoutAnnotations(
  geom: TraceGeometry,
  style: TraceStyle,
  annotations: readonly ResolvedTraceAnnotation[],
): AnnotationLayoutItem[] {
  if (annotations.length === 0) return [];

  const { plot, timeBar, laneHeight, scrollOffset, scale, focusDomain, spans } = geom;
  const plotRight = plot.left + plot.width;
  const plotBottom = plot.top + plot.height;
  const halfHit = ANNOTATION_MIN_HIT_WIDTH / 2;
  // 'timebar' marks occupy the lower half of the time bar (over the axis ticks, clear of the labels)
  // and stop at the gutter/plot boundary — nothing is drawn in the plot.
  const timeBarTickTop = timeBar.top + timeBar.height / 2;
  const timeBarTickHeight = plot.top - timeBarTickTop;

  // Post-collapse spanId → visible lane index. Rebuilt per frame because collapse changes indices.
  const laneBySpanId = new Map<string, number>();
  for (let i = 0; i < spans.length; i++) laneBySpanId.set(spans[i]!.id, i);

  const laneTopY = (laneIndex: number): number => plot.top + laneIndex * laneHeight - scrollOffset;

  const items: AnnotationLayoutItem[] = [];

  for (const annotation of annotations) {
    const colors = resolveAnnotationColors(annotation.color, style.annotation.palette);

    if (annotation.kind === 'time') {
      // Placement (Spec 29): 'plot' draws full-height rails/plot band; 'timebar' (default) draws a
      // marker in the lower half of the time bar only (a range also bands that region).
      const isTimeBar = annotation.placement !== 'plot';
      if (annotation.time !== undefined) {
        // Cull time points outside the current focus domain (silent — never a diagnostic).
        if (annotation.time < focusDomain.min || annotation.time > focusDomain.max) continue;
        const x = scale(annotation.time);
        if (!isTimeBar) {
          items.push({
            id: annotation.id,
            kind: 'time',
            annotation,
            colors,
            lines: [{ x1: x, y1: plot.top, x2: x, y2: plotBottom }],
            hitRects: [{ x: x - halfHit, y: plot.top, width: ANNOTATION_MIN_HIT_WIDTH, height: plot.height }],
          });
          continue;
        }
        // 'timebar' point: a tick in the lower half of the time bar (over the ticks) plus a marker
        // head at the gutter/plot boundary. Nothing is drawn in the plot; hit is that lower-half band.
        items.push({
          id: annotation.id,
          kind: 'time',
          annotation,
          colors,
          lines: [{ x1: x, y1: timeBarTickTop, x2: x, y2: plot.top }],
          markers: [{ x, y: plot.top }],
          hitRects: [{ x: x - halfHit, y: timeBarTickTop, width: ANNOTATION_MIN_HIT_WIDTH, height: timeBarTickHeight }],
        });
        continue;
      }
      // Range annotation.
      const [from, to] = annotation.range!;
      // Fully outside the viewport → omit (both edges past the same side of the domain).
      if (to < focusDomain.min || from > focusDomain.max) continue;
      const bandX1 = Math.max(plot.left, scale(from));
      const bandX2 = Math.min(plotRight, scale(to));
      if (bandX2 <= bandX1) continue;
      const lines: AnnotationLine[] = [];
      const hitRects: AnnotationRect[] = [];
      const fromVisible = from >= focusDomain.min && from <= focusDomain.max;
      const toVisible = to >= focusDomain.min && to <= focusDomain.max;
      if (!isTimeBar) {
        // 'plot' range: full-height edge rails + tinted plot band (edges-only hit).
        if (fromVisible) {
          const xs = scale(from);
          lines.push({ x1: xs, y1: plot.top, x2: xs, y2: plotBottom });
          hitRects.push({ x: xs - halfHit, y: plot.top, width: ANNOTATION_MIN_HIT_WIDTH, height: plot.height });
        }
        if (toVisible) {
          const xe = scale(to);
          lines.push({ x1: xe, y1: plot.top, x2: xe, y2: plotBottom });
          hitRects.push({ x: xe - halfHit, y: plot.top, width: ANNOTATION_MIN_HIT_WIDTH, height: plot.height });
        }
        items.push({
          id: annotation.id,
          kind: 'time',
          annotation,
          colors,
          band: { x: bandX1, y: plot.top, width: bandX2 - bandX1, height: plot.height },
          lines,
          hitRects,
        });
        continue;
      }
      // 'timebar' range: a tinted band in the lower half of the time bar between the clipped edges,
      // plus a tick at each visible edge (edges-only hit). Nothing is drawn in the plot.
      if (fromVisible) {
        const xs = scale(from);
        lines.push({ x1: xs, y1: timeBarTickTop, x2: xs, y2: plot.top });
        hitRects.push({ x: xs - halfHit, y: timeBarTickTop, width: ANNOTATION_MIN_HIT_WIDTH, height: timeBarTickHeight });
      }
      if (toVisible) {
        const xe = scale(to);
        lines.push({ x1: xe, y1: timeBarTickTop, x2: xe, y2: plot.top });
        hitRects.push({ x: xe - halfHit, y: timeBarTickTop, width: ANNOTATION_MIN_HIT_WIDTH, height: timeBarTickHeight });
      }
      items.push({
        id: annotation.id,
        kind: 'time',
        annotation,
        colors,
        timeBarBand: { x: bandX1, y: timeBarTickTop, width: bandX2 - bandX1, height: timeBarTickHeight },
        lines,
        hitRects,
      });
      continue;
    }

    // Lane / hierarchy: boundary-rail segments at the gutter↔plot boundary.
    // The target must be visible (present in the post-collapse spans); otherwise omit silently.
    if (!laneBySpanId.has(annotation.spanId)) continue;
    const routeLanes =
      annotation.kind === 'hierarchy'
        ? annotation.routeSpanIds.map((id) => laneBySpanId.get(id)).filter((n): n is number => n !== undefined)
        : [laneBySpanId.get(annotation.spanId)!];
    if (routeLanes.length === 0) continue;

    const railX = plot.left;
    const lines: AnnotationLine[] = [];
    const hitRects: AnnotationRect[] = [];
    for (const laneIndex of routeLanes) {
      const top = laneTopY(laneIndex);
      lines.push({ x1: railX, y1: top, x2: railX, y2: top + laneHeight });
      hitRects.push({ x: railX - halfHit, y: top, width: ANNOTATION_MIN_HIT_WIDTH, height: laneHeight });
    }
    items.push({ id: annotation.id, kind: annotation.kind, annotation, colors, lines, hitRects });
  }

  return items;
}
