/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, LegendValue, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings
      showLegend
      legendValues={[LegendValue.CurrentAndLastValue]}
      legendPosition={Position.Right}
      rotation={0}
      baseTheme={useBaseTheme()}
    />
    <Axis id="x top" position={Position.Top} title="x top axis" />
    <Axis id="y right" title="y right axis" position={Position.Right} />
    <Axis id="x bottom" position={Position.Bottom} title="x bottom axis" />
    <Axis id="y left" title="y left axis" position={Position.Left} />
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
