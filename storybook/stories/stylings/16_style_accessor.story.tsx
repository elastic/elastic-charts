/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import type {
  RecursivePartial,
  BarSeriesStyle,
  PointStyle,
  BarStyleAccessor,
  PointStyleAccessor,
} from '@elastic/charts';
import { AreaSeries, Axis, BarSeries, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const hasThreshold = boolean('threshold', true);
  const threshold = number('min threshold', 3);
  const barStyle: RecursivePartial<BarSeriesStyle> = {
    rect: {
      opacity: 0.5,
      fill: 'red',
    },
  };
  const pointStyle: RecursivePartial<PointStyle> = {
    fill: 'red',
    radius: 10,
  };
  const barStyleAccessor: BarStyleAccessor = (d, g) => (g.specId === 'bar' && d.y1! > threshold ? barStyle : null);
  const pointStyleAccessor: PointStyleAccessor = (d, g) =>
    (g.specId === 'line' || g.specId === 'area') && d.y1! > threshold ? pointStyle : null;

  return (
    <Chart title={title} description={description}>
      <Settings
        theme={{
          areaSeriesStyle: {
            point: {
              visible: 'always',
            },
          },
        }}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id="bar"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        styleAccessor={hasThreshold ? barStyleAccessor : undefined}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
      />

      <LineSeries
        id="line"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        pointStyleAccessor={hasThreshold ? pointStyleAccessor : undefined}
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 6 },
          { x: 2, y: 2 },
          { x: 3, y: 5 },
        ]}
      />

      <AreaSeries
        id="area"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        pointStyleAccessor={hasThreshold ? pointStyleAccessor : undefined}
        data={[
          { x: 0, y: 0.5 },
          { x: 1, y: 4 },
          { x: 2, y: 1 },
          { x: 3, y: 4 },
        ]}
      />
    </Chart>
  );
};
