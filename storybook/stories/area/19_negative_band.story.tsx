/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { AreaSeries, Axis, Chart, Fit, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example = () => {
  const yScaleType = customKnobs.enum.scaleType('Y scale', ScaleType.Linear, { include: ['Linear', 'Log'] });

  const data = [
    [0, -5, -2],
    [1, -6, -2.1],
    [2, -8, -0.9],
    [3, -3, -1.2],
    [4, -2.3, -1.6],
    [5, -4, -3.4],
  ];

  return (
    <Chart>
      <Settings
        showLegend
        theme={{ areaSeriesStyle: { point: { visible: true } }, lineSeriesStyle: { point: { visible: false } } }}
        baseTheme={useBaseTheme()}
        xDomain={{
          min: NaN,
          max: NaN,
          minInterval: 1,
        }}
      />
      <Axis id="bottom" title="timestamp" position={Position.Bottom} showOverlappingTicks />
      <Axis id="left" title="metric" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <AreaSeries
        id="band"
        xScaleType={ScaleType.Linear}
        yScaleType={yScaleType}
        xAccessor={0}
        yAccessors={[1]}
        y0Accessors={[2]}
        data={data}
      />

      <LineSeries
        id="metric"
        xScaleType={ScaleType.Linear}
        yScaleType={yScaleType}
        xAccessor={0}
        yAccessors={[1]}
        fit={Fit.Carry}
        data={data.map(([x, y1, y0]) => {
          return [x, (y1 + y0) / 2];
        })}
      />
    </Chart>
  );
};
