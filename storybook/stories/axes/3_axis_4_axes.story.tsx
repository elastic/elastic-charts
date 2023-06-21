/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings baseTheme={useBaseTheme()} />
    <Axis
      id="bottom"
      position={Position.Bottom}
      title="bottom"
      showOverlappingTicks
      hide={boolean('hide botttom axis', false)}
    />
    <Axis
      id="left"
      title="left"
      position={Position.Left}
      tickFormat={(d) => Number(d).toFixed(2)}
      hide={boolean('hide left axis', false)}
    />
    <Axis id="top" position={Position.Top} title="top" showOverlappingTicks hide={boolean('hide top axis', false)} />
    <Axis
      id="right"
      title="right"
      position={Position.Right}
      tickFormat={(d) => Number(d).toFixed(2)}
      hide={boolean('hide right axis', false)}
    />

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
