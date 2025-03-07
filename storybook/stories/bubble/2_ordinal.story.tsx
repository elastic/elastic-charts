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

import { Axis, Chart, BubbleSeries, Position, ScaleType, Settings, TooltipType, Tooltip } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator();
const data = new Array(100).fill(0).map(() => ({
  x: String.fromCharCode(rng(97, 122)),
  y: rng(0, 100),
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
  const size = number('total points', 30, {
    range: true,
    min: 10,
    max: 100,
    step: 10,
  });

  return (
    <Chart title={title} description={description}>
      <Settings
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
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        markSizeAccessor="z"
        data={data.slice(0, size)}
      />
    </Chart>
  );
};
