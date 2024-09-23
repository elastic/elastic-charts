/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { number, boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, BubbleSeries, Position, ScaleType, Settings, LineSeries } from '@elastic/charts';
import { SeededDataGenerator, getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const dg = new SeededDataGenerator();
const rng = getRandomNumberGenerator();
const lineData = dg.generateGroupedSeries(100, 2);
const bubbleData = new Array(100).fill(0).map((_, i) => ({
  x: i,
  y: rng(0, 10),
  z: rng(0, 100),
}));

export const Example: ChartsStory = (_, { title, description }) => {
  const onElementListeners = {
    onElementClick: action('onElementClick'),
    onElementOver: action('onElementOver'),
    onElementOut: action('onElementOut'),
  };
  const markSizeRatio = number('markSizeRatio', 30, {
    range: true,
    min: 1,
    max: 100,
    step: 1,
  });

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        theme={{
          markSizeRatio,
          bubbleSeriesStyle: {
            point: {
              opacity: 0.6,
            },
          },
        }}
        baseTheme={useBaseTheme()}
        debug={boolean('debug', false)}
        pointBuffer={(r) => 20 / r}
        {...onElementListeners}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BubbleSeries
        id="bubbles"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        markSizeAccessor="z"
        data={bubbleData}
      />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={lineData}
      />
    </Chart>
  );
};
