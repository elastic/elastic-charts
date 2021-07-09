/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, LineSeries, Position, ScaleType, timeFormatter } from '../../packages/charts/src';
import { getRandomNumberGenerator } from '../../packages/charts/src/mocks/utils';
import { KIBANA_METRICS } from '../../packages/charts/src/utils/data_samples/test_dataset_kibana';

const dateFormatter = timeFormatter('HH:mm:ss');

export const Example = () => {
  const getRandomNumber = getRandomNumberGenerator();
  const data = KIBANA_METRICS.metrics.kibana_os_load[0].data.map((d: any) => ({
    x: d[0],
    max: d[1] + 4 + 4 * getRandomNumber(),
    min: d[1] - 4 - 4 * getRandomNumber(),
  }));
  const lineData = KIBANA_METRICS.metrics.kibana_os_load[0].data.map((d: any) => [d[0], d[1]]);
  const fit = boolean('fit Y domain', true);
  const useFunctions = boolean('use fn accessors', false);
  return (
    <Chart className="story-chart">
      <Axis
        id="bottom"
        title="timestamp per 1 minute"
        position={Position.Bottom}
        showOverlappingTicks
        tickFormat={dateFormatter}
      />
      <Axis
        id="left"
        domain={{ fit }}
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
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
