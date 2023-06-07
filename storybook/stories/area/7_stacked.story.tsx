/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { AreaSeries, Axis, Chart, LegendValue, Position, ScaleType, Settings, timeFormatter } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter('HH:mm');

export const Example = () => {
  const data1 = KIBANA_METRICS.metrics.kibana_os_load.v1.data.map((d) => [
    ...d,
    KIBANA_METRICS.metrics.kibana_os_load.v1.metric.label,
  ]);
  const data2 = KIBANA_METRICS.metrics.kibana_os_load.v2.data.map((d) => [
    ...d,
    KIBANA_METRICS.metrics.kibana_os_load.v2.metric.label,
  ]);
  const data3 = KIBANA_METRICS.metrics.kibana_os_load.v3.data.map((d) => [
    ...d,
    KIBANA_METRICS.metrics.kibana_os_load.v3.metric.label,
  ]);
  const allMetrics = [...data3, ...data2, ...data1];
  return (
    <Chart>
      <Settings
        showLegend
        legendValue={LegendValue.LastTimeBucket}
        legendPosition={Position.Right}
        baseTheme={useBaseTheme()}
      />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="timestamp per 1 minute"
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
        id={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.label}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        splitSeriesAccessors={[2]}
        data={allMetrics}
      />
    </Chart>
  );
};
