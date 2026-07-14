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
import { withContext } from '../../../renderers/canvas';
import { renderText } from '../../../renderers/canvas/primitives/text';
import type { TraceGeometry, TraceStyle } from './types';
import type { TextFont } from '../../../renderers/canvas/primitives/text';

const MS_PER_SECOND = 1000;
const TICK_HEIGHT = 6; // px, tick line protruding down into the time bar

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

  withContext(ctx, () => {
    // --- Time bar background ---
    ctx.fillStyle = style.timeBarLabel.color; // will be overridden per element; set base state
    ctx.clearRect(timeBar.left, timeBar.top, timeBar.width, timeBar.height);

    for (const layer of layers) {
      const drawGrid = layer.labeled && showGridLine(layer);

      for (const { minimum, supremum: _supremum } of layer.intervals(domainFrom, domainTo)) {
        // Convert tick position back to ms for `geom.scale`.
        const tickMs = isTime ? minimum * MS_PER_SECOND : minimum;
        const tickX = scale(tickMs);

        // Skip ticks outside the visible plot x-range.
        if (tickX < plot.left || tickX > plot.left + plot.width) continue;

        // Linear mode: 1 ms is the finest meaningful resolution (matches the zoom-depth floor,
        // ADR 0004 Decision 3). numericalRasters subdivides below 1 ms at deep zoom, emitting
        // fractional-ms ticks whose integer-ms labels all duplicate. Render only ticks that sit on
        // a whole-ms boundary → at most one tick (line + gridline + label) per millisecond.
        // Time mode is exempt: continuousTimeRasters already bottoms out at integer-ms ticks, and
        // applying an epsilon test to large epoch-ms values risks float-precision false positives.
        if (!isTime && Math.abs(tickMs - Math.round(tickMs)) > 1e-6) continue;

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

        // --- Tick label (finest labeled layer only — see comment above) ---
        if (layer === labelLayer) {
          const label = isTime
            ? layer.minorTickLabelFormat(minimum * MS_PER_SECOND) // formatters expect ms
            : formatElapsedMs(minimum); // linear: ignore numericalRasters formatter (epoch-relative)
          const labelY = timeBar.top + 2; // a couple of px from the top edge
          renderText(ctx, { x: tickX, y: labelY }, label, labelFont);
        }
      }
    }
  });
}

/**
 * Formats an elapsed millisecond value for the linear scale time bar.
 * Produces "0ms", "250ms", "1.5s", "2m 30s", etc.
 */
function formatElapsedMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const s = ms / 1000;
  if (s < 60) return `${+s.toFixed(2).replace(/\.?0+$/, '')}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return rem === 0 ? `${m}m` : `${m}m ${rem}s`;
}
