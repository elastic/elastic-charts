/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React, { useMemo } from 'react';

import type { TraceDatum } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import { buildLargeTrace } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

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

  const data: TraceDatum[] = useMemo(() => buildLargeTrace(spanCount), [spanCount]);

  return (
    <Chart
      title={title}
      description={description}
      size={{ width: '100%', height: isTall ? 'calc(100vh - 230px)' : 300 }}
    >
      <Settings baseTheme={theme} theme={{ trace: { timeAxisLayerCount } }} />
      <Trace id="trace_large_n" data={data} xScaleType={xScaleType} />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'Performance gate: a seeded-PRNG generator builds a realistic microservices checkout ' +
    'trace of up to 10 000 spans. Pan, zoom, and vertical scroll must stay responsive via ' +
    'viewport culling — the draw loop only visits visible lanes per frame.\n\n' +
    'The seed is fixed at 42 for VRT stability; only span count changes with the knob. ' +
    'The culling regression guard lives in `canvas2d_renderer.test.ts`.',
};
