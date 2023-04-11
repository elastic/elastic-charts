/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  Axis,
  Chart,
  CurveType,
  LineSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));

export const Example = () => (
  <Chart>
    <Settings showLegend showLegendExtra legendPosition={Position.Right} baseTheme={useBaseTheme()} />
    <Axis id="bottom" position={Position.Bottom} showOverlappingTicks tickFormat={dateFormatter} />
    <Axis
      id="left"
      title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
      position={Position.Left}
      tickFormat={(d) => `${Number(d).toFixed(0)}%`}
    />

    <LineSeries
      id="monotone x"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      data={KIBANA_METRICS.metrics.kibana_os_load.v1.data}
      curve={CurveType.CURVE_MONOTONE_X}
    />
    <LineSeries
      id="basis"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      data={KIBANA_METRICS.metrics.kibana_os_load.v1.data}
      curve={CurveType.CURVE_BASIS}
    />
    <LineSeries
      id="cardinal"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      data={KIBANA_METRICS.metrics.kibana_os_load.v1.data}
      curve={CurveType.CURVE_CARDINAL}
    />
    <LineSeries
      id="catmull rom"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      data={KIBANA_METRICS.metrics.kibana_os_load.v1.data}
      curve={CurveType.CURVE_CATMULL_ROM}
    />
    <LineSeries
      id="natural"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      data={KIBANA_METRICS.metrics.kibana_os_load.v1.data}
      curve={CurveType.CURVE_NATURAL}
    />
    <LineSeries
      id="linear"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      data={KIBANA_METRICS.metrics.kibana_os_load.v1.data}
      curve={CurveType.LINEAR}
    />
  </Chart>
);
