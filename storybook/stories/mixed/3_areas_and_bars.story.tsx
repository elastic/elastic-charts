/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  AreaSeries,
  Axis,
  BarSeries,
  Chart,
  CurveType,
  Position,
  ScaleType,
  Settings,
  LegendValue,
} from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => (
  <Chart renderer="canvas">
    <Settings
      showLegend
      legendValue={LegendValue.LastTimeBucket}
      legendPosition={Position.Right}
      baseTheme={useBaseTheme()}
    />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
    <Axis id="top" position={Position.Top} title="Top axis" showOverlappingTicks />
    <Axis id="right" title="Right axis" position={Position.Right} tickFormat={(d) => Number(d).toFixed(2)} />
    <BarSeries
      id="bars"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      stackAccessors={['x']}
      data={[
        { x: 0, y: 2 },
        { x: 1, y: 7 },
        { x: 2, y: 3 },
        { x: 3, y: 6 },
      ]}
    />
    <AreaSeries
      id="areas"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      curve={CurveType.CURVE_MONOTONE_X}
      data={[
        { x: 0, y: 2.5 },
        { x: 1, y: 7 },
        { x: 2, y: 3 },
        { x: 3, y: 6 },
      ]}
    />
  </Chart>
);
