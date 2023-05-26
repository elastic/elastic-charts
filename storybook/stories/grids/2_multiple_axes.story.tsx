/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, GridLineStyle, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

function generateGridLineStyle(group: string, gridColor = 'purple'): GridLineStyle {
  const groupId = `${group} axis`;

  return {
    visible: true,
    stroke: color(`${groupId} grid line stroke color`, gridColor, groupId),
    strokeWidth: number(
      `${groupId} grid line stroke width`,
      1,
      {
        range: true,
        min: 0,
        max: 10,
        step: 1,
      },
      groupId,
    ),
    opacity: number(
      `${groupId} grid line stroke opacity`,
      1,
      {
        range: true,
        min: 0,
        max: 1,
        step: 0.01,
      },
      groupId,
    ),
    dash: [
      number(
        `${groupId} grid line dash length`,
        1,
        {
          range: true,
          min: 0,
          max: 10,
          step: 1,
        },
        groupId,
      ),
      number(
        `${groupId} grid line dash spacing`,
        1,
        {
          range: true,
          min: 0,
          max: 10,
          step: 1,
        },
        groupId,
      ),
    ],
  };
}

export const Example: ChartsStory = (_, { title, description }) => {
  const leftAxisGridLineStyle = generateGridLineStyle(Position.Left);
  const leftAxisGridLineStyle2 = generateGridLineStyle(`${Position.Left}2`);

  return (
    <Chart title={title} description={description} size={[500, 300]}>
      <Settings debug={boolean('debug', false)} baseTheme={useBaseTheme()} />
      <Axis
        id="left1"
        title="Left axis 1"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        showGridLines={boolean('show left axis grid lines', false, 'left axis')}
        gridLine={leftAxisGridLineStyle}
      />
      <Axis
        id="left2"
        title="Left axis 2"
        groupId="group2"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        showGridLines={boolean('show left axis 2 grid lines', false, 'left2 axis')}
        gridLine={leftAxisGridLineStyle2}
      />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
      />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        groupId="group2"
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        data={[
          { x: 0, y: 3 },
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 10 },
        ]}
      />
    </Chart>
  );
};
