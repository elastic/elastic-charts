/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React, { useMemo } from 'react';

import type { TraceDatum, TraceSpanBadge, TraceSpanBadgeAccessor } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import { buildLargeTrace } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Derives a small, realistic Span-badge cluster (service · duration · status) for every span, so the
 * badge draw pass (Spec 27) is exercised on every visible lane at large N. Deterministic per span:
 * the service is the name prefix, the duration is the span extent, and the status is a cheap hash of
 * the id so most lanes read `200 OK` with the occasional `500 ERR`.
 */
const STRESS_BADGES: TraceSpanBadgeAccessor = (datum: TraceDatum): readonly TraceSpanBadge[] => {
  const service = datum.name.split(' — ')[0] ?? datum.name;
  const durationMs = Math.round(datum.end - datum.start);
  // Cheap deterministic hash of the id → ~1 in 8 spans flagged as an error.
  let h = 0;
  for (let i = 0; i < datum.id.length; i++) h = (h * 31 + datum.id.charCodeAt(i)) % 1_000_000_007;
  const status: TraceSpanBadge =
    h % 8 === 0
      ? { id: 'status', text: '500 ERR', color: 'danger' }
      : { id: 'status', text: '200 OK', color: 'success' };
  return [
    { id: 'service', text: service, color: 'hollow' },
    { id: 'duration', text: `${durationMs} ms`, color: 'default' },
    status,
  ];
};

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const isTall = boolean('Make it tall', false);
  const spanCount = number('span count', 5_000, { min: 100, max: 10_000, step: 100 });
  const xScaleType = select<'linear' | 'time'>(
    'x scale',
    { 'linear (elapsed ms)': 'linear', 'time (epoch ms)': 'time' },
    'linear',
  );
  // Number of stacked tick-label rows in time mode (theme.trace.timeAxisLayerCount). Ignored in linear.
  const timeAxisLayerCount = number('tick layers (time mode)', 2, { min: 0, max: 3, step: 1 });
  // Where span-name labels are drawn (theme.trace.labelPosition).
  const labelPosition = select<'gutter' | 'inline' | 'none'>(
    'label position',
    { gutter: 'gutter', inline: 'inline', none: 'none' },
    'gutter',
  );

  // Stress test: attach real Span badges (Spec 27) to every span so the badge layout + draw pass runs
  // on every visible lane. Off by default so the baseline perf gate and VRT snapshots are unaffected.
  const showBadges = boolean('show badges (stress test)', false);
  const badgeSize = select<'s' | 'm'>('badge size', { small: 's', medium: 'm' }, 'm');

  const data: TraceDatum[] = useMemo(() => buildLargeTrace(spanCount), [spanCount]);

  const chartHeight = isTall ? 'calc(100vh - 230px)' : 300;
  return (
    <div style={{ height: chartHeight }}>
      <Chart title={title} description={description} size={{ width: '100%', height: '100%' }}>
        <Settings baseTheme={theme} theme={{ trace: { timeAxisLayerCount, labelPosition } }} />
        <Trace
          id="trace_large_n"
          data={data}
          xScaleType={xScaleType}
          badgeAccessor={showBadges ? STRESS_BADGES : undefined}
          badgeSize={badgeSize}
        />
      </Chart>
    </div>
  );
};

Example.parameters = {
  markdown:
    'Performance gate: a seeded-PRNG generator builds a realistic microservices checkout ' +
    'trace of up to 10 000 spans. Pan, zoom, and vertical scroll must stay responsive via ' +
    'viewport culling — the draw loop only visits visible lanes per frame.\n\n' +
    'The seed is fixed at 42 for VRT stability; only span count changes with the knob. ' +
    'The culling regression guard lives in `canvas2d_renderer.test.ts`.\n\n' +
    '**Badge stress test (Spec 27):** toggle `show badges (stress test)` to attach a real ' +
    'service · duration · status badge cluster to every span via the public `badgeAccessor` prop. ' +
    'The on-canvas badge layout and draw pass then runs on every visible lane, so panning, zooming, ' +
    'and scrolling exercise the badge pipeline at large N alongside the spans. Use the `badge size` ' +
    'and `label position` knobs to compare placements (gutter, inline, none).',
};
