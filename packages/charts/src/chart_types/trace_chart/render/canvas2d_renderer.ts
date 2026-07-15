/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba } from '../../../common/color_library_wrappers';
import { withContext } from '../../../renderers/canvas';
import { renderMultiLine } from '../../../renderers/canvas/primitives/line';
import { renderRect } from '../../../renderers/canvas/primitives/rect';
import { renderText, wrapLines } from '../../../renderers/canvas/primitives/text';
import type { TextFont } from '../../../renderers/canvas/primitives/text';
import type { Fill, Stroke } from '../../../geoms/types';
import { drawTimeBar } from './time_bar';
import type { HoverRegion, PickResult, TraceGeometry, TraceRenderer, TraceStyle } from './types';

/** Padding above/below active-segment rects within a lane (px). Mirrors TICK_HEIGHT in time_bar.ts. */
const LANE_PADDING = 3;

/**
 * Zero-width stroke used for active-segment rects (filled only, no visible border).
 * Using a transparent [0,0,0,0] color satisfies the `Stroke.color: RgbaTuple` constraint without
 * importing RgbaTuple directly.
 */
const NO_STROKE: Stroke = { color: [0, 0, 0, 0] as [number, number, number, number], width: 0 };

/**
 * Draw the full trace waterfall onto `ctx`. **DPR-agnostic**: the caller must call
 * `ctx.scale(dpr, dpr)` once before invoking this. The frozen `(ctx, geom, style)` contract is
 * intentional — replacing the Canvas2D backend with WebGL (ADR 0001) requires only a new
 * `TraceRenderer` object, not a signature change.
 * @internal
 */
export function draw(ctx: CanvasRenderingContext2D, geom: TraceGeometry, style: TraceStyle): void {
  const { gutter, plot, spans, laneHeight, scrollOffset, scale } = geom;

  withContext(ctx, () => {
    // Transparent clear of the full canvas area. Background ownership belongs to the Spec 6
    // wrapping component; the renderer only paints its own marks.
    ctx.clearRect(0, 0, gutter.width + plot.width, gutter.height);

    // Delegate time bar (raster tick engine + vertical gridlines) — Spec 4 module.
    drawTimeBar(ctx, geom, style);

    if (spans.length === 0) return;

    // --- Viewport culling ---
    // Only iterate lane indices whose top edge falls within the visible plot rect.
    const firstLane = Math.max(0, Math.floor(scrollOffset / laneHeight));
    const lastLane = Math.min(spans.length - 1, Math.floor((scrollOffset + plot.height) / laneHeight));

    // Hoist shared immutable style objects outside the per-lane loop to avoid per-frame allocations.
    const totalLineStroke: Stroke = {
      color: colorToRgba(style.totalLineColor),
      width: style.totalLineThickness,
    };
    const defaultActiveFill: Fill = {
      color: colorToRgba(style.activeSegmentColor),
    };
    const gutterFont: TextFont = {
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      fontFamily: style.gutterLabel.fontFamily,
      textColor: style.gutterLabel.color,
      fontSize: style.gutterLabel.fontSize,
      align: 'left',
      baseline: 'middle',
    };

    const plotRight = plot.left + plot.width;

    // Lazily-built fill cache: at most one colorToRgba call per distinct segment color per
    // draw() call. Segments per lane are few, so a plain Map is sufficient.
    const segFillCache = new Map<string, Fill>();

    for (let i = firstLane; i <= lastLane; i++) {
      const span = spans[i];
      if (!span) continue;

      const laneTop = plot.top + i * laneHeight - scrollOffset;
      const midY = laneTop + laneHeight / 2;

      // --- Total-duration line (thin horizontal rule for the full span extent) ---
      const rawX1 = scale(span.start);
      const rawX2 = scale(span.end);
      // Cull entirely-out-of-range spans, then clamp to plot bounds so the line
      // never paints leftward into the gutter over the span-name labels. Mirrors
      // the clamp already applied to active-segment rects below.
      if (rawX2 >= plot.left && rawX1 <= plotRight) {
        const lineX1 = Math.max(plot.left, rawX1);
        const lineX2 = Math.min(plotRight, rawX2);
        renderMultiLine(ctx, [{ x1: lineX1, y1: midY, x2: lineX2, y2: midY }], totalLineStroke);
      }

      // --- Active segments (solid rects showing self-time) ---
      // Span-level color (Spec 9 colorBy or explicit TraceDatum.color) is the lane-wide fallback.
      // Per-segment colors (label-palette or explicit segment.color, both resolved in the pipeline)
      // override the fallback for individual segments.
      const activeFill: Fill = span.color != null ? { color: colorToRgba(span.color) } : defaultActiveFill;
      for (const seg of span.activeSegments) {
        const segX1 = scale(seg.start);
        const segX2 = scale(seg.end);
        // Skip segments entirely outside the visible plot x-range.
        if (segX2 < plot.left || segX1 > plotRight) continue;
        // Clamp to plot bounds so a partially-visible mark does not paint into the gutter.
        const clampedX = Math.max(plot.left, segX1);
        const clampedW = Math.min(plotRight, segX2) - clampedX;
        if (clampedW <= 0) continue;
        // Resolve per-segment fill: explicit/label-derived color wins over span-level fallback.
        let segFill: Fill;
        if (seg.color != null) {
          let cached = segFillCache.get(seg.color);
          if (cached === undefined) {
            cached = { color: colorToRgba(seg.color) };
            segFillCache.set(seg.color, cached);
          }
          segFill = cached;
        } else {
          segFill = activeFill;
        }
        renderRect(
          ctx,
          { x: clampedX, y: laneTop + LANE_PADDING, width: clampedW, height: laneHeight - 2 * LANE_PADDING },
          segFill,
          NO_STROKE,
          true, // disableBorderOffset — no stroke, so inset is irrelevant; explicit for clarity
        );
      }

      // --- Gutter label (span name, ellipsized to fit) ---
      const { lines } = wrapLines(ctx, span.name, gutterFont, gutterFont.fontSize, gutter.width - 8, laneHeight, {
        wrapAtWord: false,
        shouldAddEllipsis: true,
      });
      if (lines[0]) {
        // Place text at horizontal offset 4 from the gutter edge; baseline 'middle' centers it vertically.
        renderText(ctx, { x: gutter.left + 4, y: midY }, lines[0], gutterFont);
      }
    }
  });
}

