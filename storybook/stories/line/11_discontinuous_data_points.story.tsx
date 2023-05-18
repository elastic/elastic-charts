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
      <Settings showLegend legendExtra="lastBucket" legendPosition={Position.Right} baseTheme={useBaseTheme()} />
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
          [0, 10],
          [1, 12],
          [2, 14],
          [3, 15],
          [4, 5],
          [5, 6],
          [6, 9],
          [8, 11],
        ]}
        curve={CurveType.CURVE_MONOTONE_X}
      />

      <LineOrAreaSeries
        id="series 2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        fit={fitEnabled ? Fit.Linear : undefined}
        data={[
          [0, 3],
          [1, 3.5],
          [3, 4],
          [4, 8],
          [6, 3],
          [7, 2],
        ]}
        curve={CurveType.CURVE_MONOTONE_X}
      />
    </Chart>
  );
};
