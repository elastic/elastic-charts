/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const fit = boolean('fit Y domain to data', true);

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" />
      <Axis
        id="left2"
        domain={{
          min: NaN,
          max: NaN,
          fit,
        }}
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
