/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba } from '../../../common/color_library_wrappers';
import { Colors } from '../../../common/colors';
import { withContext } from '../../../renderers/canvas';
import { renderMultiLine } from '../../../renderers/canvas/primitives/line';
import { renderRect } from '../../../renderers/canvas/primitives/rect';
import { renderText, wrapLines } from '../../../renderers/canvas/primitives/text';
import type { TextFont } from '../../../renderers/canvas/primitives/text';
import type { Fill, Stroke } from '../../../geoms/types';
import { waitingSegments } from '../data/self_time';
import { drawTimeBar } from './time_bar';
import type { HoverRegion, PickResult, TraceGeometry, TraceRenderer, TraceStyle } from './types';
import { CARET_GLYPH_PX, CARET_INDENT_STEP_PX } from './types';

/** Padding above/below active-segment rects within a lane (px). Mirrors TICK_HEIGHT in time_bar.ts. */
const LANE_PADDING = 3;

/** Zero-width stroke used for active-segment rects (filled only, no visible border). */
const NO_STROKE: Stroke = { color: Colors.Transparent.rgba, width: 0 };

/**
 * Draw the full trace waterfall onto `ctx`. **DPR-agnostic**: the caller must call
 * `ctx.scale(dpr, dpr)` once before invoking this. The frozen `(ctx, geom, style)` contract is
 * intentional — replacing the Canvas2D backend with WebGL (ADR 0001) requires only a new
 * `TraceRenderer` object, not a signature change.
 * @internal
 */
