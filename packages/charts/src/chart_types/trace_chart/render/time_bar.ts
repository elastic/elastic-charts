/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  continuousTimeRasters,
  type AxisLayer,
  type Interval,
} from '../../../chart_types/xy_chart/axes/timeslip/continuous_time_rasters';
import { numericalRasters } from '../../../chart_types/xy_chart/axes/timeslip/numerical_rasters';
import {
  notTooDense,
  MINIMUM_TICK_PIXEL_DISTANCE,
  MAX_TIME_TICK_COUNT,
  MAX_TIME_GRID_COUNT,
} from '../../../chart_types/xy_chart/axes/timeslip/multilayer_ticks';
import { cssFontShorthand } from '../../../common/text_utils';
import { withContext } from '../../../renderers/canvas';
import { renderText } from '../../../renderers/canvas/primitives/text';
import type { TraceGeometry, TraceStyle } from './types';
import type { TextFont } from '../../../renderers/canvas/primitives/text';

const MS_PER_SECOND = 1000;
const TICK_HEIGHT = 6; // px, tick line protruding down into the time bar

/**
 * Vertical padding added to the tick-label font size to derive one stacked tick-layer's height.
 * Exported so `geometry.ts` reserves the same per-layer height when computing the effective
 * time-bar height (see ADR 0024 Decision 5). @internal
 */
export const TICK_LAYER_PADDING = 6;

/**
 * Vertical space (px) reserved at the bottom of the time bar, below the finest tick-layer label,
 * so the downward tick marks don't crowd it. Without this inset the finest row would butt right up
 * against (and slightly overlap) the tick marks; `linear` mode gets this gap implicitly by drawing
 * its single row at the top of the bar. Sized to the tick height so the label clears the marks.
 * Exported so `geometry.ts` reserves the same room when sizing the time bar. @internal
 */
export const TICK_LAYER_BOTTOM_INSET = TICK_HEIGHT;

/**
 * Minimum px gap required between a pinned leading label and the next in-view boundary label on the
 * same tick layer before the boundary label is suppressed to avoid overlap (ADR 0024 Decision 6).
 */
const TICK_LABEL_MIN_GAP = 4;

/**
 * Distance in px from the plot edge within which a tick label switches from center-aligned to
 * edge-aligned to avoid the label painting outside the canvas. Approximately half the width of a
 * typical longest label ("2m 30s" ≈ 34 px at fontSize=10). Affects the leftmost and rightmost
 * visible ticks.
 */
const TICK_LABEL_EDGE_PX = 20;

/** IANA time zone used when the trace x-scale type is 'time'. */
const TIME_ZONE = 'UTC';

/** Raster config shared by both engines. */
const rasterConfig = {
  minimumTickPixelDistance: MINIMUM_TICK_PIXEL_DISTANCE,
  locale: 'en-US',
  dow: 1,
};

/**
 * Draws the top time bar onto the canvas, reusing the shared raster-axis engines so tick-spacing
 * logic is not duplicated. Mirrors the approach of `timeslip_render.ts:120` for engine selection
 * and `cartesian.ts:55` for layer request.
 *
 * Units: the time engine (`xScaleType === 'time'`) expects domain values in **seconds**; the trace
 * domain is in ms, so we divide by 1000 at the call boundary. The interval iterators return
 * `minimum/supremum` also in seconds; multiply back to ms before calling `geom.scale`.
 *
 * Linear (`xScaleType === 'linear'`): domain values are passed as-is (ms elapsed). The
 * `numericalRasters` label formatter hardcodes an epoch-relative transform; we ignore it and supply
 * our own elapsed-ms formatting.
 * @internal
 */
