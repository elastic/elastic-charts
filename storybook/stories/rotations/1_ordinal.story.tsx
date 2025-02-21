/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, LegendValue, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings
      baseTheme={useBaseTheme()}
      debug={boolean('Debug', true)}
      showLegend={boolean('Legend', true)}
      legendValues={[LegendValue.CurrentAndLastValue]}
      legendPosition={select(
        'Legend position',
        {
          Left: Position.Left,
          Right: Position.Right,
          Top: Position.Top,
          Bottom: Position.Bottom,
        },
        Position.Right,
      )}
      rotation={select(
        'Rotation degree',
        {
          '0 deg(default)': 0,
          '90 deg': 90,
          '-90 deg': -90,
          '180 deg': 180,
        },
        0,
      )}
    />
    <Axis
      id="bottom"
      position={Position.Bottom}
      title="Bottom axis"
      showOverlappingTicks
      showOverlappingLabels={boolean('bottom show overlapping labels', false)}
    />
    <Axis
      id="left2"
      title="Left axis"
      position={Position.Left}
      showOverlappingTicks
      showOverlappingLabels={boolean('left show overlapping labels', false)}
    />

    <BarSeries
      id="bars"
      xScaleType={ScaleType.Ordinal}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      data={[
        { x: 'a', y: 1 },
        { x: 'b', y: 2 },
        { x: 'c', y: 3 },
        { x: 'd', y: 4 },
      ]}
    />
  </Chart>
);
