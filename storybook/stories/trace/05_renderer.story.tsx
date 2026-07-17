/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React, { useEffect, useRef } from 'react';

import { normalize } from '@elastic/charts/src/chart_types/trace_chart/data/normalize';
import { resolveActive } from '@elastic/charts/src/chart_types/trace_chart/data/self_time';
import { canvas2dRenderer } from '@elastic/charts/src/chart_types/trace_chart/render/canvas2d_renderer';
import { buildGeometry } from '@elastic/charts/src/chart_types/trace_chart/render/geometry';
import { buildTraceStyle } from '@elastic/charts/src/chart_types/trace_chart/theme';

import { CHECKOUT_SPANS, EPOCH_BASE } from './data';
import { useBaseTheme } from '../../use_base_theme';

const CANVAS_W = 900;
const CANVAS_H = 200;

// Scale the 1000 ms fixture ×10 → 10 s so the x-scale knob produces visibly different labels.
const INPUT_SPANS = CHECKOUT_SPANS.map((d) => ({ ...d, start: d.start * 10, end: d.end * 10 }));

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

    const style = buildTraceStyle(theme);

    // In 'time' mode offset spans by EPOCH_BASE so the raster engine renders realistic
    // wall-clock ticks instead of 1970-01-01 labels.
    const spans =
      xScaleType === 'time'
        ? INPUT_SPANS.map((d) => ({ ...d, start: d.start + EPOCH_BASE, end: d.end + EPOCH_BASE }))
        : INPUT_SPANS;

    const { spans: normalized, domain } = normalize(spans, xScaleType);
    const resolved = resolveActive(normalized);
    const focusDomain = { min: domain.min, max: domain.max };
    const geom = buildGeometry(
      resolved,
      { width: CANVAS_W, height: CANVAS_H },
      focusDomain,
      0,
      style,
      xScaleType,
      domain,
    );

    ctx.save();
    ctx.scale(dpr, dpr);
    canvas2dRenderer.draw(ctx, geom, style);
    ctx.restore();
  }, [theme, dpr, xScaleType]);

  return (
    <div className="echChart">
      <div className="echChartStatus" data-ech-render-complete={true} />
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <canvas
          ref={ref}
          width={CANVAS_W * dpr}
          height={CANVAS_H * dpr}
          style={{ width: CANVAS_W, height: CANVAS_H, display: 'block', border: '1px solid #ccc' }}
        />
      </div>
    </div>
  );
};

Example.parameters = {
  markdown:
    'First fully-drawn trace waterfall: gutter labels, time bar (raster ticks + gridlines), ' +
    'total-duration lines, and active-segment rects — exercising the full ' +
    '`normalize → resolveActive → buildGeometry → canvas2dRenderer.draw` pipeline.\n\n' +
    'DPR-scaling is handled by the story; the renderer itself is dpr-agnostic. ' +
    'Toggle the global Storybook **theme** (light/dark) to exercise `buildTraceStyle` in both modes.',
};