export function drawTimeBar(ctx: CanvasRenderingContext2D, geom: TraceGeometry, style: TraceStyle): void {
  const { timeBar, plot, focusDomain, scale, xScaleType } = geom;
  if (timeBar.width <= 0 || timeBar.height <= 0) return;

  // Build label font from TraceStyle. Using sensible defaults for the full Font interface.
  const labelFont: TextFont = {
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    fontFamily: style.timeBarLabel.fontFamily,
    textColor: style.timeBarLabel.color,
    fontSize: style.timeBarLabel.fontSize,
    align: 'center',
    baseline: 'top',
  };

  // Select raster engine by scale type, exactly as timeslip does (timeslip_render.ts:120).
  const isTime = xScaleType === 'time';
  const rasterSelector = isTime
    ? continuousTimeRasters(rasterConfig, TIME_ZONE)
    : numericalRasters(rasterConfig);

  // Convert focusDomain to the units the engine expects.
  // Time engine: seconds. Linear engine: numeric domain (ms elapsed) unchanged.
  const domainFrom = isTime ? focusDomain.min / MS_PER_SECOND : focusDomain.min;
  const domainTo = isTime ? focusDomain.max / MS_PER_SECOND : focusDomain.max;

  // Request layers: filter by density. intervalWidth=0 follows cartesian.ts:55.
  const layers: AxisLayer<Interval>[] = rasterSelector(
    notTooDense(domainFrom, domainTo, 0, timeBar.width, MAX_TIME_TICK_COUNT),
  );

  if (layers.length === 0) return;

  // Gridline density gate: mirrors the second notTooDense call in raster.ts:186.
  const showGridLine = notTooDense(domainFrom, domainTo, 0, timeBar.width, MAX_TIME_GRID_COUNT);

  // The trace time bar is a single-row axis. The raster engine can return multiple labeled layers
  // (e.g. a coarse date layer + a fine time layer). Drawing every labeled layer's text at the same
  // fixed row causes label overlap wherever a coarse and fine tick share an x position. Fix: pick
  // only the finest (most granular) labeled layer for label rendering. Both raster factories return
  // layers finest-first (see `[...layers].reverse()` in continuous_time_rasters.ts and
  // numerical_rasters.ts), so the finest labeled layer is the first element with layer.labeled === true.
  // Tick lines and gridlines are still drawn for all layers; only label text is restricted to one layer.
  const labelLayer: AxisLayer<Interval> | null = layers.find((l) => l.labeled) ?? null;

  // For linear mode, compute one unit for the whole axis before the render loop.
  // numericalRasters returns a single labeled layer with a uniform step; derive the step from the
  // first two ticks so every label is formatted consistently (ADR 0010 — one unit per axis).
  let axisUnit: ElapsedUnit | null = null;
  if (!isTime && labelLayer) {
    // intervals() is a generator — pull the first two values to read the step.
    const iter = labelLayer.intervals(domainFrom, domainTo)[Symbol.iterator]();
    const first = iter.next().value as Interval | undefined;
    const second = iter.next().value as Interval | undefined;
    const stepMs =
      first !== undefined && second !== undefined
        ? second.minimum - first.minimum
        : domainTo - domainFrom; // fallback: window extent
    axisUnit = pickElapsedUnit(stepMs);
  }

  withContext(ctx, () => {
    // --- Time bar background ---
    ctx.fillStyle = style.timeBarLabel.color; // will be overridden per element; set base state
    ctx.clearRect(timeBar.left, timeBar.top, timeBar.width, timeBar.height);

    for (const layer of layers) {
      const drawGrid = layer.labeled && showGridLine(layer);

      for (const { minimum } of layer.intervals(domainFrom, domainTo)) {
        // Convert tick position back to ms for `geom.scale`.
        const tickMs = isTime ? minimum * MS_PER_SECOND : minimum;
        const tickX = scale(tickMs);

        // Skip ticks outside the visible plot x-range.
        if (tickX < plot.left || tickX > plot.left + plot.width) continue;

        // In the nanosecond band, suppress sub-ns positions: only integer-ns boundaries
        // get tick lines and labels. Mirrors the old whole-ms filter but for ns (ADR 0010).
        if (!isTime && axisUnit?.suffix === 'ns') {
          const nsValue = tickMs / 1e-6;
          if (Math.abs(nsValue - Math.round(nsValue)) > 1e-6) continue;
        }

        // --- Tick line: protrudes from bottom of time bar ---
        withContext(ctx, () => {
          ctx.strokeStyle = style.timeBarLabel.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tickX, timeBar.top + timeBar.height - TICK_HEIGHT);
          ctx.lineTo(tickX, timeBar.top + timeBar.height);
          ctx.stroke();
        });

        // --- Faint gridline through the plot area ---
        if (drawGrid) {
          withContext(ctx, () => {
            ctx.strokeStyle = style.gridLineColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tickX, plot.top);
            ctx.lineTo(tickX, plot.top + plot.height);
            ctx.stroke();
          });
        }

        // --- Single-row tick label (finest labeled layer only — see comment above) ---
        // Used for linear mode (any layer count) and for time mode with timeAxisLayerCount === 0
        // (legacy single-row, byte-identical to pre-feature). Time mode with count >= 1 draws its
        // labels in the stacked tick-layer loop below (ADR 0024).
        if (layer === labelLayer && (!isTime || style.timeAxisLayerCount === 0)) {
          const label = isTime
            ? layer.minorTickLabelFormat(minimum * MS_PER_SECOND) // time formatters expect ms
            : formatElapsedMs(minimum, axisUnit!); // linear: one unit per axis (ADR 0010)
          const labelY = timeBar.top + 2; // a couple of px from the top edge

          // Flip from center-aligned to edge-aligned when the tick is near the plot boundary, so
          // label text doesn't paint outside the canvas. Affects leftmost and rightmost visible ticks.
          const plotRight = plot.left + plot.width;
          let tickLabelFont = labelFont;
          if (tickX - plot.left < TICK_LABEL_EDGE_PX) {
            tickLabelFont = { ...labelFont, align: 'left' };
          } else if (plotRight - tickX < TICK_LABEL_EDGE_PX) {
            tickLabelFont = { ...labelFont, align: 'right' };
          }
          renderText(ctx, { x: tickX, y: labelY }, label, tickLabelFont);
        }
      }
    }

    // --- Stacked tick-layer label draw (time mode, timeAxisLayerCount >= 1, ADR 0024) ---
    // Draws the finest `timeAxisLayerCount` labeled layers as distinct rows: layer 0 (finest) nearest
    // the plot, coarser layers stacking upward. Tick lines and gridlines are already drawn above for
    // all layers; this pass adds only stacked label text. `linear` mode and time-mode count === 0 use
    // the single-row path above instead.
    if (isTime && style.timeAxisLayerCount >= 1) {
      const tickLayerHeight = style.timeBarLabel.fontSize + TICK_LAYER_PADDING;
      // Set the measuring font once so ctx.measureText below reflects the actual label font.
      ctx.font = cssFontShorthand(labelFont, labelFont.fontSize);

      // Collect the finest `timeAxisLayerCount` labeled layers (finest→coarsest; raster order is
      // finest-first). Unlabeled layers do not count toward the cap.
      const labelLayers: Array<{ layer: AxisLayer<Interval>; tickLayerIndex: number }> = [];
      let tickLayerIndex = -1;
      for (const layer of layers) {
        if (!layer.labeled) continue;
        tickLayerIndex++;
        if (tickLayerIndex >= style.timeAxisLayerCount) break; // cap at token
        labelLayers.push({ layer, tickLayerIndex });
      }
      const coarsestTickLayerIndex = labelLayers.length - 1;
      const plotRight = plot.left + plot.width;

      for (const { layer, tickLayerIndex: ti } of labelLayers) {
        const isFinest = ti === 0;
        const isCoarsestShown = ti === coarsestTickLayerIndex;
        // Coarsest shown layer uses the verbose absolute-time format; finer layers use the terse one.
        const labelFormat = isCoarsestShown ? layer.detailedLabelFormat : layer.minorTickLabelFormat;

        // Lift the whole stack up by TICK_LAYER_BOTTOM_INSET so the finest row clears the tick marks.
        const layerLabelY =
          timeBar.top + timeBar.height - TICK_LAYER_BOTTOM_INSET - (ti + 1) * tickLayerHeight + TICK_LAYER_PADDING / 2;

        // Upper (non-finest) layers pin a single "leading" label for the interval that *contains* the
        // left viewport edge. The raster generators emit every boundary from far before the viewport,
        // so we cannot treat each off-left tick as pinned — that would stack the whole history at
        // plot.left. Instead we remember only the newest (nearest) off-left label and flush it once,
        // when the first in-view tick appears (or at the end, if the whole layer is off-left).
        let pinnedLabel: string | null = null;
        let prevTickX: number | null = null;
        let prevLabel = '';

        const drawPinnedLeading = (): void => {
          if (pinnedLabel === null) return;
          renderText(ctx, { x: plot.left, y: layerLabelY }, pinnedLabel, { ...labelFont, align: 'left' });
          prevTickX = plot.left;
          prevLabel = pinnedLabel;
          pinnedLabel = null;
        };

        for (const { minimum } of layer.intervals(domainFrom, domainTo)) {
          const tickXRaw = scale(minimum * MS_PER_SECOND);
          const label = labelFormat(minimum * MS_PER_SECOND); // time formatters expect ms

          // Off-left ticks: the finest layer drops them outright (today's behavior); upper layers
          // keep only the last one as the pinned-leading candidate (containing interval).
          if (tickXRaw < plot.left) {
            if (!isFinest) pinnedLabel = label;
            continue;
          }

          // First in-view tick: flush the pinned-leading label at the edge before drawing it.
          if (prevTickX === null) drawPinnedLeading();

          // Skip ticks past the right edge.
          if (tickXRaw > plotRight) continue;

          // Suppress a boundary label that would overlap the previous drawn (e.g. pinned) one.
          if (
            prevTickX !== null &&
            tickXRaw - prevTickX < ctx.measureText(prevLabel).width + TICK_LABEL_MIN_GAP
          ) {
            continue; // overlap — keep the previous label, drop this one
          }

          // Flip center→edge alignment near the plot boundary so text stays on-canvas.
          let tickLabelFont = labelFont;
          if (tickXRaw - plot.left < TICK_LABEL_EDGE_PX) {
            tickLabelFont = { ...labelFont, align: 'left' };
          } else if (plotRight - tickXRaw < TICK_LABEL_EDGE_PX) {
            tickLabelFont = { ...labelFont, align: 'right' };
          }
          renderText(ctx, { x: tickXRaw, y: layerLabelY }, label, tickLabelFont);

          prevTickX = tickXRaw;
          prevLabel = label;
        }

        // Whole layer was off-left (no in-view tick): still show the containing-interval label.
        if (prevTickX === null) drawPinnedLeading();
      }
    }
  });
}

