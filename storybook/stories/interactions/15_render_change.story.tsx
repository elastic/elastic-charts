/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, LegendValue } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

const onRenderChange = action('onRenderChange');

export const Example = () => (
  <Chart>
    <Settings
      showLegend
      legendValue={LegendValue.LastTimeBucket}
      legendPosition={Position.Right}
      onRenderChange={onRenderChange}
      baseTheme={useBaseTheme()}
    />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

    <BarSeries
      id="bars"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      data={[
        { x: 0, y: 2 },
        { x: 1, y: 7 },
        { x: 2, y: 3 },
        { x: 3, y: 6 },
      ]}
    />
  </Chart>
);

Example.parameters = {
  markdown:
    'Sends an event every time the chart render state changes. This is provided to bind attributes to the chart for visulaization loading checks.',
};
