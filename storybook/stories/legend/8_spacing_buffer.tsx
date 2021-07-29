/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, PartialTheme } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const theme: PartialTheme = {
    legend: {
      spacingBuffer: number('legend buffer value', 80),
    },
  };

  return (
    <Chart>
      <Settings theme={theme} showLegend showLegendExtra legendPosition={Position.Right} baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars 1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 100000000 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
      />
      <BarSeries
        id="bars 2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 2, y: 100000000 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};
