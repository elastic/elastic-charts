/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const data = [
  { x: 'com.example.something.host.23', y: 12 },
  { x: 'com.example.something.host.11', y: 8 },
  { x: 'com.example.something.host.07', y: 17 },
  { x: 'com.example.something.host.02', y: 5 },
  { x: 'com.example.something.worker.04', y: 9 },
  { x: 'com.example.something.worker.01', y: 4 },
];

export const Example: ChartsStory = (_, { title, description }) => {
  const maxWidth = number('Max width for tick labels (Y)', 120, { min: 0, max: 400, step: 10 });

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} rotation={90} />
      <Axis id="bottom" position={Position.Bottom} title="Count" />
      <Axis
        id="left"
        position={Position.Left}
        title="Team"
        style={{ tickLabel: { maxWidth: maxWidth > 0 ? maxWidth : undefined } }}
      />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};
