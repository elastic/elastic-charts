/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number, select } from '@storybook/addon-knobs';
import React, { useEffect, useRef } from 'react';

import { buildGeometry } from '@elastic/charts/src/chart_types/trace_chart/render/geometry';
import { drawTimeBar } from '@elastic/charts/src/chart_types/trace_chart/render/time_bar';
import type { TraceStyle } from '@elastic/charts/src/chart_types/trace_chart/render/types';

import { EPOCH_BASE } from './data';

const CANVAS_W = 900;
const TIME_BAR_H = 32;

// Fixed style (production derives this via buildTraceStyle). gutterWidth=0: no span labels needed.
const STYLE: TraceStyle = {
  gutterWidth: 0,
  timeBarHeight: TIME_BAR_H,
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
};

// ---------------------------------------------------------------------------
// TimeBarCanvas — draws just the time bar on a canvas element
// ---------------------------------------------------------------------------
function TimeBarCanvas({ xScaleType, focusShiftMs }: { xScaleType: 'time' | 'linear'; focusShiftMs: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, CANVAS_W, TIME_BAR_H);

    const fullDomainMs = 10_000; // 10 s
    const focusWidthMs = 5_000; // 5 s window
    const base = xScaleType === 'time' ? EPOCH_BASE : 0;
    const focusDomain = { min: base + focusShiftMs, max: base + focusShiftMs + focusWidthMs };
    const domain = { min: base, max: base + fullDomainMs };

    // Supply domain explicitly: buildGeometry sets domain=0,0 for empty spans.
    const geom = buildGeometry([], { width: CANVAS_W, height: TIME_BAR_H }, focusDomain, 0, STYLE, xScaleType, domain);
    drawTimeBar(ctx, geom, STYLE);
    ctx.restore();
  }, [xScaleType, focusShiftMs, dpr]);

  return (
    <canvas
      ref={ref}
      width={CANVAS_W * dpr}
      height={TIME_BAR_H * dpr}
      style={{ width: CANVAS_W, height: TIME_BAR_H, display: 'block', border: '1px solid #ccc' }}
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

  return (
    <div className="echChart">
      <div className="echChartStatus" data-ech-render-complete={true} />
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <TimeBarCanvas xScaleType={xScaleType} focusShiftMs={focusShiftMs} />
      </div>
    </div>
  );
};

Example.parameters = {
  markdown:
    'Draws only the time bar via the shared raster-axis engines (`buildGeometry` + `drawTimeBar`). ' +
    'Switch the x-scale knob and nudge the focus-shift slider to verify tick labels update.\n\n' +
    '**Why the x-scale knob requires traces longer than 1 s:** `linear` labels elapsed ms from zero; ' +
    '`time` without an epoch offset labels wall-clock ms from 1970-01-01 — at sub-second resolution ' +
    'the two modes produce identical labels, making the knob appear broken. ' +
    `This story uses a 10 s domain with EPOCH_BASE = \`${EPOCH_BASE}\` (2023-11-14T22:13:20Z).`,
};
