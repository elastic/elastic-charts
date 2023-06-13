/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import React from 'react';

import { Axis, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings onBrushEnd={action('onBrushEnd')} rotation={customKnobs.enum.rotation()} baseTheme={useBaseTheme()} />
    <Axis id="bottom" position={Position.Bottom} title="bottom" showOverlappingTicks />
    <Axis id="left" title="left" position={Position.Left} />
    <LineSeries
      id="lines"
      xScaleType={ScaleType.Ordinal}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      data={[
        { x: 'a', y: 2 },
        { x: 'b', y: 7 },
        { x: 'c', y: 3 },
        { x: 'd', y: 6 },
      ]}
    />
  </Chart>
);
