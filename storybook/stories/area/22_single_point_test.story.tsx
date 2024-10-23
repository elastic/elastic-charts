/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  AreaSeries,
  Axis,
  Chart,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
  LegendValue,
  LineSeries,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter('HH:mm');
const dataLow = KIBANA_METRICS.metrics.kibana_os_load.v1.data;

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings
      showLegend
      legendValues={[LegendValue.Count]}
      legendPosition={Position.Right}
      baseTheme={useBaseTheme()}
      xDomain={{
        min: KIBANA_METRICS.metrics.kibana_os_load.v1.timeRange.min,
        max: KIBANA_METRICS.metrics.kibana_os_load.v1.timeRange.max,
      }}
    />
    <Axis
      id="bottom"
      title="timestamp per 1 minute"
      position={Position.Bottom}
      showOverlappingTicks
      tickFormat={dateFormatter}
    />
    <Axis
      id="left"
      title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
      position={Position.Left}
      tickFormat={(d) => Number(d).toFixed(2)}
    />
    <AreaSeries
      id="area 1 point"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      fit={{ type: 'linear' }}
      data={[dataLow[20]]}
      color="#00BEB8"
    />
    <AreaSeries
      id="area 2 points"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      fit={{ type: 'linear' }}
      data={[dataLow[30], dataLow[45]]}
      color="#93E5E0"
    />

    <LineSeries
      id="line 1 point"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      fit={{ type: 'linear' }}
      data={[dataLow[60]]}
      color="#599DFF"
    />
    <LineSeries
      id="line 2 points"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      fit={{ type: 'linear' }}
      data={[dataLow[65], dataLow[85]]}
      color="#B4D5FF"
    />
  </Chart>
);
