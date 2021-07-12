/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, number } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, timeFormatter } from '../../packages/charts/src';
import { KIBANA_METRICS } from '../../packages/charts/src/utils/data_samples/test_dataset_kibana';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const dateFormatter = timeFormatter('HH:mm');

const data = KIBANA_METRICS.metrics.kibana_os_load[0].data.map(([x, y]) => {
  return [x, -y];
});
export const Example = () => {
  const scaleType = select(
    'Y scale',
    {
      [ScaleType.Linear]: ScaleType.Linear,
      [ScaleType.Log]: ScaleType.Log,
    },
    ScaleType.Linear,
  );
  return (
    <Chart className="story-chart">
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks tickFormat={dateFormatter} />
      <Axis
        id="left"
        title="negative metric"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        domain={{ logMinLimit: number('Y log limit', 1, { min: 0 }) }}
      />

      <AreaSeries
        id="area"
        xScaleType={ScaleType.Time}
        yScaleType={scaleType}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
