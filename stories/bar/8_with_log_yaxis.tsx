/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../packages/charts/src';
import { SB_SOURCE_PANEL } from '../utils/storybook';

export const Example = () => (
  <Chart className="story-chart">
    <Settings legendPosition={Position.Right} />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis
      id="left2"
      domain={{ fit: true }}
      title="Left axis"
      position={Position.Left}
      tickFormat={(d: any) => Number(d).toFixed(2)}
    />

    <BarSeries
      id="bars"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Log}
      xAccessor="x"
      yAccessors={['y']}
      data={[
        { x: 1, y: 0 },
        { x: 2, y: 1 },
        { x: 3, y: 2 },
        { x: 4, y: 3 },
        { x: 5, y: 4 },
        { x: 6, y: 5 },
        { x: 7, y: 6 },
        { x: 8, y: 7 },
      ]}
    />
  </Chart>
);

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
