/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, CurveType, Fit, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const series = [
  {
    id: 'complete',
    data: [3, 5, 4, 7, 6, 8, 5, 9, 6, 7, 4, 6, 5, 8, 6].map((y, x) => ({ x, y })),
  },
  {
    id: 'interior gap',
    data: [
      { x: 0, y: 2 },
      { x: 1, y: 3 },
      { x: 2, y: 4 },
      { x: 9, y: 8 },
      { x: 10, y: 7 },
      { x: 11, y: 9 },
      { x: 12, y: 8 },
      { x: 13, y: 7 },
      { x: 14, y: 8 },
    ],
  },
  {
    id: 'leading and trailing gaps',
    data: [
      { x: 5, y: 3 },
      { x: 6, y: 5 },
      { x: 7, y: 4 },
      { x: 8, y: 6 },
    ],
  },
];

export const Example: ChartsStory = (_, { title, description }) => {
  const stacked = boolean('stacked', true);
  const fit = customKnobs.enum.fit(undefined, Fit.Nearest);
  const curve = customKnobs.enum.curve(undefined, CurveType.LINEAR);
  return (
    <Chart title={title} description={description}>
      <Settings showLegend baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="left" position={Position.Left} />
      {series.map(({ id, data }) => (
        <AreaSeries
          key={id}
          id={id}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          stackAccessors={stacked ? ['x'] : undefined}
          curve={curve}
          fit={{ type: fit, endValue: 'nearest' }}
          data={data}
        />
      ))}
    </Chart>
  );
};
