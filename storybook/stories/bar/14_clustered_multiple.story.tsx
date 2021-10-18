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
    <Settings showLegend showLegendExtra legendPosition={Position.Right} baseTheme={useBaseTheme()} />
    <Axis id="bottom" position={Position.Bottom} title="elements" showOverlappingTicks />
    <Axis id="left2" title="count" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

    <BarSeries
      id="bar series 1"
      xScaleType={ScaleType.Ordinal}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      data={[
        { x: 'cat 0', y: 2 },
        { x: 'cat 1', y: 7 },
        { x: 'cat 2', y: 3 },
        { x: 'cat 3', y: 6 },
      ]}
    />
    <BarSeries
      id="bar series 2"
      xScaleType={ScaleType.Ordinal}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      data={[
        { x: 'cat 0', y: 1 },
        { x: 'cat 1', y: 2 },
        { x: 'cat 2', y: 3 },
        { x: 'cat 3', y: 4 },
      ]}
    />
    <BarSeries
      id="bar series 3"
      xScaleType={ScaleType.Ordinal}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      splitSeriesAccessors={['g']}
      data={[
        { x: 'cat 0', y: 1, g: 'a' },
        { x: 'cat 1', y: 2, g: 'a' },
        { x: 'cat 2', y: 3, g: 'a' },
        { x: 'cat 3', y: 4, g: 'a' },
        { x: 'cat 0', y: 5, g: 'b' },
        { x: 'cat 1', y: 8, g: 'b' },
        { x: 'cat 2', y: 9, g: 'b' },
        { x: 'cat 3', y: 2, g: 'b' },
      ]}
    />
  </Chart>
);
