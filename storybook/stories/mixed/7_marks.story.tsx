/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { number, boolean, text } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import { AreaSeries, Axis, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const getRandomNumber = getRandomNumberGenerator();
const data1 = new Array(100).fill(0).map((_, x) => ({
  x,
  y: getRandomNumber(0, 100),
  z: getRandomNumber(0, 50),
}));
const data2 = new Array(100).fill(0).map((_, x) => ({
  x,
  y: getRandomNumber(0, 100),
  z: getRandomNumber(200, 500, 4),
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
  const size = number('data size', 20, {
    range: true,
    min: 10,
    max: 100,
    step: 10,
  });
  const markFormat = text('markFormat', '0.0');

  return (
    <Chart title={title} description={description}>
      <Settings
        theme={{
          markSizeRatio,
          areaSeriesStyle: {
            point: {
              visible: 'always',
            },
          },
          lineSeriesStyle: {
            point: {
              visible: 'always',
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

      <AreaSeries
        id="area"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        markSizeAccessor="z"
        data={data1.slice(0, size)}
        markFormat={(d) => `${numeral(d).format(markFormat)}%`}
      />
      <LineSeries
        id="line"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        markSizeAccessor="z"
        data={data2.slice(0, size)}
        markFormat={(d) => `$${numeral(d).format(markFormat)}`}
      />
    </Chart>
  );
};
