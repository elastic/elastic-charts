/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, timeFormatter } from '../../packages/charts/src';
import { KIBANA_METRICS } from '../../packages/charts/src/utils/data_samples/test_dataset_kibana';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const dateFormatter = timeFormatter('HH:mm');

export const Example = () => (
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
      title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
      position={Position.Left}
      tickFormat={(d) => Number(d).toFixed(2)}
    />

    <AreaSeries
      id={KIBANA_METRICS.metrics.kibana_os_load[0].metric.label}
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
    />
  </Chart>
);

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
