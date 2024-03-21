/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import React from 'react';

import { AreaSeries, Axis, Chart, LegendValue, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const onElementListeners = {
  onElementClick: action('onElementClick'),
  onElementOver: action('onElementOver'),
  onElementOut: action('onElementOut'),
};

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings
      showLegend
      legendValues={[LegendValue.CurrentAndLastValue]}
      legendPosition={Position.Right}
      {...onElementListeners}
      baseTheme={useBaseTheme()}
    />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

    <AreaSeries
      id="area"
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
