/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { number, boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  Chart,
  BubbleSeries,
  Position,
  ScaleType,
  Settings,
  TooltipType,
  PointShape,
  Tooltip,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const dg = new SeededDataGenerator();
const data = dg.generateRandomSeries(100);

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
  const size = number('total points', 20, {
    range: true,
    min: 10,
    max: 100,
    step: 10,
  });
  const shape = select<PointShape>('shape', PointShape, PointShape.Circle);
  const opacity = number('shape fill opacity', 1, {
    range: true,
    min: 0,
    max: 1,
    step: 0.01,
  });

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        theme={{
          markSizeRatio,
        }}
        baseTheme={useBaseTheme()}
        debug={boolean('debug', false)}
        pointBuffer={(r) => 20 / r}
        {...onElementListeners}
      />
      <Tooltip type={TooltipType.Follow} snap={false} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BubbleSeries
        id="bubbles"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        markSizeAccessor="z"
        bubbleSeriesStyle={{
          point: {
            shape,
            opacity,
          },
        }}
        data={data.slice(0, size)}
      />
    </Chart>
  );
};
