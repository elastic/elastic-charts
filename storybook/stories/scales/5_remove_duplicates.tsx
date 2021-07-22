/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => (
  <Chart>
    <Settings hideDuplicateAxes={boolean('hideDuplicateAxes', true)} baseTheme={useBaseTheme()} />
    <Axis id="bottom" position={Position.Bottom} />
    <Axis id="y1" position={Position.Left} tickFormat={(d) => `${d}%`} />
    <Axis id="y2" position={Position.Left} tickFormat={(d) => `${d}%`} />
    <Axis title="Axis - Different title" id="y3" position={Position.Left} tickFormat={(d) => `${d}%`} />
    <Axis domain={{ min: 0 }} id="y4" position={Position.Left} tickFormat={(d) => `${d}%`} />
    <LineSeries
      id="lines"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      timeZone="utc-6"
      data={[
        [1, 62],
        [2, 56],
        [3, 41],
        [4, 62],
        [5, 90],
      ]}
    />
  </Chart>
);

Example.parameters = {
  markdown: 'hideDuplicateAxes will remove redundant axes that have the same min and max labels and position',
};
