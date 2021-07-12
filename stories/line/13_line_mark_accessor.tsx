/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number, boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, Position, ScaleType, Settings, LineSeries } from '../../packages/charts/src';
import { getRandomNumberGenerator } from '../../packages/charts/src/mocks/utils';

const rng = getRandomNumberGenerator();
const bubbleData = new Array(30).fill(0).map((_, i) => ({
  x: i,
  y: rng(2, 3, 2),
  z: rng(0, 20),
}));

export const Example = () => {
  const markSizeRatio = number('markSizeRatio', 10, {
    range: true,
    min: 1,
    max: 20,
    step: 1,
  });

  const visible = boolean('show line points', true);

  return (
    <Chart className="story-chart">
      <Settings
        showLegend
        theme={{
          markSizeRatio,
          lineSeriesStyle: {
            point: {
              visible,
            },
          },
        }}
        debug={boolean('debug', false)}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" />
      <Axis
        id="left2"
        title="Left axis"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        domain={{ max: 5 }}
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

Example.text = 'testing';
