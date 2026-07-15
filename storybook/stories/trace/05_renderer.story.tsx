/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useEffect, useRef } from 'react';

import { normalize } from '@elastic/charts/src/chart_types/trace_chart/data/normalize';
import { resolveActive } from '@elastic/charts/src/chart_types/trace_chart/data/self_time';
import { canvas2dRenderer } from '@elastic/charts/src/chart_types/trace_chart/render/canvas2d_renderer';
import { buildGeometry } from '@elastic/charts/src/chart_types/trace_chart/render/geometry';
import { buildTraceStyle } from '@elastic/charts/src/chart_types/trace_chart/theme';
import type { TraceDatum } from '@elastic/charts/src/chart_types/trace_chart/trace_api';
import { select } from '@storybook/addon-knobs';
import { useBaseTheme } from '../../use_base_theme';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 200;

/**
 * Epoch ms anchor used when xScaleType='time'. Same value as 06_interactive and 04_time_bar.
 * Without this offset, small elapsed-ms values are interpreted as epoch ms (1970-01-01) where
 * every calendar boundary coincides at x=plot.left, producing overlapping "gibberish" labels.
 * See the note in 04_time_bar.story.tsx for why the x-scale knob requires traces > 1 s.
 */
const EPOCH_BASE = 1_700_000_000_000; // 2023-11-14T22:13:20Z

/** Fixture trace: one root with three children (one of which has two children). 10 s total. */
const INPUT_SPANS: TraceDatum[] = [
  { id: 'root', name: 'HTTP GET /checkout', traceId: 't1', start: 0, end: 10_000 },
  { id: 'auth', name: 'AuthService.validate', parentId: 'root', traceId: 't1', start: 1_000, end: 3_500 },
  { id: 'db', name: 'DB.query', parentId: 'root', traceId: 't1', start: 4_000, end: 8_500 },
  { id: 'cache', name: 'Cache.get', parentId: 'db', traceId: 't1', start: 4_200, end: 6_000 },
  { id: 'leaf', name: 'Serializer.encode', parentId: 'db', traceId: 't1', start: 7_000, end: 8_200 },
];

export const Example = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const theme = useBaseTheme();
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
  const xScaleType = select<'linear' | 'time'>(
    'x scale',
    { 'linear (elapsed ms)': 'linear', 'time (epoch ms)': 'time' },
    'linear',
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Derive style from the real light/dark theme — exercises buildTraceStyle in both modes.
    const style = buildTraceStyle(theme);

    // In 'time' mode offset spans by EPOCH_BASE so the raster engine renders realistic wall-clock
    // ticks (e.g. "22:13:20 … 22:13:30") instead of 1970-01-01 epoch labels.
    const spans = xScaleType === 'time'
      ? INPUT_SPANS.map((d) => ({ ...d, start: d.start + EPOCH_BASE, end: d.end + EPOCH_BASE }))
      : INPUT_SPANS;

    // Full normalize → resolveActive → buildGeometry pipeline (Specs 1–3).
    const { spans: normalized, domain } = normalize(spans, xScaleType);
    const resolved = resolveActive(normalized);
    const focusDomain = { min: domain.min, max: domain.max };
    const geom = buildGeometry(
      resolved,
      { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
      focusDomain,
      0,
      style,
      xScaleType,
      domain,
    );

    // DPR-scale once, then hand off to the renderer (which is dpr-agnostic by contract).
    ctx.save();
    ctx.scale(dpr, dpr);
    canvas2dRenderer.draw(ctx, geom, style);
    ctx.restore();
  }, [theme, dpr, xScaleType]);

  return (
    <div className="echChart">
      <div className="echChartStatus" data-ech-render-complete={true} />
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <h2 style={{ marginBottom: 12 }}>Spec 5 &mdash; Canvas2D renderer</h2>
        <p style={{ marginBottom: 16, color: '#555', fontSize: 13 }}>
          First fully-drawn trace waterfall: gutter labels, time bar (raster ticks + gridlines),
          total-duration lines, and active-segment rects. DPR-scaled by the story; the renderer
          itself is dpr-agnostic. Toggle the global Storybook theme (light/dark) to exercise{' '}
          <code>buildTraceStyle</code> in both modes.
        </p>
        <canvas
          ref={ref}
          width={CANVAS_WIDTH * dpr}
          height={CANVAS_HEIGHT * dpr}
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, display: 'block', border: '1px solid #ccc' }}
        />
        <p style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
          5-span trace &middot; 10 s &middot; {xScaleType === 'linear' ? 'linear elapsed-ms' : 'time (wall-clock)'} scale &middot; scrollOffset 0
        </p>
      </div>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
