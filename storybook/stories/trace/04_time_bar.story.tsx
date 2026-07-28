/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number, select } from '@storybook/addon-knobs';
import React, { useEffect, useMemo, useRef } from 'react';

import { buildGeometry } from '@elastic/charts/src/chart_types/trace_chart/render/geometry';
import {
  drawTimeBar,
  TICK_LAYER_PADDING,
  TICK_LAYER_BOTTOM_INSET,
} from '@elastic/charts/src/chart_types/trace_chart/render/time_bar';
import {
  DEFAULT_TRACE_ANNOTATION_STYLE,
  DEFAULT_TRACE_BADGE_STYLE,
} from '@elastic/charts/src/chart_types/trace_chart/render/types';
import type { TraceStyle } from '@elastic/charts/src/chart_types/trace_chart/render/types';

import { EPOCH_BASE } from './data';

const CANVAS_W = 900;
const TIME_BAR_H = 32;

// Zoom presets: focus-window width in ms, from day-scale down to 1 ns. Object keys are the dropdown
// labels; values are the window width the focus domain spans. Ordered widest→narrowest. The sub-ms
// widths (µs/ns) are only meaningful in `linear` mode — the `time` scale bottoms out at 1 ms (float64
// cannot resolve sub-ms differences at epoch magnitudes; see the Minimum visible extent glossary).
const ZOOM_WINDOWS_MS: Record<string, number> = {
  '7 days': 7 * 86_400_000,
  '1 day': 86_400_000,
  '6 hours': 6 * 3_600_000,
  '1 hour': 3_600_000,
  '10 minutes': 10 * 60_000,
  '1 minute': 60_000,
  '10 seconds': 10_000,
  '1 second': 1_000,
  '100 ms': 100,
  '10 ms': 10,
  '1 ms': 1,
  '100 µs': 1e-1,
  '10 µs': 1e-2,
  '1 µs': 1e-3,
  '100 ns': 1e-4,
  '10 ns': 1e-5,
  '1 ns': 1e-6,
};

// Fixed style (production derives this via buildTraceStyle). gutterWidth=0: no span labels needed.
const STYLE: TraceStyle = {
  gutterWidth: 0,
  timeBarHeight: TIME_BAR_H,
  timeAxisLayerCount: 2,
  laneHeight: 28,
  totalLineThickness: 2,
  totalLineColor: '#aaa',
  activeSegmentColor: '#1f6feb',
  gutterLabel: { fontFamily: 'monospace', fontSize: 11, color: '#555' },
  timeBarLabel: { fontFamily: 'monospace', fontSize: 11, color: '#444' },
  gridLineColor: '#e0e0e0',
  focusedLaneBackground: 'rgba(96,146,192,0.15)',
  selectedSegmentStroke: '#f00',
  selectedSegmentStrokeWidth: 2,
  criticalPathColor: '#c61e25',
  criticalPathThickness: 2,
  labelPosition: 'gutter',
  badge: DEFAULT_TRACE_BADGE_STYLE,
  annotation: DEFAULT_TRACE_ANNOTATION_STYLE,
};

