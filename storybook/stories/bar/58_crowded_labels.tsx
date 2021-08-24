/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { SB_SOURCE_PANEL } from '../utils/storybook';

export const Example = () => (
  <Chart>
    <Settings baseTheme={useBaseTheme()} />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

    <BarSeries
      id="bars"
      xScaleType={ScaleType.Ordinal}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      data={[
        { x: 'Albaquerque is a beautifully long name', y: 2 },
        { x: 'b', y: 7 },
        { x: 'c', y: 3 },
        { x: 'd', y: 6 },
        { x: 'e', y: 2 },
        { x: 'f', y: 7 },
        { x: 'g', y: 3 },
        { x: 'h', y: 6 },
        { x: 'Indiana is not a long name', y: 2 },
        { x: 'j', y: 7 },
        { x: 'k', y: 3 },
        { x: 'l', y: 6 },
        { x: 'm', y: 2 },
        { x: 'o', y: 7 },
        { x: 'p', y: 3 },
        { x: 'q', y: 6 },
        { x: 'r', y: 7 },
        { x: 's', y: 3 },
        { x: 't', y: 6 },
        { x: 'u', y: 2 },
        { x: 'v', y: 7 },
        { x: 'w', y: 3 },
        { x: 'x', y: 6 },
        { x: 'y', y: 2 },
        { x: 'Zanzibar is not too shabby either', y: 7 },
      ]}
    />
  </Chart>
);

// storybook configuration
Example.parameters = {
  options: { selectedPanel: SB_SOURCE_PANEL },
};
