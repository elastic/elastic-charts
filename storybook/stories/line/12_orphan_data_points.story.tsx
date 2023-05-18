/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, CurveType, LineSeries, Position, ScaleType, Settings, Fit, AreaSeries } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const fitEnabled = boolean('enable fit function', false);
  const isArea = boolean('switch to area', false);
  const LineOrAreaSeries = isArea ? AreaSeries : LineSeries;
  return (
    <Chart>
      <Settings
        showLegend
        legendExtra="lastBucket"
        legendPosition={Position.Right}
        theme={{
          areaSeriesStyle: {
            point: {
              visible: false,
            },
          },
          lineSeriesStyle: {
            point: {
              visible: false,
            },
          },
        }}
        baseTheme={useBaseTheme()}
      />
      <Axis id="x" position={Position.Bottom} />
      <Axis id="y" position={Position.Left} />

      <LineOrAreaSeries
        id="series 1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        fit={fitEnabled ? Fit.Linear : undefined}
        data={[
          [0, 12],
          [1, null],
          [2, 14],
          [3, 23],
          [4, 12],
          [5, null],
          [6, 5],
          [7, null],
          [8, 9],
          [9, 3],
          [10, null],
          [11, 10],
        ]}
        curve={CurveType.CURVE_MONOTONE_X}
      />
    </Chart>
  );
};
