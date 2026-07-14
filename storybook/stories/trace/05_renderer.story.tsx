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
import { useBaseTheme } from '../../use_base_theme';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 200;

/** Fixture trace: one root with three children (one of which has two children). */
const INPUT_SPANS: TraceDatum[] = [
  { id: 'root', name: 'HTTP GET /checkout', traceId: 't1', start: 0, end: 1000 },
  { id: 'auth', name: 'AuthService.validate', parentId: 'root', traceId: 't1', start: 100, end: 350 },
  { id: 'db', name: 'DB.query', parentId: 'root', traceId: 't1', start: 400, end: 850 },
  { id: 'cache', name: 'Cache.get', parentId: 'db', traceId: 't1', start: 420, end: 600 },
  { id: 'leaf', name: 'Serializer.encode', parentId: 'db', traceId: 't1', start: 700, end: 820 },
];

export const Example = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const theme = useBaseTheme();
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Derive style from the real light/dark theme — exercises buildTraceStyle in both modes.
    const style = buildTraceStyle(theme);

    // Full normalize → resolveActive → buildGeometry pipeline (Specs 1–3).
    const { spans: normalized } = normalize(INPUT_SPANS, 'simple', 'linear');
    const resolved = resolveActive(normalized);
    const focusDomain = { min: 0, max: 1000 };
    const geom = buildGeometry(resolved, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }, focusDomain, 0, style, 'linear');

    // DPR-scale once, then hand off to the renderer (which is dpr-agnostic by contract).
    ctx.save();
    ctx.scale(dpr, dpr);
    canvas2dRenderer.draw(ctx, geom, style);
    ctx.restore();
  }, [theme, dpr]);

  return (
    <div className="echChart">
      <div className="echChartStatus" data-ech-render-complete={true} />
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <h2 style={{ marginBottom: 12 }}>Spec 5 — Canvas2D renderer</h2>
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
          5-span trace · linear elapsed-ms scale · focus domain [0, 1000 ms] · scrollOffset 0
        </p>
      </div>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
