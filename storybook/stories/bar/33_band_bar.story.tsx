/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, LineSeries, Position, ScaleType, Settings, timeFormatter } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter('HH:mm:ss');

export const Example: ChartsStory = (_, { title, description }) => {
  const getRandomNumber = getRandomNumberGenerator();
  const data = KIBANA_METRICS.metrics.kibana_os_load.v1.data.map((d: any) => ({
    x: d[0],
    max: d[1] + 4 + 4 * getRandomNumber(),
    min: d[1] - 4 - 4 * getRandomNumber(),
  }));
  const lineData = KIBANA_METRICS.metrics.kibana_os_load.v1.data.map((d: any) => [d[0], d[1]]);
  const fit = boolean('fit Y domain', true);
  const useFunctions = boolean('use fn accessors', false);
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis
        id="bottom"
        title="timestamp per 1 minute"
        position={Position.Bottom}
        showOverlappingTicks
        tickFormat={dateFormatter}
      />
      <Axis
        id="left"
        domain={{
          min: NaN,
          max: NaN,
          fit,
        }}
        title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
        position={Position.Left}
        tickFormat={(d: any) => Number(d).toFixed(2)}
      />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={[useFunctions ? (d) => d.max : 'max']}
        y0Accessors={[useFunctions ? (d) => d.min : 'min']}
        data={data}
      />

      <LineSeries
        id="average"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={lineData}
      />
    </Chart>
  );
};
