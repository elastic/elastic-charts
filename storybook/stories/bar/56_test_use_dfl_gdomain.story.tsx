/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="right" groupId="mainGroup" position={Position.Left} ticks={5} />

      <BarSeries
        id="groupB"
        groupId="other"
        useDefaultGroupDomain="mainGroup"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        yNice
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        stackAccessors={['g']}
        data={[
          { x: 'A', y: 10, g: 'ga' },
          { x: 'A', y: 10, g: 'gb' },
          { x: 'A', y: 10, g: 'gc' },
          { x: 'B', y: 10, g: 'ga' },
          { x: 'B', y: 10, g: 'gb' },
          { x: 'B', y: 10, g: 'gc' },
        ]}
      />
    </Chart>
  );
};
