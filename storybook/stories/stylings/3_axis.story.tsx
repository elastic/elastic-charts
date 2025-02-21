/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number, select } from '@storybook/addon-knobs';
import React from 'react';

import type { PartialTheme } from '@elastic/charts';
import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

function range(title: string, min: number, max: number, value: number, groupId?: string, step = 1) {
  return number(
    title,
    value,
    {
      range: true,
      min,
      max,
      step,
    },
    groupId,
  );
}

export const Example: ChartsStory = (_, { title, description }) => {
  const theme: PartialTheme = {
    axes: {
      axisTitle: {
        fill: color('titleFill', '#333', 'Axis Title'),
        fontSize: range('titleFontSize', 0, 40, 12, 'Axis Title'),
        fontFamily: "'Open Sans', Helvetica, Arial, sans-serif",
        padding: range('titlePadding', 0, 40, 5, 'Axis Title'),
      },
      axisLine: {
        stroke: color('axisLinecolor', '#333', 'Axis Line'),
        strokeWidth: range('axisLineWidth', 0, 5, 1, 'Axis Line'),
      },
      tickLabel: {
        fill: color('tickFill', '#333', 'Tick Label'),
        fontSize: range('tickFontSize', 0, 40, 10, 'Tick Label'),
        fontFamily: "'Open Sans', Helvetica, Arial, sans-serif",
        fontStyle: 'normal',
        padding: number('tickLabelPadding', 1, {}, 'Tick Label'),
      },
      tickLine: {
        visible: boolean('showTicks', true, 'Tick Line'),
        stroke: color('tickLineColor', '#333', 'Tick Line'),
        strokeWidth: range('tickLineWidth', 0, 5, 1, 'Tick Line'),
      },
    },
  };
  return (
    <Chart title={title} description={description}>
      <Settings
        theme={theme}
        baseTheme={useBaseTheme()}
        debug={boolean('debug', true)}
        rotation={select('rotation', { 0: 0, 90: 90, '-90': -90, 180: 180 }, 0)}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

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
    </Chart>
  );
};
