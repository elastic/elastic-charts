/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, text } from '@storybook/addon-knobs';
import React from 'react';

import {
  AreaSeries,
  Axis,
  Chart,
  CurveType,
  LineSeries,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '../../packages/charts/src';
import { getRandomNumberGenerator } from '../../packages/charts/src/mocks/utils';
import { KIBANA_METRICS } from '../../packages/charts/src/utils/data_samples/test_dataset_kibana';

const dateFormatter = timeFormatter('HH:mm');

export const Example = () => {
  const getRandomNumber = getRandomNumberGenerator();
  const data = KIBANA_METRICS.metrics.kibana_os_load[0].data.map((d) => ({
    x: d[0],
    max: d[1] + 4 + 4 * getRandomNumber(),
    min: d[1] - 4 - 4 * getRandomNumber(),
  }));
  const lineData = KIBANA_METRICS.metrics.kibana_os_load[0].data.map((d) => [d[0], d[1]]);
  const fit = boolean('fit Y domain', true);
  const y0AccessorFormat = text('y0AccessorFormat', '');
  const y1AccessorFormat = text('y1AccessorFormat', '');
  return (
    <Chart className="story-chart">
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
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
        tickFormat={(d) => Number(d).toFixed(2)}
      />

      <AreaSeries
        id="area"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['max']}
        y0Accessors={['min']}
        y1AccessorFormat={y1AccessorFormat || undefined}
        y0AccessorFormat={y0AccessorFormat || undefined}
        data={data}
        curve={CurveType.CURVE_MONOTONE_X}
      />

      <LineSeries
        id="average"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={lineData}
        curve={CurveType.CURVE_MONOTONE_X}
      />
    </Chart>
  );
};
