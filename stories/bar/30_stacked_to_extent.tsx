/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType } from '../../packages/charts/src';
import { SB_SOURCE_PANEL } from '../utils/storybook';

export const Example = () => {
  const fit = boolean('fit Y domain to data', true);

  return (
    <Chart className="story-chart">
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" />
      <Axis
        id="left2"
        domain={{ fit }}
        title="Left axis"
        position={Position.Left}
        tickFormat={(d: any) => Number(d).toFixed(2)}
      />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        stackAccessors={['x']}
        data={[
          { x: 0, y: 10, g: 'a' },
          { x: 0, y: 20, g: 'b' },
          { x: 0, y: 30, g: 'c' },
        ]}
      />
    </Chart>
  );
};

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