export function draw(ctx: CanvasRenderingContext2D, geom: TraceGeometry, style: TraceStyle): void {
  const { gutter, plot, spans, laneHeight, scrollOffset, scale, focusedLaneIndex, disclosureByLane } = geom;

  withContext(ctx, () => {
    // Transparent clear of the full canvas area. Background ownership belongs to the Spec 6
    // wrapping component; the renderer only paints its own marks.
    ctx.clearRect(0, 0, gutter.width + plot.width, gutter.height);

    // Delegate time bar (raster tick engine + vertical gridlines) — Spec 4 module.
    drawTimeBar(ctx, geom, style);

    if (spans.length === 0) {
      if (geom.emptyMessage) {
        const emptyFont: TextFont = {
          fontStyle: 'normal',
          fontVariant: 'normal',
          fontWeight: 'normal',
          fontFamily: style.timeBarLabel.fontFamily,
          textColor: style.timeBarLabel.color,
          fontSize: style.timeBarLabel.fontSize,
          align: 'center',
          baseline: 'middle',
        };
        renderText(
          ctx,
          { x: plot.left + plot.width / 2, y: plot.top + plot.height / 2 },
          geom.emptyMessage,
          emptyFont,
        );
      }
      return;
    }

    // --- Viewport culling ---
    // Only iterate lane indices whose top edge falls within the visible plot rect.
    const firstLane = Math.max(0, Math.floor(scrollOffset / laneHeight));
    const lastLane = Math.min(spans.length - 1, Math.floor((scrollOffset + plot.height) / laneHeight));

    // Clip the lane area so that a fractional scrollOffset cannot let lane content
    // (total-line, active segments, labels, focus highlight, selection outlines)
    // overpaint the time bar above plot.top. The clip rect covers the full gutter + plot
    // width so the focused-lane background highlight still paints into the gutter column.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, plot.top, gutter.width + plot.width, plot.height);
    ctx.clip();

    // --- Focused-lane background highlight (keyboard nav) ---
    // Drawn before span content so total-line and active-segments render on top.
    if (focusedLaneIndex !== null && focusedLaneIndex >= firstLane && focusedLaneIndex <= lastLane) {
      const focusTop = plot.top + focusedLaneIndex * laneHeight - scrollOffset;
      renderRect(
        ctx,
        { x: 0, y: focusTop, width: gutter.width + plot.width, height: laneHeight },
        { color: colorToRgba(style.focusedLaneBackground) },
        NO_STROKE,
        true,
      );
    }

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

    // In inline mode each lane is split vertically: a bar band at the top and a label band beneath.
    // For gutter/none the label band is zero-height and all geometry reduces to today's behaviour.
    const labelBandPx =
      style.labelPosition === 'inline' ? style.gutterLabel.fontSize + LANE_PADDING : 0;

    // Width of the disclosure-caret column within the gutter. Derived from gutter.width and the
    // label mode: in 'gutter' mode the label area follows the caret column; in other modes the
    // full gutter IS the caret column. Zero when disclosureByLane is empty (flat trace, no carets).
    const caretColumnWidth = disclosureByLane.size > 0
      ? (style.labelPosition === 'gutter' ? gutter.width - style.gutterWidth : gutter.width)
      : 0;

    // Caret font: reuses the gutter label settings with center-align for the glyph.
    const caretFont: TextFont = {
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      fontFamily: style.gutterLabel.fontFamily,
      textColor: style.gutterLabel.color,
      fontSize: style.gutterLabel.fontSize,
      align: 'center',
      baseline: 'middle',
    };

    // Lazily-built fill cache: at most one colorToRgba call per distinct segment color per
    // draw() call. Segments per lane are few, so a plain Map is sufficient.
    const segFillCache = new Map<string, Fill>();

    for (let i = firstLane; i <= lastLane; i++) {
      const span = spans[i];
      if (!span) continue;

      const laneTop = plot.top + i * laneHeight - scrollOffset;

      // Bar band: occupies the top portion of the lane (full lane when labelBandPx = 0).
      const barTop = laneTop + LANE_PADDING;
      const barBottom = laneTop + laneHeight - LANE_PADDING - labelBandPx;
      const barMidY = (barTop + barBottom) / 2;

      // --- Total-duration line (thin horizontal rule for the full span extent) ---
      const rawX1 = scale(span.start);
      const rawX2 = scale(span.end);
      // Cull entirely-out-of-range spans, then clamp to plot bounds so the line
      // never paints leftward into the gutter over the span-name labels. Mirrors
      // the clamp already applied to active-segment rects below.
      if (rawX2 >= plot.left && rawX1 <= plotRight) {
        const lineX1 = Math.max(plot.left, rawX1);
        const lineX2 = Math.min(plotRight, rawX2);
        renderMultiLine(ctx, [{ x1: lineX1, y1: barMidY, x2: lineX2, y2: barMidY }], totalLineStroke);
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
          { x: clampedX, y: barTop, width: clampedW, height: barBottom - barTop },
          segFill,
          NO_STROKE,
          true, // disableBorderOffset — no stroke, so inset is irrelevant; explicit for clarity
        );
      }

      // --- Label pass ---
      if (style.labelPosition === 'gutter') {
        // Gutter label: offset right of the caret column so label and caret don't overlap.
        const labelX = gutter.left + caretColumnWidth + 4;
        const labelWidth = gutter.width - caretColumnWidth - 8;
        const { lines } = wrapLines(ctx, span.name, gutterFont, gutterFont.fontSize, labelWidth, laneHeight, {
          wrapAtWord: false,
          shouldAddEllipsis: true,
        });
        if (lines[0]) {
          renderText(ctx, { x: labelX, y: barMidY }, lines[0], gutterFont);
        }
      } else if (style.labelPosition === 'inline' && span.name) {
        // Inline label: drawn on a row below the bar, starting at the bar's start x (sticky-left).
        // Cull when the bar is entirely outside the visible x-range (no bar to anchor to).
        // Right-edge clipping is handled by the outer lane-area ctx.clip() above.
        if (rawX2 >= plot.left && rawX1 <= plotRight) {
          const barStartX = Math.max(plot.left, rawX1);
          const labelMidY = laneTop + laneHeight - LANE_PADDING - labelBandPx / 2;
          renderText(ctx, { x: barStartX, y: labelMidY }, span.name, gutterFont);
        }
      }
      // labelPosition === 'none': no label drawn.

      // --- Disclosure caret (▶/▼) ---
      // Drawn inside the caret column at depth-indented x. Omitted when not a parent lane.
      const disclosure = disclosureByLane.get(i);
      if (disclosure) {
        const caretX = gutter.left + disclosure.depth * CARET_INDENT_STEP_PX + CARET_GLYPH_PX / 2;
        renderText(ctx, { x: caretX, y: barMidY }, disclosure.state === 'collapsed' ? '▶' : '▼', caretFont);
      }
    }

    // --- Selection-highlight pass (after all lane content) ---
    // Stroke-only outline per resolved selection entry; no fill so ADR 0006 colorBy fills are not distorted.
    const { resolvedSelection } = geom;
    if (resolvedSelection.length > 0) {
      const NO_FILL: Fill = { color: Colors.Transparent.rgba };
      const selectionStroke: Stroke = {
        color: colorToRgba(style.selectedSegmentStroke),
        width: style.selectedSegmentStrokeWidth,
      };
      for (const entry of resolvedSelection) {
        const { laneIndex, region, segmentIndex } = entry;
        if (laneIndex < firstLane || laneIndex > lastLane) continue;
        const hlSpan = spans[laneIndex];
        if (!hlSpan) continue;
        const entryLaneTop = plot.top + laneIndex * laneHeight - scrollOffset;

        let hlX1: number;
        let hlX2: number;
        if (region === 'active') {
          const seg = hlSpan.activeSegments[segmentIndex];
          if (!seg) continue;
          hlX1 = scale(seg.start);
          hlX2 = scale(seg.end);
        } else if (region === 'waiting') {
          const gaps = waitingSegments(hlSpan);
          const gap = gaps[segmentIndex];
          if (!gap) continue;
          hlX1 = scale(gap.start);
          hlX2 = scale(gap.end);
        } else {
          // region === 'span'
          hlX1 = scale(hlSpan.start);
          hlX2 = scale(hlSpan.end);
        }

        // Cull entirely off-screen, then clamp to plot bounds.
        if (hlX2 < plot.left || hlX1 > plotRight) continue;
        const hlClampedX = Math.max(plot.left, hlX1);
        const hlClampedW = Math.min(plotRight, hlX2) - hlClampedX;
        if (hlClampedW <= 0) continue;

        // Selection outline must frame the bar band (same vertical extent as the active-segment rects).
        const hlBarTop = entryLaneTop + LANE_PADDING;
        const hlBarBottom = entryLaneTop + laneHeight - LANE_PADDING - labelBandPx;
        renderRect(
          ctx,
          { x: hlClampedX, y: hlBarTop, width: hlClampedW, height: hlBarBottom - hlBarTop },
          NO_FILL,
          selectionStroke,
          false,
        );
      }
    }
    ctx.restore(); // end of lane-area clip (paired with ctx.save() before the focused-lane pass)
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
 * Caret-zone hit test for the disclosure gutter column (Spec 21 / ADR 0026). Returns the 0-based
 * lane index when `(x, y)` falls within the clickable caret area of a parent lane, or `-1`
 * otherwise. Callers should check this before the regular `pickRegion` path; a caret hit is
 * consumed and must not propagate to the selection / `onElementClick` flow.
 * @internal
 */
export function pickDisclosure(x: number, y: number, geom: TraceGeometry): number {
  const { disclosureByLane, gutter, plot, laneHeight, scrollOffset, spans } = geom;
  if (disclosureByLane.size === 0) return -1;
  if (x < gutter.left || x >= plot.left) return -1; // must be in the gutter zone
  if (y < plot.top || y >= plot.top + plot.height) return -1;
  const lane = Math.floor((y - plot.top + scrollOffset) / laneHeight);
  if (lane < 0 || lane >= spans.length) return -1;
  const entry = disclosureByLane.get(lane);
  if (!entry) return -1;
  const caretLeft = gutter.left + entry.depth * CARET_INDENT_STEP_PX;
  const caretRight = caretLeft + CARET_GLYPH_PX;
  return x >= caretLeft && x < caretRight ? lane : -1;
}

/**
 * Returns the lane index and x-axis region (`active` | `waiting` | `empty` | `span`) under
 * `(x, y)`, or `null` when the pointer is outside all lanes (above/below the plot area).
 * Supersedes `pickLane` for hover/tooltip use: the `region` drives the State row in the default
 * tooltip and the cursor.
 *
 * Region semantics (per ADR 0003 / Spec 21):
 * - `active`  — `t` falls inside a span's active segment (self-time by default)
 * - `waiting` — `t` is inside `[start, end]` but not an active segment (in children, by default)
 * - `empty`   — `t` is outside `[start, end]`; no span activity at this x in this lane
 * - `span`    — `t` is inside the extent of a **collapsed** parent; whole-span picking (ADR 0026)
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
  } else if (geom.disclosureByLane.get(lane)?.state === 'collapsed') {
    // Collapsed parent: sub-segment indices are ambiguous for rolled-up bars (ADR 0026).
    // Return whole-span picking so a click creates a 'span' selection ref, not 'active'/'waiting'.
    region = 'span';
  } else {
    segmentIndex = span.activeSegments.findIndex((seg) => t >= seg.start && t <= seg.end);
    if (segmentIndex >= 0) {
      region = 'active';
    } else {
      region = 'waiting';
      // Set segmentIndex to the 0-based index into waitingSegments(span) that contains t.
      // -1 when no waiting segment contains t (degenerate data). Backward-compatible: the
      // field was already -1 for non-active hits before this extension (ADR 0011 Consequence).
      segmentIndex = waitingSegments(span).findIndex((gap) => t >= gap.start && t <= gap.end);
    }
  }

  return { index: lane, region, segmentIndex };
}

/** @internal */
export const canvas2dRenderer: TraceRenderer = { draw, pickLane, pickRegion };
