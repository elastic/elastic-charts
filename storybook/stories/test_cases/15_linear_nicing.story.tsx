/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator();

// This data is carefully picked to trigger adaptive tick placements
// See https://github.com/elastic/elastic-charts/issues/2687
const data = new Array(20).fill(1).map((_, i) => ({
  x: i === 0 ? -1e6 : (i - 1) * 13e6,
  y: (i === 0 ? 0 : i === 2 ? -5.2 : i === 12 ? 21 : rng(-4, 20)) * 1e5,
}));

export const Example: ChartsStory = (_, { title, description }) => {
  const xNice = boolean('Nice x ticks', true);
  const yNice = boolean('Nice y ticks', true);

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="x" position={Position.Bottom} />
      <Axis id="y" position={Position.Left} style={{ tickLabel: { rotation: -90 } }} />
      <LineSeries
        id="line-1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        data={data}
        xNice={xNice}
        yNice={yNice}
        xAccessor="x"
        yAccessors={['y']}
      />
    </Chart>
  );
};

Example.parameters = {
  resize: true,
};
