/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useEffect, useRef, useState } from 'react';

import { buildGeometry } from '@elastic/charts/src/chart_types/trace_chart/render/geometry';
import { drawTimeBar } from '@elastic/charts/src/chart_types/trace_chart/render/time_bar';
import type { TraceStyle } from '@elastic/charts/src/chart_types/trace_chart/render/types';

const CANVAS_WIDTH = 900;
const TIME_BAR_HEIGHT = 32;
const GUTTER_WIDTH = 0; // no gutter needed for this isolated story

const style: TraceStyle = {
  gutterWidth: GUTTER_WIDTH,
  timeBarHeight: TIME_BAR_HEIGHT,
  laneHeight: 28,
  totalLineThickness: 2,
  totalLineColor: '#aaa',
  activeSegmentColor: '#1f6feb',
  gutterLabel: { fontFamily: 'monospace', fontSize: 11, color: '#555' },
  timeBarLabel: { fontFamily: 'monospace', fontSize: 11, color: '#444' },
  gridLineColor: '#e0e0e0',
};

/**
 * Epoch ms anchor used in stories that expose an `x scale` knob.
 *
 * ## Why the x-scale knob requires traces longer than 1 s
 *
 * The `'time'` and `'linear'` x-scale types produce visually identical tick labels for traces
 * shorter than ~1 s:
 *   - `'linear'` labels elapsed ms from zero: "0ms … 800ms"
 *   - `'time'` without an epoch offset labels wall-clock ms since 1970-01-01: "00:00:00.000 … 00:00:00.800"
 *
 * The two labels look the same at sub-second precision, making the knob appear broken.
 *
 * The fix is twofold:
 *   1. Use a trace that crosses at least one whole-second boundary (duration > 1 s).
 *   2. Offset the span timestamps by EPOCH_BASE when `xScaleType='time'` so the raster engine
 *      renders realistic wall-clock labels ("22:13:20 … 22:13:30") instead of 1970-01-01.
 *
 * Stories where the data is ≤ 1 s and no EPOCH_BASE offset is applied therefore omit the
 * `x scale` knob entirely (e.g. 11_chrome_network, 12_kibana_trace, 13_segment_phases,
 * 14_pinned_tooltip, 15_brush_zoom). Stories with > 1 s data always apply this offset.
 */
const EPOCH_BASE = 1_700_000_000_000; // 2023-11-14T22:13:20Z

function TimeBarCanvas({
  xScaleType,
  focusShiftMs,
}: {
  xScaleType: 'time' | 'linear';
  focusShiftMs: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, CANVAS_WIDTH, TIME_BAR_HEIGHT);

    const fullDomainMs = 10_000; // 10 seconds
    const focusWidthMs = 5_000; // show a 5 s window

    const baseFocusMin = xScaleType === 'time' ? EPOCH_BASE : 0;
    const focusDomain = {
      min: baseFocusMin + focusShiftMs,
      max: baseFocusMin + focusShiftMs + focusWidthMs,
    };
    const domain = {
      min: baseFocusMin,
      max: baseFocusMin + fullDomainMs,
    };

    // Pass domain explicitly: buildGeometry sets domain=0,0 for empty spans, so we supply the
    // full trace domain directly to make the time bar reflect the right range.
    const geom = buildGeometry([], { width: CANVAS_WIDTH, height: TIME_BAR_HEIGHT }, focusDomain, 0, style, xScaleType, domain);

    drawTimeBar(ctx, geom, style);
    ctx.restore();
  }, [xScaleType, focusShiftMs, dpr]);

  return (
    <canvas
      ref={ref}
      width={CANVAS_WIDTH * dpr}
      height={TIME_BAR_HEIGHT * dpr}
      style={{ width: CANVAS_WIDTH, height: TIME_BAR_HEIGHT, display: 'block', border: '1px solid #ccc' }}
    />
  );
}

export const Example = () => {
  const [xScaleType, setXScaleType] = useState<'time' | 'linear'>('time');
  const [focusShiftMs, setFocusShiftMs] = useState(0);

  return (
    <div className="echChart">
      <div className="echChartStatus" data-ech-render-complete={true} />
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <h2 style={{ marginBottom: 12 }}>Spec 4 — time bar</h2>
        <p style={{ marginBottom: 8, color: '#555', fontSize: 13 }}>
          Draws only the time bar via the shared raster-axis engines. Switch scale type and nudge the
          focus domain to verify ticks update correctly.
        </p>
        <p style={{ marginBottom: 16, color: '#888', fontSize: 12, fontStyle: 'italic' }}>
          Note: the <code>x scale</code> knob is only meaningful for traces longer than 1&nbsp;s.
          Below 1&nbsp;s the two scales produce identical sub-second labels, so stories with
          sub-second fixtures omit the knob. This story uses a 10&nbsp;s domain plus a fixed epoch
          base (2023-11-14T22:13:20Z) so wall-clock and elapsed labels are clearly distinguishable.
        </p>

        {/* Controls */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center' }}>
          <label style={{ fontSize: 13 }}>
            Scale type:&nbsp;
            <select
              value={xScaleType}
              onChange={(e) => setXScaleType(e.target.value as 'time' | 'linear')}
              style={{ fontSize: 13 }}
            >
              <option value="time">time (epoch ms)</option>
              <option value="linear">linear (elapsed ms)</option>
            </select>
          </label>
          <label style={{ fontSize: 13 }}>
            Focus shift:&nbsp;
            <input
              type="range"
              min={0}
              max={5000}
              step={100}
              value={focusShiftMs}
              onChange={(e) => setFocusShiftMs(Number(e.target.value))}
            />
            &nbsp;{focusShiftMs}ms
          </label>
        </div>

        <TimeBarCanvas xScaleType={xScaleType} focusShiftMs={focusShiftMs} />

        <p style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
          {xScaleType === 'time'
            ? `Time engine: domain is epoch ms → converted to seconds for the raster engine; labels use Intl.DateTimeFormat.`
            : `Linear engine: domain is elapsed ms; labels use trace-local formatter (not numericalRasters formatter).`}
        </p>
      </div>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
