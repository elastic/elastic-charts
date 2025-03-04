/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number, boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, Position, ScaleType, Settings, LineSeries } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator();
const bubbleData = new Array(30).fill(0).map((_, i) => ({
  x: i,
  y: rng(2, 3, 2),
  z: rng(0, 20),
}));

export const Example: ChartsStory = (_, { title, description }) => {
  const markSizeRatio = number('markSizeRatio', 10, {
    range: true,
    min: 1,
    max: 20,
    step: 1,
  });

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        theme={{
          markSizeRatio,
          lineSeriesStyle: {
            point: {
              visible: boolean('show line points', true) ? 'always' : 'never',
            },
          },
        }}
        baseTheme={useBaseTheme()}
        debug={boolean('debug', false)}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" />
      <Axis
        id="left2"
        title="Left axis"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        domain={{
          min: NaN,
          max: 5,
        }}
      />

      <LineSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        markSizeAccessor="z"
        data={bubbleData}
      />
    </Chart>
  );
};
