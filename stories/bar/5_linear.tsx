/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, LIGHT_THEME, Position, ScaleType, Settings } from '../../packages/charts/src';
import { getChartRotationKnob } from '../utils/knobs';

export const Example = () => {
  const theme = {
    ...LIGHT_THEME,
    scales: {
      histogramPadding: number('histogram padding', 0, {
        range: true,
        min: 0,
        max: 1,
        step: 0.01,
      }),
      barsPadding: number('bar padding', 0, {
        range: true,
        min: 0,
        max: 1,
        step: 0.01,
      }),
    },
  };
  return (
    <Chart className="story-chart">
      <Settings rotation={getChartRotationKnob()} theme={theme} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 1, y: 2 },
          { x: 2, y: 7 },
          { x: 4, y: 3 },
          { x: 9, y: 6 },
        ]}
      />
    </Chart>
  );
};
