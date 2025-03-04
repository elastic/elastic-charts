/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number } from '@storybook/addon-knobs';
import React from 'react';

import type { PartialTheme, RecursivePartial, AxisStyle } from '@elastic/charts';
import { AreaSeries, Axis, Chart, Position, ScaleType, Settings } from '@elastic/charts';

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
      tickLabel: {
        fill: color('tickFill', '#333', 'Tick Label'),
        fontSize: range('tickFontSize', 0, 40, 10, 'Tick Label'),
        fontFamily: "'Open Sans', Helvetica, Arial, sans-serif",
        fontStyle: 'normal',
        padding: number('Tick Label Padding Theme', 1, {}, 'Tick Label'),
      },
    },
  };

  const customStyle: RecursivePartial<AxisStyle> = {
    tickLabel: {
      padding: number('Tick Label Padding Axis Spec', 0),
    },
  };

  return (
    <Chart title={title} description={description}>
      <Settings theme={theme} debug={boolean('debug', true)} baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks style={customStyle} />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
      <AreaSeries
        id="lines"
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
