/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, LegendValue, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings
      showLegend
      legendValues={[LegendValue.CurrentAndLastValue]}
      legendPosition={Position.Right}
      baseTheme={useBaseTheme()}
    />
    <Axis id="bottom" position={Position.Bottom} title="elements" showOverlappingTicks />
    <Axis id="left2" title="count" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

    <BarSeries
      id="bar series 1"
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
    <BarSeries
      id="bar series 2"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      data={[
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 4 },
      ]}
    />
    <BarSeries
      id="bar series 3"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      splitSeriesAccessors={['g']}
      data={[
        { x: 0, y: 1, g: 'a' },
        { x: 1, y: 2, g: 'a' },
        { x: 2, y: 3, g: 'a' },
        { x: 3, y: 4, g: 'a' },
        { x: 0, y: 5, g: 'b' },
        { x: 1, y: 8, g: 'b' },
        { x: 2, y: 9, g: 'b' },
        { x: 3, y: 2, g: 'b' },
      ]}
    />
  </Chart>
);