/**
 * Axis unit descriptor for the linear time bar. Carry it as an opaque value from
 * `pickElapsedUnit` to `formatElapsedMs` — do not read its fields directly in callers.
 * @internal
 */
export interface ElapsedUnit {
  /** Divisor to convert ms to the display unit (e.g. 1000 for seconds). */
  divisor: number;
  /** Display suffix string (e.g. "ms", "µs", "ns", "s", or "m" for the minutes compound format). */
  suffix: string;
  /** Number of decimal places to render (0 = integer). No cap — ensures adjacent ticks stay distinct. */
  decimals: number;
}

/**
 * Picks ONE unit for the whole linear time-bar axis.
 *
 * `stepMs` — the uniform tick spacing — drives BOTH the unit and decimal precision.
 * Unit thresholds: step ≥60000ms → minutes compound, step ≥1000ms → s, step ≥1ms → ms,
 * step >1e-6ms → µs, else (≤1e-6ms, i.e. ≤1ns) → ns. Using the step (not the absolute
 * tick value) ensures the unit reflects the zoom resolution, not the position in the trace.
 *
 * Nanosecond range always uses 0 decimals (integer ns). Sub-ns tick positions are
 * suppressed in `drawTimeBar` via an integer-ns filter so no fractional-ns labels appear.
 *
 * Decimal precision for non-ns units: `ceil(-log10(step_in_unit))`. No cap — ensures
 * adjacent ticks stay distinct. Guard: step ≤ 0 / NaN → 0 decimals (integer).
 *
 * See ADR 0010 for the one-unit-per-axis decision and rationale.
 * @internal
 */