// ---------------------------------------------------------------------------
// TimeBarCanvas — draws just the time bar on a canvas element
// ---------------------------------------------------------------------------
function TimeBarCanvas({
  xScaleType,
  windowMs,
  shiftWindows,
  timeAxisLayerCount,
}: {
  xScaleType: 'time' | 'linear';
  windowMs: number;
  shiftWindows: number;
  timeAxisLayerCount: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  const style: TraceStyle = useMemo(() => ({ ...STYLE, timeAxisLayerCount }), [timeAxisLayerCount]);

  // Effective time-bar height: in time mode it grows to reserve a fixed slot per stacked tick layer
  // (ADR 0024). Mirrors the formula in buildGeometry so the canvas element is tall enough not to clip.
  const tickLayerHeight = style.timeBarLabel.fontSize + TICK_LAYER_PADDING;
  const barH =
    xScaleType === 'time'
      ? Math.max(style.timeBarHeight, timeAxisLayerCount * tickLayerHeight + TICK_LAYER_BOTTOM_INSET)
      : style.timeBarHeight;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, CANVAS_W, barH);

    // The focus window width is the zoom level. `time` anchors at EPOCH_BASE (wall clock); `linear`
    // anchors at 0 (elapsed). Shift moves the window right in whole-window steps so the pan scales with
    // zoom. Keeping shift at 0 places the window at the origin — ideal for `linear` ns zoom, where
    // float64 only resolves nanosecond steps near zero (large offsets lose sub-ms precision).
    const base = xScaleType === 'time' ? EPOCH_BASE : 0;
    const start = base + shiftWindows * windowMs;
    const focusDomain = { min: start, max: start + windowMs };
    const domain = { min: base, max: Math.max(focusDomain.max, base + windowMs) };

    // Supply domain explicitly: buildGeometry sets domain=0,0 for empty spans.
    const geom = buildGeometry([], { width: CANVAS_W, height: barH }, focusDomain, 0, style, xScaleType, domain);
    drawTimeBar(ctx, geom, style);
    ctx.restore();
  }, [xScaleType, windowMs, shiftWindows, dpr, barH, style]);

  return (
    <canvas
      ref={ref}
      width={CANVAS_W * dpr}
      height={barH * dpr}
      style={{ width: CANVAS_W, height: barH, display: 'block', border: '1px solid #ccc' }}
    />
  );
}

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------
export const Example = () => {
  const xScaleType = select<'time' | 'linear'>(
    'x scale',
    { 'time (epoch ms)': 'time', 'linear (elapsed ms)': 'linear' },
    'time',
  );
  const windowMs = select<number>('zoom (window width)', ZOOM_WINDOWS_MS, ZOOM_WINDOWS_MS['1 second']!);
  const shiftWindows = number('focus shift (windows)', 0, { min: 0, max: 10, step: 0.25 });
  const timeAxisLayerCount = number('tick layers (time mode)', 2, { min: 0, max: 3, step: 1 });

  return (
    <div className="echChart">
      <div className="echChartStatus" data-ech-render-complete={true} />
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <TimeBarCanvas
          xScaleType={xScaleType}
          windowMs={windowMs}
          shiftWindows={shiftWindows}
          timeAxisLayerCount={timeAxisLayerCount}
        />
      </div>
    </div>
  );
};

Example.parameters = {
  markdown:
    'Draws only the time bar via the shared raster-axis engines (`buildGeometry` + `drawTimeBar`). ' +
    'Switch the x-scale knob, pick a `zoom (window width)`, and nudge `focus shift (windows)` to verify ' +
    'tick labels update.\n\n' +
    '**Zoom knob:** the focus-window width *is* the zoom level. Presets range from `7 days` down to ' +
    '`1 ns`. Use it to exercise the extremes:\n' +
    '- **Nanosecond precision (`linear` only):** pick `100 ns` … `1 ns` with `focus shift = 0`. The ' +
    'linear axis re-zeros at 0, so float64 resolves nanosecond steps near the origin; labels switch to ' +
    '`µs`/`ns` units and stay distinct (ADR 0010). Keep shift at 0 — large offsets lose sub-ms ' +
    "precision. In `time` mode sub-ms widths collapse (epoch magnitudes can't resolve them).\n" +
    '- **Day precision (both modes):** pick `1 day` / `7 days`. `time` mode shows calendar day/hour ' +
    'rows; `linear` mode shows the elapsed value in its coarsest unit (minutes/compound).\n\n' +
    '**Linear label density gating:** at wide zooms the single elapsed row thins labels to a uniform ' +
    'stride (anchored to absolute tick ordinals, so labels don\'t "dance" while zooming/shifting) while ' +
    'the fine tick lines stay dense.\n\n' +
    '**Multi-level time bar (time mode):** the `tick layers` knob sets `theme.trace.timeAxisLayerCount`. ' +
    'At `2` a coarser absolute-time row stacks above the fine sub-second row; at `3` a date row is added; ' +
    'at `0` the bar collapses to the legacy single row. The coarsest row pins its leading label to the ' +
    'left edge so absolute-time context stays visible between boundary ticks. `linear` mode is always ' +
    'single-row regardless of the knob.\n\n' +
    '**Why sub-second `time` zoom looks like `linear`:** `linear` labels elapsed ms from zero; ' +
    '`time` labels wall-clock ms from EPOCH_BASE — at sub-second resolution the two modes produce ' +
    'similar-looking labels. ' +
    `This story anchors \`time\` mode at EPOCH_BASE = \`${EPOCH_BASE}\` (2023-11-14T22:13:20Z).`,
};
