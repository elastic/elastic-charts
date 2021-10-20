/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  Chart,
  Axis,
  LineSeries,
  Position,
  ScaleType,
  PartialTheme,
  Settings,
  LIGHT_THEME,
  TooltipType,
} from '@elastic/charts';

export const Example = () => {
  const theme1: PartialTheme = {
    crosshair: {
      line: {
        stroke: 'red',
        dash: [2, 2],
      },
      crossLine: { stroke: 'blue', dash: [4, 4] },
    },
  };

  return (
    <Chart>
      <Settings
        theme={[theme1]}
        baseTheme={LIGHT_THEME}
        tooltip={TooltipType.Crosshairs}
        //xDomain={{ min: 0, max: 5 }}
      />
      <Axis id="count" title="count" position={Position.Left} showGridLines />
      <Axis id="x" title="goods" position={Position.Bottom} showGridLines />
      <LineSeries
        id="bars"
        name="amount"
        xScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 1, y: 390, val: 1222 },
          { x: 2, y: 23, val: 1222 },
          { x: 3, y: 750, val: 1222 },
          { x: 4, y: 854, val: 1222 },
        ]}
      />
    </Chart>
  );
};
