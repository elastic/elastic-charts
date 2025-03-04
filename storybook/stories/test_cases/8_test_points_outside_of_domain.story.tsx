/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, LineSeries, Axis, Chart, Position, ScaleType, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const typeOfSeries = select('series type', ['line', 'area'], 'area');
  const showY0Accessor = typeOfSeries === 'area' ? boolean('show y0Accessor', false) : null;

  const data = [
    [1, 1],
    [2, -3],
    [3, 3],
    [4, 4],
    [5, 5],
    [6, 4],
    [7, -3],
    [8, 2],
    [9, 1],
  ];
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" title="index" position={Position.Bottom} />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        domain={{
          min: -2,
          max: NaN,
        }}
      />
      {typeOfSeries === 'line' ? (
        <LineSeries
          id="lines"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={data}
        />
      ) : (
        <AreaSeries
          id="areas"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          y0Accessors={showY0Accessor ? [([, y]) => y - 1] : undefined}
          data={data}
        />
      )}
    </Chart>
  );
};