export function pickElapsedUnit(stepMs: number): ElapsedUnit {
  const decFor = (stepInUnit: number): number => {
    if (!(stepInUnit > 0)) return 0; // guard ≤0 / NaN
    return stepInUnit >= 1 ? 0 : Math.ceil(-Math.log10(stepInUnit));
  };
  // Guard: treat ≤0 / NaN as a 1ms step (ms unit, 0 decimals).
  if (!(stepMs > 0)) return { divisor: 1, suffix: 'ms', decimals: 0 };
  if (stepMs >= 60_000) {
    // Compound minutes format; decimals unused (formatElapsedMs handles it separately).
    return { divisor: 1, suffix: 'm', decimals: 0 };
  }
  if (stepMs >= 1_000) return { divisor: 1000, suffix: 's', decimals: decFor(stepMs / 1000) };
  if (stepMs >= 1e-3) return { divisor: 1, suffix: 'ms', decimals: decFor(stepMs) };
  if (stepMs > 1e-6) return { divisor: 1e-3, suffix: 'µs', decimals: decFor(stepMs / 1e-3) };
  // ≤ 1ns: always integer ns (no fractional nanoseconds). Sub-ns positions are filtered
  // out in drawTimeBar so tick lines and labels only appear at integer-ns boundaries.
  return { divisor: 1e-6, suffix: 'ns', decimals: 0 };
}

/**
 * Formats one elapsed-ms tick value using the axis unit from `pickElapsedUnit`.
 *
 * The `'m'` suffix triggers the compound "Xm"/"Xm Ys" minutes format.
 * All other suffixes use `toFixed(decimals)` for fixed-width alignment across the axis.
 * @internal
 */
export function formatElapsedMs(ms: number, unit: ElapsedUnit): string {
  if (unit.suffix === 'm') {
    const s = ms / 1000;
    if (s < 60) return `${+s.toFixed(2).replace(/\.?0+$/, '')}s`;
    const m = Math.floor(s / 60);
    const rem = Math.round(s % 60);
    return rem === 0 ? `${m}m` : `${m}m ${rem}s`;
  }
  const v = ms / unit.divisor;
  return unit.decimals === 0 ? `${Math.round(v)}${unit.suffix}` : `${v.toFixed(unit.decimals)}${unit.suffix}`;
}
