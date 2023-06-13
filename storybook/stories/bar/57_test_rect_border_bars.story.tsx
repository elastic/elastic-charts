/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  return (
    <Chart title={title} description={description} renderer="canvas">
      <Settings theme={useBaseTheme()} />
      <Axis id="count" title="count" position={Position.Left} />
      <Axis id="x" title="goods" position={Position.Bottom} />
      <BarSeries
        id="bars"
        name="amount"
        xScaleType={ScaleType.Ordinal}
        xAccessor="x"
        yAccessors={['y']}
        barSeriesStyle={{
          rectBorder: {
            visible: true,
            strokeWidth: 10,
            stroke: 'black',
          },
        }}
        data={[
          { x: 'A', y: 0, val: 1222 },
          { x: 'B', y: 20, val: 1222 },
          { x: 'C', y: 750, val: 1222 },
          { x: 'D', y: 854, val: 1222 },
        ]}
      />
    </Chart>
  );
};
