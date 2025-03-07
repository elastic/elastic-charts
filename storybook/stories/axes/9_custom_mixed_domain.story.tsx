/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => {
  const leftDomain = {
    min: number('left min', 0),
    max: number('left max', 7),
  };

  const right1Domain = {
    min: number('right1 min', 0),
    max: number('right1 max', 10),
  };

  const xDomain = customKnobs.array('xDomain', ['a', 'b', 'c', 'd', 0, 1, 2, 3]);

  return (
    <Chart title={title} description={description}>
      <Settings showLegend={false} xDomain={xDomain} baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis
        id="left"
        title="Bar axis"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        domain={leftDomain}
      />
      <Axis
        id="right"
        title="Line axis"
        groupId="group2"
        position={Position.Right}
        tickFormat={(d) => Number(d).toFixed(2)}
        domain={right1Domain}
      />
      <Axis
        id="right 2"
        title="Line axis 2"
        groupId="group2"
        position={Position.Right}
        tickFormat={(d) => Number(d).toFixed(2)}
      />
      <BarSeries
        id="bars"
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
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        groupId="group2"
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        data={[
          { x: 0, y: 3 },
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 10 },
        ]}
      />
    </Chart>
  );
};
