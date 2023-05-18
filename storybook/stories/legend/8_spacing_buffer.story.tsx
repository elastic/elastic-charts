/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, PartialTheme } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const theme: PartialTheme = {
    legend: {
      spacingBuffer: number('legend buffer value', 80),
      labelOptions: {
        maxLines: number('max legend label lines', 0, { min: 0, step: 1 }),
      },
    },
  };
  const longLabels = boolean('use long labels', false);

  return (
    <Chart>
      <Settings theme={theme} showLegend legendExtra="lastBucket" legendPosition={Position.Right} baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={longLabels ? 'Elit exercitation dolore fugiat aliquip Lorem commodo' : 'bars 1'}
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
        id={
          longLabels
            ? 'Laborum consectetur ut esse aute sunt adipisicing laboris reprehenderit eu officia labore in laborum'
            : 'bars 2'
        }
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
