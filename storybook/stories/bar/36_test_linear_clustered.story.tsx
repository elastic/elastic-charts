/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// for testing purposes only
export const Example: ChartsStory = (_, { title, description }) => {
  const data9 = [
    [1, 1, 3],
    [2, 2, 4],
    [3, 3, 5],
    [4, 4, 6],
    [5, 5, 7],
    [6, 4, 6],
    [7, 3, 5],
    [8, 2, 4],
    [9, 1, 3],
  ];
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" title="index" position={Position.Bottom} />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
        position={Position.Left}
        tickFormat={(d: any) => Number(d).toFixed(2)}
      />
      <BarSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1, 2]}
        data={data9}
      />
    </Chart>
  );
};
