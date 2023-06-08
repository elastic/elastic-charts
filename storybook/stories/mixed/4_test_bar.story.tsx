/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, LineSeries, Position, ScaleType, Settings, LegendValue } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const data1 = [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
    [5, 5],
    [6, 4],
    [7, 3],
    [8, 2],
    [9, 1],
  ];
  const data2 = [
    [1, 5],
    [2, 4],
    [3, 3],
    [4, 2],
    [5, 1],
    [6, 2],
    [7, 3],
    [8, 4],
    [9, 5],
  ];

  return (
    <Chart>
      <Settings
        showLegend
        legendValue={LegendValue.LastTimeBucket}
        legendPosition={Position.Right}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="data1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data1}
      />
      <LineSeries
        id="data2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data2}
      />
    </Chart>
  );
};
