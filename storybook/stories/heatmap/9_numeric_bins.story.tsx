/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Heatmap, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator('numeric_bins');
const hosts = ['host-a', 'host-b', 'host-c', 'host-d'];
const interval = 10;
const data = hosts.flatMap((host) =>
  Array.from({ length: 20 }, (_, i) => ({ host, x: i * interval, count: rng(0, 100) })).filter(
    ({ x }) => x < 60 || x > 100,
  ),
);

export const Example: ChartsStory = (_, { title, description }) => {
  const useDomain = boolean('Custom domain', false);
  const min = number('Domain min', -20, { step: 5 }, 'Domain');
  const max = number('Domain max', 140, { step: 5 }, 'Domain');
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} onBrushEnd={action('onBrushEnd')} />
      <Heatmap
        id="numericBinsHeatmap"
        colorScale={{
          type: 'bands',
          bands: [
            { start: 0, end: 25, color: '#d2e9f7' },
            { start: 25, end: 50, color: '#8bc8fb' },
            { start: 50, end: 75, color: '#fdec25' },
            { start: 75, end: Infinity, color: '#fe5050' },
          ],
        }}
        data={data}
        xAccessor="x"
        yAccessor="host"
        valueAccessor="count"
        valueFormatter={(d) => `${Number(d.toFixed(0))}`}
        xScale={{ type: ScaleType.Linear, interval, domain: useDomain ? { min, max } : undefined }}
      />
    </Chart>
  );
};
