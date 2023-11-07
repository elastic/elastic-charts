/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} showLegend />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="left" position={Position.Left} />

      <LineSeries
        id="Sensor 1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={[
          [0, 1],
          [1, 0.8],
          [2, 0.5],
          [3, 0.12],
        ]}
      />
      <LineSeries
        id="Sensor 2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={[
          [0, 1],
          [1, 0.8],
          [2, 0.76],
          [3, 0.12],
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: 'Currently not correctly rendered due to [#1921](https://github.com/elastic/elastic-charts/issues/1921)',
};