/**
 * Returns the 0-based span-array index under `(_x, y)`, or -1 if outside all lanes.
 * Hit-testing is **y-only** (spec-literal); for x-axis / segment refinement use `pickRegion`.
 * @internal
 */
export function pickLane(_x: number, y: number, geom: TraceGeometry): number {
  const { plot, laneHeight, scrollOffset, spans } = geom;
  if (y < plot.top || y > plot.top + plot.height) return -1;
  const lane = Math.floor((y - plot.top + scrollOffset) / laneHeight);
  if (lane < 0 || lane >= spans.length) return -1;
  return lane;
}

/**
 * Returns the lane index and x-axis region (`active` | `waiting` | `empty`) under `(x, y)`, or
 * `null` when the pointer is outside all lanes (above/below the plot area). Supersedes `pickLane`
 * for hover/tooltip use: the `region` drives the State row in the default tooltip and the cursor.
 *
 * Region semantics (per ADR 0003):
 * - `active`  — `t` falls inside a span's active segment (self-time by default)
 * - `waiting` — `t` is inside `[start, end]` but not an active segment (in children, by default)
 * - `empty`   — `t` is outside `[start, end]`; no span activity at this x in this lane
 * @internal
 */
export function pickRegion(x: number, y: number, geom: TraceGeometry): PickResult | null {
  const { plot, laneHeight, scrollOffset, spans, focusDomain } = geom;
  if (y < plot.top || y > plot.top + plot.height) return null;
  const lane = Math.floor((y - plot.top + scrollOffset) / laneHeight);
  if (lane < 0 || lane >= spans.length) return null;
  const span = spans[lane];
  if (!span) return null;

  // Invert the linear scale: map x-pixel → time value. Guard degenerate zero-width domain/plot.
  const extent = focusDomain.max - focusDomain.min;
  const t =
    plot.width > 0 && extent > 0
      ? focusDomain.min + ((x - plot.left) / plot.width) * extent
      : focusDomain.min;

  let region: HoverRegion;
  let segmentIndex = -1;
  if (t < span.start || t > span.end) {
    region = 'empty';
  } else {
    segmentIndex = span.activeSegments.findIndex((seg) => t >= seg.start && t <= seg.end);
    if (segmentIndex >= 0) {
      region = 'active';
    } else {
      region = 'waiting';
    }
  }

  return { index: lane, region, segmentIndex };
}

/** @internal */
export const canvas2dRenderer: TraceRenderer = { draw, pickLane };
