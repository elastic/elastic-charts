/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => (
  <Chart>
    <Settings showLegend legendValue="lastBucket" legendPosition={Position.Right} baseTheme={useBaseTheme()} />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

    <BarSeries
      id="bars"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      stackAccessors={['x']}
      splitSeriesAccessors={['g']}
      data={[
        { x: 0, y: 2, g: 'a' },
        { x: 1, y: 7, g: 'a' },
        { x: 2, y: 3, g: 'a' },
        { x: 3, y: 6, g: 'a' },
        { x: 0, y: 4, g: 'b' },
        { x: 1, y: 5, g: 'b' },
        { x: 2, y: 8, g: 'b' },
        { x: 3, y: 2, g: 'b' },
      ]}
    />
  </Chart>
);
