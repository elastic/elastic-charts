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
  focusShiftMs,
  timeAxisLayerCount,
}: {
  xScaleType: 'time' | 'linear';
  focusShiftMs: number;
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

    const fullDomainMs = 10_000; // 10 s
    const focusWidthMs = 5_000; // 5 s window
    const base = xScaleType === 'time' ? EPOCH_BASE : 0;
    const focusDomain = { min: base + focusShiftMs, max: base + focusShiftMs + focusWidthMs };
    const domain = { min: base, max: base + fullDomainMs };

    // Supply domain explicitly: buildGeometry sets domain=0,0 for empty spans.
    const geom = buildGeometry([], { width: CANVAS_W, height: barH }, focusDomain, 0, style, xScaleType, domain);
    drawTimeBar(ctx, geom, style);
    ctx.restore();
  }, [xScaleType, focusShiftMs, dpr, barH, style]);

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
  const focusShiftMs = number('focus shift (ms)', 0, { min: 0, max: 5000, step: 100 });
  const timeAxisLayerCount = number('tick layers (time mode)', 2, { min: 0, max: 3, step: 1 });

  return (
    <div className="echChart">
      <div className="echChartStatus" data-ech-render-complete={true} />
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <TimeBarCanvas xScaleType={xScaleType} focusShiftMs={focusShiftMs} timeAxisLayerCount={timeAxisLayerCount} />
      </div>
    </div>
  );
};

Example.parameters = {
  markdown:
    'Draws only the time bar via the shared raster-axis engines (`buildGeometry` + `drawTimeBar`). ' +
    'Switch the x-scale knob and nudge the focus-shift slider to verify tick labels update.\n\n' +
    '**Multi-level time bar (time mode):** the `tick layers` knob sets `theme.trace.timeAxisLayerCount`. ' +
    'At `2` a coarser absolute-time row stacks above the fine sub-second row; at `3` a date row is added; ' +
    'at `0` the bar collapses to the legacy single row. The coarsest row pins its leading label to the ' +
    'left edge so absolute-time context stays visible between boundary ticks. `linear` mode is always ' +
    'single-row regardless of the knob.\n\n' +
    '**Why the x-scale knob requires traces longer than 1 s:** `linear` labels elapsed ms from zero; ' +
    '`time` without an epoch offset labels wall-clock ms from 1970-01-01 — at sub-second resolution ' +
    'the two modes produce identical labels, making the knob appear broken. ' +
    `This story uses a 10 s domain with EPOCH_BASE = \`${EPOCH_BASE}\` (2023-11-14T22:13:20Z).`,
};
