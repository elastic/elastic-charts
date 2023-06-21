/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={-90} baseTheme={useBaseTheme()} />
    <Axis id="y top" position={Position.Top} title="y top axis" />
    <Axis id="x right" title="x right axis" position={Position.Right} />
    <Axis id="y bottom" position={Position.Bottom} title="y bottom axis" />
    <Axis id="x left" title="x left axis" position={Position.Left} />
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
