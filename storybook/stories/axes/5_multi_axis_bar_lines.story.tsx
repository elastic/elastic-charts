/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings showLegend={false} baseTheme={useBaseTheme()} />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="left" title="Bar axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
    <Axis
      id="right"
      title="Line axis"
      groupId="group2"
      position={Position.Right}
      tickFormat={(d) => Number(d).toFixed(2)}
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
