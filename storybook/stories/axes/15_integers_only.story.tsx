/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, Position, ScaleType, Settings, BarSeries } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const scaleType = select<typeof ScaleType.Linear | typeof ScaleType.Log | typeof ScaleType.Sqrt>(
    'scaleType',
    {
      Linear: ScaleType.Linear,
      Log: ScaleType.Log,
      Sqrt: ScaleType.Sqrt,
    },
    'linear',
  );
  const niceValues = boolean('yNice', false);
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="left" position={Position.Left} integersOnly />

      <BarSeries
        id="Thermal changes"
        xScaleType={ScaleType.Ordinal}
        yScaleType={scaleType}
        xAccessor={0}
        yAccessors={[1]}
        data={[
          ['Sensor 1', 120.2],
          ['Sensor 2', 50.8],
          ['Sensor 3', 300.76],
          ['Sensor 4', 10.12],
          ['Sensor 5', 0.92],
        ]}
        yNice={niceValues}
      />
    </Chart>
  );
};
