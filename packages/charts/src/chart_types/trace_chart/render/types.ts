/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../../../common/colors';
import type { Dimensions, Size } from '../../../utils/dimensions';
import type { NormalizedSpan } from '../data/types';

export type { Dimensions, Size };

/**
 * Style configuration for the trace waterfall chart. Set via `theme.trace` on the global `Theme`.
 * @public
 */
export interface TraceStyle {
  /** Width of the left gutter that shows span names, in px. */
  gutterWidth: number;
  /** Height of the top time bar that shows tick labels, in px. */
  timeBarHeight: number;
  /** Height of each span lane, in px. */
  laneHeight: number;
  /** Thickness of the total-duration line drawn for each span, in px. */
  totalLineThickness: number;
  /** Color of the total-duration line (muted). */
  totalLineColor: Color;
  /** Color of the active (self-time) segments (stronger). */
  activeSegmentColor: Color;
  /** Font for span name labels in the gutter. */
  gutterLabel: { fontFamily: string; fontSize: number; color: Color };
  /** Font for time-bar tick labels. */
  timeBarLabel: { fontFamily: string; fontSize: number; color: Color };
  /** Color of the faint gridlines drawn down through the plot area. */
  gridLineColor: Color;
  /** Background fill for the full-width highlight behind the keyboard-focused lane. */
  focusedLaneBackground: Color;
  /** Stroke color for the selection-highlight outline drawn around selected segments. */
  selectedSegmentStroke: Color;
  /** Stroke width in px for the selection-highlight outline. */
  selectedSegmentStrokeWidth: number;
}

/**
 * The pure layout model produced by `buildGeometry`. Every field downstream consumers (time bar,
 * canvas renderer, picking) need is present here; no external mutable state is read at draw time.
 * @internal
 */
export interface TraceGeometry {
  /** Spans sorted ascending by `start`. */
  spans: NormalizedSpan[];
  /** The fixed left gutter region (x=0, y=0, width=gutterWidth, height=canvasHeight). */
  gutter: Dimensions;
  /** The fixed top time bar region (x=gutterWidth, y=0, width=plotWidth, height=timeBarHeight). */
  timeBar: Dimensions;
  /** The scrollable plot region below the time bar and to the right of the gutter. */
  plot: Dimensions;
  /** Lane height in px (same as TraceStyle.laneHeight). */
  laneHeight: number;
  /** Full trace extent across all spans (used for reset/fit). */
  domain: { min: number; max: number };
  /** Current zoom window (eased by the caller; identical to domain when no zoom is active). */
  focusDomain: { min: number; max: number };
  /** Vertical scroll offset in px (1 unit = 1 px); passed through unchanged. */
  scrollOffset: number;
  /** Which x-scale the trace uses; controls raster-engine and time-bar unit selection. */
  xScaleType: 'time' | 'linear';
  /**
   * The lane currently focused by keyboard navigation, or `null` when no lane is focused.
   * Distinct from `hoverIndex` (mouse-driven). Drawn as a full-width background highlight.
   */
  focusedLaneIndex: number | null;
  /**
   * Resolved selection entries, filtered to refs that exist in the current span array and have
   * valid `segmentIndex` values. Deduplicated: segment entries subsumed by a same-span `'span'`
   * entry are dropped. Built by `buildGeometry`; consumed by the selection-highlight draw pass.
   */
  resolvedSelection: ReadonlyArray<{ laneIndex: number; region: 'span' | 'active' | 'waiting'; segmentIndex: number }>;
  /**
   * Maps a time value (ms) to an x pixel coordinate within the plot, based on `focusDomain`.
   * Returns `plot.left` when the domain is zero-width (degenerate guard).
   */
  scale: (tMs: number) => number;
}

/**
 * The x-axis region the pointer is over within a lane.
 * - `active`  — inside an active segment (self-time, per ADR 0003)
 * - `waiting` — inside [start, end] but not an active segment (time spent in children, by default)
 * - `empty`   — outside [start, end]; no span activity at this x in this lane
 * @internal
 */
export type HoverRegion = 'active' | 'waiting' | 'empty';

/**
 * Result of x-aware lane picking (`pickRegion`). `index` is the 0-based span-array index; `region`
 * is the x-axis sub-region under the pointer within that lane.
 * @internal
 */
export interface PickResult {
  index: number;
  region: HoverRegion;
  /**
   * 0-based index into `span.activeSegments` when `region === 'active'`; -1 otherwise.
   * Use this to display per-segment duration in the tooltip.
   */
  segmentIndex: number;
}

/**
 * The renderer seam that allows a Canvas2D or WebGL backend to be swapped without changing
 * geometry, interaction, or the public API. See ADR 0001.
 * @internal
 */
export interface TraceRenderer {
  draw(ctx: CanvasRenderingContext2D, geom: TraceGeometry, style: TraceStyle): void;
  /** Returns the 0-based span-array index under (x, y), or -1 if outside all lanes. */
  pickLane(x: number, y: number, geom: TraceGeometry): number;
}
