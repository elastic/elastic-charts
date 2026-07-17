/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React, { useMemo } from 'react';

import type { TraceDatum } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import { CHECKOUT_WATERFALL, EPOCH_BASE } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// Multiplier applied at render time: stretches the 0–1000 ms fixture to 0–10 000 ms
// so the two x-scale modes produce clearly different labels:
//   linear: "0ms, 1s, 2s, … 10s"   time: "22:13:20, 22:13:21, … 22:13:30"
const SPAN_DURATION_SCALE = 10;

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const xScaleType = select<'time' | 'linear'>(
    'x scale',
    { 'linear (elapsed ms)': 'linear', 'time (epoch ms)': 'time' },
    'linear',
  );

  // Scale durations ×10 and — in time mode — offset by EPOCH_BASE so the raster
  // engine renders realistic wall-clock ticks instead of 1970-01-01 labels.
  const data: TraceDatum[] = useMemo(() => {
    const scaled = CHECKOUT_WATERFALL.map((d) => ({
      ...d,
      start: d.start * SPAN_DURATION_SCALE,
      end: d.end * SPAN_DURATION_SCALE,
    }));
    return xScaleType === 'time'
      ? scaled.map((d) => ({ ...d, start: d.start + EPOCH_BASE, end: d.end + EPOCH_BASE }))
      : scaled;
  }, [xScaleType]);

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 300 }}>
      <Settings baseTheme={theme} />
      <Trace id="trace_interactive" data={data} xScaleType={xScaleType} />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'First story using the public `<Trace>` component. 16 spans (16 × 24 px = 384 px content ' +
    'height) intentionally exceed the plot height so vertical lane-scroll is reachable by ' +
    'dragging down. Pan (drag), zoom (wheel), and vertical scroll are all active.\n\n' +
    'The x-scale knob switches between **linear** (elapsed ms) and **time** (wall-clock). ' +
    'Spans are scaled ×10 (to 10 s) so the two modes produce visibly different axis labels.',
};
